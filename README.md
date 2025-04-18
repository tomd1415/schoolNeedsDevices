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
   - A need can belong to multiple categories (many-to-many relationship)
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
- Comprehensive pupil profile API that aggregates related data

### Frontend
- Clean, responsive interface with navigation
- Pages for managing entities and relationships
- Forms for creating and editing records
- Modal dialogs for managing relationships
- Advanced pupil search with autocomplete functionality
- Print-optimized pupil profile view for A4 portrait paper

## Implemented Features

- ✅ Entity management (create, read, delete) for all main entities
- ✅ Relationship management for categories and needs
- ✅ Relationship management for pupils and categories
- ✅ Need override system for individual pupil customization
- ✅ Device assignment to address specific needs
- ✅ Dropdown selections for related entities
- ✅ CSV upload for pupil data
- ✅ Many-to-many relationship between needs and categories
- ✅ Effective needs calculation based on pupil categories and overrides
- ✅ Comprehensive pupil search with autocomplete
- ✅ Detailed pupil profile view showing all related information
- ✅ Print-optimized layout for pupil profiles

## Recently Resolved Issues

- ✅ Routes for pupil-category and category-needs now registered in the main server file
- ✅ Integration of the effective needs calculation in the frontend
- ✅ Fixed inconsistencies in field naming between database and code (standardized on snake_case)
- ✅ PostgreSQL query parameters are now correctly using $1, $2 format instead of ? placeholders
- ✅ Added proper validation to prevent empty database records
- ✅ Fixed category-to-pupil assignment functionality
- ✅ Fixed route order in Express for correct handling of specific vs. wildcard routes
- ✅ Fixed pupil search functionality with proper DOM management to prevent null element errors
- ✅ Improved error handling in the pupil profile display

## Remaining Issues

- ❌ Update functionality for some entities not fully implemented
- ❌ create_db.sql file needs updating to match the current schema_dump.sql
- ❌ Some inconsistencies in handling need descriptions (short vs. long)

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

## Database Schema

The database uses a relational structure with the following key tables:

- `category`: Stores categories of needs
- `need`: Stores individual needs
- `category_need`: Junction table for many-to-many relationship between categories and needs
- `pupil`: Stores pupil information
- `pupil_category`: Junction table linking pupils to categories
- `pupil_need_override`: Stores overrides that add or remove specific needs for pupils
- `device`: Stores device information
- `need_device`: Junction table linking needs to their associated devices

## Key Workflows

1. **Category-Need Management**
   - Create categories representing types of needs
   - Create individual needs
   - Assign needs to appropriate categories using the "Manage Categories" feature

2. **Pupil Management**
   - Create pupil records
   - Assign categories to pupils (which automatically assigns all needs in those categories)
   - Create individual overrides by adding or removing specific needs
   - View effective needs based on categories and overrides

3. **Device Management**
   - Create device records with appropriate details
   - Assign devices to address specific needs for pupils

4. **Pupil Search & Profile**
   - Search for pupils by name with autocomplete suggestions
   - View comprehensive pupil profiles showing all related information
   - Print pupil profiles in A4 portrait format

## Next Steps

1. Update the create_db.sql file to match the current database schema
2. Fix update functionality for all entities
3. Add more comprehensive validation and error handling
4. Implement in-place editing functionality for pupil profiles
   - Allow direct editing of pupil details from the search page
   - Enable adding/removing categories directly from profile view
   - Provide interface for managing need overrides inline
   - Add ability to assign/unassign devices from the profile page
5. Add reporting functionality
6. Add user authentication and authorization
7. Implement audit trails for tracking changes

## Usage

1. Clone the repository
2. Install dependencies with `npm install` in the server directory
3. Configure the database in `server/.env`
4. Set up the database schema using the latest schema_dump.sql file
5. Start the server with `node index.js` from the server directory
6. Access the application at http://localhost:5000
