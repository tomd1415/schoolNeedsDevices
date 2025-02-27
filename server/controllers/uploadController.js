const csv = require('csv-parser');
const fs = require('fs');
const pupilModel = require('../models/pupilModel');

const uploadPupilsCSV = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Assuming the CSV has columns: first_name, last_name, form_id, notes
        for (const row of results) {
          await pupilModel.addPupil(row.first_name, row.last_name, row.form_id, row.notes);
        }
        res.json({ message: 'CSV upload successful', count: results.length });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
};

module.exports = {
  uploadPupilsCSV
};
