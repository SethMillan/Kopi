document.addEventListener('DOMContentLoaded', () => {
    const orderSummary = document.querySelector('.order-summary');
    const template = document.querySelector('.product-details');
    const carritoBasio = document.getElementById('carrito_basio');
    const carritoSubtotal = document.getElementById('subtotal');
    const carritoTotal = document.getElementById('total');
    let precioTotal = 0;



    // 👉 Hacer POST con JSON
    fetch('http://localhost:3000/php/carrito.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion: 'ver' })
    })
    .then(res => res.json())
    .then(data => {
        // Ocultar el template original desde el principio
        template.style.display = 'none';
        if (data.success && data.carrito.length > 0) {
            data.carrito.forEach(producto => {
                const clone = template.cloneNode(true);
                clone.style.display = 'flex'; // Mostramos el clon

                // Actualiza los datos del producto
                clone.querySelector('p:nth-of-type(2)').textContent = producto.nombre;
                clone.querySelector('p:nth-of-type(3)').textContent = `Qty: ${producto.cantidad}`;
                let precioProducto = (producto.precio * producto.cantidad).toFixed(2);
                clone.querySelector('.price').textContent = `$${precioProducto}`;

                precioTotal += parseFloat(precioProducto);
                
                const imagenTag = clone.querySelector('img.product-icon');
                if (imagenTag && producto.imagen) {
                    imagenTag.src = producto.imagen;
                }

                // Añade el clon al DOM
                orderSummary.appendChild(clone);
            });

            // Ocultar mensaje de "carrito vacío"
            if (carritoBasio) carritoBasio.style.display = 'none';

        } else {
            // Mostrar mensaje de "carrito vacío"
            if (carritoBasio) carritoBasio.style.display = 'block';
        }
        carritoSubtotal.textContent = "Subtotal " + "$"+precioTotal;
        carritoTotal.textContent = "Total " + "$"+(precioTotal+10);

    })
    .catch(err => {
        console.error('catch carrito', err);
        // Mostrar mensaje de error o "carrito vacío" si ocurre un fallo
        if (carritoBasio) carritoBasio.style.display = 'block';
    });

    // 🔄 Botones + y -
    orderSummary.addEventListener('click', (e) => {
        if (e.target.classList.contains('mas') || e.target.classList.contains('menos')) {
            const container = e.target.parentElement;
            const label = container.querySelector('label');
            let count = parseInt(label.textContent);

            if (e.target.classList.contains('mas')) {
                count++;
            } else if (e.target.classList.contains('menos') && count > 1) {
                count--;
            }

            label.textContent = count;
        }
    });
});
