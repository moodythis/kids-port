-- Create the database
CREATE DATABASE IF NOT EXISTS kids_harbor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kids_harbor;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customerName VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerEmail VARCHAR(255),
    customerBirthdate DATE,
    customerGender ENUM('male', 'female'),
    customerNationality VARCHAR(50),
    customerAddress TEXT,
    emergencyContact VARCHAR(255),
    emergencyPhone VARCHAR(20),
    customerNotes TEXT,
    allowMarketing BOOLEAN DEFAULT FALSE,
    visits INT DEFAULT 0,
    totalSpent DECIMAL(10,3) DEFAULT 0,
    lastVisit DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    packageName VARCHAR(255) NOT NULL,
    packageDescription TEXT,
    price DECIMAL(10,3) NOT NULL,
    duration INT DEFAULT 0,
    packageType ENUM('time', 'party', 'food', 'other') DEFAULT 'time',
    color VARCHAR(50) DEFAULT 'bg-blue',
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticketNumber VARCHAR(50) NOT NULL,
    customerId INT,
    total DECIMAL(10,3) NOT NULL,
    paymentMethod ENUM('cash', 'card', 'transfer') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    saleId INT NOT NULL,
    packageId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,3) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (packageId) REFERENCES packages(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default packages
INSERT INTO packages (packageName, packageDescription, price, duration, packageType, color) VALUES
('باقة الساعة الواحدة', 'لعب حر لمدة ساعة واحدة', 3.000, 60, 'time', 'bg-blue'),
('باقة الساعتين', 'لعب حر لمدة ساعتين', 5.000, 120, 'time', 'bg-green'),
('باقة نصف يوم', 'لعب حر لمدة 4 ساعات', 8.000, 240, 'time', 'bg-purple'),
('باقة اليوم الكامل', 'لعب حر طوال اليوم', 12.000, 480, 'time', 'bg-orange'),
('باقة الحفلة', 'حجز غرفة حفلات لمدة 3 ساعات', 25.000, 180, 'party', 'bg-pink'),
('وجبة سعيدة', 'وجبة أطفال مع لعبة', 4.500, 0, 'food', 'bg-yellow');
