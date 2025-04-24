<?php
header(header: 'Content-Type: application/json');
try {
    include 'db.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos']);
    exit;
}



function verCarrito ( $conn) {
    session_start();
    
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];

    $result = pg_query_params($conn, "SELECT producto_id, cantidad  FROM carrito WHERE cliente_id = $1", [$clienteid]);

    if (!$result) {
        return ['success' => false, 'message' => 'carrito basio'];
    }

    $carrito = [];
    while ($row = pg_fetch_assoc($result)) {
        $carrito[] = $row;
    }

    return ['success' => true, 'carrito' => $carrito];
}

function AgregarCarrito ($datos, $conn) {
    session_start();
    
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];
    $producto_id = $datos['producto_id'];


    $result = pg_query_params($conn, "INSERT INTO carrito ( cliente_id, producto_id, cantidad) VALUES ($1, $2, $3)",
    [$clienteid , $producto_id, 1]); 

}

?>