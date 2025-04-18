const pool = require('../config/db');

// Get categories assigned to a pupil
const getPupilCategories = async (pupilId) => {
  const query = `
    SELECT c.* 
    FROM category c
    JOIN pupil_category pc ON c.category_id = pc.category_id
    WHERE pc.pupil_id = $1
    ORDER BY c.category_name
  `;
  const result = await pool.query(query, [pupilId]);
  return result.rows;
};

// Assign a category to a pupil
const assignCategory = async (pupilId, categoryId) => {
  console.log('assignCategory called with:', { pupilId, categoryId });
  
  try {
    // Check if the category is already assigned to this pupil
    const checkQuery = 'SELECT 1 FROM pupil_category WHERE pupil_id = $1 AND category_id = $2';
    const checkResult = await pool.query(checkQuery, [pupilId, categoryId]);
    
    // If category is already assigned, throw an error with appropriate message
    if (checkResult.rows.length > 0) {
      const error = new Error('Category is already assigned to this pupil');
      error.code = 'DUPLICATE_CATEGORY';
      throw error;
    }
    
    // If not already assigned, proceed with insertion
    const query = 'INSERT INTO pupil_category (pupil_id, category_id) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [pupilId, categoryId]);
    console.log('Category assigned result:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in assignCategory:', error);
    throw error;
  }
};

// Remove a category from a pupil
const removeCategory = async (pupilId, categoryId) => {
  const query = 'DELETE FROM pupil_category WHERE pupil_id = $1 AND category_id = $2';
  await pool.query(query, [pupilId, categoryId]);
};

// Get all need overrides for a pupil
const getNeedOverrides = async (pupilId) => {
  const query = `
    SELECT * FROM pupil_need_override
    WHERE pupil_id = $1
    ORDER BY override_id DESC
  `;
  const result = await pool.query(query, [pupilId]);
  return result.rows;
};

// Add a need override (add or remove a need)
const addNeedOverride = async (pupilId, needId, isAdded, notes) => {
  const query = `
    INSERT INTO pupil_need_override 
    (pupil_id, need_id, is_added, notes) 
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await pool.query(query, [pupilId, needId, isAdded, notes]);
  return result.rows[0];
};

// Remove a need override
const removeNeedOverride = async (overrideId) => {
  const query = 'DELETE FROM pupil_need_override WHERE override_id = $1';
  await pool.query(query, [overrideId]);
};

// Get effective needs for a pupil (considering categories and overrides)
const getEffectivePupilNeeds = async (pupilId) => {
  // Use the database view instead of the complex query
  const query = `
    SELECT * FROM effective_pupil_needs
    WHERE pupil_id = $1
    ORDER BY name
  `;
  
  const result = await pool.query(query, [pupilId]);
  return result.rows;
};

module.exports = {
  getPupilCategories,
  assignCategory,
  removeCategory,
  getNeedOverrides,
  addNeedOverride,
  removeNeedOverride,
  getEffectivePupilNeeds
};