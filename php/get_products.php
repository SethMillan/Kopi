<?php
// Archivo: php/get_products.php
// API para obtener productos del menú con la estructura correcta de la tabla

// Configurar CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS (preflight), responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Incluir la conexión a la base de datos
    require_once 'db.php';
    
    // Obtener el filtro de categoría si existe
    $category = isset($_GET['category']) ? $_GET['category'] : 'todo';
    
    // Construir la consulta SQL con JOIN para obtener el nombre de la categoría
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
    
    // Agregar filtro de categoría si no es 'all'
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
        throw new Exception('Error al ejecutar la consulta: ' . pg_last_error($conn));
    }
    
    // Obtener todos los productos
    $products = array();
    while ($row = pg_fetch_assoc($result)) {
        // Convertir el precio a float
        $row['precio'] = floatval($row['precio']);
        $row['stock'] = intval($row['stock']);
        $row['categoria_id'] = intval($row['categoria_id']);
        
        // Si no hay imagen, usar una imagen por defecto según la categoría
        if (empty($row['imagen'])) {
            switch(strtolower($row['categoria_nombre'])) {
                case 'coffee':
                    $row['imagen'] = '../assets/img/menu/default-coffee.jpg';
                    break;
                case 'tea':
                    $row['imagen'] = '../assets/img/menu/default-tea.jpg';
                    break;
                case 'pastries':
                    $row['imagen'] = '../assets/img/menu/default-pastry.jpg';
                    break;
                case 'bags':
                    $row['imagen'] = '../assets/img/menu/default-bags.jpg';
                    break;
                default:
                    $row['imagen'] = '../assets/img/menu/default-product.jpg';
            }
        }
        
        // Crear el objeto producto con la estructura esperada por el frontend
        $product = array(
            'id' => $row['id'],
            'name' => $row['nombre'],  // Mantener 'name' para compatibilidad con el frontend
            'description' => $row['descripcion'],
            'price' => $row['precio'],
            'stock' => $row['stock'],
            'category' => $row['categoria_nombre'],
            'categoria_id' => $row['categoria_id'],
            'image_url' => $row['imagen'],  // El frontend espera 'image_url'
            'available' => $row['stock'] > 0  // Disponible si hay stock
        );
        
        $products[] = $product;
    }
    
    // Obtener todas las categorías disponibles
    $categoriesQuery = "SELECT DISTINCT c.name 
                        FROM categoria c
                        INNER JOIN producto p ON c.id = p.categoria_id
                        WHERE p.stock > 0
                        ORDER BY c.name";
    $categoriesResult = pg_query($conn, $categoriesQuery);
    
    if (!$categoriesResult) {
        throw new Exception('Error al obtener categorías: ' . pg_last_error($conn));
    }
    
    $categories = array('Todo'); // Siempre incluir 'All' como primera opción
    while ($catRow = pg_fetch_assoc($categoriesResult)) {
        $categories[] = ucfirst(strtolower($catRow['name']));
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
    // En caso de error
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage()
    ));
}