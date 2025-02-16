const express = require('express');
const router = express.Router();
const {
  getAllPedidos,
  getPedidoById,
  createPedido,
  updateEstadoPedido,
  deletePedido
} = require('../controllers/pedidos');

router.get('/', getAllPedidos);
router.get('/:id', getPedidoById);
router.post('/create', createPedido);
router.patch('/:id/estado', updateEstadoPedido);
router.delete('/:id', deletePedido);

module.exports = router;
