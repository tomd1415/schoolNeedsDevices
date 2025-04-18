const express = require('express');
const router = express.Router();
const pupilController = require('../controllers/pupilController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');
const pupilProfileController = require('../controllers/pupilProfileController');

// Configure multer to store uploaded files in the 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// API endpoints for pupil CRUD operations
router.get('/', pupilController.getAllPupils);

// Specific routes must come before wildcard routes
router.get('/search', pupilController.searchPupils);
router.get('/profile', pupilProfileController.getPupilProfile);

// Wildcard route for getting pupil by ID
router.get('/:id', pupilController.getPupilById);
router.post('/', pupilController.createPupil);
router.put('/:id', pupilController.updatePupil);
router.delete('/:id', pupilController.deletePupil);

// Endpoint for CSV file upload for adding pupils
router.post('/upload', upload.single('csvfile'), uploadController.uploadPupilsCSV);

module.exports = router;
