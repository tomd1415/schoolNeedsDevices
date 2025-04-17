const pupilCategoryModel = require('../models/pupilCategoryModel');

// Get categories assigned to a pupil
const getPupilCategories = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const categories = await pupilCategoryModel.getPupilCategories(pupilId);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching pupil categories:', error);
    res.status(500).json({ message: 'Failed to fetch pupil categories' });
  }
};

// Assign a category to a pupil
const assignCategory = async (req, res) => {
  try {
    const { pupil_id, category_id } = req.body;
    console.log('Assigning category. Request body:', req.body);
    
    if (!pupil_id || !category_id) {
      return res.status(400).json({ message: 'Missing required parameters: pupil_id or category_id' });
    }
    
    await pupilCategoryModel.assignCategory(pupil_id, category_id);
    res.status(201).json({ message: 'Category assigned successfully' });
  } catch (error) {
    console.error('Error assigning category:', error);
    res.status(500).json({ message: 'Failed to assign category' });
  }
};

// Remove a category from a pupil
const removeCategory = async (req, res) => {
  try {
    const { pupilId, categoryId } = req.params;
    await pupilCategoryModel.removeCategory(pupilId, categoryId);
    res.status(200).json({ message: 'Category removed successfully' });
  } catch (error) {
    console.error('Error removing category:', error);
    res.status(500).json({ message: 'Failed to remove category' });
  }
};

// Get need overrides for a pupil
const getNeedOverrides = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const overrides = await pupilCategoryModel.getNeedOverrides(pupilId);
    res.status(200).json(overrides);
  } catch (error) {
    console.error('Error fetching need overrides:', error);
    res.status(500).json({ message: 'Failed to fetch need overrides' });
  }
};

// Add a need override
const addNeedOverride = async (req, res) => {
  try {
    const { pupil_id, need_id, is_added, notes } = req.body;
    console.log('Adding need override. Request body:', req.body);
    
    if (!pupil_id || !need_id || is_added === undefined) {
      return res.status(400).json({ message: 'Missing required parameters: pupil_id, need_id, or is_added' });
    }
    
    await pupilCategoryModel.addNeedOverride(pupil_id, need_id, is_added, notes || null);
    res.status(201).json({ message: 'Need override added successfully' });
  } catch (error) {
    console.error('Error adding need override:', error);
    res.status(500).json({ message: 'Failed to add need override' });
  }
};

// Remove a need override
const removeNeedOverride = async (req, res) => {
  try {
    const { overrideId } = req.params;
    await pupilCategoryModel.removeNeedOverride(overrideId);
    res.status(200).json({ message: 'Need override removed successfully' });
  } catch (error) {
    console.error('Error removing need override:', error);
    res.status(500).json({ message: 'Failed to remove need override' });
  }
};

// Get effective needs for a pupil (considering categories and overrides)
const getEffectivePupilNeeds = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const needs = await pupilCategoryModel.getEffectivePupilNeeds(pupilId);
    res.status(200).json(needs);
  } catch (error) {
    console.error('Error fetching effective pupil needs:', error);
    res.status(500).json({ message: 'Failed to fetch effective pupil needs' });
  }
};

module.exports = {
  getPupilCategories,
  assignCategory,
  removeCategory,
  getNeedOverrides,
  addNeedOverride,
  removeNeedOverride,
  getEffectivePupilNeeds
};