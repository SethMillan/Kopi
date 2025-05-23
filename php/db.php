<?php
// Archivo: php/db.php
// Conexión a PostgreSQL en Neon con SSL

// Tus credenciales de Neon:
$host     = 'ep-icy-fire-a4s4jr5h-pooler.us-east-1.aws.neon.tech';
$port     = '5432';
$dbname   = 'kopi';
$user     = 'kopi_owner';
$password = 'npg_I96AhqlJUrkZ'; 
$sslmode  = 'require';

// Cadena de conexión
$conn_str = sprintf(
    'host=%s port=%s dbname=%s user=%s password=%s sslmode=%s',
    $host, $port, $dbname, $user, $password, $sslmode
);

// Intentar conectar
$conn = pg_connect($conn_str);
if (!$conn) {
    // Lanza excepción si falla la conexión
    throw new Exception('No se pudo conectar a la base de datos: ' . pg_last_error());
}

// Devolver la variable $conn para usarla en otros scripts
