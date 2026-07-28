-- =============================================
-- PostgreSQL Database Initialization Script
-- Run this script to set up the database
-- =============================================

-- Connect to PostgreSQL as superuser and run:
-- psql -U postgres -f init.sql

-- Create the database
DROP DATABASE IF EXISTS book_inventory;
CREATE DATABASE book_inventory;

-- Create a dedicated user for the application
DROP USER IF EXISTS book_admin;
CREATE USER book_admin WITH ENCRYPTED PASSWORD 'book_admin_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE book_inventory TO book_admin;

-- Connect to the new database and set up permissions
\c book_inventory

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO book_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO book_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO book_admin;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO book_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO book_admin;

\echo 'Database initialization complete!'
\echo 'Now run: psql -U book_admin -d book_inventory -f schema.sql'
