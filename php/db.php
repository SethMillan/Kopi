<?php
$servername = "localhost:3308";
$username = "root";
$password = null;
$bd = "kopi";

 $conn = new mysqli($servername, $username, $password, $bd);

 if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
} else {
}

?>
