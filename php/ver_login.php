<?php
include 'db.php';

function mostrarTablas($conn) {
    // Obtener las tablas de la base de datos
    $sql = "SHOW TABLES";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        echo "<br>Tablas en la base de datos:<br>";
        while ($row = $result->fetch_array()) {
            echo $row[0] . "<br>";  // Mostrar el nombre de cada tabla
        }
    } else {
        echo "No se encontraron tablas en la base de datos.<br>";
    }
}


function mostrarColumnas($conn, $nombreTabla) {
    // Obtener las columnas de la tabla
    $sql = "DESCRIBE $nombreTabla";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        echo "<br>Columnas de la tabla '$nombreTabla':<br>";
        while ($row = $result->fetch_assoc()) {
            echo "Columna: " . $row['Field'] . " | Tipo: " . $row['Type'] . "<br>";  // Mostrar nombre y tipo de columna
        }
    } else {
        echo "No se encontraron columnas en la tabla '$nombreTabla'.<br>";
    }
}


function mostrarDatosTabla($conn, $nombreTabla) {
     $sql = "SELECT * FROM $nombreTabla";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
         echo "<br>Datos de la tabla '$nombreTabla':<br>";
        
         $columns = $result->fetch_fields();
        foreach ($columns as $column) {
            echo $column->name . " | ";   
        }
        echo "<br><br>";

         while ($row = $result->fetch_assoc()) {
            foreach ($row as $value) {
                echo $value . " | ";   
            }
            echo "<br>";
        }
    } else {
        echo "No se encontraron datos en la tabla '$nombreTabla'.<br>";
    }
}


function mostrarDatosTablaEspecificos($conn, $nombreTabla, $email) {
     $sql = "SELECT * FROM $nombreTabla WHERE email = ?";

     if ($stmt = $conn->prepare($sql)) {
         $stmt->bind_param("s", $email);
         $stmt->execute();
         $result = $stmt->get_result();
         if ($result->num_rows > 0) {

            echo "<br>Tablas encontradas<br>";
            while ($row = $result->fetch_assoc()) {
                foreach ($row as $value) {
                    echo $value . " | ";   
                }
                echo "<br>";
            }
        } else {
            echo "No se encontraron datos.<br>";
        }
         $stmt->close();
    } else {
        echo "Error al preparar la consulta.<br>";
    }
}


echo mostrarTablas($conn);
mostrarColumnas($conn, "usuario");
mostrarDatosTabla($conn,"usuario");
mostrarDatosTablaEspecificos($conn, "usuario", "a");

$conn->close();

?>
