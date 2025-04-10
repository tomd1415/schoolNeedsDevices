const formModel = require('../models/formModel');

const getAllForms = async (req, res) => {
  try {
    const forms = await formModel.getForms();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllForms
}; 