-- Migration: Create basic utility functions (no table dependencies)
-- Table-dependent functions are in 003b_create_functions_with_deps.sql

-- Function: update_updated_at_column
-- Automatically updates the updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
