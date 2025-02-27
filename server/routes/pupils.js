const express = require('express');
const router = express.Router();
const pupilController = require('../controllers/pupilController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');

// Configure multer to store uploaded files in the 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// API endpoints for pupil CRUD operations
router.get('/', pupilController.getAllPupils);
router.post('/', pupilController.createPupil);
router.put('/:id', pupilController.updatePupil);
router.delete('/:id', pupilController.deletePupil);

// Endpoint for CSV file upload for adding pupils
router.post('/upload', upload.single('csvfile'), uploadController.uploadPupilsCSV);

module.exports = router;
