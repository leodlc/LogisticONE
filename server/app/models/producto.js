const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: false },
  precio: { type: Number, required: true },
  cantidadDisponible: { type: Number, required: true }, 
  categoria: { type: String, required: true } // Ejemplo: "Electrónica", "Ropa", "Comida"
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Producto', ProductoSchema);
