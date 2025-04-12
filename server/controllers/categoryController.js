const categoryModel = require('../models/categoryModel');

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCategoryById = async (req, res) => {
  const id = req.params.id;
  try {
    const category = await categoryModel.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCategory = async (req, res) => {
  const { category_name, description } = req.body;
  try {
    const newCategory = await categoryModel.addCategory(category_name, description);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCategory = async (req, res) => {
  const id = req.params.id;
  const { category_name, description } = req.body;
  try {
    const updatedCategory = await categoryModel.updateCategory(id, category_name, description);
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  const id = req.params.id;
  try {
    await categoryModel.deleteCategory(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}; 