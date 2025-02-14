const {httpError} = require('../helpers/handleError');
const Conductor = require('../models/conductor');

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

module.exports = {
    getAllDrivers,
    getDriverByName,
    createDriver,
    updateDriver,
    deleteDriver
};
