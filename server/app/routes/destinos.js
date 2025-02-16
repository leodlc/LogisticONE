const express = require('express');
const router = express.Router();
const {
  getAllDestinos,
  createDestino
} = require('../controllers/destinos');

router.get('/', getAllDestinos);
router.post('/create', createDestino);

module.exports = router;
