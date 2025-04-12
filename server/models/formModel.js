const pool = require('../config/db');

const getForms = async () => {
  const result = await pool.query('SELECT * FROM form WHERE deleted = false ORDER BY form_name');
  return result.rows;
};

const getFormById = async (id) => {
  const result = await pool.query('SELECT * FROM form WHERE form_id = $1', [id]);
  return result.rows[0];
};

const newForm = async (form_year, form_name, teacher_name, description ) => {
  const result = await pool.query(
    'INSERT INTO form (form_year, form_name, teacher_name, form_description) VALUES ($1, $2, $3, $4) RETURNING *',
    [form_year, form_name, teacher_name, description]
  );
  return result.rows[0];
}

const deleteForm = async (id) => {
  await pool.query('UPDATE form SET deleted = true WHERE form_id = $1 RETURNING *', [id]);
};

module.exports = {
  getForms,
  getFormById,
  newForm,
  deleteForm
}; 
