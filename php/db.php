<?php
$host = 'ep-icy-fire-a4s4jr5h-pooler.us-east-1.aws.neon.tech';
$db   = 'kopi';
$user = 'kopi_owner';
$pass = 'npg_I96AhqlJUrkZ';
$dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Conexión exitosa a Neon PostgreSQL 🚀";
} catch (PDOException $e) {
    echo "Error al conectar: " . $e->getMessage();
}
?>
