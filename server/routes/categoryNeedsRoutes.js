const express = require('express');
const router = express.Router();
const categoryNeedController = require('../controllers/categoryNeedController');

router.get('/:categoryId/needs', categoryNeedController.getCategoryNeeds);
router.post('/assign-need', categoryNeedController.addNeedToCategory);
router.delete('/:categoryId/needs/:needId', categoryNeedController.removeNeedFromCategory);

module.exports = router;