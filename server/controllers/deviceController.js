const deviceModel = require('../models/deviceModel');

const getAllDevices = async (req, res) => {
  try {
    const devices = await deviceModel.getDevices();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDeviceById = async (req, res) => {
  const id = req.params.id;
  try {
    const device = await deviceModel.getDeviceById(id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createDevice = async (req, res) => {
  const { 
    device_name, model, serial_number, purchase_date, 
    warranty_info, status, notes, category_id 
  } = req.body;
  
  try {
    const newDevice = await deviceModel.addDevice(
      device_name, model, serial_number, purchase_date, 
      warranty_info, status, notes, category_id
    );
    res.status(201).json(newDevice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDevice = async (req, res) => {
  const id = req.params.id;
  const { 
    device_name, model, serial_number, purchase_date, 
    warranty_info, status, notes, category_id 
  } = req.body;
  
  try {
    const updatedDevice = await deviceModel.updateDevice(
      id, device_name, model, serial_number, purchase_date, 
      warranty_info, status, notes, category_id
    );
    
    if (!updatedDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(updatedDevice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDevice = async (req, res) => {
  const id = req.params.id;
  try {
    await deviceModel.deleteDevice(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get devices for a need
const getNeedDevices = async (req, res) => {
  const needId = req.params.needId;
  try {
    const devices = await deviceModel.getNeedDevices(needId);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign device to a need
const assignDeviceToNeed = async (req, res) => {
  const { need_id, device_id, assignment_date, notes } = req.body;
  try {
    const result = await deviceModel.assignDeviceToNeed(need_id, device_id, assignment_date, notes);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove device from a need
const removeDeviceFromNeed = async (req, res) => {
  const need_id = req.params.needId;
  const device_id = req.params.deviceId;
  try {
    await deviceModel.removeDeviceFromNeed(need_id, device_id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get devices not assigned to any need
const getUnassignedDevices = async (req, res) => {
  try {
    const devices = await deviceModel.getUnassignedDevices();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  getNeedDevices,
  assignDeviceToNeed,
  removeDeviceFromNeed,
  getUnassignedDevices
}; 