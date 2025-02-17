const express = require('express');
const router = express.Router();

const { getAllDrivers, getDriverByName, createDriver, updateDriver, deleteDriver, updateDriverLocationRealtime, updateDriverFCMToken } = require('../controllers/conductor');

router.get('/', getAllDrivers);

router.get('/nombre/:nombreConductor', getDriverByName);

router.post('/createDriver', createDriver);

router.patch('/:id', updateDriver);

router.delete('/:id', deleteDriver);

router.patch('/:id/ubicacion', updateDriverLocationRealtime);

router.patch('/:id/tokenFCM', updateDriverFCMToken);

module.exports = router;