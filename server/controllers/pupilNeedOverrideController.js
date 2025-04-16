const pupilNeedOverrideModel = require('../models/pupilNeedOverrideModel');

const getPupilNeedOverrides = async (req, res) => {
  try {
    const pupilId = req.params.pupilId;
    const overrides = await pupilNeedOverrideModel.getPupilNeedOverrides(pupilId);
    res.json(overrides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addNeedOverride = async (req, res) => {
  try {
    const { pupil_id, need_id, is_added, notes } = req.body;
    const result = await pupilNeedOverrideModel.addNeedOverride(pupil_id, need_id, is_added, notes);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateNeedOverride = async (req, res) => {
  try {
    const overrideId = req.params.overrideId;
    const { is_added, notes } = req.body;
    const result = await pupilNeedOverrideModel.updateNeedOverride(overrideId, is_added, notes);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeNeedOverride = async (req, res) => {
  try {
    const overrideId = req.params.overrideId;
    await pupilNeedOverrideModel.removeNeedOverride(overrideId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPupilNeedOverrides,
  addNeedOverride,
  updateNeedOverride,
  removeNeedOverride
};