const {httpError} = require('../helpers/handleError');
const Conductor = require('../models/conductor');
const Pedido = require('../models/pedido');
const Ubicacion = require('../models/ubicacion');
const admin = require('firebase-admin');

// Memoria temporal para evitar actualizar MongoDB en cada cambio de ubicación
const ubicacionesTemporales = new Map();

// Distancia en metros para considerar que el conductor está "cerca"
const DISTANCIA_MINIMA = 500; // 500 metros

// Función para calcular la distancia entre dos coordenadas (Haversine formula)
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Obtener todos los conductores
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Conductor.find();
        res.json({data: drivers});
    } catch (e) {
        console.error("Error in getAllDrivers:", e);
        httpError(res, e);
    }
};

// Obtener un conductor por su nombre
const getDriverByName = async (req, res) => {
    try{
        const nombreConductor = decodeURIComponent(req.params.nombreConductor);
        const driver = await Conductor.findOne({nombreConductor: new RegExp(`^${nombreConductor}$`, 'i')});

        if(!driver) return res.status(404).json({error: 'Conductor no encontrado'});

        res.json({data: driver});
    }catch(e){
        console.error("Error in getDriverByName:", e);
        httpError(res, e);
    }
};

// Crear un conductor
const createDriver = async (req, res) => {
    try{
        const nuevoConductor = new Conductor(req.body);
        const conductorGuardado = await nuevoConductor.save();

        res.status(201).json({
            message: 'Conductor creado exitosamente',
            data: conductorGuardado
        });
    }catch(e){
        console.error("Error in createDriver:", e);
        httpError(res, e);
    }
};

// Actualizar un conductor
const updateDriver = async (req, res) => {
    try{
        const {id} = req.params;
        const updatedDriver = await Conductor.findByIdAndUpdate(id, req.body, {new: true});

        if (!updatedDriver) return res.status(404).json({error: 'Conductor no encontrado'});
        res.json({message: 'Conductor actualizado correctamente', data: updatedDriver});
    }catch(e){
        console.error("Error in updateDriver:", e);
        httpError(res, e);
    }
};

// Eliminar un conductor
const deleteDriver = async (req, res) => {
    try{
        const {id} = req.params;
        const result = await Conductor.findByIdAndDelete(id);

        if (!result) return res.status(404).json({error: 'Conductor no encontrado'});
        res.json({message: 'Conductor eliminado correctamente'});
    }catch(e){
        console.error("Error in deleteDriver:", e);
        httpError(res, e);
    }
};

// Función para actualizar la ubicación en Firestore en tiempo real
const updateDriverLocationRealtime = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;

        // Buscar el conductor
        const conductor = await Conductor.findById(id);
        if (!conductor) return res.status(404).json({ error: 'Conductor no encontrado' });

        // Actualizar Firestore en tiempo real
        await admin.firestore().collection('ubicaciones').doc(id).set({
            conductorId: id,
            lat,
            lng,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Guardar ubicación en memoria para actualizar MongoDB después de un tiempo
        ubicacionesTemporales.set(id, { lat, lng, lastUpdated: Date.now() });

        res.json({ message: 'Ubicación del conductor actualizada en Firestore' });
    } catch (e) {
        console.error("Error in updateDriverLocationRealtime:", e);
        httpError(res, e);
    }
};

// Función para actualizar MongoDB cada 30 segundos
const updateDriverLocationMongoDB = async () => {
    const now = Date.now();

    for (const [id, data] of ubicacionesTemporales) {
        if (now - data.lastUpdated >= 30000) { // 30 segundos
            try {
                const conductor = await Conductor.findById(id);
                if (!conductor) continue;

                // Si el conductor ya tiene una ubicación en MongoDB, actualizarla
                if (conductor.ubicacion) {
                    await Ubicacion.findByIdAndUpdate(conductor.ubicacion, { lat: data.lat, lng: data.lng });
                } else {
                    // Si no tiene, crear una nueva ubicación
                    const nuevaUbicacion = new Ubicacion({ lat: data.lat, lng: data.lng });
                    const ubicacionGuardada = await nuevaUbicacion.save();

                    // Asociar la nueva ubicación al conductor
                    conductor.ubicacion = ubicacionGuardada._id;
                    await conductor.save();
                }

                console.log(`Ubicación del conductor ${id} actualizada en MongoDB`);
                ubicacionesTemporales.delete(id);
            } catch (e) {
                console.error(`Error actualizando ubicación en MongoDB para el conductor ${id}:`, e);
            }
        }
    }
};

// Ejecutar la actualización de MongoDB cada 30 segundos
setInterval(updateDriverLocationMongoDB, 30000);


// Función para verificar si el conductor está cerca del destino
const verificarConductorCerca = async (conductorId) => {
    try {
      const conductor = await Conductor.findById(conductorId).populate('ubicacion');
      if (!conductor || !conductor.ubicacion) return;
  
      // Obtener el pedido asignado al conductor
      const pedido = await Pedido.findOne({ conductor: conductorId, estado: 'en camino' }).populate('destino cliente');
      if (!pedido || !pedido.destino) return;
  
      const destino = await Ubicacion.findById(pedido.destino.ubicacion);
      if (!destino) return;
  
      // Calcular la distancia entre la ubicación del conductor y el destino
      const distancia = calcularDistancia(
        conductor.ubicacion.lat,
        conductor.ubicacion.lng,
        destino.lat,
        destino.lng
      );
  
      console.log(`🚗 Conductor ${conductorId} -> Distancia al destino: ${distancia.toFixed(2)}m`);
  
      if (distancia < DISTANCIA_MINIMA) {
        sendPushNotification(
          pedido.cliente.tokenFCM,
          "Tu pedido está cerca",
          "El conductor está a menos de 500 metros de tu ubicación.",
          pedido.cliente._id.toString(),
          "Cliente"
        );
      }
    } catch (e) {
      console.error(`❌ Error en verificarConductorCerca para conductor ${conductorId}:`, e);
    }
  };
  
  
  // Verificar ubicación de los conductores cada 10 segundos
  setInterval(async () => {
    const conductores = await Conductor.find({ activo: true });
    conductores.forEach(conductor => verificarConductorCerca(conductor._id));
  }, 10000);

  // Actualizar el tokenFCM de un conductor
const updateDriverFCMToken = async (req, res) => {
    try {
      const { id } = req.params;
      const { tokenFCM } = req.body;
  
      if (!tokenFCM) {
        return res.status(400).json({ error: 'El tokenFCM es requerido' });
      }
  
      const updatedDriver = await Conductor.findByIdAndUpdate(
        id, 
        { tokenFCM }, 
        { new: true }
      );
  
      if (!updatedDriver) {
        return res.status(404).json({ error: 'Conductor no encontrado' });
      }
  
      console.log(`✅ Token FCM actualizado para Conductor (ID: ${id}): ${tokenFCM}`);
  
      res.json({ message: 'Token FCM actualizado correctamente', data: updatedDriver });
    } catch (e) {
      console.error("❌ Error en updateDriverFCMToken:", e);
      httpError(res, e);
    }
  };

module.exports = {
    getAllDrivers,
    getDriverByName,
    createDriver,
    updateDriver,
    deleteDriver,
    updateDriverLocationRealtime,
    updateDriverFCMToken
};
