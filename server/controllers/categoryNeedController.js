const categoryNeedModel = require('../models/categoryNeedModel');

const getCategoryNeeds = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const needs = await categoryNeedModel.getCategoryNeeds(categoryId);
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNeedCategories = async (req, res) => {
  try {
    const needId = req.params.needId;
    const categories = await categoryNeedModel.getNeedCategories(needId);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addNeedToCategory = async (req, res) => {
  try {
    const { category_id, need_id } = req.body;
    const result = await categoryNeedModel.addNeedToCategory(category_id, need_id);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeNeedFromCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const needId = req.params.needId;
    await categoryNeedModel.removeNeedFromCategory(categoryId, needId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCategoryNeeds,
  getNeedCategories,
  addNeedToCategory,
  removeNeedFromCategory
};