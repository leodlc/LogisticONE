const { httpError } = require('../helpers/handleError');
const Destino = require('../models/destino');

// Obtener todos los destinos
const getAllDestinos = async (req, res) => {
  try {
    const destinos = await Destino.find();
    res.json({ data: destinos });
  } catch (e) {
    console.error("Error in getAllDestinos:", e);
    httpError(res, e);
  }
};

// Crear un destino
const createDestino = async (req, res) => {
  try {
    const nuevoDestino = new Destino(req.body);
    const destinoGuardado = await nuevoDestino.save();

    res.status(201).json({
      message: 'Destino creado exitosamente',
      data: destinoGuardado
    });
  } catch (e) {
    console.error("Error in createDestino:", e);
    httpError(res, e);
  }
};

module.exports = {
  getAllDestinos,
  createDestino
};
