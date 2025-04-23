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
- Database view for effective pupil needs calculation

### Frontend
- Clean, responsive interface with navigation and consistent styling
- Interactive landing page with card-based navigation
- Pages for managing entities and relationships
- Forms for creating and editing records
- Modal dialogs for managing relationships
- Advanced pupil search with autocomplete functionality
- Print-optimized pupil profile view for A4 portrait paper
- Modular JavaScript architecture for the pupil search and profile features
- Enhanced UI with icons, gradients, and visual feedback for user actions

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
- ✅ In-place editing of pupil details from the search page
- ✅ Adding/removing categories directly from profile view
- ✅ Interface for managing need overrides inline
- ✅ Ability to assign/unassign devices from the profile page
- ✅ Client and server-side validation for duplicate category assignments
- ✅ Proper removal of needs via the override system
- ✅ Consistent UI styling across all pages
- ✅ Intuitive navigation with visual feedback
- ✅ Responsive design for various screen sizes

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
- ✅ Fixed JSON parsing errors when removing devices and categories
- ✅ Refactored pupil-search.js into modular components for better maintainability
- ✅ Fixed issue with effective needs calculation to properly exclude removed needs
- ✅ Implemented proper client and server-side validation for pupil-category assignments
- ✅ Updated database queries to use the effective_pupil_needs view consistently
- ✅ Fixed UI inconsistencies in the landing page and pupil search page
- ✅ Enhanced the landing page with fully clickable cards and consistent icons
- ✅ Added hero sections to all pages for consistent styling
- ✅ Fixed background styling for the pupil search card
- ✅ Corrected button styling inconsistencies across the application
- ✅ Fixed center card positioning in the landing page's circular menu

## Remaining Issues

- ❌ Update functionality for some entities not fully implemented
- ❌ create_db.sql file needs updating to match the current schema_dump.sql
- ❌ Some inconsistencies in handling need descriptions (short vs. long)
- ❌ Need for more comprehensive input validation
- ❌ Error feedback to users could be improved

## Project Structure

```
/
├── public/                     # Frontend files
│   ├── css/                    # Stylesheets
│   │   ├── common.css          # Shared styles
│   │   ├── index.css           # Landing page styles
│   │   ├── pupil-search.css    # Styles for pupil search
│   │   ├── validation.css      # Form validation styles
│   │   └── ...                 # Other stylesheets
│   ├── js/                     # JavaScript files
│   │   ├── pupil-search/       # Modular components for pupil search
│   │   │   ├── core.js         # Core state and initialization
│   │   │   ├── profile.js      # Pupil profile loading and display
│   │   │   ├── category-manager.js # Category management
│   │   │   ├── device-manager.js   # Device management
│   │   │   ├── override-manager.js # Override management
│   │   │   ├── needs-override-manager.js # Need override specific logic
│   │   │   ├── ui.js           # UI interactions
│   │   │   ├── modal-utils.js  # Modal dialog utilities
│   │   │   └── main.js         # Entry point
│   │   ├── validation/         # Form validation scripts
│   │   └── ...                 # Other JS files for each page
│   ├── img/                    # Image assets
│   │   ├── main-bg.png         # Main background image
│   │   ├── hero-bg.png         # Hero section background
│   │   └── ...                 # Other images
│   └── *.html                  # HTML pages
└── server/                     # Backend files
    ├── config/                 # Database configuration
    ├── controllers/            # API controllers
    │   ├── categoryController.js     # Category management
    │   ├── deviceController.js       # Device management
    │   ├── formController.js         # Form management
    │   ├── needController.js         # Need management
    │   ├── pupilController.js        # Pupil management
    │   ├── pupilCategoryController.js # Pupil-category relationships
    │   ├── pupilProfileController.js  # Comprehensive pupil profiles
    │   ├── pupilNeedOverrideController.js # Need override management
    │   └── ...                       # Other controllers
    ├── models/                 # Data models
    ├── routes/                 # API routes
    ├── uploads/                # Uploaded files
    └── index.js                # Server entry point
```

## Database Schema

The database uses a relational structure with the following key tables:

- `form`: Stores form/class information
- `pupil`: Stores pupil information
- `category`: Stores categories of needs
- `need`: Stores individual needs
- `device`: Stores device information
- `category_need`: Junction table for many-to-many relationship between categories and needs
- `pupil_category`: Junction table linking pupils to categories
- `pupil_need_override`: Stores overrides that add or remove specific needs for pupils
- `need_device`: Junction table linking needs to their associated devices
- `pupil_device_alter`: Tracks changes to pupil-device assignments
- `effective_pupil_needs`: View that calculates a pupil's effective needs based on their categories and overrides

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
   - Edit pupil details directly from the profile
   - Add/remove categories and manage need overrides
   - Assign/unassign devices for specific needs

## Next Steps

1. Update the create_db.sql file to match the current database schema
2. Fix update functionality for all entities
3. Add more comprehensive validation and error handling
4. Add reporting functionality
5. Add user authentication and authorization
6. Implement audit trails for tracking changes
7. Add data visualization for needs and device distribution
8. Improve mobile responsiveness for tablet and phone use
9. Add dark mode support

## Usage

1. Clone the repository
2. Install dependencies with `npm install` in the server directory
3. Configure the database in `server/.env`
4. Set up the database schema using the latest schema_dump.sql file
5. Start the server with `node index.js` from the server directory
6. Access the application at http://localhost:5000

## Screenshots

(Future enhancement: Add screenshots showcasing the key interfaces of the application)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms of the license included in the repository.
