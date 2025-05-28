/* menu_script.js - VERSIÓN MEJORADA CON SELECTOR DE CANTIDAD */

document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    let currentCategory = 'todo';
    let allProducts = [];

    function verificarSesion() {
        fetch('http://localhost:3000/php/carrito.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: 'secion' })
        })
            .then(res => res.json())
            .then(data => {
                const btnlogin = document.querySelector('.btnLogin');
                const btnregister = document.querySelector('.btnRegister');
                const btnUser = document.getElementById('usuario');

                if (data.logueado) {
                    if (btnlogin) btnlogin.style.display = 'none';
                    if (btnregister) btnregister.style.display = 'none';
                    if (btnUser) {
                        btnUser.style.display = 'flex';
                        const nombreElemento = btnUser.querySelector('p');
                        if (nombreElemento) nombreElemento.textContent = data.nombre;
                    }
                } else {
                    if (btnlogin) btnlogin.style.display = 'block';
                    if (btnregister) btnregister.style.display = 'block';
                    if (btnUser) btnUser.style.display = 'none';
                }
            })
            .catch(err => console.error("Error verificando sesión:", err));
    }
    verificarSesion();

    // Elementos del DOM
    const menuItemsContainer = document.querySelector('.menu-items');
    const categoryButtons = document.querySelectorAll('.category-button');
    const categoriesContainer = document.querySelector('.menu-categories');

    // Función para crear el HTML de un producto - ACTUALIZADA
    function createProductHTML(product) {
        const stockBadge = product.stock < 10 && product.stock > 0 ?
            `<span class="stock-badge low-stock">Solo ${product.stock} disponibles</span>` : '';

        const isOutOfStock = product.stock === 0;
        const disabledClass = isOutOfStock ? 'disabled' : '';
        const buttonText = isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito';
        const buttonIcon = isOutOfStock ? 'block' : 'add_shopping_cart';

        // Selector de cantidad deshabilitado si no hay stock
        const quantityDisabled = isOutOfStock ? 'disabled' : '';
        const quantitySelectorOpacity = isOutOfStock ? 'style="opacity: 0.5;"' : '';
        const initialQuantity = isOutOfStock ? '0' : '1';

        return `
            <div class="menu-item" data-product-id="${product.id}">
                <img src="${product.image_url}" alt="${product.name}" class="menu-item-image" 
                     onerror="this.src='../assets/img/menu/default-product.jpg'">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${product.name}</h3>
                    <p class="menu-item-description">${product.description}</p>
                    <div class="menu-item-info">
                        <p class="menu-item-price">$${product.price.toFixed(2)}</p>
                        ${stockBadge}
                    </div>
                    
                    <!-- Selector de cantidad -->
                    <div class="quantity-selector" ${quantitySelectorOpacity}>
                        <button class="quantity-btn" data-action="decrease" type="button" ${quantityDisabled}>
                            <span class="material-symbols-outlined">remove</span>
                        </button>
                        <span class="quantity-display">${initialQuantity}</span>
                        <button class="quantity-btn" data-action="increase" type="button" ${quantityDisabled}>
                            <span class="material-symbols-outlined">add</span>
                        </button>
                    </div>
                    
                    <button class="add-to-cart ${disabledClass}" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.name}" 
                            data-product-price="${product.price}"
                            data-product-stock="${product.stock}"
                            ${isOutOfStock ? 'disabled' : ''}>
                        <span class="material-symbols-outlined">${buttonIcon}</span>
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
    }

    // Función para renderizar productos
    function renderProducts(products) {
        menuItemsContainer.innerHTML = '';

        if (products.length === 0) {
            menuItemsContainer.innerHTML = '<p class="no-products">Sin productos en esta categoria.</p>';
            return;
        }

        products.forEach(product => {
            menuItemsContainer.innerHTML += createProductHTML(product);
        });

        // Re-agregar event listeners a los nuevos elementos
        attachQuantityListeners();
        attachAddToCartListeners();
    }

    // Función para renderizar categorías
    function renderCategories(categories) {
        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = category;

            if (category.toLowerCase() === currentCategory) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => handleCategoryClick(category));
            categoriesContainer.appendChild(button);
        });
    }

    // Función para manejar clic en categoría
    function handleCategoryClick(category) {
        currentCategory = category.toLowerCase();

        document.querySelectorAll('.category-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === currentCategory) {
                btn.classList.add('active');
            }
        });

        if (currentCategory === 'todo') {
            renderProducts(allProducts);
        } else {
            const filteredProducts = allProducts.filter(product =>
                product.category.toLowerCase() === currentCategory
            );
            renderProducts(filteredProducts);
        }
    }

    // NUEVA: Función para manejar los selectores de cantidad
    function attachQuantityListeners() {
        const quantityButtons = document.querySelectorAll('.quantity-btn:not([disabled])');

        quantityButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const action = button.getAttribute('data-action');
                const quantitySelector = button.closest('.quantity-selector');
                const quantityDisplay = quantitySelector.querySelector('.quantity-display');
                const menuItem = button.closest('.menu-item');
                const addToCartBtn = menuItem.querySelector('.add-to-cart');
                const productStock = parseInt(addToCartBtn.getAttribute('data-product-stock')) || 999;

                let currentQuantity = parseInt(quantityDisplay.textContent);

                if (action === 'increase' && currentQuantity < productStock) {
                    currentQuantity++;
                } else if (action === 'decrease' && currentQuantity > 1) {
                    currentQuantity--;
                }

                // Actualizar display
                quantityDisplay.textContent = currentQuantity;

                // Actualizar estados de los botones
                const decreaseBtn = quantitySelector.querySelector('[data-action="decrease"]');
                const increaseBtn = quantitySelector.querySelector('[data-action="increase"]');

                decreaseBtn.disabled = currentQuantity <= 1;
                increaseBtn.disabled = currentQuantity >= productStock;

                // Efecto visual en el botón presionado
                button.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);

                // Actualizar texto del botón de agregar al carrito
                if (currentQuantity === 1) {
                    addToCartBtn.innerHTML = `
                        <span class="material-symbols-outlined">add_shopping_cart</span>
                        Agregar al Carrito
                    `;
                } else {
                    addToCartBtn.innerHTML = `
                        <span class="material-symbols-outlined">add_shopping_cart</span>
                        Agregar ${currentQuantity} al Carrito
                    `;
                }
            });
        });
    }

    // Función para cargar productos desde el servidor
    async function loadProducts() {
        if (!document.querySelector('.menu-items')) {
            console.log('No estamos en la página del menú, saltando loadProducts');
            return;
        }

        try {
            menuItemsContainer.innerHTML = '<div class="loading">Cargando productos...</div>';

            const response = await fetch('../php/get_products.php');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                allProducts = data.products;

                if (data.categories && data.categories.length > 0) {
                    renderCategories(data.categories);
                }

                renderProducts(allProducts);
                console.log(`Loaded ${allProducts.length} products successfully`);
            } else {
                throw new Error(data.error || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            menuItemsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar productos. Intenta mas tarde.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
    }

    // Función para verificar si el usuario está logueado
    async function checkUserSession() {
        try {
            const response = await fetch('../php/carrito.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accion: 'secion'
                })
            });

            const data = await response.json();
            return data.logueado || false;
        } catch (error) {
            console.error('Error checking session:', error);
            return false;
        }
    }

    // ACTUALIZADA: Función para adjuntar listeners a los botones de agregar al carrito
    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart:not(.disabled)');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();

                const productId = button.getAttribute('data-product-id');
                const productName = button.getAttribute('data-product-name');
                const productPrice = button.getAttribute('data-product-price');
                const productStock = parseInt(button.getAttribute('data-product-stock')) || 999;

                // NUEVO: Obtener la cantidad seleccionada
                const menuItem = button.closest('.menu-item');
                const quantityDisplay = menuItem.querySelector('.quantity-display');
                const quantity = parseInt(quantityDisplay.textContent) || 1;

                console.log(`Agregando al carrito: ${productName} (ID: ${productId}) - Cantidad: ${quantity}`);

                // Verificar stock antes de proceder
                if (quantity > productStock) {
                    showToast(`Solo hay ${productStock} unidades disponibles`, 'error');
                    return;
                }

                // Deshabilitar el botón temporalmente con animación
                const originalContent = button.innerHTML;
                button.disabled = true;
                button.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Agregando...';

                // Agregar clase de loading al item
                menuItem.classList.add('loading');

                try {
                    const response = await fetch('../php/carrito.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            accion: 'agg',
                            producto_id: productId,
                            producto_nombre: productName,
                            precio: productPrice,
                            cantidad: quantity // NUEVO: Enviar la cantidad seleccionada
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Éxito - mostrar mensaje de confirmación
                        button.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ¡Agregado!';
                        button.classList.add('success');

                        // Mostrar toast de éxito
                        const quantityText = quantity > 1 ? ` (${quantity} unidades)` : '';
                        showToast(`${productName}${quantityText} agregado al carrito`, 'Exitazooo');

                        // Actualizar el contador del carrito si existe
                        updateCartCounter(data.total_items);

                        // Resetear la cantidad a 1 después de agregar
                        quantityDisplay.textContent = '1';
                        updateQuantityButtons(menuItem, 1, productStock);

                        // Restaurar el botón después de 2 segundos
                        setTimeout(() => {
                            button.disabled = false;
                            button.innerHTML = originalContent;
                            button.classList.remove('success');
                        }, 2000);

                    } else {
                        throw new Error(data.message || 'Fallo al agregar al carrito');
                    }
                } catch (error) {
                    console.error('Error agregando al carrito:', error);

                    // Error - mostrar mensaje específico
                    let errorMessage = 'Error';
                    let showAlert = false;

                    if (error.message.includes('stock')) {
                        errorMessage = 'Sin stock suficiente';
                        showAlert = true;
                    } else if (error.message.includes('sesión') || error.message.includes('login')) {
                        errorMessage = 'Inicia sesión';
                        showLoginRequiredPopup();
                        return;
                    }

                    button.innerHTML = `<span class="material-symbols-outlined">error</span> ${errorMessage}`;
                    button.classList.add('error');

                    if (showAlert) {
                        showToast(error.message, 'error');
                    }

                    // Restaurar el botón después de 3 segundos
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = originalContent;
                        button.classList.remove('error');
                    }, 3000);

                } finally {
                    // Remover clase de loading
                    menuItem.classList.remove('loading');
                }
            });
        });
    }

    // NUEVA: Función para actualizar el estado de los botones de cantidad
    function updateQuantityButtons(menuItem, quantity, maxStock) {
        const quantitySelector = menuItem.querySelector('.quantity-selector');
        const decreaseBtn = quantitySelector.querySelector('[data-action="decrease"]');
        const increaseBtn = quantitySelector.querySelector('[data-action="increase"]');
        const addToCartBtn = menuItem.querySelector('.add-to-cart');

        decreaseBtn.disabled = quantity <= 1;
        increaseBtn.disabled = quantity >= maxStock;

        // Actualizar texto del botón
        if (quantity === 1) {
            addToCartBtn.innerHTML = `
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Agregar al Carrito
            `;
        } else {
            addToCartBtn.innerHTML = `
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Agregar ${quantity} al Carrito
            `;
        }
    }

    // Función para actualizar el contador del carrito
    function updateCartCounter(totalItems) {
        const cartIcon = document.getElementById('shopping_cart');
        if (cartIcon) {
            let badge = document.querySelector('.cart-badge');
            if (!badge && totalItems > 0) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartIcon.parentElement.style.position = 'relative';
                cartIcon.parentElement.appendChild(badge);
            }

            if (badge) {
                if (totalItems > 0) {
                    badge.textContent = totalItems;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }

    // Función para cargar el contador del carrito
    async function loadCartCounter() {
        try {
            const response = await fetch('../php/carrito.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accion: 'obtener'
                })
            });

            const data = await response.json();

            if (data.success && data.total_items) {
                updateCartCounter(data.total_items);
            }
        } catch (error) {
            console.error('Error cargando el contador de carrito:', error);
        }
    }

    // Usar el sistema de toast existente (se asume que showToast ya está definido globalmente)
    // Si no existe la función, crear una versión básica compatible
    if (typeof window.showToast !== 'function') {
        console.warn('showToast no encontrado, usando función básica');
        window.showToast = function (message, type = 'info') {
            // Fallback básico si no existe el sistema de toast
            console.log(`Toast ${type}: ${message}`);
            alert(message);
        };
    }

    // Cargar productos e inicializar
    loadProducts();
    loadCartCounter();
});

// Función auxiliar para manejar imágenes con error
window.handleImageError = function (img) {
    img.src = '../assets/img/menu/default-product.jpg';
};

// Funciones para el popup de Login Required
window.showLoginRequiredPopup = function () {
    const overlay = document.getElementById('loginRequiredOverlay');
    const popup = document.getElementById('loginRequiredPopup');

    overlay.classList.add('active');
    popup.classList.add('active');
};

window.closeLoginRequiredPopup = function () {
    const overlay = document.getElementById('loginRequiredOverlay');
    const popup = document.getElementById('loginRequiredPopup');

    overlay.classList.remove('active');
    popup.classList.remove('active');
};

window.closeAndReloadLoginRequiredPopup = function () {
    const overlay = document.getElementById('loginRequiredOverlay');
    const popup = document.getElementById('loginRequiredPopup');

    overlay.classList.remove('active');
    popup.classList.remove('active');
    window.location.reload();
};

window.openLoginFromRequired = function () {
    closeLoginRequiredPopup();
    setTimeout(() => {
        openPopup();
    }, 300);
};