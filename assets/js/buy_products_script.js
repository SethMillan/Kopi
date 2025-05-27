// buy_products_script.js
document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.pathname.includes('buy.html')) return;

    loadCartProducts();

    async function loadCartProducts() {
        try {
            const response = await fetch('../php/carrito.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'ver' })
            });

            const data = await response.json();

            if (data.success && data.carrito.length > 0) {
                renderCartProducts(data.carrito);
            }
        } catch (error) {
            console.error('Error loading cart products:', error);
        }
    }

    function renderCartProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-details';
            productElement.innerHTML = `
<img src="${product.imagen || '../assets/img/buy/borrar-removebg-preview.png'}" alt="Producto" class="product-icon">                <div class="product-info">
                    <p><strong>${product.nombre}</strong></p>
                    <p>Qty: ${product.cantidad}</p>
                </div>
                <p class="price">$${(product.precio * product.cantidad).toFixed(2)}</p>
            `;
            container.appendChild(productElement);
        });
    }
});