-- Create Database
CREATE DATABASE IF NOT EXISTS maintenance_system_db;
USE maintenance_system_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'inspector', 'approver', 'mechanic', 'stores') NOT NULL DEFAULT 'inspector',
    department VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department)
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    department VARCHAR(100) NOT NULL,
    status ENUM('Active', 'In Maintenance', 'Grounded') DEFAULT 'Active',
    chassis_number VARCHAR(100),
    fuel_type ENUM('Petrol', 'Diesel', 'Electric'),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plate_number (plate_number),
    INDEX idx_department (department),
    INDEX idx_status (status)
);

-- Inspection Reports Table
CREATE TABLE IF NOT EXISTS inspection_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id INT NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    vehicle_make_model VARCHAR(100),
    vehicle_department VARCHAR(100),
    inspector_name VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL,
    findings LONGTEXT NOT NULL,
    recommended_parts LONGTEXT,
    estimated_cost DECIMAL(10, 2),
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    photos LONGTEXT,
    status ENUM('Awaiting Approval', 'Approved', 'Rejected', 'Completed', 'Verified') DEFAULT 'Awaiting Approval',
    department_comments LONGTEXT,
    approved_by VARCHAR(100),
    approval_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_report_number (report_number),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_inspection_date (inspection_date)
);

-- Job Cards Table
CREATE TABLE IF NOT EXISTS job_cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_number VARCHAR(50) UNIQUE NOT NULL,
    inspection_report_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    vehicle_make_model VARCHAR(100),
    approved_repair LONGTEXT NOT NULL,
    assigned_mechanic VARCHAR(100),
    start_date DATE,
    completion_date DATE,
    status ENUM('In Progress', 'Awaiting Parts', 'Completed', 'Verified') DEFAULT 'In Progress',
    work_done LONGTEXT,
    notes LONGTEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_job_number (job_number),
    INDEX idx_inspection_report_id (inspection_report_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status)
);

-- Parts Requests Table
CREATE TABLE IF NOT EXISTS parts_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    job_card_id INT NOT NULL,
    job_number VARCHAR(50) NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    request_date DATE NOT NULL,
    items LONGTEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Partially Issued', 'Issued', 'Rejected') DEFAULT 'Pending',
    approved_by VARCHAR(100),
    issue_date DATE,
    voucher_number VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    INDEX idx_request_number (request_number),
    INDEX idx_job_card_id (job_card_id),
    INDEX idx_status (status),
    INDEX idx_request_date (request_date)
);

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) UNIQUE,
    category ENUM('Brakes', 'Engine', 'Electrical', 'Body', 'Suspension', 'Fluids', 'Filters', 'Tyres', 'Other') NOT NULL,
    quantity_in_stock INT DEFAULT 0,
    unit ENUM('Pieces', 'Litres', 'Sets', 'Metres', 'Kg') DEFAULT 'Pieces',
    reorder_level INT DEFAULT 5,
    unit_cost DECIMAL(10, 2) DEFAULT 0,
    location VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_name (part_name),
    INDEX idx_part_number (part_number),
    INDEX idx_category (category),
    INDEX idx_quantity (quantity_in_stock)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message LONGTEXT NOT NULL,
    type ENUM('inspection', 'approval', 'parts', 'completion', 'info') NOT NULL,
    target_department ENUM('Inspection', 'Department Approver', 'Workshop', 'Stores', 'All') NOT NULL,
    reference_id VARCHAR(100),
    is_read TINYINT(1) DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_target_department (target_department),
    INDEX idx_is_read (is_read),
    INDEX idx_created_date (created_date)
);

-- Seed default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, department, is_active) VALUES
('admin@maintenance.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'Administration', 1);

