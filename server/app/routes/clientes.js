const express = require('express');
const router = express.Router();

const { getAllClients, getClientByName, createClient, updateClient, deleteClient } = require('../controllers/clientes');

router.get('/', getAllClients);

router.get('/nombre/:nombreCliente', getClientByName);

router.post('/createClient', createClient);

router.patch('/:id', updateClient);


router.delete('/:id', deleteClient);

module.exports = router;