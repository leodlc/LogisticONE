const express = require('express');
const router = express.Router();
const {
  getUbicacionById,
  updateUbicacionConductor
} = require('../controllers/ubicaciones');

router.get('/:id', getUbicacionById);
router.patch('/:id', updateUbicacionConductor);

module.exports = router;
