<?php
// Archivo: php/get_products_debug.php
// Versión con debug de get_products.php

// Mostrar errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurar CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una solicitud OPTIONS (preflight), responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Intentar capturar cualquier error
try {
    // Verificar si db.php existe
    if (!file_exists('db.php')) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Archivo db.php no encontrado',
            'path' => getcwd(),
            'files' => scandir('.')
        ]);
        exit();
    }
    
    // Incluir la conexión a la base de datos
    require_once 'db.php';
    
    // Verificar que la conexión existe
    if (!isset($conn) || !$conn) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo establecer conexión con la base de datos'
        ]);
        exit();
    }
    
    // Header JSON después de verificar todo
    header('Content-Type: application/json');
    
    // Obtener el filtro de categoría si existe
    $category = isset($_GET['category']) ? $_GET['category'] : 'todo';
    
    // Consulta simple primero
    $sql = "SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                p.categoria_id,
                c.name as categoria_nombre
            FROM producto p
            INNER JOIN categoria c ON p.categoria_id = c.id
            WHERE p.stock > 0";
    
    // Agregar filtro de categoría si no es 'todo'
    if ($category !== 'todo') {
        $sql .= " AND LOWER(c.name) = LOWER($1)";
    }
    
    $sql .= " ORDER BY c.name, p.nombre";
    
    // Ejecutar la consulta
    if ($category !== 'todo') {
        $result = pg_query_params($conn, $sql, array($category));
    } else {
        $result = pg_query($conn, $sql);
    }
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'error' => 'Error en consulta SQL',
            'pg_error' => pg_last_error($conn),
            'sql' => $sql
        ]);
        exit();
    }
    
    // Obtener todos los productos
    $products = array();
    while ($row = pg_fetch_assoc($result)) {
        $product = array(
            'id' => intval($row['id']),
            'name' => $row['nombre'],
            'description' => $row['descripcion'],
            'price' => floatval($row['precio']),
            'stock' => intval($row['stock']),
            'category' => $row['categoria_nombre'],
            'categoria_id' => intval($row['categoria_id']),
            'image_url' => !empty($row['imagen']) ? $row['imagen'] : '../assets/img/menu/default-product.jpg',
            'available' => intval($row['stock']) > 0
        );
        
        $products[] = $product;
    }
    
    // Obtener categorías
    $categories = array('Todo');
    $categoriesQuery = "SELECT DISTINCT c.name 
                        FROM categoria c
                        INNER JOIN producto p ON c.id = p.categoria_id
                        WHERE p.stock > 0
                        ORDER BY c.name";
    
    $categoriesResult = pg_query($conn, $categoriesQuery);
    
    if ($categoriesResult) {
        while ($catRow = pg_fetch_assoc($categoriesResult)) {
            $categories[] = ucfirst(strtolower($catRow['name']));
        }
    }
    
    // Cerrar la conexión
    pg_close($conn);
    
    // Devolver respuesta exitosa
    echo json_encode(array(
        'success' => true,
        'products' => $products,
        'categories' => $categories,
        'total_products' => count($products)
    ));
    
} catch (Exception $e) {
    // En caso de cualquier error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ));
}