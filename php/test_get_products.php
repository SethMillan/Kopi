<?php
// Archivo: php/test_get_products.php
// Script para debuggear el problema con get_products.php

// Mostrar TODOS los errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers para mostrar como texto
header('Content-Type: text/plain; charset=utf-8');

echo "=== PRUEBA DE GET_PRODUCTS.PHP ===\n\n";

echo "1. Verificando archivo db.php...\n";
if (file_exists('db.php')) {
    echo "✓ db.php existe\n";
    
    try {
        require_once 'db.php';
        echo "✓ db.php incluido correctamente\n";
        echo "✓ Conexión a base de datos exitosa\n";
    } catch (Exception $e) {
        echo "✗ Error al incluir db.php: " . $e->getMessage() . "\n";
        exit;
    }
} else {
    echo "✗ db.php NO EXISTE en la carpeta actual\n";
    echo "Carpeta actual: " . getcwd() . "\n";
    echo "Archivos en la carpeta:\n";
    $files = scandir('.');
    foreach ($files as $file) {
        echo "  - $file\n";
    }
    exit;
}

echo "\n2. Verificando tablas...\n";

// Verificar tabla categoria
$result = pg_query($conn, "SELECT COUNT(*) as total FROM categoria");
if ($result) {
    $row = pg_fetch_assoc($result);
    echo "✓ Tabla categoria: {$row['total']} registros\n";
} else {
    echo "✗ Error en tabla categoria: " . pg_last_error($conn) . "\n";
}

// Verificar tabla producto
$result = pg_query($conn, "SELECT COUNT(*) as total FROM producto");
if ($result) {
    $row = pg_fetch_assoc($result);
    echo "✓ Tabla producto: {$row['total']} registros\n";
} else {
    echo "✗ Error en tabla producto: " . pg_last_error($conn) . "\n";
}

echo "\n3. Probando consulta de productos...\n";

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
        WHERE p.stock > 0
        LIMIT 5";

$result = pg_query($conn, $sql);

if ($result) {
    echo "✓ Consulta exitosa\n";
    echo "\nPrimeros 5 productos:\n";
    while ($row = pg_fetch_assoc($result)) {
        echo "- {$row['nombre']} (${$row['precio']}) - {$row['categoria_nombre']} - Stock: {$row['stock']}\n";
    }
} else {
    echo "✗ Error en consulta: " . pg_last_error($conn) . "\n";
}

echo "\n4. Simulando respuesta JSON...\n";

// Intentar crear la respuesta JSON
try {
    $products = array();
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
    
    $result = pg_query($conn, $sql);
    
    while ($row = pg_fetch_assoc($result)) {
        $product = array(
            'id' => $row['id'],
            'name' => $row['nombre'],
            'description' => $row['descripcion'],
            'price' => floatval($row['precio']),
            'stock' => intval($row['stock']),
            'category' => $row['categoria_nombre'],
            'categoria_id' => intval($row['categoria_id']),
            'image_url' => $row['imagen'] ?: '../assets/img/menu/default-product.jpg',
            'available' => true
        );
        $products[] = $product;
    }
    
    $response = array(
        'success' => true,
        'products' => $products,
        'categories' => ['All', 'Coffee', 'Tea', 'Pastries', 'Bags'],
        'total_products' => count($products)
    );
    
    echo "✓ Respuesta JSON creada correctamente\n";
    echo "Total de productos: " . count($products) . "\n";
    echo "\nJSON de ejemplo (primeros 2 productos):\n";
    $sample = array(
        'success' => true,
        'products' => array_slice($products, 0, 2),
        'total_products' => count($products)
    );
    echo json_encode($sample, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "✗ Error al crear JSON: " . $e->getMessage() . "\n";
}

pg_close($conn);

echo "\n\n=== FIN DE PRUEBA ===\n";
echo "\nSi todo está marcado con ✓, el problema puede estar en:\n";
echo "1. La configuración de CORS\n";
echo "2. La ruta del archivo\n";
echo "3. Permisos del servidor\n";
echo "\nPrueba acceder directamente a:\n";
echo "http://localhost:3000/php/get_products.php\n";