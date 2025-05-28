<?php
header('Content-Type: application/json');
session_start();

try {
    include 'db.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos']);
    exit;
}

function secion($conn)
{
    if (isset($_SESSION['cliente_id'])) {
        $nombre = $_SESSION['cliente_nombre'] ?? 'Usuario';
        echo json_encode([
            'logueado' => true,
            'nombre' => $nombre
        ]);
    } else {
        echo json_encode(['logueado' => false]);
    }
}

function verCarrito($conn)
{
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];

    // Productos en el carrito
    $sql_carrito = "
        SELECT c.id AS carrito_id, p.id AS producto_id, p.nombre, p.precio, p.imagen, c.cantidad
        FROM carrito c
        JOIN producto p ON c.producto_id = p.id
        WHERE c.cliente_id = $1 AND c.estado = 'carrito'
    ";

    // Productos guardados
    $sql_guardado = "
        SELECT c.id AS carrito_id, p.id AS producto_id, p.nombre, p.precio, p.imagen, c.cantidad
        FROM carrito c
        JOIN producto p ON c.producto_id = p.id
        WHERE c.cliente_id = $1 AND c.estado = 'guardado'
    ";

    $result_carrito = pg_query_params($conn, $sql_carrito, [$clienteid]);
    $result_guardado = pg_query_params($conn, $sql_guardado, [$clienteid]);

    $carrito = [];
    $guardado = [];

    while ($row = pg_fetch_assoc($result_carrito)) {
        $carrito[] = $row;
    }

    while ($row = pg_fetch_assoc($result_guardado)) {
        $guardado[] = $row;
    }

    return ['success' => true, 'carrito' => $carrito, 'guardado' => $guardado];
}

// Buscar el ID del producto por su nombre
function encontrarID($productoNombre, $conn)
{
    $sql = "SELECT id FROM producto WHERE nombre = $1";
    $result = pg_query_params($conn, $sql, [$productoNombre]);

    if (!$result || pg_num_rows($result) == 0) {
        return null;
    }

    $row = pg_fetch_assoc($result);
    return $row['id'];
}

// Función mejorada para agregar al carrito con validación de stock
function AgregarCarrito($producto_id, $conn)
{
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'Usuario no tiene sesión activa'];
    }

    $clienteid = $_SESSION['cliente_id'];
    $cantidad = 1;

    // Verificar stock disponible
    $sql_stock = "SELECT stock FROM producto WHERE id = $1";
    $result_stock = pg_query_params($conn, $sql_stock, [$producto_id]);

    if (!$result_stock || pg_num_rows($result_stock) == 0) {
        return ['success' => false, 'message' => 'Producto no encontrado'];
    }

    $producto_db = pg_fetch_assoc($result_stock);
    $stock_disponible = intval($producto_db['stock']);

    // Verificar cantidad actual en carrito
    $sql_check = "SELECT cantidad FROM carrito WHERE cliente_id = $1 AND producto_id = $2 AND estado = 'carrito'";
    $result_check = pg_query_params($conn, $sql_check, [$clienteid, $producto_id]);

    $cantidad_actual = 0;
    if ($result_check && pg_num_rows($result_check) > 0) {
        $row = pg_fetch_assoc($result_check);
        $cantidad_actual = intval($row['cantidad']);
    }

    if ($cantidad_actual + $cantidad > $stock_disponible) {
        return ['success' => false, 'message' => "Solo hay $stock_disponible unidades disponibles. Ya tienes $cantidad_actual en tu carrito."];
    }

    if ($cantidad_actual > 0) {
        // Actualizar cantidad
        $nueva_cantidad = $cantidad_actual + $cantidad;
        $sql_update = "UPDATE carrito SET cantidad = $1 WHERE cliente_id = $2 AND producto_id = $3 AND estado = 'carrito'";
        $result_update = pg_query_params($conn, $sql_update, [$nueva_cantidad, $clienteid, $producto_id]);

        if (!$result_update) {
            return ['success' => false, 'message' => 'Error al actualizar la cantidad del producto'];
        }
    } else {
        // Insertar nuevo producto
        $sql_insert = "INSERT INTO carrito (cliente_id, producto_id, cantidad, estado) VALUES ($1, $2, $3, 'carrito')";
        $result_insert = pg_query_params($conn, $sql_insert, [$clienteid, $producto_id, $cantidad]);

        if (!$result_insert) {
            return ['success' => false, 'message' => 'Error al agregar el producto al carrito'];
        }
    }

    // Calcular total de items en el carrito
    $sql_total = "SELECT SUM(cantidad) as total FROM carrito WHERE cliente_id = $1 AND estado = 'carrito'";
    $result_total = pg_query_params($conn, $sql_total, [$clienteid]);
    $total_items = 0;
    if ($result_total) {
        $row = pg_fetch_assoc($result_total);
        $total_items = intval($row['total']);
    }

    return ['success' => true, 'message' => 'Producto agregado al carrito', 'total_items' => $total_items];
}

