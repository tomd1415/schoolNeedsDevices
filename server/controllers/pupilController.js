const db = require('../config/db');

/**
 * Get all pupils
 */
exports.getAllPupils = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, f.form_name 
      FROM pupil p
      LEFT JOIN form f ON p.form_id = f.form_id
      ORDER BY p.last_name, p.first_name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pupils:', error);
    res.status(500).json({ error: 'Failed to fetch pupils' });
  }
};

/**
 * Get a pupil by ID
 */
exports.getPupilById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM pupil WHERE pupil_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pupil not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching pupil:', error);
    res.status(500).json({ error: 'Failed to fetch pupil' });
  }
};

/**
 * Create a new pupil
 */
exports.createPupil = async (req, res) => {
  try {
    const { first_name, last_name, form_id, notes } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const result = await db.query(
      'INSERT INTO pupil (first_name, last_name, form_id, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, form_id, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating pupil:', error);
    res.status(500).json({ error: 'Failed to create pupil' });
  }
};

/**
 * Update a pupil
 */
exports.updatePupil = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, form_id, notes } = req.body;
    
    console.log('Update request for pupil ID:', id);
    console.log('Request body:', req.body);
    
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Handle form_id properly (it can be null, but not undefined)
    const formIdParam = form_id === undefined ? null : form_id;
    const notesParam = notes === undefined ? null : notes;
    
    console.log('Using parameters:', { first_name, last_name, form_id: formIdParam, notes: notesParam });
    
    const result = await db.query(
      'UPDATE pupil SET first_name = $1, last_name = $2, form_id = $3, notes = $4 WHERE pupil_id = $5 RETURNING *',
      [first_name, last_name, formIdParam, notesParam, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pupil not found' });
    }
    
    console.log('Update successful. Returning:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pupil:', error);
    res.status(500).json({ error: 'Failed to update pupil: ' + error.message });
  }
};

/**
 * Delete a pupil
 */
exports.deletePupil = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM pupil WHERE pupil_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pupil not found' });
    }
    
    res.json({ message: 'Pupil deleted successfully' });
  } catch (error) {
    console.error('Error deleting pupil:', error);
    res.status(500).json({ error: 'Failed to delete pupil' });
  }
};

/**
 * Search for pupils by name
 */
exports.searchPupils = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    // Search for pupils with first_name or last_name containing the search term
    const result = await db.query(`
      SELECT pupil_id, first_name, last_name, form_id 
      FROM pupil 
      WHERE 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR
        CONCAT(first_name, ' ', last_name) ILIKE $1
      ORDER BY last_name, first_name
      LIMIT 20
    `, [`%${term}%`]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching pupils:', error);
    res.status(500).json({ error: 'Failed to search pupils' });
  }
};
