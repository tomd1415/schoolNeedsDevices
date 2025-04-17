const pool = require('../config/db');

const getCategories = async () => {
  const result = await pool.query('SELECT * FROM category ORDER BY category_name');
  return result.rows;
};

const getCategoryById = async (id) => {
  const result = await pool.query('SELECT * FROM category WHERE category_id = $1', [id]);
  return result.rows[0];
};

const addCategory = async (category_name, description) => {
  const result = await pool.query(
    'INSERT INTO category (category_name, description) VALUES ($1, $2) RETURNING *',
    [category_name, description]
  );
  return result.rows[0];
};

const updateCategory = async (id, category_name, description) => {
  const result = await pool.query(
    'UPDATE category SET category_name = $2, description = $3 WHERE category_id = $1 RETURNING *',
    [id, category_name, description]
  );
  return result.rows[0];
};

const deleteCategory = async (id) => {
  await pool.query('DELETE FROM category WHERE category_id = $1', [id]);
};

module.exports = {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory
}; 
