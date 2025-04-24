<?php
include 'db.php';


// Querys
$queryTablas = "SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE';";

$queryCliente = "SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_name = 'cliente';";

$queryCategoria = "SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'categoria';";

$queryCarrito = "SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'carrito';";

$queryProducto = "SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_name = 'producto';";

$queryPedido = "SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_name = 'pedido';";

$queryDPedido = "SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_name = 'detalle_pedido';";

$queryDescuento = "SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_name = 'descuento';";


$queryDatosCliente = "SELECT * FROM cliente";

$queryDatosCarrito = "SELECT * FROM carrito";

// Fin de las querys


// Obtención de los resultados
$resultTablas = pg_query($conn, $queryTablas);
$resultCliente = pg_query($conn, $queryCliente);
$resultCategoria = pg_query($conn, $queryCategoria);
$resultDatosCliente = pg_query($conn, $queryDatosCliente);
$resultProducto = pg_query($conn, $queryProducto);
$resultPedido = pg_query($conn, $queryPedido);
$resultDPedido = pg_query($conn, $queryDPedido);
$resultDescuento = pg_query($conn, $queryDescuento);
$resultCarrito = pg_query($conn, $queryCarrito);
$resultDatosCarrito = pg_query($conn, $queryDatosCarrito);



// Fin de resultados


// Comprobar si llegan bien
if (!$resultTablas   || !$queryCategoria || !$resultCliente || !$resultDatosCliente || 
    !$resultProducto || !$resultPedido || !$resultDPedido || !$resultDescuento || 
    !$resultCarrito  || !$resultDatosCarrito) {
    echo "Error al ejecutar la consulta de tablas.<br>";
    exit;
}

// Fin de comprobación


// Mostrar todas las tablas
echo "<strong>Tablas disponibles en la base de datos:</strong><br><br>";
while ($row = pg_fetch_assoc($resultTablas)) {
    echo "🔸 <strong>" . $row['table_name'] . "</strong><br>";
}

echo "<br><hr><br>";


// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'categoria':</strong><br><br>";
while ($row = pg_fetch_assoc($resultCategoria)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";

 
// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'producto':</strong><br><br>";
while ($row = pg_fetch_assoc($resultProducto)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";

// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'carrito':</strong><br><br>";
while ($row = pg_fetch_assoc($resultCarrito)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";

// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'pedido':</strong><br><br>";
while ($row = pg_fetch_assoc($resultPedido)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";
// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'detalle_pedido':</strong><br><br>";
while ($row = pg_fetch_assoc($resultDPedido)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";
// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'descuento':</strong><br><br>";
while ($row = pg_fetch_assoc($resultDescuento)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";

// Mostrar campos de la tabla cliente
echo "<strong>Campos de la tabla 'cliente':</strong><br><br>";
while ($row = pg_fetch_assoc($resultCliente)) {
    echo "🔹 <strong>" . $row['column_name'] . "</strong> (" . $row['data_type'] . ")<br>";
}

echo "<br><hr><br>";


// Mostrar datos de la tabla cliente
echo "<strong>Datos almacenados en 'cliente':</strong><br><br>";

if (pg_num_rows($resultDatosCliente) === 0) {
    echo "La tabla 'cliente' está vacía.<br>";
} else {
    // Mostrar cada fila
    while ($row = pg_fetch_assoc($resultDatosCliente)) {
        foreach ($row as $col => $val) {
            echo "<strong>$col:</strong> $val<br>";
        }
        echo "<br><hr><br>";
    }
}



// Mostrar datos de la tabla cliente
echo "<strong>Datos almacenados en 'carrito':</strong><br><br>";

if (pg_num_rows($resultDatosCarrito) === 0) {
    echo "La tabla 'carrito' está vacía.<br>";
} else {
    // Mostrar cada fila
    while ($row = pg_fetch_assoc($resultDatosCarrito)) {
        foreach ($row as $col => $val) {
            echo "<strong>$col:</strong> $val<br>";
        }
        echo "<br><hr><br>";
    }
}


// Cerrar conexión
pg_close($conn);
?>
