-- Database setup for Pharmacy Management System
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pharmacy_db;

-- Use the database
USE pharmacy_db;

-- Drop existing tables if they exist (to ensure clean state)
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS customers;

-- Create medicines table with only required fields
CREATE TABLE medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    medicine_type VARCHAR(50) NOT NULL,
    no_of_medicines INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    expired_date DATE NOT NULL,
    price DECIMAL(10,2) DEFAULT NULL,
    batch_number VARCHAR(50) DEFAULT NULL,
    manufacturer VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    INDEX idx_medicine_name (medicine_name),
    INDEX idx_medicine_type (medicine_type),
    INDEX idx_status (status),
    INDEX idx_expired_date (expired_date)
);

-- Create customers table with only required fields
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL,
    -- last_transaction DATETIME DEFAULT NULL,
    -- is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    INDEX idx_customer_name (customer_name),
    INDEX idx_phone_number (phone_number),
    INDEX idx_email (email)
);

-- Insert sample data for testing
INSERT INTO medicines (medicine_name, medicine_type, no_of_medicines, status, expired_date, price) VALUES
('Paracetamol', 'Pain Relief', 100, 'Available', '2025-12-31', 5.50),
('Amoxicillin', 'Antibiotic', 50, 'Available', '2025-10-15', 12.75),
('Aspirin', 'Blood Thinner', 75, 'Available', '2026-03-20', 8.25);

-- Insert sample customers for testing
INSERT INTO customers (customer_name, phone_number, email, gender) VALUES
('John Doe', '(555) 123-4567', 'john.doe@email.com', 'Male'),
('Jane Smith', '(555) 987-6543', 'jane.smith@email.com', 'Female');

-- Show created tables
SHOW TABLES;

-- Show medicines table structure
DESCRIBE medicines;

-- Show sample data
SELECT * FROM medicines;
SELECT * FROM customers;
