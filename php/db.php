<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$PGHOST = getenv('PGHOST');
$PGDATABASE = getenv('PGDATABASE');
$PGUSER = getenv('PGUSER');
$PGPASSWORD = getenv('PGPASSWORD');

try {
    $dsn = "pgsql:host=$PGHOST;dbname=$PGDATABASE";
    $pdo = new PDO($dsn, $PGUSER, $PGPASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
