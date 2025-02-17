const { httpError } = require('../helpers/handleError');
const Cliente = require('../models/cliente'); // Importamos el modelo

// Obtener todos los clientes
const getAllClients = async (req, res) => {
  try {
    const clients = await Cliente.find();
    res.json({ data: clients });
  } catch (e) {
    console.error("Error in getAllClients:", e);
    httpError(res, e);
  }
};

// Obtener un cliente por su nombre
const getClientByName = async (req, res) => {
  try {
    const nombreCliente = decodeURIComponent(req.params.nombreCliente);
    const client = await Cliente.findOne({ nombreCliente: new RegExp(`^${nombreCliente}$`, 'i') });

    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({ data: client });
  } catch (e) {
    console.error("Error in getClientByName:", e);
    httpError(res, e);
  }
};

// Crear un cliente
const createClient = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    const clienteGuardado = await nuevoCliente.save();
    
    res.status(201).json({
      message: 'Cliente creado exitosamente',
      data: clienteGuardado
    });
  } catch (e) {
    console.error("Error in createClient:", e);
    httpError(res, e);
  }
};

// Actualizar un cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClient = await Cliente.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedClient) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({ message: 'Cliente actualizado correctamente', data: updatedClient });
  } catch (e) {
    console.error("Error in updateClient:", e);
    httpError(res, e);
  }
};

// Eliminar un cliente
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Cliente.findByIdAndDelete(id);

    if (!result) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (e) {
    console.error("Error in deleteClient:", e);
    httpError(res, e);
  }
};

// Actualizar el tokenFCM de un cliente
const updateClientFCMToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { tokenFCM } = req.body;

    if (!tokenFCM) {
      return res.status(400).json({ error: 'El tokenFCM es requerido' });
    }

    const updatedClient = await Cliente.findByIdAndUpdate(
      id, 
      { tokenFCM }, 
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    console.log(`Token FCM actualizado para Cliente (ID: ${id}): ${tokenFCM}`);

    res.json({ message: 'Token FCM actualizado correctamente', data: updatedClient });
  } catch (e) {
    console.error("Error en updateClientFCMToken:", e);
    httpError(res, e);
  }
};

module.exports = {
  getAllClients,
  getClientByName,
  createClient,
  updateClient,
  deleteClient,
  updateClientFCMToken
};
