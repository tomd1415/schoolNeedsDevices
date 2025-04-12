const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// API endpoint for getting all forms
router.get('/', formController.getAllForms);
// API endpoint for creating a new form
router.post('/', formController.newForm);
// API endpoint for deleting a form
router.delete('/:id', formController.deleteForm);

module.exports = router; 
