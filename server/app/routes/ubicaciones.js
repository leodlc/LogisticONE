const express = require('express');
const router = express.Router();
const {
  createUbicacion,
  getUbicacionById,
  updateUbicacionConductor
} = require('../controllers/ubicaciones');

router.post('/createUbicacion', createUbicacion);
router.get('/:id', getUbicacionById);
router.patch('/:id', updateUbicacionConductor);

module.exports = router;
