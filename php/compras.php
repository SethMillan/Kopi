<?php
header(header: 'Content-Type: application/json');
try {
    include 'db.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos']);
    exit;
}

function a ($datos, $conn) {}
function b ($datos, $conn) {}

?>