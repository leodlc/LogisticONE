const { httpError } = require('../helpers/handleError');
const Producto = require('../models/producto'); // Importamos el modelo

// Obtener todos los productos
const getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json({ data: productos });
  } catch (e) {
    console.error("Error in getAllProductos:", e);
    httpError(res, e);
  }
};

// Obtener un producto por su nombre
const getProductoByNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const producto = await Producto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ data: producto });
  } catch (e) {
    console.error("Error in getProductoByNombre:", e);
    httpError(res, e);
  }
};

// Crear un producto
const createProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();

    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: productoGuardado
    });
  } catch (e) {
    console.error("Error in createProducto:", e);
    httpError(res, e);
  }
};

// Actualizar un producto
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProducto = await Producto.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedProducto) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ message: 'Producto actualizado correctamente', data: updatedProducto });
  } catch (e) {
    console.error("Error in updateProducto:", e);
    httpError(res, e);
  }
};

// Eliminar un producto
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Producto.findByIdAndDelete(id);

    if (!result) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (e) {
    console.error("Error in deleteProducto:", e);
    httpError(res, e);
  }
};

module.exports = {
  getAllProductos,
  getProductoByNombre,
  createProducto,
  updateProducto,
  deleteProducto
};
