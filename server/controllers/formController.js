const formModel = require('../models/formModel');

const getAllForms = async (req, res) => {
  try {
    const forms = await formModel.getForms();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const newForm = async (req, res) => {
  const { form_year, form_name, teacher_name, description } = req.body;
  try {
    const newForm = await formModel.newForm( form_year, form_name, teacher_name, description);
    res.status(201).json(newForm);
  } catch (err) {
    res.status(500).json({ error: err.message});
  }
};

const deleteForm = async (req, res) => {
  const id = req.params.id;
  try {
    await formModel.deleteForm(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
};

module.exports = {
  getAllForms,
  newForm,
  deleteForm
}; 
