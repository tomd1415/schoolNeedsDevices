# School Needs Devices

A system to keep track of pupils' needs in the school and the devices that can help them.

## Project Overview

School Needs Devices is a web application designed to help educational institutions manage the relationship between pupils, their specific needs, and the assistive devices assigned to address those needs. This system provides a centralized platform for tracking and managing these relationships.

## Current State

The project has a full-stack implementation with the following components:

### Backend
- Express.js server with RESTful API endpoints
- PostgreSQL database integration
- Models for pupils, forms, categories, needs, and devices
- Controllers for handling CRUD operations
- File upload functionality for CSV imports

### Frontend
- Clean, responsive interface with navigation
- Pages for managing:
  - Pupils
  - Form groups
  - Categories
  - Needs
  - Devices
- Relationship management:
  - Assigning needs to pupils
  - Assigning devices to needs

## Implemented Features

- ✅ Entity management (create, read, delete) for all main entities
- ✅ Dropdown selections for related entities (forms, categories)
- ✅ Navigation menu for easy access to all system components
- ✅ CSV upload for pupil data
- ✅ Assigning needs to pupils
- ✅ Assigning devices to needs

## Known Issues

- ❌ Update functionality for most entities not working correctly
- ❌ Database schema has changed but create_db.sql file is outdated
- ❌ Form year and teacher name handling inconsistencies
- ❌ Device model and category references need corrections
- ❌ Need descriptions (long/short) inconsistent field handling

## Project Structure

```
/
├── public/               # Frontend files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── *.html            # HTML pages
└── server/               # Backend files
    ├── config/           # Database configuration
    ├── controllers/      # API controllers
    ├── models/           # Data models
    ├── routes/           # API routes
    └── uploads/          # Uploaded files
```

## Next Steps

1. Update the create_db.sql file to match the current database schema
2. Fix update functionality for all entities
3. Standardize field naming across models and controllers
4. Add input validation and error handling
5. Implement additional filtering and search capabilities
6. Add reporting functionality

## Usage

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure the database in `server/.env`
4. Start the server with `npm start`
5. Access the application at http://localhost:3000
