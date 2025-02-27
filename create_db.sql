-- Optionally, drop tables if they exist (order is important due to FK dependencies)
DROP TABLE IF EXISTS pupil_device_alter;
DROP TABLE IF EXISTS need_device;
DROP TABLE IF EXISTS pupil_need;
DROP TABLE IF EXISTS device;
DROP TABLE IF EXISTS need;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS pupil;
DROP TABLE IF EXISTS form;

-- Create the form table
CREATE TABLE form (
    form_id SERIAL PRIMARY KEY,
    form_year INTEGER NOT NULL,
    form_name VARCHAR(255) NOT NULL
);

-- Create the pupil table; each pupil belongs to a form
CREATE TABLE pupil (
    pupil_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    form_id INTEGER REFERENCES form(form_id),
    notes TEXT
);

-- Create the category table for need categories
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
    -- You can add additional fields later for subcategories, etc.
);

-- Create the need table with a foreign key to category
CREATE TABLE need (
    need_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES category(category_id),
    need_short_desc VARCHAR(255) NOT NULL,
    need_long_desc TEXT
);

-- Create the device table
CREATE TABLE device (
    device_id SERIAL PRIMARY KEY,
    device_short_desc VARCHAR(255) NOT NULL,
    device_long_desc TEXT,
    image_link TEXT
);

-- Create the pupil_need junction table
CREATE TABLE pupil_need (
    pupil_need_id SERIAL PRIMARY KEY,
    pupil_id INTEGER NOT NULL REFERENCES pupil(pupil_id) ON DELETE CASCADE,
    need_id INTEGER NOT NULL REFERENCES need(need_id) ON DELETE CASCADE,
    note TEXT
);

-- Create the need_device junction table
CREATE TABLE need_device (
    need_device_id SERIAL PRIMARY KEY,
    need_id INTEGER NOT NULL REFERENCES need(need_id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES device(device_id) ON DELETE CASCADE,
    note TEXT
);

-- Create the pupil_device_alter table with updated check constraint
CREATE TABLE pupil_device_alter (
    pupil_device_alter_id SERIAL PRIMARY KEY,
    pupil_id INTEGER NOT NULL REFERENCES pupil(pupil_id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES device(device_id) ON DELETE CASCADE,
    add_remove VARCHAR(10) NOT NULL CHECK (add_remove IN ('add', 'remove', 'edit')),
    note TEXT
);
