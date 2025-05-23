document.addEventListener('DOMContentLoaded', () => {
    const contenedorProductos = document.getElementById('products-container');
    const priceSummary = document.querySelector('.price-summary');

    // Inicializar Stripe
    const stripe = Stripe('TU_PUBLISHABLE_KEY'); // Reemplaza con tu clave pública de Stripe
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    const displayError = document.getElementById('card-errors');
    const form = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit-button');

    let totalAmount = 0; // Total en dólares

    function actualizarTotales(precioTotal) {
        totalAmount = precioTotal;
        const subtotal = precioTotal.toFixed(2);
        const impuestos = 15.00; // Fijo, o puede venir dinámico
        const total = (precioTotal + impuestos).toFixed(2);

        priceSummary.innerHTML = `
            <p>Subtotal: $${subtotal}</p>
            <p>Taxes and Fees: $${impuestos.toFixed(2)}</p>
            <h3>Total: $${total}</h3>
        `;
    }

    function cargarProductosPasarela() {
        fetch('http://localhost:3000/php/carrito.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accion: 'ver' })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.carrito.length === 0) {
                contenedorProductos.innerHTML = '<p>Tu carrito está vacío.</p>';
                actualizarTotales(0);
                return;
            }

            contenedorProductos.innerHTML = '';
            let precioTotal = 0;

            data.carrito.forEach(producto => {
                const totalProducto = producto.precio * producto.cantidad;
                precioTotal += totalProducto;

                const productoHTML = `
                    <div class="product-details">
                        <img src="${producto.imagen || '../assets/img/buy/borrar-removebg-preview.png'}" alt="${producto.nombre}" class="product-icon">
                        <div class="product-info">
                            <p><strong>Producto:</strong></p>
                            <p>${producto.nombre}</p>
                            <p>Qty: ${producto.cantidad}</p>
                        </div>
                        <p class="price">$${totalProducto.toFixed(2)}</p>
                    </div>
                `;

                contenedorProductos.insertAdjacentHTML('beforeend', productoHTML);
            });

            actualizarTotales(precioTotal);
        })
        .catch(err => {
            console.error('Error al cargar productos:', err);
            contenedorProductos.innerHTML = '<p>Error al cargar el carrito.</p>';
            actualizarTotales(0);
        });
    }

    // Manejo errores en el input de la tarjeta
    cardElement.on('change', event => {
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Maneja el envío del formulario de pago
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (totalAmount <= 0) {
            alert('Tu carrito está vacío o no tiene un total válido para pagar.');
            return;
        }

        submitButton.disabled = true;

        try {
            // Convierte total a centavos para Stripe
            const amountInCents = Math.round((totalAmount + 15.00) * 100); // suma impuestos

            // Crea PaymentIntent en backend (debes implementar esta ruta)
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amountInCents }),
            });
            const { clientSecret } = await response.json();

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (error) {
                displayError.textContent = error.message;
                submitButton.disabled = false;
            } else {
                alert('Pago exitoso!');
                console.log('Pago completado:', paymentIntent);
                // Aquí puedes redirigir o limpiar carrito, etc.
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al procesar el pago. Inténtalo de nuevo.');
            submitButton.disabled = false;
        }
    });

    // Inicializa la carga de productos al cargar la página
    cargarProductosPasarela();
});

document.addEventListener('DOMContentLoaded', () => {
    const contenedorProductos = document.getElementById('products-container'); // div donde va el listado dinámico
    const priceSummary = document.querySelector('.price-summary'); // div del resumen de precios

    function actualizarTotales(precioTotal) {
        const subtotal = precioTotal.toFixed(2);
        const impuestos = 15.00; // valor fijo de impuestos
        const total = (precioTotal + impuestos).toFixed(2);

        priceSummary.innerHTML = `
            <p>Subtotal: $${subtotal}</p>
            <p>Taxes and Fees: $${impuestos.toFixed(2)}</p>
            <h3>Total: $${total}</h3>
        `;
    }

    function cargarProductosPasarela() {
        fetch('http://localhost:3000/php/carrito.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accion: 'ver' })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.carrito.length === 0) {
                contenedorProductos.innerHTML = '<p>Tu carrito está vacío.</p>';
                actualizarTotales(0);
                return;
            }

            contenedorProductos.innerHTML = ''; // limpiar contenido actual

            let precioTotal = 0;

            data.carrito.forEach(producto => {
                const totalProducto = producto.precio * producto.cantidad;
                precioTotal += totalProducto;

                const productoHTML = `
                    <div class="product-details">
                        <img src="${producto.imagen || '../assets/img/buy/borrar-removebg-preview.png'}" alt="${producto.nombre}" class="product-icon">
                        <div class="product-info">
                            <p><strong>Product:</strong></p>
                            <p>${producto.nombre}</p>
                            <p>Qty: ${producto.cantidad}</p>
                        </div>
                        <p class="price">$${totalProducto.toFixed(2)}</p>
                    </div>
                `;

                contenedorProductos.insertAdjacentHTML('beforeend', productoHTML);
            });

            actualizarTotales(precioTotal);
        })
        .catch(err => {
            console.error('Error al cargar productos:', err);
            contenedorProductos.innerHTML = '<p>Error al cargar el carrito.</p>';
            actualizarTotales(0);
        });
    }

    cargarProductosPasarela();
});
