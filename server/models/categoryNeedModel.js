const pool = require('../config/db');

const getCategoryNeeds = async (categoryId) => {
  const result = await pool.query(
    'SELECT n.* FROM need n JOIN category_need cn ON n.need_id = cn.need_id WHERE cn.category_id = $1',
    [categoryId]
  );
  return result.rows;
};

const getNeedCategories = async (needId) => {
  const result = await pool.query(
    'SELECT c.* FROM category c JOIN category_need cn ON c.category_id = cn.category_id WHERE cn.need_id = $1',
    [needId]
  );
  return result.rows;
};

const addNeedToCategory = async (categoryId, needId) => {
  const result = await pool.query(
    'INSERT INTO category_need (category_id, need_id) VALUES ($1, $2) RETURNING *',
    [categoryId, needId]
  );
  return result.rows[0];
};

const removeNeedFromCategory = async (categoryId, needId) => {
  await pool.query(
    'DELETE FROM category_need WHERE category_id = $1 AND need_id = $2',
    [categoryId, needId]
  );
};

module.exports = {
  getCategoryNeeds,
  getNeedCategories,
  addNeedToCategory,
  removeNeedFromCategory
};