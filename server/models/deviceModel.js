const pool = require('../config/db');

const getDevices = async () => {
  const result = await pool.query(`
    SELECT d.*, c.category_name 
    FROM device d
    LEFT JOIN category c ON d.category_id = c.category_id
    ORDER BY d.name
  `);
  return result.rows;
};

const getDeviceById = async (id) => {
  const result = await pool.query(`
    SELECT d.*, c.category_name 
    FROM device d
    LEFT JOIN category c ON d.category_id = c.category_id
    WHERE d.device_id = $1
  `, [id]);
  return result.rows[0];
};

const addDevice = async (name, model, serial_number, purchase_date, warranty_info, status, notes, category_id) => {
  const result = await pool.query(
    `INSERT INTO device (
      name, model, serial_number, purchase_date, warranty_info, status, notes, category_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, model, serial_number, purchase_date, warranty_info, status, notes, category_id]
  );
  return result.rows[0];
};

const updateDevice = async (id, name, model, serial_number, purchase_date, warranty_info, status, notes, category_id) => {
  const result = await pool.query(
    `UPDATE device SET 
      name = $2, model = $3, serial_number = $4, purchase_date = $5, warranty_info = $6, status = $7, notes = $8, category_id = $9
     WHERE device_id = $1 RETURNING *`,
    [id, name, model, serial_number, purchase_date, warranty_info, status, notes, category_id]
  );
  return result.rows[0];
};

const deleteDevice = async (id) => {
  await pool.query('DELETE FROM device WHERE device_id = $1', [id]);
};

// Get devices assigned to a need
const getNeedDevices = async (needId) => {
  const result = await pool.query(`
    SELECT nd.*, d.name, d.model, d.serial_number, d.status
    FROM need_device nd
    JOIN device d ON nd.device_id = d.device_id
    WHERE nd.need_id = $1
    ORDER BY d.name
  `, [needId]);
  return result.rows;
};

// Assign device to a need
const assignDeviceToNeed = async (need_id, device_id, assignment_date, notes) => {
  const result = await pool.query(
    'INSERT INTO need_device (need_id, device_id, assignment_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
    [need_id, device_id, assignment_date, notes]
  );
  return result.rows[0];
};

// Remove device from a need
const removeDeviceFromNeed = async (need_id, device_id) => {
  await pool.query('DELETE FROM need_device WHERE need_id = $1 AND device_id = $2', [need_id, device_id]);
};

// Get devices not assigned to any need
const getUnassignedDevices = async () => {
  const result = await pool.query(`
    SELECT d.*, c.category_name 
    FROM device d
    LEFT JOIN category c ON d.category_id = c.category_id
    WHERE d.device_id NOT IN (
      SELECT DISTINCT device_id FROM need_device
    )
    ORDER BY d.name
  `);
  return result.rows;
};

module.exports = {
  getDevices,
  getDeviceById,
  addDevice,
  updateDevice,
  deleteDevice,
  getNeedDevices,
  assignDeviceToNeed,
  removeDeviceFromNeed,
  getUnassignedDevices
}; 
