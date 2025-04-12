const express = require('express');
const router = express.Router();
const needController = require('../controllers/needController');

// API endpoints for need CRUD operations
router.get('/', needController.getAllNeeds);
router.get('/:id', needController.getNeedById);
router.post('/', needController.createNeed);
router.put('/:id', needController.updateNeed);
router.delete('/:id', needController.deleteNeed);

// Pupil need management
router.get('/pupil/:pupilId', needController.getPupilNeeds);
router.post('/pupil/', needController.addNeedToPupil);
router.delete('/pupil/:pupilId/need/:needId', needController.removeNeedFromPupil);

module.exports = router; 