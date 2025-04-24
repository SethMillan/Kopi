<?php
header('Content-Type: application/json');
session_start();

try {
    include 'db.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos']);
    exit;
}
 

function verCarrito($conn) {

    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];

     $sql = "
        SELECT 
            p.id AS producto_id,
            p.nombre,
            p.precio,
            p.imagen,
            c.cantidad
        FROM carrito c
        JOIN producto p ON c.producto_id = p.id
        WHERE c.cliente_id = $1
    ";

    $result = pg_query_params($conn, $sql, [$clienteid]);

    if (!$result) {
        return ['success' => false, 'message' => 'No se pudo obtener el carrito'];
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

// --- Punto de entrada principal ---

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['accion'])) {
    echo json_encode(['success' => false, 'message' => 'Solicitud no válida']);
    exit;
}

switch ($input['accion']) {
    case 'ver':
        $respuesta = verCarrito(  $conn);
        break;
    case 'agg':
        $respuesta = AgregarCarrito($input, $conn);
        break;
    default:
        $respuesta = ['success' => false, 'message' => 'Acción no válida'];
}

echo json_encode($respuesta);

?>