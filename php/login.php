<?php
header('Content-Type: application/json');

try {
    include 'db.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos']);
    exit;
}

// Función para crear un usuario nuevo
function crearUsuario($datos, $conn) {
    if (!isset($datos['nombre']) || !isset($datos['apaterno']) || 
        !isset($datos['amaterno']) || !isset($datos['email']) || 
        !isset($datos['password'])) {
        return ['success' => false, 'message' => 'Datos incompletos'];
    }

    $nombre = $datos['nombre'];
    $apaterno = $datos['apaterno'];
    $amaterno = $datos['amaterno'];
    $email = $datos['email'];
    $password = $datos['password'];

    $result = pg_query_params($conn, "SELECT id FROM cliente WHERE email = $1", [$email]);
    if (pg_num_rows($result) > 0) {
        return ['success' => false, 'message' => 'El email ya está registrado'];
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $insert = pg_query_params($conn, "INSERT INTO cliente (nombre, apaterno, amaterno, email, password) VALUES ($1, $2, $3, $4, $5)", 
        [$nombre, $apaterno, $amaterno, $email, $hash]);

    if ($insert) {
        return ['success' => true, 'message' => 'Usuario creado correctamente'];
    } else {
        return ['success' => false, 'message' => 'Error al insertar usuario'];
    }
}

// Función para iniciar sesión
function procesarLogin($datos, $conn) {
    if (!isset($datos['email']) || !isset($datos['password'])) {
        return ['success' => false, 'message' => 'Datos incompletos'];
    }

    $email = $datos['email'];
    $password = $datos['password'];

    $result = pg_query_params($conn, "SELECT id, nombre, apaterno, amaterno, email, password FROM cliente WHERE email = $1", [$email]);

    if ($row = pg_fetch_assoc($result)) {
        if (password_verify($password, $row['password'])) {
            session_start();
            $_SESSION['usuario_nombre'] = $row['nombre'];
            $_SESSION['usuario_apellido'] = $row['apaterno'];
            return ['success' => true, 'message' => 'Login exitoso'];
        }
    }

    return ['success' => false, 'message' => 'Email o contraseña incorrectos'];
}

// --- Punto de entrada principal ---

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['accion'])) {
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
?>
