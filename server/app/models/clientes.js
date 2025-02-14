const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, unique: true },
  tokenFCM: { type: String }, // Para notificaciones push
  firmaDigital: { type: String }, // Firma en base64
  activo: { type: Boolean, default: true },
  ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion'}, // Relación con ubicación
  pedidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }] // Historial de pedidos
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Cliente', ClienteSchema);
