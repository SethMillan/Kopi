<?php
$host = 'ep-icy-fire-a4s4jr5h-pooler.us-east-1.aws.neon.tech';
$db   = 'kopi';
$user = 'kopi_owner';
$pass = 'npg_I96AhqlJUrkZ';
$dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require";


$connStr = "host=$host dbname=$dbname user=$user password=$password sslmode=require options='endpoint=ep-icy-fire-a4s4jr5h'";
$conn = pg_connect($connStr);

if (!$conn) {
    // En vez de imprimir error, lo manejás donde incluyas este archivo
    throw new Exception('No se pudo conectar a la base de datos: ' . pg_last_error());
}
?>
