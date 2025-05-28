<?php
// Archivo: php/logout.php
// Maneja el cierre de sesión

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
    // Iniciar la sesión
    session_start();
    
    // Verificar si hay una sesión activa
    if (!isset($_SESSION['cliente_id'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'No hay sesión activa'
        ]);
        exit;
    }
    
    // Guardar el nombre para el mensaje de despedida (opcional)
    $nombre_usuario = $_SESSION['cliente_nombre'] ?? 'Usuario';
    
    // Destruir todas las variables de sesión
    $_SESSION = array();
    
    // Si se desea destruir la sesión completamente, también hay que borrar la cookie de sesión
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Finalmente, destruir la sesión
    session_destroy();
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true, 
        'message' => "Hasta luego, $nombre_usuario. Sesión cerrada correctamente."
    ]);
    
} catch (Exception $e) {
    // En caso de error
    echo json_encode([
        'success' => false, 
        'message' => 'Error al cerrar sesión: ' . $e->getMessage()
    ]);
}
?>