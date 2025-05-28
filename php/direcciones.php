<?php
// Archivo: php/direcciones.php
// Manejo de direcciones de usuario

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Verificar si el usuario está logueado
if (!isset($_SESSION['cliente_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuario no autenticado'
    ]);
    exit;
}

$cliente_id = $_SESSION['cliente_id'];

// Obtener datos de la solicitud
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input) || empty($input['accion'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Solicitud no válida']);
    exit;
}

$accion = $input['accion'];

try {
    switch ($accion) {
        case 'obtener':
            $respuesta = obtenerDirecciones($conn, $cliente_id);
            break;

        case 'crear':
            $respuesta = crearDireccion($conn, $cliente_id, $input);
            break;

        case 'actualizar':
            $respuesta = actualizarDireccion($conn, $cliente_id, $input);
            break;

        case 'eliminar':
            $respuesta = eliminarDireccion($conn, $cliente_id, $input);
            break;

        case 'establecer_principal':
            $respuesta = establecerPrincipal($conn, $cliente_id, $input);
            break;

        default:
            $respuesta = ['success' => false, 'message' => 'Acción no válida'];
    }
} catch (Exception $e) {
    $respuesta = [
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ];
}

echo json_encode($respuesta);

// Función para obtener todas las direcciones del usuario
function obtenerDirecciones($conn, $cliente_id)
{
    $query = "SELECT * FROM direccion 
              WHERE cliente_id = $1 AND activa = true 
              ORDER BY es_principal DESC, createdAt DESC";

    $result = pg_query_params($conn, $query, [$cliente_id]);

    if (!$result) {
        return ['success' => false, 'message' => 'Error al obtener direcciones'];
    }

    $direcciones = [];
    while ($row = pg_fetch_assoc($result)) {
        // Convertir valores booleanos
        $row['es_principal'] = $row['es_principal'] === 't';
        $row['activa'] = $row['activa'] === 't';
        $direcciones[] = $row;
    }

    return [
        'success' => true,
        'direcciones' => $direcciones
    ];
}

// Función para crear nueva dirección
function crearDireccion($conn, $cliente_id, $data)
{
    // Validar campos requeridos
    $requeridos = ['calle', 'numero_exterior', 'colonia', 'codigo_postal', 'ciudad', 'estado'];
    foreach ($requeridos as $campo) {
        if (empty($data[$campo])) {
            return ['success' => false, 'message' => "El campo {$campo} es requerido"];
        }
    }

    // Preparar datos
    $alias = $data['alias'] ?? null;
    $calle = $data['calle'];
    $numero_exterior = $data['numero_exterior'];
    $numero_interior = $data['numero_interior'] ?? null;
    $colonia = $data['colonia'];
    $codigo_postal = $data['codigo_postal'];
    $ciudad = $data['ciudad'];
    $estado = $data['estado'];
    $referencias = $data['referencias'] ?? null;
    $es_principal = isset($data['es_principal']) && $data['es_principal'];

    // Si es principal, desactivar otras direcciones principales
    if ($es_principal) {
        $update_query = "UPDATE direccion SET es_principal = false WHERE cliente_id = $1";
        pg_query_params($conn, $update_query, [$cliente_id]);
    }

    // Insertar nueva dirección
    $query = "INSERT INTO direccion 
              (cliente_id, alias, calle, numero_exterior, numero_interior, colonia, 
               codigo_postal, ciudad, estado, referencias, es_principal) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
              RETURNING id";

    $params = [
        $cliente_id,
        $alias,
        $calle,
        $numero_exterior,
        $numero_interior,
        $colonia,
        $codigo_postal,
        $ciudad,
        $estado,
        $referencias,
        $es_principal ? 'true' : 'false'
    ];

    $result = pg_query_params($conn, $query, $params);

    if (!$result) {
        return ['success' => false, 'message' => 'Error al crear la dirección'];
    }

    $row = pg_fetch_assoc($result);

    return [
        'success' => true,
        'message' => 'Dirección creada correctamente',
        'direccion_id' => $row['id']
    ];
}

// Función para actualizar dirección
function actualizarDireccion($conn, $cliente_id, $data)
{
    if (empty($data['direccion_id'])) {
        return ['success' => false, 'message' => 'ID de dirección requerido'];
    }

    $direccion_id = $data['direccion_id'];

    // Verificar que la dirección pertenece al usuario
    $check_query = "SELECT id FROM direccion WHERE id = $1 AND cliente_id = $2";
    $check_result = pg_query_params($conn, $check_query, [$direccion_id, $cliente_id]);

    if (pg_num_rows($check_result) === 0) {
        return ['success' => false, 'message' => 'Dirección no encontrada'];
    }

    // Construir query de actualización dinámicamente
    $updates = [];
    $params = [$direccion_id, $cliente_id];
    $param_count = 2;

    $campos_actualizables = [
        'alias',
        'calle',
        'numero_exterior',
        'numero_interior',
        'colonia',
        'codigo_postal',
        'ciudad',
        'estado',
        'referencias'
    ];

    foreach ($campos_actualizables as $campo) {
        if (isset($data[$campo])) {
            $param_count++;
            $updates[] = "{$campo} = \${$param_count}";
            $params[] = $data[$campo];
        }
    }

    // Manejar es_principal por separado
    if (isset($data['es_principal'])) {
        $es_principal = $data['es_principal'];

        if ($es_principal) {
            // Desactivar otras direcciones principales
            $update_principal_query = "UPDATE direccion SET es_principal = false WHERE cliente_id = $1 AND id != $2";
            pg_query_params($conn, $update_principal_query, [$cliente_id, $direccion_id]);
        }

        $param_count++;
        $updates[] = "es_principal = \${$param_count}";
        $params[] = $es_principal ? 'true' : 'false';
    }

    if (empty($updates)) {
        return ['success' => false, 'message' => 'No hay datos para actualizar'];
    }

    $query = "UPDATE direccion SET " . implode(', ', $updates) . ", updatedAt = CURRENT_TIMESTAMP WHERE id = $1 AND cliente_id = $2";

    $result = pg_query_params($conn, $query, $params);

    if (!$result) {
        return ['success' => false, 'message' => 'Error al actualizar la dirección'];
    }

    return [
        'success' => true,
        'message' => 'Dirección actualizada correctamente'
    ];
}

// Función para eliminar dirección (marcar como inactiva)
function eliminarDireccion($conn, $cliente_id, $data)
{
    if (empty($data['direccion_id'])) {
        return ['success' => false, 'message' => 'ID de dirección requerido'];
    }

    $direccion_id = $data['direccion_id'];

    // Verificar que la dirección pertenece al usuario
    $check_query = "SELECT es_principal FROM direccion WHERE id = $1 AND cliente_id = $2 AND activa = true";
    $check_result = pg_query_params($conn, $check_query, [$direccion_id, $cliente_id]);

    if (pg_num_rows($check_result) === 0) {
        return ['success' => false, 'message' => 'Dirección no encontrada'];
    }

    $row = pg_fetch_assoc($check_result);
    $es_principal = $row['es_principal'] === 't';

    // No permitir eliminar la dirección principal si es la única
    if ($es_principal) {
        $count_query = "SELECT COUNT(*) as total FROM direccion WHERE cliente_id = $1 AND activa = true";
        $count_result = pg_query_params($conn, $count_query, [$cliente_id]);
        $count_row = pg_fetch_assoc($count_result);

        if ($count_row['total'] == 1) {
            return ['success' => false, 'message' => 'No puedes eliminar tu única dirección'];
        }

        // Si hay más direcciones, establecer otra como principal
        $new_principal_query = "UPDATE direccion SET es_principal = true 
                               WHERE cliente_id = $1 AND id != $2 AND activa = true 
                               ORDER BY createdAt DESC LIMIT 1";
        pg_query_params($conn, $new_principal_query, [$cliente_id, $direccion_id]);
    }

    // Marcar como inactiva
    $query = "UPDATE direccion SET activa = false, updatedAt = CURRENT_TIMESTAMP WHERE id = $1 AND cliente_id = $2";
    $result = pg_query_params($conn, $query, [$direccion_id, $cliente_id]);

    if (!$result) {
        return ['success' => false, 'message' => 'Error al eliminar la dirección'];
    }

    return [
        'success' => true,
        'message' => 'Dirección eliminada correctamente'
    ];
}

// Función para establecer dirección como principal
function establecerPrincipal($conn, $cliente_id, $data)
{
    if (empty($data['direccion_id'])) {
        return ['success' => false, 'message' => 'ID de dirección requerido'];
    }

    $direccion_id = $data['direccion_id'];

    // Verificar que la dirección pertenece al usuario
    $check_query = "SELECT id FROM direccion WHERE id = $1 AND cliente_id = $2 AND activa = true";
    $check_result = pg_query_params($conn, $check_query, [$direccion_id, $cliente_id]);

    if (pg_num_rows($check_result) === 0) {
        return ['success' => false, 'message' => 'Dirección no encontrada'];
    }

    // Desactivar todas las direcciones principales del usuario
    $update_all_query = "UPDATE direccion SET es_principal = false WHERE cliente_id = $1";
    pg_query_params($conn, $update_all_query, [$cliente_id]);

    // Establecer la nueva dirección principal
    $update_query = "UPDATE direccion SET es_principal = true, updatedAt = CURRENT_TIMESTAMP WHERE id = $1 AND cliente_id = $2";
    $result = pg_query_params($conn, $update_query, [$direccion_id, $cliente_id]);

    if (!$result) {
        return ['success' => false, 'message' => 'Error al establecer dirección principal'];
    }

    return [
        'success' => true,
        'message' => 'Dirección principal actualizada'
    ];
}
