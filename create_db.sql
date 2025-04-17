-- Database creation and setup script for School Needs Devices
-- Updated based on schema_dump.sql

-- Create database (uncomment if needed)
-- CREATE DATABASE school_devices;
-- \c school_devices

-- Create user if it doesn't exist (works with PostgreSQL 9.6+)
DO
$$BEGIN
    CREATE ROLE webuser WITH LOGIN PASSWORD 'clover8556';
    EXCEPTION WHEN DUPLICATE_OBJECT THEN
    RAISE NOTICE 'User webuser already exists';
END$$;

-- Drop tables if they exist (order is important due to FK dependencies)
DROP TABLE IF EXISTS pupil_device_alter CASCADE;
DROP TABLE IF EXISTS need_device CASCADE;
DROP TABLE IF EXISTS pupil_need CASCADE;
DROP TABLE IF EXISTS pupil_need_override CASCADE;
DROP TABLE IF EXISTS pupil_category CASCADE;
DROP TABLE IF EXISTS category_need CASCADE;
DROP TABLE IF EXISTS device CASCADE;
DROP TABLE IF EXISTS need CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS pupil CASCADE;
DROP TABLE IF EXISTS form CASCADE;

-- Create the form table
CREATE TABLE form (
    form_id SERIAL PRIMARY KEY,
    form_year INTEGER NOT NULL,
    form_name VARCHAR(255) NOT NULL,
    teacher_name TEXT,
    form_description TEXT,
    deleted BOOLEAN DEFAULT false NOT NULL
);

-- Create the pupil table
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
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create the need table
CREATE TABLE need (
    need_id SERIAL PRIMARY KEY,
    name TEXT,
    short_description TEXT,
    description TEXT
);

-- Create the category_need junction table
CREATE TABLE category_need (
    category_need_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES category(category_id) ON DELETE CASCADE,
    need_id INTEGER REFERENCES need(need_id) ON DELETE CASCADE,
    UNIQUE (category_id, need_id)
);

-- Create the device table
CREATE TABLE device (
    device_id SERIAL PRIMARY KEY,
    image_link TEXT,
    name TEXT,
    model TEXT,
    serial_number TEXT,
    warranty_info TEXT,
    status TEXT,
    notes TEXT,
    purchase_date DATE,
    category_id INTEGER
);

-- Create the pupil_category junction table
CREATE TABLE pupil_category (
    pupil_category_id SERIAL PRIMARY KEY,
    pupil_id INTEGER REFERENCES pupil(pupil_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES category(category_id) ON DELETE CASCADE,
    UNIQUE (pupil_id, category_id)
);

-- Create the pupil_need junction table
CREATE TABLE pupil_need (
    pupil_need_id SERIAL PRIMARY KEY,
    pupil_id INTEGER NOT NULL REFERENCES pupil(pupil_id) ON DELETE CASCADE,
    need_id INTEGER NOT NULL REFERENCES need(need_id) ON DELETE CASCADE,
    notes TEXT
);

-- Create the pupil_need_override table
CREATE TABLE pupil_need_override (
    override_id SERIAL PRIMARY KEY,
    pupil_id INTEGER REFERENCES pupil(pupil_id) ON DELETE CASCADE,
    need_id INTEGER REFERENCES need(need_id) ON DELETE CASCADE,
    is_added BOOLEAN NOT NULL,
    notes TEXT,
    UNIQUE (pupil_id, need_id)
);

-- Create the need_device junction table
CREATE TABLE need_device (
    need_device_id SERIAL PRIMARY KEY,
    need_id INTEGER NOT NULL REFERENCES need(need_id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES device(device_id) ON DELETE CASCADE,
    notes TEXT,
    assignment_date DATE DEFAULT CURRENT_DATE
);

-- Create the pupil_device_alter table
CREATE TABLE pupil_device_alter (
    pupil_device_alter_id SERIAL PRIMARY KEY,
    pupil_id INTEGER NOT NULL REFERENCES pupil(pupil_id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES device(device_id) ON DELETE CASCADE,
    add_remove VARCHAR(10) NOT NULL CHECK (add_remove IN ('add', 'remove', 'edit')),
    note TEXT
);

-- Grant permissions to webuser
GRANT ALL ON TABLE category TO webuser;
GRANT ALL ON TABLE category_need TO webuser;
GRANT ALL ON TABLE device TO webuser;
GRANT ALL ON TABLE form TO webuser;
GRANT ALL ON TABLE need TO webuser;
GRANT ALL ON TABLE need_device TO webuser;
GRANT ALL ON TABLE pupil TO webuser;
GRANT ALL ON TABLE pupil_category TO webuser;
GRANT ALL ON TABLE pupil_device_alter TO webuser;
GRANT ALL ON TABLE pupil_need TO webuser;
GRANT ALL ON TABLE pupil_need_override TO webuser;

-- Grant permissions on sequences
GRANT ALL ON SEQUENCE category_category_id_seq TO webuser;
GRANT ALL ON SEQUENCE category_need_category_need_id_seq TO webuser;
GRANT ALL ON SEQUENCE device_device_id_seq TO webuser;
GRANT ALL ON SEQUENCE form_form_id_seq TO webuser;
GRANT ALL ON SEQUENCE need_need_id_seq TO webuser;
GRANT ALL ON SEQUENCE need_device_need_device_id_seq TO webuser;
GRANT ALL ON SEQUENCE pupil_pupil_id_seq TO webuser;
GRANT ALL ON SEQUENCE pupil_category_pupil_category_id_seq TO webuser;
GRANT ALL ON SEQUENCE pupil_device_alter_pupil_device_alter_id_seq TO webuser;
GRANT ALL ON SEQUENCE pupil_need_pupil_need_id_seq TO webuser;
GRANT ALL ON SEQUENCE pupil_need_override_override_id_seq TO webuser;

-- Drop view if it exists
DROP VIEW IF EXISTS effective_pupil_needs CASCADE;

-- Create a simpler view that calculates effective needs for pupils
CREATE VIEW effective_pupil_needs AS
SELECT 
    p.pupil_id,
    n.need_id,
    n.name,
    n.short_description,
    n.description,
    CASE
        WHEN o.is_added = TRUE THEN 'Added manually'
        ELSE (
            SELECT string_agg(c.category_name, ', ')
            FROM category c
            JOIN category_need cn ON c.category_id = cn.category_id
            JOIN pupil_category pc ON c.category_id = pc.category_id
            WHERE cn.need_id = n.need_id
              AND pc.pupil_id = p.pupil_id
        )
    END AS sources
FROM 
    pupil p
CROSS JOIN 
    need n
LEFT JOIN 
    pupil_need_override o ON p.pupil_id = o.pupil_id AND n.need_id = o.need_id
WHERE
    -- Include needs from categories
    EXISTS (
        SELECT 1
        FROM pupil_category pc
        JOIN category_need cn ON pc.category_id = cn.category_id
        WHERE pc.pupil_id = p.pupil_id AND cn.need_id = n.need_id
    )
    -- Or needs explicitly added
    OR (o.pupil_id IS NOT NULL AND o.is_added = TRUE)
    -- But exclude needs explicitly removed
    AND NOT EXISTS (
        SELECT 1
        FROM pupil_need_override 
        WHERE pupil_id = p.pupil_id 
        AND need_id = n.need_id 
        AND is_added = FALSE
    );

-- Grant permissions on the view
GRANT SELECT ON effective_pupil_needs TO webuser;
