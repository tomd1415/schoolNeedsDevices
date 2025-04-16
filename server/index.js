const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const pupilRoutes = require('./routes/pupils');
const formRoutes = require('./routes/forms');
const categoryRoutes = require('./routes/categories');
const needRoutes = require('./routes/needs');
const deviceRoutes = require('./routes/devices');
const pupilCategoryRoutes = require('./routes/pupilCategoryRoutes');
const categoryNeedRoutes = require('./routes/categoryNeedRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/pupils', pupilRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/pupil-categories', pupilCategoryRoutes);
app.use('/api/category-needs', categoryNeedRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
