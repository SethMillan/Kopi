
// Variables globales
let userOrders = [];

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

// Función para formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(price);
}

// Función para obtener clase de estado
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'creado':
            return 'status-creado';
        case 'preparado':
            return 'status-preparado';
        case 'entregado':
            return 'status-entregado';
        default:
            return 'status-creado';
    }
}

// Función para crear HTML de tarjeta de pedido
function createOrderCard(order) {
    return `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-info">
                            <div>
                                <div class="order-id">Pedido #${order.id}</div>
                                <div class="order-date">${formatDate(order.fecha_hora)}</div>
                            </div>
                        </div>
                        <div class="order-status ${getStatusClass(order.estado)}">
                            ${order.estado}
                        </div>
                    </div>
                    <div class="order-body">
                        <div class="order-total">
                            ${formatPrice(order.total)}
                        </div>
                        <div class="order-actions">
                            <button class="action-btn btn-primary" onclick="reorderItems(${order.id})">
                                <span class="material-symbols-outlined">refresh</span>
                                Volver a Ordenar
                            </button>
                            <button class="action-btn btn-secondary" onclick="viewOrderDetails(${order.id})">
                                <span class="material-symbols-outlined">visibility</span>
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
}

// Función para actualizar estadísticas
function updateStats(orders) {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(order => order.estado === 'Entregado').length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatPrice(totalSpent);
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Función para cargar pedidos
async function loadOrders() {
    const ordersContent = document.getElementById('ordersContent');

    // Mostrar loading
    ordersContent.innerHTML = `
                <div class="loading">
                    <span class="material-symbols-outlined">hourglass_empty</span>
                    <p>Cargando tus pedidos...</p>
                </div>
            `;

    try {
        const response = await fetch('../php/get_orders.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            userOrders = data.pedidos;

            if (userOrders.length === 0) {
                // Sin pedidos
                ordersContent.innerHTML = `
                            <div class="empty-state">
                                <span class="material-symbols-outlined">receipt_long</span>
                                <h3>Sin pedidos encontrados</h3>
                                <p>Aún no has realizado ningún pedido. ¡Es hora de probar nuestros deliciosos cafés!</p>
                                <a href="../pages/menu.html" class="primary-btn">
                                    <span class="material-symbols-outlined">restaurant_menu</span>
                                    Ver Menú
                                </a>
                            </div>
                        `;
                updateStats([]);
            } else {
                // Mostrar pedidos
                const ordersHTML = userOrders.map(order => createOrderCard(order)).join('');
                ordersContent.innerHTML = ordersHTML;
                updateStats(userOrders);
            }
        } else {
            throw new Error(data.message || 'Error al cargar pedidos');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContent.innerHTML = `
                    <div class="error-message">
                        <span class="material-symbols-outlined">error</span>
                        <h3>Error al cargar pedidos</h3>
                        <p>${error.message}</p>
                        <button class="primary-btn" onclick="loadOrders()">
                            <span class="material-symbols-outlined">refresh</span>
                            Intentar de nuevo
                        </button>
                    </div>
                `;
    }
}

// Función para volver a ordenar
function reorderItems(orderId) {
    if (confirm('¿Deseas agregar los productos de este pedido a tu carrito actual?')) {
        // Aquí puedes implementar la lógica para agregar productos al carrito
        alert(`Funcionalidad de "Volver a Ordenar" para pedido #${orderId} - Por implementar`);
        // Redirigir al carrito
        // window.location.href = '../pages/carrito.html';
    }
}

// Función para ver detalles
function viewOrderDetails(orderId) {
    alert(`Ver detalles del pedido #${orderId} - Por implementar`);
    // Aquí puedes abrir un modal o redirigir a una página de detalles
}

// Verificar sesión al cargar
async function checkSession() {
    try {
        const response = await fetch('../php/carrito.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: 'secion' })
        });

        const data = await response.json();

        if (!data.logueado) {
            alert('Debes iniciar sesión para ver tus pedidos');
            window.location.href = '../pages/login.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking session:', error);
        alert('Error de conexión');
        return false;
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', async function () {
    const sessionValid = await checkSession();
    if (sessionValid) {
        loadOrders();
    }
});
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
            const btnlogin = document.querySelector('.btnLogin'); // Cambiado a clase
            const btnregister = document.querySelector('.btnRegister'); // Cambiado a clase
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
