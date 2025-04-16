const pool = require('../config/db');

const getPupilNeedOverrides = async (pupilId) => {
  const result = await pool.query(
    'SELECT * FROM pupil_need_override WHERE pupil_id = $1',
    [pupilId]
  );
  return result.rows;
};

const addNeedOverride = async (pupilId, needId, isAdded, notes) => {
  const result = await pool.query(
    'INSERT INTO pupil_need_override (pupil_id, need_id, is_added, notes) VALUES ($1, $2, $3, $4) RETURNING *',
    [pupilId, needId, isAdded, notes]
  );
  return result.rows[0];
};

const updateNeedOverride = async (overrideId, isAdded, notes) => {
  const result = await pool.query(
    'UPDATE pupil_need_override SET is_added = $2, notes = $3 WHERE override_id = $1 RETURNING *',
    [overrideId, isAdded, notes]
  );
  return result.rows[0];
};

const removeNeedOverride = async (overrideId) => {
  await pool.query('DELETE FROM pupil_need_override WHERE override_id = $1', [overrideId]);
};

module.exports = {
  getPupilNeedOverrides,
  addNeedOverride,
  updateNeedOverride,
  removeNeedOverride
};