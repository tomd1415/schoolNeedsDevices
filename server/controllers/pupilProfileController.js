const db = require('../config/db');

/**
 * Get a comprehensive pupil profile including categories, needs, devices, etc.
 */
exports.getPupilProfile = async (req, res) => {
  try {
    const { pupil_id, name } = req.query;
    let pupilId;
    
    // If no identifier is provided, return an error
    if (!pupil_id && !name) {
      return res.status(400).json({ error: 'Pupil ID or name is required' });
    }
    
    // If pupil_id is provided, use it directly
    if (pupil_id) {
      pupilId = pupil_id;
    } 
    // If name is provided, search for the pupil by name
    else if (name) {
      const nameResult = await db.query(`
        SELECT pupil_id FROM pupil 
        WHERE CONCAT(first_name, ' ', last_name) ILIKE $1
        LIMIT 1
      `, [name]);
      
      if (nameResult.rows.length === 0) {
        return res.status(404).json({ error: 'No pupil found with that name' });
      }
      
      pupilId = nameResult.rows[0].pupil_id;
    }
    
    // Get basic pupil information including form details
    const pupilResult = await db.query(`
      SELECT p.*, f.form_name, f.form_year, f.teacher_name
      FROM pupil p
      LEFT JOIN form f ON p.form_id = f.form_id
      WHERE p.pupil_id = $1
    `, [pupilId]);
    
    if (pupilResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pupil not found' });
    }
    
    const pupilData = pupilResult.rows[0];
    
    // Format form data if it exists
    if (pupilData.form_id) {
      pupilData.form = {
        form_id: pupilData.form_id,
        form_name: pupilData.form_name,
        form_year: pupilData.form_year,
        teacher_name: pupilData.teacher_name
      };
    }
    
    // Remove redundant form fields
    delete pupilData.form_name;
    delete pupilData.form_year;
    delete pupilData.teacher_name;
    
    // Get categories assigned to the pupil
    const categoriesResult = await db.query(`
      SELECT c.category_id, c.category_name, c.description
      FROM category c
      JOIN pupil_category pc ON c.category_id = pc.category_id
      WHERE pc.pupil_id = $1
      ORDER BY c.category_name
    `, [pupilId]);
    
    pupilData.categories = categoriesResult.rows;
    
    // Get effective needs for the pupil using the view
    const needsResult = await db.query(`
      SELECT * FROM effective_pupil_needs
      WHERE pupil_id = $1
      ORDER BY name
    `, [pupilId]);
    
    pupilData.effective_needs = needsResult.rows;
    
    // Get need overrides
    const overridesResult = await db.query(`
      SELECT pno.*, n.name AS need_name
      FROM pupil_need_override pno
      JOIN need n ON pno.need_id = n.need_id
      WHERE pno.pupil_id = $1
      ORDER BY n.name
    `, [pupilId]);
    
    pupilData.need_overrides = overridesResult.rows;
    
    // Get devices assigned to pupil's needs
    const devicesResult = await db.query(`
      SELECT d.*, nd.need_id, nd.assignment_date, nd.notes AS assignment_notes, n.name AS need_name
      FROM device d
      JOIN need_device nd ON d.device_id = nd.device_id
      JOIN need n ON nd.need_id = n.need_id
      JOIN effective_pupil_needs epn ON n.need_id = epn.need_id
      WHERE epn.pupil_id = $1
      ORDER BY d.name
    `, [pupilId]);
    
    // Format device data
    pupilData.devices = devicesResult.rows.map(device => ({
      device_id: device.device_id,
      device_name: device.name,
      model: device.model,
      serial_number: device.serial_number,
      need_id: device.need_id,
      need_name: device.need_name,
      assignment_date: device.assignment_date,
      notes: device.assignment_notes || device.notes
    }));
    
    res.json(pupilData);
  } catch (error) {
    console.error('Error fetching pupil profile:', error);
    res.status(500).json({ error: 'Failed to fetch pupil profile' });
  }
}; 