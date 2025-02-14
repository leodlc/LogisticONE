const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'Conductor', required: false }, // Puede ser asignado después
  destino: { type: mongoose.Schema.Types.ObjectId, ref: 'Destino', required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'asignado', 'en camino', 'entregado', 'cancelado'], 
    default: 'pendiente' 
  },
  codigoQR: { type: String }, // Código QR para validación de entrega
  timestampEntrega: { type: Date }, // Hora exacta de entrega
  notificadoCliente: { type: Boolean, default: false },
  notificadoConductor: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Pedido', PedidoSchema);
