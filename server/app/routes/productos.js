const express = require('express');
const router = express.Router();

const { getAllProductos, getProductoByNombre, createProducto, updateProducto, deleteProducto } = require('../controllers/productos');


router.get('/', getAllProductos);

router.get('/nombre/:nombre', getProductoByNombre);

router.post('/createProducto', createProducto);

router.patch('/:id', updateProducto);

router.delete('/:id', deleteProducto);

module.exports = router;