// SESION.JS - Versión corregida

// Definir showToast ANTES que cualquier otra cosa
window.showToast = function (type = 'info', title = '', message = '', duration = 3000) {
    const container = document.getElementById('toastContainer');

    // VALIDACIÓN CRÍTICA
    if (!container) {
        console.error('Toast container no encontrado en el DOM');
        console.log('Elementos encontrados:', document.querySelectorAll('[id*="toast"], [class*="toast"]'));
        alert(`${title}: ${message}`); // Fallback
        return;
    }

    console.log('Creando toast:', type, title, message);

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon;
    switch (type) {
        case 'error': icon = 'error'; break;
        case 'success': icon = 'check_circle'; break;
        case 'warning': icon = 'warning'; break;
        default: icon = 'info';
    }

    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon">${icon}</span>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <span class="material-symbols-outlined toast-close" onclick="closeToast(this.parentElement)">close</span>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Forzar reflow antes de mostrar
    toast.offsetHeight;

    // Mostrar el toast
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-cerrar después del tiempo especificado
    setTimeout(() => closeToast(toast), duration);

    console.log("Toast creado exitosamente:", type, title, message);
    return toast;
};

window.closeToast = function (toast) {
    if (toast && toast.classList.contains('toast')) {
        toast.classList.add('hide');
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }
};

// Funciones específicas para login
window.showLoginError = function (message) {
    showToast('error', 'Error de Login', message, 4000);
};

window.showLoginSuccess = function (message = '¡Bienvenido!') {
    showToast('success', 'Login Exitoso', message, 2000);
};

function cerrarSesion() {
    closeUserMenu(); // Cerrar el menú primero

    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Detectar si estamos en una página dentro de /pages/ o en el root
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        const logoutUrl = isInPagesFolder ? '../php/logout.php' : 'php/logout.php';

        fetch(logoutUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log(data.message);
                    showToast('success', 'Sesión Cerrada', data.message, 2000);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showToast('error', 'Error', 'Error al cerrar sesión: ' + data.message);
                    console.error('Error en logout:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al cerrar sesión:', error);
                showToast('warning', 'Advertencia', 'Cerrando sesión...');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            });
    }
}

function verificarSesion() {
    // Detectar la URL correcta según la ubicación
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const baseUrl = isInPagesFolder ? '../php/' : 'php/';

    fetch(`${baseUrl}carrito.php`, {
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
            const btnProcederPagar = document.querySelector('a[href="../pages/buy.html"] button'); // Botón de proceder a pagar

            if (data.logueado) {
                if (btnlogin) btnlogin.style.display = 'none';
                if (btnregister) btnregister.style.display = 'none';
                if (btnUser) {
                    btnUser.style.display = 'flex';
                    const nombreElemento = btnUser.querySelector('p');
                    if (nombreElemento) nombreElemento.textContent = data.nombre;
                }
                // Mostrar botón de proceder a pagar si usuario está logueado
                if (btnProcederPagar) btnProcederPagar.style.display = 'block';
            } else {
                if (btnlogin) btnlogin.style.display = 'block';
                if (btnregister) btnregister.style.display = 'block';
                if (btnUser) btnUser.style.display = 'none';
                // Ocultar botón de proceder a pagar si usuario NO está logueado
                if (btnProcederPagar) btnProcederPagar.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Error verificando sesión:", err);
            showToast('error', 'Error de Conexión', 'No se pudo verificar la sesión');
        });
}

// Ejecutar verificación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado, verificando sesión y configurando toasts...');

    // Verificar que el container de toast exista
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error('CRÍTICO: No se encontró el toast container');
    } else {
        console.log('Toast container encontrado correctamente');
    }

    verificarSesion();
});

function openPopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    if (overlay) overlay.classList.add('active');
    if (popup) popup.classList.add('open-popup');
}

function closePopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    if (overlay) overlay.classList.remove('active');
    if (popup) popup.classList.remove('open-popup');
}

// Funciones para el menú de usuario
function toggleUserMenu(event) {
    event.preventDefault();
    const overlay = document.getElementById('userMenuOverlay');
    const dropdown = document.getElementById('userMenuDropdown');
    const userName = document.getElementById('nombreUsuario').textContent;
    const userMenuName = document.getElementById('userMenuName');

    if (userMenuName && userName) {
        userMenuName.textContent = userName;
    }

    if (overlay) overlay.classList.toggle('active');
    if (dropdown) dropdown.classList.toggle('active');
}

function closeUserMenu() {
    const overlay = document.getElementById('userMenuOverlay');
    const dropdown = document.getElementById('userMenuDropdown');

    if (overlay) overlay.classList.remove('active');
    if (dropdown) dropdown.classList.remove('active');
}