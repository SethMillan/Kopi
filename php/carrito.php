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

// Buscar el ID del producto por su nombre
function encontrarID($productoNombre, $conn) {
    $sql = "SELECT id FROM producto WHERE nombre = $1";
    $result = pg_query_params($conn, $sql, [$productoNombre]);

    if (!$result || pg_num_rows($result) == 0) {
        return null;  // Si no se encuentra el producto
    }

    $row = pg_fetch_assoc($result);
    return $row['id'];  // Devuelve el ID del producto
}

// Función para agregar al carrito o actualizar la cantidad
function AgregarCarrito($producto_id, $conn) {
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];
    $cantidad = 1; 

    // Verificamos si el producto ya está en el carrito del cliente
    $sql_check = "SELECT cantidad FROM carrito WHERE cliente_id = $1 AND producto_id = $2";
    $result_check = pg_query_params($conn, $sql_check, [$clienteid, $producto_id]);

    if ($result_check && pg_num_rows($result_check) > 0) {
        // Si ya está en el carrito, solo actualizamos la cantidad
        $row = pg_fetch_assoc($result_check);
        $nueva_cantidad = $row['cantidad'] + $cantidad;

        // Actualizamos la cantidad en la base de datos
        $sql_update = "UPDATE carrito SET cantidad = $1 WHERE cliente_id = $2 AND producto_id = $3";
        $result_update = pg_query_params($conn, $sql_update, [$nueva_cantidad, $clienteid, $producto_id]);

        if (!$result_update) {
            return ['success' => false, 'message' => 'Error al actualizar la cantidad del producto'];
        }

        return ['success' => true, 'message' => 'Cantidad actualizada en el carrito'];
    } else {
        // Si no está en el carrito, lo agregamos
        $sql_insert = "INSERT INTO carrito (cliente_id, producto_id, cantidad) VALUES ($1, $2, $3)";
        $result_insert = pg_query_params($conn, $sql_insert, [$clienteid, $producto_id, $cantidad]);

        if (!$result_insert) {
            return ['success' => false, 'message' => 'Error al agregar el producto al carrito'];
        }

        return ['success' => true, 'message' => 'Producto agregado al carrito'];
    }
}
    function eliminarProducto($datos, $conn) {
        if (!isset($_SESSION['cliente_id'])) {
            return ['success' => false, 'message' => 'No hay sesión iniciada'];
        }
    
        $clienteid = $_SESSION['cliente_id'];
        $nombre = $datos['nombre'];
    
        // Obtener ID del producto por nombre
        $res = pg_query_params($conn, "SELECT id FROM producto WHERE nombre = $1", [$nombre]);
    
        if (!$res || pg_num_rows($res) === 0) {
            return ['success' => false, 'message' => 'Producto no encontrado'];
        }
    
        $producto = pg_fetch_assoc($res);
        $producto_id = $producto['id'];
    
        // Verificar cantidad actual
        $check = pg_query_params($conn, "SELECT cantidad FROM carrito WHERE cliente_id = $1 AND producto_id = $2", [$clienteid, $producto_id]);
    
        if (!$check || pg_num_rows($check) === 0) {
            return ['success' => false, 'message' => 'Producto no está en el carrito'];
        }
    
        $data = pg_fetch_assoc($check);
        $cantidad = (int)$data['cantidad'];
    
            // Eliminar producto completamente
            $delete = pg_query_params($conn, "DELETE FROM carrito WHERE cliente_id = $1 AND producto_id = $2", [$clienteid, $producto_id]);
            if ($delete) {
                return ['success' => true, 'message' => 'Producto eliminado del carrito'];
            } else {
                return ['success' => false, 'message' => 'Error al eliminar el producto'];
            }
        

        
    }
    // Función para agregar al carrito o actualizar la cantidad
function actualizarCantidad($producto_id, $cantidad, $conn) {
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];

    // Actualizamos la cantidad del producto en el carrito
    $sql_update = "UPDATE carrito SET cantidad = $1 WHERE cliente_id = $2 AND producto_id = $3";
    $result_update = pg_query_params($conn, $sql_update, [$cantidad, $clienteid, $producto_id]);

    if (!$result_update) {
        return ['success' => false, 'message' => 'Error al actualizar la cantidad del producto'];
    }

    return ['success' => true, 'message' => 'Cantidad actualizada en el carrito'];
}

    
    


// --- Punto de entrada principal ---

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['accion'])) {
    echo json_encode(['success' => false, 'message' => 'Solicitud no válida']);
    exit;
}

switch ($input['accion']) {
    case 'ver':
        $respuesta = verCarrito($conn);
        break;
    case 'agg':
        if (isset($input['producto_nombre'])) {
            // Encontrar el ID del producto por su nombre
            $producto_id = encontrarID($input['producto_nombre'], $conn);
            if ($producto_id === null) {
                $respuesta = ['success' => false, 'message' => 'Producto no encontrado'];
            } else {
                // Si se encontró el ID, agregar el producto al carrito o actualizar la cantidad
                $respuesta = AgregarCarrito($producto_id, $conn);
            }
        } else {
            $respuesta = ['success' => false, 'message' => 'Nombre del producto no recibido'];
        }
        break;
    case 'eliminar':
            $respuesta = eliminarProducto($input, $conn);
        break;

        case 'actualizar':
            if (isset($input['nombre']) && isset($input['cantidad'])) {
                // Encontrar el ID del producto por su nombre
                $producto_id = encontrarID($input['nombre'], $conn);
                if ($producto_id === null) {
                    $respuesta = ['success' => false, 'message' => 'Producto no encontrado'];
                } else {
                    // Si se encontró el ID, actualizar la cantidad
                    $cantidad = (int)$input['cantidad'];
                    $respuesta = actualizarCantidad($producto_id, $cantidad, $conn);
                }
            } else {
                $respuesta = ['success' => false, 'message' => 'Datos incompletos para actualizar'];
            }
            break;

    default:
        $respuesta = ['success' => false, 'message' => 'Acción no válida'];
}

echo json_encode($respuesta);
?>
