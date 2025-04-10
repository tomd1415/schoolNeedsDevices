const pool = require('../config/db');

const getPupils = async () => {
  const result = await pool.query('SELECT * FROM pupil ORDER BY last_name, first_name');
  return result.rows;
};

const getPupilById = async (id) => {
  const result = await pool.query('SELECT * FROM pupil WHERE pupil_id = $1', [id]);
  return result.rows[0];
};

const addPupil = async (first_name, last_name, form_id, notes) => {
  const result = await pool.query(
    'INSERT INTO pupil (first_name, last_name, form_id, notes) VALUES ($1, $2, $3, $4) RETURNING *',
    [first_name, last_name, form_id, notes]
  );
  return result.rows[0];
};

const updatePupil = async (id, first_name, last_name, form_id, notes) => {
  const result = await pool.query(
    'UPDATE pupil SET first_name = $2, last_name = $3, form_id = $4, notes = $5 WHERE pupil_id = $1 RETURNING *',
    [id, first_name, last_name, form_id, notes]
  );
  return result.rows[0];
};

const deletePupil = async (id) => {
  await pool.query('DELETE FROM pupil WHERE pupil_id = $1', [id]);
};

module.exports = {
  getPupils,
  getPupilById,
  addPupil,
  updatePupil,
  deletePupil
};
