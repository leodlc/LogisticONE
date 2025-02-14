const express = require('express');
const router = express.Router();

const { getAllDrivers, getDriverByName, createDriver, updateDriver, deleteDriver } = require('../controllers/conductor');

router.get('/', getAllDrivers);

router.get('/nombre/:nombreConductor', getDriverByName);

router.post('/createDriver', createDriver);

router.patch('/:id', updateDriver);

router.delete('/:id', deleteDriver);

module.exports = router;