const needModel = require('../models/needModel');

const getAllNeeds = async (req, res) => {
  try {
    const needs = await needModel.getNeeds();
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNeedById = async (req, res) => {
  const id = req.params.id;
  try {
    const need = await needModel.getNeedById(id);
    if (!need) {
      return res.status(404).json({ error: 'Need not found' });
    }
    res.json(need);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createNeed = async (req, res) => {
  const { need_name, need_short_desc, need_long_desc, category_id } = req.body;
  try {
    const newNeed = await needModel.addNeed(need_name, need_short_desc, need_long_desc, category_id);
    res.status(201).json(newNeed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateNeed = async (req, res) => {
  const id = req.params.id;
  const { need_name, description, category_id } = req.body;
  try {
    const updatedNeed = await needModel.updateNeed(id, need_name, description, category_id);
    if (!updatedNeed) {
      return res.status(404).json({ error: 'Need not found' });
    }
    res.json(updatedNeed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteNeed = async (req, res) => {
  const id = req.params.id;
  try {
    await needModel.deleteNeed(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get needs for a pupil
const getPupilNeeds = async (req, res) => {
  const pupilId = req.params.pupilId;
  try {
    const needs = await needModel.getPupilNeeds(pupilId);
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add need to pupil
const addNeedToPupil = async (req, res) => {
  const { pupil_id, need_id, notes } = req.body;
  try {
    const result = await needModel.addNeedToPupil(pupil_id, need_id, notes);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove need from pupil
const removeNeedFromPupil = async (req, res) => {
  const pupil_id = req.params.pupilId;
  const need_id = req.params.needId;
  try {
    await needModel.removeNeedFromPupil(pupil_id, need_id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllNeeds,
  getNeedById,
  createNeed,
  updateNeed,
  deleteNeed,
  getPupilNeeds,
  addNeedToPupil,
  removeNeedFromPupil
}; 
