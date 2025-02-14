const mongoose = require('mongoose');

const DestinoSchema = new mongoose.Schema({
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion', required: true } // Relación con ubicación
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Destino', DestinoSchema);
