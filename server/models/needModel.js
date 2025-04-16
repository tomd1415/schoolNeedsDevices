const pool = require('../config/db');

const getNeeds = async () => {
  const result = await pool.query(`
    SELECT n.*
    FROM need n
    ORDER BY n.name
  `);
  return result.rows;
};

const getNeedById = async (id) => {
  const result = await pool.query(`
    SELECT n.*
    FROM need n
    WHERE n.need_id = $1
  `, [id]);
  return result.rows[0];
};

const addNeed = async (need_name, need_short_desc, need_long_desc) => {
  const result = await pool.query(
    'INSERT INTO need (name, short_description, description) VALUES ($1, $2, $3) RETURNING *',
    [need_name, need_short_desc, need_long_desc]
  );
  return result.rows[0];
};

const updateNeed = async (id, need_name, need_short_desc, need_long_desc) => {
  const result = await pool.query(
    'UPDATE need SET name = $2, short_description = $3, description = $4 WHERE need_id = $1 RETURNING *',
    [id, need_name, need_short_desc, need_long_desc]
  );
  return result.rows[0];
};

const deleteNeed = async (id) => {
  await pool.query('DELETE FROM need WHERE need_id = $1', [id]);
};

// Get categories for a need
const getNeedCategories = async (needId) => {
  const result = await pool.query(`
    SELECT c.* 
    FROM category c
    JOIN category_need cn ON c.category_id = cn.category_id
    WHERE cn.need_id = $1
    ORDER BY c.category_name
  `, [needId]);
  return result.rows;
};

// Get pupil needs
const getPupilNeeds = async (pupilId) => {
  const result = await pool.query(`
    SELECT pn.*, n.name, n.short_description, n.description
    FROM pupil_need pn
    JOIN need n ON pn.need_id = n.need_id
    WHERE pn.pupil_id = $1
    ORDER BY n.name
  `, [pupilId]);
  return result.rows;
};

// Add need to pupil
const addNeedToPupil = async (pupil_id, need_id, note) => {
  const result = await pool.query(
    'INSERT INTO pupil_need (pupil_id, need_id, note) VALUES ($1, $2, $3) RETURNING *',
    [pupil_id, need_id, note]
  );
  return result.rows[0];
};

// Remove need from pupil
const removeNeedFromPupil = async (pupil_id, need_id) => {
  await pool.query('DELETE FROM pupil_need WHERE pupil_id = $1 AND need_id = $2', [pupil_id, need_id]);
};

// Get effective needs for a pupil based on their categories and overrides
const getEffectivePupilNeeds = async (pupilId) => {
  const result = await pool.query(`
    WITH category_needs AS (
      SELECT DISTINCT n.need_id, n.name, n.short_description, n.description
      FROM need n
      JOIN category_need cn ON n.need_id = cn.need_id
      JOIN pupil_category pc ON cn.category_id = pc.category_id
      WHERE pc.pupil_id = $1
    ),
    added_needs AS (
      SELECT n.need_id, n.name, n.short_description, n.description
      FROM need n
      JOIN pupil_need_override pno ON n.need_id = pno.need_id
      WHERE pno.pupil_id = $1 AND pno.is_added = TRUE
    ),
    removed_need_ids AS (
      SELECT need_id
      FROM pupil_need_override
      WHERE pupil_id = $1 AND is_added = FALSE
    )
    SELECT * FROM (
      SELECT * FROM category_needs
      UNION
      SELECT * FROM added_needs
    ) AS all_needs
    WHERE need_id NOT IN (SELECT need_id FROM removed_need_ids)
  `, [pupilId]);
  
  return result.rows;
};

module.exports = {
  getNeeds,
  getNeedById,
  addNeed,
  updateNeed,
  deleteNeed,
  getNeedCategories,
  getPupilNeeds,
  addNeedToPupil,
  removeNeedFromPupil,
  getEffectivePupilNeeds
}; 
