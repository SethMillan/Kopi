document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    let currentCategory = 'all';
    let allProducts = [];
    
    // Elementos del DOM
    const menuItemsContainer = document.querySelector('.menu-items');
    const categoryButtons = document.querySelectorAll('.category-button');
    const categoriesContainer = document.querySelector('.menu-categories');
    
    // Función para crear el HTML de un producto
    function createProductHTML(product) {
        const stockBadge = product.stock < 10 && product.stock > 0 ? `<span class="stock-badge low-stock">Solo ${product.stock} disponibles</span>` : '';
        const disabledClass = product.stock === 0 ? 'disabled' : '';
        const buttonText = product.stock === 0 ? 'Sin Stock' : 'Add to Cart';
        const buttonIcon = product.stock === 0 ? 'block' : 'add_shopping_cart';
        
        return `
            <div class="menu-item" data-product-id="${product.id}">
                <img src="${product.image_url}" alt="${product.name}" class="menu-item-image" onerror="this.src='../assets/img/menu/default-product.jpg'">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${product.name}</h3>
                    <p class="menu-item-description">${product.description}</p>
                    <div class="menu-item-info">
                        <p class="menu-item-price">$${product.price.toFixed(2)}</p>
                        ${stockBadge}
                    </div>
                    <button class="add-to-cart ${disabledClass}" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.name}" 
                            data-product-price="${product.price}"
                            ${product.stock === 0 ? 'disabled' : ''}>
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
            menuItemsContainer.innerHTML = '<p class="no-products">No products found in this category.</p>';
            return;
        }
        
        products.forEach(product => {
            menuItemsContainer.innerHTML += createProductHTML(product);
        });
        
        // Re-agregar event listeners a los nuevos botones
        attachAddToCartListeners();
    }
    
    // Función para renderizar categorías
    function renderCategories(categories) {
        categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = category;
            
            // Marcar como activo si corresponde
            if (category.toLowerCase() === currentCategory) {
                button.classList.add('active');
            }
            
            // Agregar event listener
            button.addEventListener('click', () => handleCategoryClick(category));
            
            categoriesContainer.appendChild(button);
        });
    }
    
    // Función para manejar clic en categoría
    function handleCategoryClick(category) {
        currentCategory = category.toLowerCase();
        
        // Actualizar botones activos
        document.querySelectorAll('.category-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === currentCategory) {
                btn.classList.add('active');
            }
        });
        
        // Filtrar productos
        if (currentCategory === 'all') {
            renderProducts(allProducts);
        } else {
            const filteredProducts = allProducts.filter(product => 
                product.category.toLowerCase() === currentCategory
            );
            renderProducts(filteredProducts);
        }
    }
    
    // Función para cargar productos desde el servidor
    async function loadProducts() {
        try {
            // Mostrar indicador de carga
            menuItemsContainer.innerHTML = '<div class="loading">Loading products...</div>';
            
            const response = await fetch('../php/get_products.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                allProducts = data.products;
                
                // Renderizar categorías dinámicamente
                if (data.categories && data.categories.length > 0) {
                    renderCategories(data.categories);
                }
                
                // Renderizar todos los productos inicialmente
                renderProducts(allProducts);
                
                console.log(`Loaded ${allProducts.length} products successfully`);
            } else {
                throw new Error(data.error || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            menuItemsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading products. Please try again later.</p>
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
    
    // Función para adjuntar listeners a los botones de agregar al carrito
    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart:not(.disabled)');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const productId = button.getAttribute('data-product-id');
                const productName = button.getAttribute('data-product-name');
                const productPrice = button.getAttribute('data-product-price');
                
                console.log(`Adding to cart: ${productName} (ID: ${productId})`);
                
                // Deshabilitar el botón temporalmente
                button.disabled = true;
                button.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Adding...';
                
                try {
                    const response = await fetch('../php/carrito.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include', // Importante para mantener la sesión
                        body: JSON.stringify({
                            accion: 'agg',
                            producto_id: productId,
                            producto_nombre: productName,
                            precio: productPrice,
                            cantidad: 1
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Éxito - mostrar mensaje de confirmación
                        button.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Added!';
                        button.classList.add('success');
                        
                        // Actualizar el contador del carrito si existe
                        updateCartCounter(data.total_items);
                        
                        // Restaurar el botón después de 2 segundos
                        setTimeout(() => {
                            button.disabled = false;
                            button.innerHTML = '<span class="material-symbols-outlined">add_shopping_cart</span> Add to Cart';
                            button.classList.remove('success');
                        }, 2000);
                    } else {
                        throw new Error(data.message || 'Failed to add to cart');
                    }
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    
                    // Error - mostrar mensaje específico
                    let errorMessage = 'Error';
                    let showAlert = false;
                    
                    if (error.message.includes('stock')) {
                        errorMessage = 'Sin stock';
                        showAlert = true;
                    } else if (error.message.includes('sesión')) {
                        errorMessage = 'Login needed';
                        // Opcionalmente, redirigir al login
                        if (confirm('Necesitas iniciar sesión para agregar productos al carrito. ¿Deseas ir a la página de login?')) {
                            window.location.href = 'login.html';
                            return;
                        }
                    }
                    
                    button.innerHTML = `<span class="material-symbols-outlined">error</span> ${errorMessage}`;
                    button.classList.add('error');
                    
                    if (showAlert && error.message.includes('Solo hay')) {
                        alert(error.message);
                    }
                    
                    // Restaurar el botón después de 3 segundos
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = '<span class="material-symbols-outlined">add_shopping_cart</span> Add to Cart';
                        button.classList.remove('error');
                    }, 3000);
                }
            });
        });
    }
    
    // Función para actualizar el contador del carrito
    function updateCartCounter(totalItems) {
        const cartIcon = document.getElementById('shopping_cart');
        if (cartIcon) {
            // Crear o actualizar el badge del carrito
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
                    badge.style.display = 'block';
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
            console.error('Error loading cart counter:', error);
        }
    }
    
    // Cargar productos al iniciar
    loadProducts();
    
    // Cargar el contador del carrito al iniciar
    loadCartCounter();
});

// Función auxiliar para manejar imágenes con error
window.handleImageError = function(img) {
    img.src = '../assets/img/menu/default-product.jpg';
};