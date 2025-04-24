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

$queryDatosCliente = "SELECT * FROM cliente";
// Fin de las querys


// Obtención de los resultados
$resultTablas = pg_query($conn, $queryTablas);
$resultCliente = pg_query($conn, $queryCliente);
$resultDatosCliente = pg_query($conn, $queryDatosCliente);
// Fin de resultados


// Comprobar si llegan bien
if (!$resultTablas) {
    echo "Error al ejecutar la consulta de tablas.<br>";
    exit;
}

if (!$resultCliente) {
    echo "Error al ejecutar la consulta de la tabla 'cliente'.<br>";
    exit;
}

if (!$resultDatosCliente) {
    echo "Error al obtener los datos de la tabla 'cliente'.<br>";
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


// Cerrar conexión
pg_close($conn);
?>
