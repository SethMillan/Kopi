<?php
session_start();
header('Content-Type: application/json');

require_once 'db.php';

if (!isset($_SESSION['cliente_id'])) {
    echo json_encode(['error' => 'No logueado']);
    exit;
}

$cliente_id = $_SESSION['cliente_id'];

$query = "SELECT nombre, apaterno, email FROM cliente WHERE id = $1";
$result = pg_query_params($conn, $query, array($cliente_id));
$data = pg_fetch_assoc($result);

echo json_encode($data);
