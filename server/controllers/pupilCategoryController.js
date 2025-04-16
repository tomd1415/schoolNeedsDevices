const pupilCategoryModel = require('../models/pupilCategoryModel');
const needModel = require('../models/needModel');

const getPupilCategories = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const categories = await pupilCategoryModel.getPupilCategories(pupilId);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignCategoryToPupil = async (req, res) => {
  try {
    const { pupil_id, category_id } = req.body;
    const result = await pupilCategoryModel.assignCategoryToPupil(pupil_id, category_id);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeCategoryFromPupil = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const categoryId = req.params.categoryId;
    await pupilCategoryModel.removeCategoryFromPupil(pupilId, categoryId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPupilEffectiveNeeds = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const needs = await needModel.getEffectivePupilNeeds(pupilId);
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPupilCategories,
  assignCategoryToPupil,
  removeCategoryFromPupil,
  getPupilEffectiveNeeds
};