# School Needs Devices

A system to keep track of pupils' needs in the school and the devices that can help them.

## Project Overview

School Needs Devices is a web application designed to help educational institutions manage the relationship between pupils, their specific needs, and the assistive devices assigned to address those needs. The system enables administrators to categorize needs, assign categories to pupils, and track devices allocated to meet these needs.

## Core Concepts

### Data Model and Relationships

1. **Categories**: Represent types of needs or requirements (e.g., Visual Impairment, Learning Support)
   - A category can contain multiple needs
   - A category can be assigned to multiple pupils

2. **Needs**: Specific requirements or accommodations (e.g., Screen Reader, Extended Time)
   - A need can belong to multiple categories
   - A need is automatically assigned to a pupil when its category is assigned to that pupil
   - Individual needs can be added to or removed from specific pupils via overrides

3. **Pupils**: Students in the school
   - A pupil can be assigned to multiple categories
   - A pupil receives all needs from their assigned categories, with possible individual overrides

4. **Devices**: Physical or software tools that address specific needs
   - Devices are assigned to address specific needs for specific pupils

## Current State

The project has a full-stack implementation with the following components:

### Backend
- Express.js server with RESTful API endpoints
- PostgreSQL database with many-to-many relationships
- Models for pupils, forms, categories, needs, devices, and their relationships
- Controllers for CRUD operations and relationship management
- File upload functionality for CSV imports

### Frontend
- Clean, responsive interface with navigation
- Pages for managing entities and relationships
- Forms for creating and editing records

## Implemented Features

- ✅ Entity management (create, read, delete) for all main entities
- ✅ Relationship management for categories and needs
- ✅ Relationship management for pupils and categories
- ✅ Need override system for individual pupil customization
- ✅ Device assignment to address specific needs
- ✅ Dropdown selections for related entities
- ✅ CSV upload for pupil data

## Known Issues

- ❌ Update functionality for most entities not working correctly
- ❌ Database schema has changed but create_db.sql file is outdated
- ❌ Inconsistencies in field naming between database and code (prefixed vs. non-prefixed)
- ❌ Missing integration of the effective needs calculation in the frontend
- ❌ Routes for pupil-category and category-needs not registered in the main server file
- ❌ Inconsistent handling of need descriptions (short vs. long)

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

## Key Workflows

1. **Category-Need Management**
   - Create categories representing types of needs
   - Create individual needs
   - Assign needs to appropriate categories

2. **Pupil Management**
   - Create pupil records
   - Assign categories to pupils (which automatically assigns all needs in those categories)
   - Create individual overrides by adding or removing specific needs

3. **Device Management**
   - Create device records with appropriate details
   - Assign devices to address specific needs for pupils

## Next Steps

1. Register missing routes in server/index.js
2. Implement the effective needs calculation in needModel.js
3. Update the create_db.sql file to match the current database schema
4. Fix field naming inconsistencies across models and database
5. Fix update functionality for all entities
6. Update the frontend to work with the new relationship structure
7. Add validation and error handling
8. Create dedicated UI for viewing effective needs based on categories and overrides
9. Add reporting functionality

## Usage

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure the database in `server/.env`
4. Set up the database schema using the latest SQL file
5. Start the server with `npm start`
6. Access the application at http://localhost:3000
