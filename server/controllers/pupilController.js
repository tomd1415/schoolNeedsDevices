const pupilModel = require('../models/pupilModel');

const getAllPupils = async (req, res) => {
  try {
    const pupils = await pupilModel.getPupils();
    res.json(pupils);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPupil = async (req, res) => {
  const { first_name, last_name, form_id, notes } = req.body;
  try {
    const newPupil = await pupilModel.addPupil(first_name, last_name, form_id, notes);
    res.status(201).json(newPupil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePupil = async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, form_id, notes } = req.body;
  try {
    const updatedPupil = await pupilModel.updatePupil(id, first_name, last_name, form_id, notes);
    res.json(updatedPupil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePupil = async (req, res) => {
  const id = req.params.id;
  try {
    await pupilModel.deletePupil(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPupils,
  createPupil,
  updatePupil,
  deletePupil
};
