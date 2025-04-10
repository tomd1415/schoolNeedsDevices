const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// API endpoint for getting all forms
router.get('/', formController.getAllForms);

module.exports = router; 