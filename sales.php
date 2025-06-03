<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$action = $_GET['action'] ?? '';

switch($action) {
    case 'add':
        addSale();
        break;
    case 'get':
        getSales();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function addSale() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $pdo->beginTransaction();
        
        // Insert sale
        $stmt = $pdo->prepare("INSERT INTO sales (ticketNumber, customerId, total, paymentMethod) 
            VALUES (?, ?, ?, ?)");
            
        $stmt->execute([
            $data['ticketNumber'],
            $data['customer']['id'] ?? null,
            $data['total'],
            $data['paymentMethod']
        ]);
        
        $saleId = $pdo->lastInsertId();
        
        // Insert sale items
        $stmt = $pdo->prepare("INSERT INTO sale_items (saleId, packageId, quantity, price) 
            VALUES (?, ?, ?, ?)");
            
        foreach ($data['items'] as $item) {
            $stmt->execute([
                $saleId,
                $item['package']['id'],
                $item['quantity'],
                $item['package']['price']
            ]);
        }
        
        // Update customer if exists
        if (!empty($data['customer']['id'])) {
            $stmt = $pdo->prepare("UPDATE customers SET 
                visits = visits + 1,
                totalSpent = totalSpent + ?,
                lastVisit = CURRENT_TIMESTAMP
                WHERE id = ?");
                
            $stmt->execute([$data['total'], $data['customer']['id']]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Sale recorded successfully',
            'saleId' => $saleId
        ]);
    } catch(PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function getSales() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("
            SELECT s.*, c.customerName, c.customerPhone
            FROM sales s
            LEFT JOIN customers c ON s.customerId = c.id
            ORDER BY s.createdAt DESC
            LIMIT 100
        ");
        
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get sale items for each sale
        foreach ($sales as &$sale) {
            $stmt = $pdo->prepare("
                SELECT si.*, p.packageName, p.packageDescription
                FROM sale_items si
                JOIN packages p ON si.packageId = p.id
                WHERE si.saleId = ?
            ");
            
            $stmt->execute([$sale['id']]);
            $sale['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        echo json_encode(['success' => true, 'sales' => $sales]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
