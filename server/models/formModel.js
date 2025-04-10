const pool = require('../config/db');

const getForms = async () => {
  const result = await pool.query('SELECT * FROM form ORDER BY form_name');
  return result.rows;
};

const getFormById = async (id) => {
  const result = await pool.query('SELECT * FROM form WHERE form_id = $1', [id]);
  return result.rows[0];
};

module.exports = {
  getForms,
  getFormById
}; 