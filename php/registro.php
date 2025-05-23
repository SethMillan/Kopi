<?php
$host     = 'ep-icy-fire-a4s4jr5h-pooler.us-east-1.aws.neon.tech';
$port     = '5432';
$dbname   = 'kopi';
$user     = 'kopi_owner';
$password = 'npg_I96AhqlJUrkZ';
$sslmode  = 'require';
$endpoint_id = 'ep-icy-fire-a4s4jr5h';

try {
    // Intento con options sin -c y sin comillas simples
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=$sslmode;options=endpoint=$endpoint_id";

    // Alternativamente prueba esto (descomentar y comentar el anterior)
    // $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=$sslmode?options=endpoint%3D$endpoint_id";

    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $sql = "INSERT INTO pagos (pais, zip, titular, numero_tarjeta, expiracion, cvv) VALUES (:pais, :zip, :titular, :numero_tarjeta, :expiracion, :cvv)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':pais' => $_POST['country'],
        ':zip' => $_POST['zip'],
        ':titular' => $_POST['titular'],
        ':numero_tarjeta' => $_POST['numeroDeTarjeta'],
        ':expiracion' => $_POST['expiracion'],
        ':cvv' => $_POST['cvc']
    ]);

    echo "✅ Pago registrado exitosamente.";
} catch (PDOException $e) {
    echo "❌ Error al registrar el pago: " . $e->getMessage();
}
?>
