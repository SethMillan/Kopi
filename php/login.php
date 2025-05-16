<?php
// Archivo: php/login.php
// Punto de entrada para login y registro. Devuelve JSON.

// 1) Cabeceras para JSON y CORS (ajusta el Origin si no es *):
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder al preflight y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    include __DIR__ . '/db.php';  // carga $conn o lanza excepción
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con la base de datos'
    ]);
    exit;
}

// Función: crea un usuario
function crearUsuario(array $d, $conn): array {
    if (empty($d['nombre'] || $d['apaterno'] || $d['amaterno'] || $d['email'] || $d['password'])) {
        return ['success' => false, 'message' => 'Datos incompletos'];
    }
    // Revisa si el email ya existe
    $res = pg_query_params($conn, 'SELECT id FROM cliente WHERE email=$1', [$d['email']]);
    if (pg_num_rows($res) > 0) {
        return ['success' => false, 'message' => 'El email ya está registrado'];
    }
    // Inserta usuario con contraseña hasheada
    $hash = password_hash($d['password'], PASSWORD_DEFAULT);
    $ok   = pg_query_params(
        $conn,
        'INSERT INTO cliente (nombre, apaterno, amaterno, email, password) VALUES ($1,$2,$3,$4,$5)',
        [$d['nombre'], $d['apaterno'], $d['amaterno'], $d['email'], $hash]
    );
    return $ok
        ? ['success' => true, 'message' => 'Usuario creado correctamente']
        : ['success' => false, 'message' => 'Error al insertar usuario'];
}

// Función: procesa login
function procesarLogin(array $d, $conn): array {
    if (empty($d['email'] || $d['password'])) {
        return ['success' => false, 'message' => 'Datos incompletos'];
    }
    $res = pg_query_params($conn, 'SELECT id,nombre,apaterno,amaterno,email,password FROM cliente WHERE email=$1', [$d['email']]);
    if ($row = pg_fetch_assoc($res)) {
        if (password_verify($d['password'], $row['password'])) {
            session_start();
            $_SESSION['cliente_id']       = $row['id'];
            $_SESSION['cliente_nombre']   = $row['nombre'];
            $_SESSION['cliente_apaterno'] = $row['apaterno'];
            $_SESSION['cliente_amaterno'] = $row['amaterno'];
            $_SESSION['cliente_email']    = $row['email'];
            return ['success' => true, 'message' => 'Login exitoso'];
        }
    }
    return ['success' => false, 'message' => 'Email o contraseña incorrectos'];
}

// --- Punto de entrada principal ---
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || empty($input['accion'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Solicitud no válida']);
    exit;
}

switch ($input['accion']) {
    case 'registro':
        $respuesta = crearUsuario($input, $conn);
        break;
    case 'login':
        $respuesta = procesarLogin($input, $conn);
        break;
    default:
        $respuesta = ['success' => false, 'message' => 'Acción no válida'];
}

echo json_encode($respuesta);
