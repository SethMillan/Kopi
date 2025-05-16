// Configura Stripe con tu clave pública
const stripe = Stripe('TU_PUBLISHABLE_KEY'); // Reemplaza con tu clave pública de Stripe

// Crea una instancia de Elements
const elements = stripe.elements();
const cardElement = elements.create('card');

// Monta el elemento de la tarjeta en el div correspondiente
cardElement.mount('#card-element');

// Maneja los errores de la tarjeta
cardElement.on('change', (event) => {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Maneja el envío del formulario
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Deshabilita el botón de pago para evitar múltiples envíos
    document.getElementById('submit-button').disabled = true;

    try {
        // Crea un PaymentIntent en el backend
        const { clientSecret } = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: 19800 }), // El monto en centavos (198.00 USD)
        }).then((response) => response.json());

        // Confirma el pago con Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            // Muestra el error al usuario
            const displayError = document.getElementById('card-errors');
            displayError.textContent = error.message;
            document.getElementById('submit-button').disabled = false;
        } else {
            // Pago exitoso
            alert('Pago exitoso!');
            console.log('Pago completado:', paymentIntent);
            // Aquí puedes redirigir al usuario o mostrar un mensaje de éxito
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al procesar el pago. Inténtalo de nuevo.');
        document.getElementById('submit-button').disabled = false;
    }
});