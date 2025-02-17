const { httpError } = require('../helpers/handleError');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const Conductor = require('../models/conductor');
const admin = require('firebase-admin'); // Firebase SDK

// Función para enviar notificaciones push con Firebase Cloud Messaging (FCM)
const sendPushNotification = async (token, title, body, userId, userType) => {
  try {
    if (!token) {
      console.log(`⚠️ Notificación NO enviada: No hay token FCM para ${userType} (ID: ${userId})`);
      return;
    }

    await admin.messaging().send({
      token: token,
      notification: {
        title: title,
        body: body
      }
    });

    console.log(`✅ Notificación enviada a ${userType} (ID: ${userId}): ${title} - ${body}`);
  } catch (e) {
    console.error(`❌ Error enviando notificación a ${userType} (ID: ${userId}):`, e);
  }
};


// Obtener todos los pedidos
const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('cliente conductor destino productos.producto');
    res.json({ data: pedidos });
  } catch (e) {
    console.error("Error in getAllPedidos:", e);
    httpError(res, e);
  }
};

// Obtener un pedido por ID
const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findById(id).populate('cliente conductor destino productos.producto');

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ data: pedido });
  } catch (e) {
    console.error("Error in getPedidoById:", e);
    httpError(res, e);
  }
};

// Crear un pedido
const createPedido = async (req, res) => {
  try {
    // Crear el pedido en MongoDB
    const nuevoPedido = new Pedido(req.body);
    const pedidoGuardado = await nuevoPedido.save();

    // Convertir a un objeto plano
    const pedidoFirestore = pedidoGuardado.toObject();

    // Formatear los productos (eliminar prototipos de Mongoose)
    pedidoFirestore.productos = pedidoFirestore.productos.map(item => ({
      producto: item.producto.toString(),
      cantidad: item.cantidad
    }));

    // Guardar en Firestore asegurando que el ID sea el mismo que en MongoDB
    await admin.firestore().collection('pedidos').doc(pedidoGuardado._id.toString()).set({
      cliente: pedidoFirestore.cliente.toString(),
      conductor: pedidoFirestore.conductor ? pedidoFirestore.conductor.toString() : null,
      destino: pedidoFirestore.destino.toString(),
      productos: pedidoFirestore.productos,
      estado: pedidoFirestore.estado,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Pedido ${pedidoGuardado._id} guardado en Firestore`);

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      data: pedidoGuardado
    });

  } catch (e) {
    console.error("❌ Error in createPedido:", e);
    httpError(res, e);
  }
};



// Actualizar estado del pedido y notificar al cliente/conductor
const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(id, { estado }, { new: true }).populate('cliente conductor');

    if (!pedidoActualizado) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Actualizar en Firestore
    await admin.firestore().collection('pedidos').doc(id).update({ estado });

    console.log(`📦 Estado del pedido ${id} actualizado a: ${estado}`);

    // Notificaciones por estado
    if (estado === 'asignado') {
      sendPushNotification(
        pedidoActualizado.cliente.tokenFCM,
        "Tu pedido ha sido asignado",
        "Un conductor está en camino para recoger tu pedido.",
        pedidoActualizado.cliente._id.toString(),
        "Cliente"
      );
    } else if (estado === 'en camino') {
      sendPushNotification(
        pedidoActualizado.cliente.tokenFCM,
        "Tu pedido está en camino",
        "El conductor está en camino a tu dirección.",
        pedidoActualizado.cliente._id.toString(),
        "Cliente"
      );
      sendPushNotification(
        pedidoActualizado.conductor?.tokenFCM,
        "Nuevo pedido en camino",
        "Entrega el pedido al cliente en la dirección asignada.",
        pedidoActualizado.conductor?._id.toString(),
        "Conductor"
      );
    } else if (estado === 'entregado') {
      sendPushNotification(
        pedidoActualizado.cliente.tokenFCM,
        "Pedido entregado",
        "Tu pedido ha sido entregado exitosamente.",
        pedidoActualizado.cliente._id.toString(),
        "Cliente"
      );
    } else if (estado === 'cancelado') {
      sendPushNotification(
        pedidoActualizado.cliente.tokenFCM,
        "Pedido cancelado",
        "Tu pedido ha sido cancelado.",
        pedidoActualizado.cliente._id.toString(),
        "Cliente"
      );
    }

    res.json({ message: 'Estado del pedido actualizado y notificaciones enviadas', data: pedidoActualizado });
  } catch (e) {
    console.error("Error in updateEstadoPedido:", e);
    httpError(res, e);
  }
};


// Eliminar un pedido
const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Pedido.findByIdAndDelete(id);

    if (!result) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Eliminar de Firestore
    await admin.firestore().collection('pedidos').doc(id).delete();

    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (e) {
    console.error("Error in deletePedido:", e);
    httpError(res, e);
  }
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  createPedido,
  updateEstadoPedido,
  deletePedido
};
