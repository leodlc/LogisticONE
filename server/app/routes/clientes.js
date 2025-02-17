const express = require('express');
const router = express.Router();

const { getAllClients, getClientByName, createClient, updateClient, deleteClient, updateClientFCMToken } = require('../controllers/clientes');

router.get('/', getAllClients);

router.get('/nombre/:nombreCliente', getClientByName);

router.post('/createClient', createClient);

router.patch('/:id', updateClient);

router.patch('/:id/tokenFCM', updateClientFCMToken); 
router.delete('/:id', deleteClient);

module.exports = router;