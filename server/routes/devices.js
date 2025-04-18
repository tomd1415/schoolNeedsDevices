const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// API endpoints for device CRUD operations
router.get('/', deviceController.getAllDevices);
router.get('/unassigned', deviceController.getUnassignedDevices);
router.get('/:id', deviceController.getDeviceById);
router.post('/', deviceController.createDevice);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

// Need device management
router.get('/need/:needId', deviceController.getNeedDevices);
router.post('/need/', deviceController.assignDeviceToNeed);
router.delete('/need/:needId/device/:deviceId', deviceController.removeDeviceFromNeed);

module.exports = router; 