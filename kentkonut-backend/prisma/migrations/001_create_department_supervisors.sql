-- Migration: Create Department Supervisors System
-- Date: 2025-01-22
-- Description: Creates department_supervisors table and updates departments table

-- Create department_supervisors table
CREATE TABLE IF NOT EXISTS department_supervisors (
    id VARCHAR(255) PRIMARY KEY,
    department_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    main_image_url TEXT,
    documents JSON,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_department_supervisors_department 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_department_supervisors_department_id (department_id),
    INDEX idx_department_supervisors_active (is_active),
    INDEX idx_department_supervisors_order (order_index),
    INDEX idx_department_supervisors_position (position)
);

-- Add slug column to departments table if not exists
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Remove manager_id column from departments table if exists
-- (This is optional - only if the column exists)
-- ALTER TABLE departments DROP COLUMN IF EXISTS manager_id;

-- Create index on departments slug for performance
CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);

-- Insert sample data for testing (optional)
-- INSERT INTO department_supervisors (id, department_id, full_name, position, order_index, is_active) VALUES
-- ('supervisor-1', 'dept-1', 'Ahmet Yılmaz', 'mudur', 1, true),
-- ('supervisor-2', 'dept-1', 'Fatma Kaya', 'sef', 2, true);

-- Migration completed successfully
