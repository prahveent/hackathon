-- Database initialization script for hackathon project
-- This script will be executed when the PostgreSQL container starts

-- Create the database and user (if they don't exist)
-- Note: These are already created via environment variables, but this ensures permissions

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE hackathon_db TO hackathon_user;

-- Grant schema privileges for PostgreSQL 15+
GRANT ALL ON SCHEMA public TO hackathon_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hackathon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hackathon_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hackathon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hackathon_user;

-- Create some sample data (optional)
-- This will be created after Entity Framework migrations run

SELECT 'Database initialization completed successfully!' as message;
