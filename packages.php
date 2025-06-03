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
        addPackage();
        break;
    case 'get':
        getPackages();
        break;
    case 'update':
        updatePackage();
        break;
    case 'delete':
        deletePackage();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function addPackage() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO packages (
            packageName, packageDescription, price, duration, 
            packageType, color, active, featured) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $data['packageName'],
            $data['packageDescription'],
            $data['price'],
            $data['duration'] ?? 0,
            $data['packageType'],
            $data['color'] ?? 'bg-blue',
            $data['active'] ?? true,
            $data['featured'] ?? false
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Package added successfully',
            'id' => $pdo->lastInsertId()
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function getPackages() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM packages ORDER BY packageName");
        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'packages' => $packages]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updatePackage() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Package ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE packages SET 
            packageName = ?,
            packageDescription = ?,
            price = ?,
            duration = ?,
            packageType = ?,
            color = ?,
            active = ?,
            featured = ?
            WHERE id = ?");
            
        $stmt->execute([
            $data['packageName'],
            $data['packageDescription'],
            $data['price'],
            $data['duration'] ?? 0,
            $data['packageType'],
            $data['color'] ?? 'bg-blue',
            $data['active'] ?? true,
            $data['featured'] ?? false,
            $id
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Package updated successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deletePackage() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Package ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Package deleted successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
