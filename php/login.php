<?php
 header('Content-Type: application/json'); //Mandamos solo js

include 'db.php';   

 
function crearUsuario($datos, $conn) {
    try {
        // Validar datos recibidos
        if (!isset($datos['nombre']) || !isset($datos['lastName']) || 
            !isset($datos['email']) || !isset($datos['password'])) {
            return ['success' => false, 'message' => 'Datos incompletos'];
        }
        
        $nombre = $datos['nombre'];
        $lastName = $datos['lastName'];
        $email = $datos['email'];
        $password = $datos['password'];
        
        // Verificar si el email ya existe
        $stmt = $conn->prepare("SELECT id FROM usuario WHERE email = ?");
        if (!$stmt) {
            $error = "Error en la preparación de la consulta: " . $conn->error;
            error_log($error);
            return ['success' => false, 'message' => $error];
        }
        
        // Se ingresa el email que recibe
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        // Si ya existe nos dice que no no tilin
        if ($resultado->num_rows > 0) {
            $stmt->close();
            return ['success' => false, 'message' => 'El email ya está registrado'];
        }
        $stmt->close();
        
        // Pa que este segura la contra sisisi
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Ahora si pa dentro mi loco, ingrese a la bd
        $stmt = $conn->prepare("INSERT INTO usuario (Nombre, lastName, email, passw) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            $error = "Error en la preparación de la inserción: " . $conn->error;
            error_log($error);
            return ['success' => false, 'message' => $error];
        }
        
        // Igual, el le insertamos los datasos
        $stmt->bind_param("ssss", $nombre, $lastName, $email, $hash);
        $resultado = $stmt->execute();
        
        // chido
        if ($resultado) {
            $id = $conn->insert_id;
            $stmt->close();
            return ['success' => true, 'message' => 'Usuario creado correctamente', 'id' => $id];
        } else { //Me mato
            $error = "Error al insertar usuario: " . $stmt->error;
            error_log($error);
            $stmt->close();
            return ['success' => false, 'message' => $error];
        }

        // Paro por aqui no
    } catch (Exception $e) {
        $error = "Error en crearUsuario: " . $e->getMessage();
        error_log($error);
        return ['success' => false, 'message' => $error];
    }
}
 
function procesarLogin($datos, $conn) {
    try {
        // Validar datos recibidos
        if (!isset($datos['email']) || !isset($datos['password'])) {
            return ['success' => false, 'message' => 'Datos incompletos'];
        }
        
        $email = $datos['email'];
        $password = $datos['password'];
        
        // Consultar la base de datos
        $stmt = $conn->prepare("SELECT id, Nombre, lastName, email, passw FROM usuario WHERE email = ?");
        
        if (!$stmt) {
            $error = "Error en la preparación de la consulta: " . $conn->error;
            error_log($error);
            return ['success' => false, 'message' => $error];
        }
        
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado->num_rows > 0) {
            $usuario = $resultado->fetch_assoc();
            if (password_verify($password, $usuario['passw'])) {
                // Login exitoso
                session_start();
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['usuario_nombre'] = $usuario['Nombre'];
                $_SESSION['usuario_apellido'] = $usuario['lastName'];
                
                return ['success' => true, 'message' => 'Login exitoso'];
            } else {
                // Contraseña incorrecta
                error_log("Intento de login fallido para email: $email - Contraseña incorrecta");
                return ['success' => false, 'message' => 'Email o contraseña incorrectos'];
            }
        } else {
            // Usuario no encontrado
            error_log("Intento de login fallido para email: $email - Usuario no encontrado");
            return ['success' => false, 'message' => 'Email o contraseña incorrectos'];
        }
    } catch (Exception $e) {
        $error = "Error en procesarLogin: " . $e->getMessage();
        error_log($error);
        return ['success' => false, 'message' => $error];
    } finally {
        // Cerrar statement si existe
        if (isset($stmt) && $stmt) {
            $stmt->close();
        }
    }
}

try {
    // Recibir datos JSON del cliente
    $datos = json_decode(file_get_contents('php://input'), true);
    
    if (!$datos) { //Si no se reciben bien los datos
        echo json_encode(['success' => false, 'message' => 'No se recibieron datos']);
    } else { // Si se reciben bien para poder determinar que vamos a ejecutar
        
        // Cual quieres mi buen

            //Crear usuario
        if (isset($datos['accion']) && $datos['accion'] === 'crearUsuario') {
             $resultado = crearUsuario($datos, $conn);
            echo json_encode($resultado);

            //Login
        } else {
            $resultado = procesarLogin($datos, $conn);
            echo json_encode($resultado);
        }
    }
} catch (Exception $e) {
    $error = "Error general: " . $e->getMessage();
    error_log($error);
    echo json_encode(['success' => false, 'message' => $error]);
    
} finally {
    if (isset($conn) && $conn) {
        $conn->close();     
    }
}
?>