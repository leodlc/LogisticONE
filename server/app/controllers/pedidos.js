const { httpError } = require('../helpers/handleError');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const Conductor = require('../models/conductor');
const admin = require('firebase-admin'); // Firebase SDK

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
    const nuevoPedido = new Pedido(req.body);
    const pedidoGuardado = await nuevoPedido.save();

    // Enviar a Firestore
    await admin.firestore().collection('pedidos').doc(pedidoGuardado._id.toString()).set({
      cliente: pedidoGuardado.cliente.toString(),
      destino: pedidoGuardado.destino.toString(),
      estado: pedidoGuardado.estado,
      productos: pedidoGuardado.productos,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      data: pedidoGuardado
    });
  } catch (e) {
    console.error("Error in createPedido:", e);
    httpError(res, e);
  }
};

// Actualizar estado del pedido y notificar al cliente/conductor
const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(id, { estado }, { new: true });

    if (!pedidoActualizado) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Actualizar en Firestore
    await admin.firestore().collection('pedidos').doc(id).update({ estado });

    // Enviar notificación push con Firebase Cloud Messaging (FCM)
    const cliente = await Cliente.findById(pedidoActualizado.cliente);
    if (cliente && cliente.tokenFCM) {
      await admin.messaging().send({
        token: cliente.tokenFCM,
        notification: {
          title: "Estado del pedido actualizado",
          body: `Tu pedido ahora está: ${estado}`
        }
      });
    }

    res.json({ message: 'Estado del pedido actualizado y notificación enviada', data: pedidoActualizado });
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
