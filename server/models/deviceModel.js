const pool = require('../config/db');

const getDevices = async () => {
  const result = await pool.query(`
    SELECT d.*, c.category_name 
    FROM device d
    LEFT JOIN category c ON d.device_category_id = c.category_id
    ORDER BY d.device_name
  `);
  return result.rows;
};

const getDeviceById = async (id) => {
  const result = await pool.query(`
    SELECT d.*, c.category_name 
    FROM device d
    LEFT JOIN category c ON d.device_category_id = c.category_id
    WHERE d.device_id = $1
  `, [id]);
  return result.rows[0];
};

const addDevice = async (device_name, model, serial_number, purchase_date, warranty_info, status, notes, category_id) => {
  const result = await pool.query(
    `INSERT INTO device (
      device_name, device_model, device_serial_number, device_purchase_date, device_warranty_info, device_status, device_notes, device_category_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [device_name, model, serial_number, purchase_date, warranty_info, status, notes, category_id]
  );
  return result.rows[0];
};

const updateDevice = async (id, device_name, model, serial_number, purchase_date, warranty_info, status, notes, category_id) => {
  const result = await pool.query(
    `UPDATE device SET 
      device_name = $2, device_model = $3, device_serial_number = $4, device_purchase_date = $5, device_warranty_info = $6, device_status = $7, device_notes = $8, device_category_id = $9`
    [id, device_name, model, serial_number, purchase_date, warranty_info, status, notes, category_id]
  );
  return result.rows[0];
};

const deleteDevice = async (id) => {
  await pool.query('DELETE FROM device WHERE device_id = $1', [id]);
};

// Get devices assigned to a need
const getNeedDevices = async (needId) => {
  const result = await pool.query(`
    SELECT nd.*, d.device_name, d.device_model, d.device_serial_number, d.device_status
    FROM need_device nd
    JOIN device d ON nd.device_id = d.device_id
    WHERE nd.need_id = $1
    ORDER BY d.device_name
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

module.exports = {
  getDevices,
  getDeviceById,
  addDevice,
  updateDevice,
  deleteDevice,
  getNeedDevices,
  assignDeviceToNeed,
  removeDeviceFromNeed
}; 
