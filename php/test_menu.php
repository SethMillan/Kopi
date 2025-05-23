<?php
// Archivo: php/test_menu.php
// Script para verificar que todo funcione correctamente

header('Content-Type: text/plain; charset=utf-8');

echo "=== PRUEBA COMPLETA DEL SISTEMA DE MENÚ ===\n\n";

try {
    require_once 'db.php';
    
    echo "1. VERIFICANDO CONEXIÓN A LA BASE DE DATOS\n";
    echo "✓ Conexión exitosa\n\n";
    
    echo "2. VERIFICANDO CATEGORÍAS\n";
    $result = pg_query($conn, "SELECT * FROM categoria ORDER BY name");
    $categorias = [];
    while ($row = pg_fetch_assoc($result)) {
        $categorias[] = $row;
        echo "   - {$row['name']} (ID: {$row['id']})\n";
    }
    echo "✓ Total categorías: " . count($categorias) . "\n\n";
    
    echo "3. VERIFICANDO PRODUCTOS\n";
    $result = pg_query($conn, "
        SELECT p.*, c.name as categoria_nombre 
        FROM producto p 
        JOIN categoria c ON p.categoria_id = c.id 
        ORDER BY c.name, p.nombre
    ");
    
    $productos_por_categoria = [];
    while ($row = pg_fetch_assoc($result)) {
        $cat = $row['categoria_nombre'];
        if (!isset($productos_por_categoria[$cat])) {
            $productos_por_categoria[$cat] = 0;
        }
        $productos_por_categoria[$cat]++;
    }
    
    foreach ($productos_por_categoria as $cat => $count) {
        echo "   - $cat: $count productos\n";
    }
    
    $total = array_sum($productos_por_categoria);
    echo "✓ Total productos: $total\n\n";
    
    echo "4. VERIFICANDO PRODUCTOS SIN STOCK\n";
    $result = pg_query($conn, "SELECT nombre, stock FROM producto WHERE stock = 0");
    $sin_stock = pg_num_rows($result);
    if ($sin_stock > 0) {
        echo "   ⚠ Productos sin stock:\n";
        while ($row = pg_fetch_assoc($result)) {
            echo "     - {$row['nombre']}\n";
        }
    } else {
        echo "   ✓ Todos los productos tienen stock\n";
    }
    echo "\n";
    
    echo "5. PROBANDO API DE PRODUCTOS\n";
    // Simular llamada a get_products.php
    $api_url = "http://localhost:3000/php/get_products.php";
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "   ✓ API funcionando correctamente\n";
            echo "   ✓ Productos devueltos: " . count($data['products']) . "\n";
            echo "   ✓ Categorías devueltas: " . implode(', ', $data['categories']) . "\n";
        } else {
            echo "   ✗ Error en la respuesta de la API\n";
        }
    } else {
        echo "   ✗ Error al conectar con la API (HTTP $httpcode)\n";
    }
    echo "\n";
    
    echo "6. VERIFICANDO IMÁGENES DE PRODUCTOS\n";
    $result = pg_query($conn, "SELECT nombre, imagen FROM producto LIMIT 5");
    while ($row = pg_fetch_assoc($result)) {
        echo "   - {$row['nombre']}: {$row['imagen']}\n";
    }
    echo "\n";
    
    pg_close($conn);
    
    echo "=== RESUMEN ===\n";
    echo "✓ Base de datos: OK\n";
    echo "✓ Categorías: " . count($categorias) . "\n";
    echo "✓ Productos: $total\n";
    echo "✓ Sin stock: $sin_stock\n";
    echo "\n";
    echo "Si todo está marcado con ✓, tu menú debería funcionar correctamente.\n";
    echo "Abre http://localhost:3000/pages/menu.html para verificar.\n";
    
} catch (Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
}