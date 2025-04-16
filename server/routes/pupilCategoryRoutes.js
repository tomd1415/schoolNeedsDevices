const express = require('express');
const router = express.Router();
const pupilCategoryController = require('../controllers/pupilCategoryController');
const pupilNeedOverrideController = require('../controllers/pupilNeedOverrideController');

router.get('/:pupilId/categories', pupilCategoryController.getPupilCategories);
router.post('/assign-category', pupilCategoryController.assignCategoryToPupil);
router.delete('/:pupilId/categories/:categoryId', pupilCategoryController.removeCategoryFromPupil);

router.get('/:pupilId/effective-needs', pupilCategoryController.getPupilEffectiveNeeds);

router.get('/:pupilId/need-overrides', pupilNeedOverrideController.getPupilNeedOverrides);
router.post('/need-override', pupilNeedOverrideController.addNeedOverride);
router.put('/need-override/:overrideId', pupilNeedOverrideController.updateNeedOverride);
router.delete('/need-override/:overrideId', pupilNeedOverrideController.removeNeedOverride);

module.exports = router;