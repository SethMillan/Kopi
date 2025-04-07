<?php
// Credenciales de conexión
$host = 'ep-icy-fire-a4s4jr5h-pooler.us-east-1.aws.neon.tech';
$dbname = 'kopi';
$user = 'kopi_owner';
$password = 'npg_I96AhqlJUrkZ';

// Cadena de conexión
$connStr = "host=$host dbname=$dbname user=$user password=$password sslmode=require";

// Intentar la conexión
$conn = pg_connect($connStr);

if (!$conn) {
    echo "Error: No se pudo conectar a la base de datos.\n";
    exit;
} else {
    echo "Conexión exitosa a PostgreSQL.\n";
}
?>
