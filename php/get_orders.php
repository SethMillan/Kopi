<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder al preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

try {
    include __DIR__ . '/db.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con la base de datos'
    ]);
    exit;
}

// Verificar que el usuario esté logueado
if (!isset($_SESSION['cliente_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuario no autenticado'
    ]);
    exit;
}

$cliente_id = $_SESSION['cliente_id'];

try {
    // Obtener todos los pedidos del cliente ordenados por fecha (más recientes primero)
    $sql = "SELECT id, fecha_hora, estado, total 
            FROM pedido 
            WHERE cliente_id = $1 
            ORDER BY fecha_hora DESC";

    $result = pg_query_params($conn, $sql, [$cliente_id]);

    if (!$result) {
        throw new Exception('Error al consultar los pedidos');
    }

    $pedidos = [];
    while ($row = pg_fetch_assoc($result)) {
        $pedidos[] = [
            'id' => $row['id'],
            'fecha_hora' => $row['fecha_hora'],
            'estado' => $row['estado'],
            'total' => floatval($row['total'])
        ];
    }

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos,
        'total_pedidos' => count($pedidos)
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los pedidos: ' . $e->getMessage()
    ]);
}
