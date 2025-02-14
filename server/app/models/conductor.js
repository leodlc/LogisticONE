const mongoose = require('mongoose');

const ConductorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo' }, // Relación con vehículo
  ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion'}, // Relación con ubicación
  pedidosAsignados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }], // Pedidos en curso
  tokenFCM: { type: String }, // Token para recibir notificaciones
  activo: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Conductor', ConductorSchema);
