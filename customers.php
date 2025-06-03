<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$action = $_GET['action'] ?? '';

switch($action) {
    case 'add':
        addCustomer();
        break;
    case 'get':
        getCustomers();
        break;
    case 'update':
        updateCustomer();
        break;
    case 'delete':
        deleteCustomer();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function addCustomer() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO customers (customerName, customerPhone, customerEmail, 
            customerBirthdate, customerGender, customerNationality, customerAddress, 
            emergencyContact, emergencyPhone, customerNotes, allowMarketing) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $data['customerName'],
            $data['customerPhone'],
            $data['customerEmail'] ?? null,
            $data['customerBirthdate'] ?? null,
            $data['customerGender'] ?? null,
            $data['customerNationality'] ?? null,
            $data['customerAddress'] ?? null,
            $data['emergencyContact'] ?? null,
            $data['emergencyPhone'] ?? null,
            $data['customerNotes'] ?? null,
            $data['allowMarketing'] ?? 0
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Customer added successfully',
            'id' => $pdo->lastInsertId()
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function getCustomers() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY customerName");
        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'customers' => $customers]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateCustomer() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Customer ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE customers SET 
            customerName = ?, 
            customerPhone = ?,
            customerEmail = ?,
            customerBirthdate = ?,
            customerGender = ?,
            customerNationality = ?,
            customerAddress = ?,
            emergencyContact = ?,
            emergencyPhone = ?,
            customerNotes = ?,
            allowMarketing = ?
            WHERE id = ?");
            
        $stmt->execute([
            $data['customerName'],
            $data['customerPhone'],
            $data['customerEmail'] ?? null,
            $data['customerBirthdate'] ?? null,
            $data['customerGender'] ?? null,
            $data['customerNationality'] ?? null,
            $data['customerAddress'] ?? null,
            $data['emergencyContact'] ?? null,
            $data['emergencyPhone'] ?? null,
            $data['customerNotes'] ?? null,
            $data['allowMarketing'] ?? 0,
            $id
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Customer updated successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteCustomer() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Customer ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Customer deleted successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
