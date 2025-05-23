<?php
header('Content-Type: application/json');

// En una implementación real, aquí llamarías a la API de OpenAI
// Esto es solo un ejemplo básico

$data = json_decode(file_get_contents('php://input'), true);
$message = strtolower(trim($data['message']));

// Respuestas predefinidas (en producción usarías la API de OpenAI)
$responses = [
    "hola" => "¡Hola! Soy el asistente de Kopi. ¿En qué puedo ayudarte con el café hoy?",
    "qué tipos de café tienen" => "Tenemos espresso, americano, latte, cappuccino, mocha, y nuestras especialidades: Magic Thai y Caramel Kiss. También ofrecemos granos de Colombia, Etiopía y nuestra mezcla especial.",
    "recomiéndame" => "Te recomiendo nuestro Magic Thai si te gustan sabores únicos, o el Caramel Kiss para algo dulce. ¿Prefieres algo fuerte o suave?",
    "cómo preparo" => "Para el mejor café en casa: 1) Usa agua filtrada, 2) Muele los granos frescos, 3) Proporción 1:16 (café:agua), 4) Temperatura 90-96°C, 5) Tiempo de extracción 2-4 minutos.",
    "qué hace especial" => "Kopi selecciona granos de alta calidad, tuesta artesanalmente y prepara cada taza con precisión. Nuestro barista jefe tiene 10 años de experiencia premiada.",
    "default" => "Soy un experto en café. Puedes preguntarme sobre nuestros productos, métodos de preparación, orígenes del café o recomendaciones personalizadas."
];

$reply = $responses['default'];

foreach ($responses as $key => $response) {
    if (strpos($message, $key) !== false) {
        $reply = $response;
        break;
    }
}

echo json_encode(['reply' => $reply]);
?>