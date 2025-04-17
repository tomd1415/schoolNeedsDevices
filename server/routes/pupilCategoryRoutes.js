const express = require('express');
const router = express.Router();
const pupilCategoryController = require('../controllers/pupilCategoryController');

// Pupil category routes
router.get('/:pupilId/categories', pupilCategoryController.getPupilCategories);
router.post('/assign-category', pupilCategoryController.assignCategory);
router.delete('/:pupilId/categories/:categoryId', pupilCategoryController.removeCategory);

// Need override routes
router.get('/:pupilId/need-overrides', pupilCategoryController.getNeedOverrides);
router.post('/need-override', pupilCategoryController.addNeedOverride);
router.delete('/need-override/:overrideId', pupilCategoryController.removeNeedOverride);

// Effective needs route
router.get('/:pupilId/effective-needs', pupilCategoryController.getEffectivePupilNeeds);

module.exports = router;