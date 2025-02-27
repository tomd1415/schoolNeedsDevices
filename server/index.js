const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const pupilRoutes = require('./routes/pupils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// API routes for pupil management
app.use('/api/pupils', pupilRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
