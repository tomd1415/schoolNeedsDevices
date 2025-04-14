const pool = require('../config/db');

const getNeeds = async () => {
  const result = await pool.query(`
    SELECT n.*, c.category_name 
    FROM need n
    LEFT JOIN category c ON n.category_id = c.category_id
    ORDER BY n.need_name
  `);
  return result.rows;
};

const getNeedById = async (id) => {
  const result = await pool.query(`
    SELECT n.*, c.category_name 
    FROM need n
    LEFT JOIN category c ON n.category_id = c.category_id
    WHERE n.need_id = $1
  `, [id]);
  return result.rows[0];
};

const addNeed = async (need_name, need_short_desc, need_long_desc, category_id) => {
  const result = await pool.query(
    'INSERT INTO need (need_name, need_short_desc, need_long_desc, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [need_name, need_short_desc, need_long_desc, category_id]
  );
  return result.rows[0];
};

const updateNeed = async (id, need_name, need_long_desc, need_short_desc, category_id) => {
  const result = await pool.query(
    'UPDATE need SET need_name = $2, need_short_desc = $3, need_long_desc = $4, category_id = $5 WHERE need_id = $1 RETURNING *',
    [id, need_name, description, category_id]
  );
  return result.rows[0];
};

const deleteNeed = async (id) => {
  await pool.query('DELETE FROM need WHERE need_id = $1', [id]);
};

// Get pupil needs
const getPupilNeeds = async (pupilId) => {
  const result = await pool.query(`
    SELECT pn.*, n.need_name, n.description, c.category_name 
    FROM pupil_need pn
    JOIN need n ON pn.need_id = n.need_id
    LEFT JOIN category c ON n.category_id = c.category_id
    WHERE pn.pupil_id = $1
    ORDER BY n.need_name
  `, [pupilId]);
  return result.rows;
};

// Add need to pupil
const addNeedToPupil = async (pupil_id, need_id, notes) => {
  const result = await pool.query(
    'INSERT INTO pupil_need (pupil_id, need_id, notes) VALUES ($1, $2, $3) RETURNING *',
    [pupil_id, need_id, notes]
  );
  return result.rows[0];
};

// Remove need from pupil
const removeNeedFromPupil = async (pupil_id, need_id) => {
  await pool.query('DELETE FROM pupil_need WHERE pupil_id = $1 AND need_id = $2', [pupil_id, need_id]);
};

module.exports = {
  getNeeds,
  getNeedById,
  addNeed,
  updateNeed,
  deleteNeed,
  getPupilNeeds,
  addNeedToPupil,
  removeNeedFromPupil
}; 
