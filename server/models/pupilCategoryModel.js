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
  // This is a complex query that:
  // 1. Gets all needs from categories assigned to the pupil
  // 2. Adds needs that are explicitly added via overrides
  // 3. Removes needs that are explicitly removed via overrides
  
  const query = `
    WITH category_needs AS (
      -- Get all needs from categories assigned to the pupil
      SELECT 
        n.need_id, 
        n.name, 
        n.description,
        n.short_description,
        c.category_id::integer,
        c.category_name,
        string_agg(c.category_name, ', ') AS categories
      FROM need n
      JOIN category_need cn ON n.need_id = cn.need_id
      JOIN category c ON cn.category_id = c.category_id
      JOIN pupil_category pc ON c.category_id = pc.category_id
      WHERE pc.pupil_id = $1
      GROUP BY n.need_id, n.name, n.description, n.short_description, c.category_id, c.category_name
    ),
    added_needs AS (
      -- Get needs explicitly added via overrides
      SELECT 
        n.need_id, 
        n.name, 
        n.description,
        n.short_description,
        NULL::integer as category_id,
        NULL::text as category_name,
        NULL::text as categories
      FROM pupil_need_override pno
      JOIN need n ON pno.need_id = n.need_id
      WHERE pno.pupil_id = $1 AND pno.is_added = true
    ),
    removed_needs AS (
      -- Get needs explicitly removed via overrides
      SELECT need_id
      FROM pupil_need_override
      WHERE pupil_id = $1 AND is_added = false
    )
    -- Combine all needs that apply to the pupil
    SELECT * FROM (
      SELECT * FROM category_needs
      UNION
      SELECT * FROM added_needs
    ) AS all_needs
    WHERE need_id NOT IN (SELECT need_id FROM removed_needs)
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