function eliminarProducto($datos, $conn)
{
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
    $check = pg_query_params($conn, "SELECT cantidad FROM carrito WHERE cliente_id = $1 AND producto_id = $2 AND estado = 'carrito'", [$clienteid, $producto_id]);

    if (!$check || pg_num_rows($check) === 0) {
        return ['success' => false, 'message' => 'Producto no está en el carrito'];
    }

    // Eliminar producto completamente
    $delete = pg_query_params($conn, "DELETE FROM carrito WHERE cliente_id = $1 AND producto_id = $2 AND estado = 'carrito'", [$clienteid, $producto_id]);
    if ($delete) {
        return ['success' => true, 'message' => 'Producto eliminado del carrito'];
    } else {
        return ['success' => false, 'message' => 'Error al eliminar el producto'];
    }
}

function actualizarCantidad($producto_id, $cantidad, $conn)
{
    if (!isset($_SESSION['cliente_id'])) {
        return ['success' => false, 'message' => 'No hay sesión iniciada'];
    }

    $clienteid = $_SESSION['cliente_id'];

    // Verificar stock antes de actualizar
    $sql_stock = "SELECT stock FROM producto WHERE id = $1";
    $result_stock = pg_query_params($conn, $sql_stock, [$producto_id]);

    if (!$result_stock || pg_num_rows($result_stock) == 0) {
        return ['success' => false, 'message' => 'Producto no encontrado'];
    }

    $producto_db = pg_fetch_assoc($result_stock);
    $stock_disponible = intval($producto_db['stock']);

    if ($cantidad > $stock_disponible) {
        return ['success' => false, 'message' => "Solo hay $stock_disponible unidades disponibles"];
    }

    // Actualizamos la cantidad del producto en el carrito
    $sql_update = "UPDATE carrito SET cantidad = $1 WHERE cliente_id = $2 AND producto_id = $3 AND estado = 'carrito'";
    $result_update = pg_query_params($conn, $sql_update, [$cantidad, $clienteid, $producto_id]);

    if (!$result_update) {
        return ['success' => false, 'message' => 'Error al actualizar la cantidad del producto'];
    }

    return ['success' => true, 'message' => 'Cantidad actualizada en el carrito'];
}

function guardar($datos, $conn)
{
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

    $res2 = pg_query_params($conn, "SELECT estado FROM carrito WHERE cliente_id = $1 AND producto_id = $2", [$clienteid, $producto_id]);

    $producto2 = pg_fetch_assoc($res2);
    $producto_estado = $producto2['estado'];

    if ($producto_estado == 'carrito') {
        // Mover a guardado
        $sql_update = "UPDATE carrito SET estado = $1 WHERE cliente_id = $2 AND producto_id = $3";
        $result_update = pg_query_params($conn, $sql_update, ['guardado', $clienteid, $producto_id]);

        if (!$result_update) {
            return ['success' => false, 'message' => 'Error al guardar el producto'];
        }

        return ['success' => true, 'message' => 'Producto guardado correctamente'];
    } else {
        // Mover a carrito
        $sql_update = "UPDATE carrito SET estado = $1 WHERE cliente_id = $2 AND producto_id = $3";
        $result_update = pg_query_params($conn, $sql_update, ['carrito', $clienteid, $producto_id]);

        if (!$result_update) {
            return ['success' => false, 'message' => 'Error al mover el producto al carrito'];
        }

        return ['success' => true, 'message' => 'Producto movido al carrito correctamente'];
    }
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
        // Manejar tanto producto_nombre como producto_id
        if (isset($input['producto_id'])) {
            $producto_id = intval($input['producto_id']);
            $respuesta = AgregarCarrito($producto_id, $conn);
        } elseif (isset($input['producto_nombre'])) {
            $producto_id = encontrarID($input['producto_nombre'], $conn);
            if ($producto_id === null) {
                $respuesta = ['success' => false, 'message' => 'Producto no encontrado'];
            } else {
                $respuesta = AgregarCarrito($producto_id, $conn);
            }
        } else {
            $respuesta = ['success' => false, 'message' => 'Identificador del producto no recibido'];
        }
        break;

    case 'eliminar':
        $respuesta = eliminarProducto($input, $conn);
        break;

    case 'actualizar':
        if (isset($input['nombre']) && isset($input['cantidad'])) {
            $producto_id = encontrarID($input['nombre'], $conn);
            if ($producto_id === null) {
                $respuesta = ['success' => false, 'message' => 'Producto no encontrado'];
            } else {
                $cantidad = (int)$input['cantidad'];
                $respuesta = actualizarCantidad($producto_id, $cantidad, $conn);
            }
        } else {
            $respuesta = ['success' => false, 'message' => 'Datos incompletos para actualizar'];
        }
        break;

    case 'secion':
        secion($conn);
        exit;

    case 'guardar':
        if (isset($input['nombre'])) {
            $respuesta = guardar($input, $conn);
        } else {
            $respuesta = ['success' => false, 'message' => 'Nombre del producto no recibido'];
        }
        break;

    default:
        $respuesta = ['success' => false, 'message' => 'Acción no válida'];
}

echo json_encode($respuesta);
