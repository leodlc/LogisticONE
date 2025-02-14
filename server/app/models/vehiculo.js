const mongoose = require('mongoose');

const VehiculoSchema = new mongoose.Schema({
  conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'Conductor', required: false }, // Puede estar sin asignar
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  placa: { type: String, required: true, unique: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Vehiculo', VehiculoSchema);
