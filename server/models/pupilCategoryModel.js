const pool = require('../config/db');

const getPupilCategories = async (pupilId) => {
  const result = await pool.query(
    'SELECT c.* FROM category c JOIN pupil_category pc ON c.category_id = pc.category_id WHERE pc.pupil_id = $1',
    [pupilId]
  );
  return result.rows;
};

const assignCategoryToPupil = async (pupilId, categoryId) => {
  const result = await pool.query(
    'INSERT INTO pupil_category (pupil_id, category_id) VALUES ($1, $2) RETURNING *',
    [pupilId, categoryId]
  );
  return result.rows[0];
};

const removeCategoryFromPupil = async (pupilId, categoryId) => {
  await pool.query(
    'DELETE FROM pupil_category WHERE pupil_id = $1 AND category_id = $2',
    [pupilId, categoryId]
  );
};

module.exports = {
  getPupilCategories,
  assignCategoryToPupil,
  removeCategoryFromPupil
};