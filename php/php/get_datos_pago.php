<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['cliente_id'])) {
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

$cliente_id = $_SESSION['cliente_id'];

$query = "SELECT titular, numero_tarjeta, pais, zip, expiracion FROM pagos WHERE cliente_id = $1 ORDER BY fecha_registro DESC LIMIT 1";
$result = pg_query_params($conn, $query, array($cliente_id));

if (!$result || pg_num_rows($result) === 0) {
    echo json_encode(['error' => 'No se encontraron datos de pago']);
    exit;
}

$datos_pago = pg_fetch_assoc($result);
echo json_encode($datos_pago);
