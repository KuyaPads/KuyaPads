-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the uuid generation function that we'll use as default
-- This is an alternative to uuid-ossp for generating UUIDs
CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS UUID AS $$
SELECT uuid_generate_v4();
$$ LANGUAGE SQL;