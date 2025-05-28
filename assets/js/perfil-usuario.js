/* user_profile.js - Manejo del perfil de usuario */

document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let userData = {};

    // Elementos del DOM
    const menuItems = document.querySelectorAll('#fe li');
    const seccionesContenido = document.querySelectorAll('.seccion-contenido');

    // ===== INICIALIZACIÓN ===== 
    init();

    function init() {
        cargarDatosUsuario();
        configurarNavegacion();
        activarSeccion('personales'); // Sección por defecto
    }

    // ===== CARGAR DATOS DEL USUARIO =====
    async function cargarDatosUsuario() {
        try {
            // Mostrar estado de carga inicial
            mostrarCargandoInicial();

            const response = await fetch("../php/get_datos_usuario.php");
            const data = await response.json();

            if (data.error) {
                console.error("No logueado o error:", data.error);
                mostrarError("Error al cargar datos del usuario");
                return;
            }

            // Guardar datos globalmente
            userData = data;
            console.log("Datos del usuario cargados:", userData); // Para debug

            // Mostrar la sección de personales con los datos
            mostrarSeccionPersonales();

        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
            mostrarError("Error de conexión al cargar datos");
        }
    }

    function mostrarCargandoInicial() {
        const df = document.getElementById('df');
        df.innerHTML = `
            <h3 id="w1">Cargando datos...</h3>
            <div class="campo-grupo">
                <div class="subrayado loading">Obteniendo información del usuario...</div>
            </div>
        `;
    }

    // ===== RELLENAR DATOS EN SECCIONES =====
    function rellenarDatosPersonales(data) {
        const elementos = {
            'nombreUsuario': data.nombre || 'No disponible',
            'apellidoUsuario': data.apaterno || 'No disponible',
            'emailUsuario': data.email || 'No disponible'
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
                elemento.classList.remove('loading');
            }
        });
    }

    function rellenarDatosContacto(data) {
        // Crear sección de contacto si no existe
        if (!document.getElementById('seccion-contacto')) {
            crearSeccionContacto(data);
        }
    }

    function rellenarMetodosPago(data) {
        // Crear sección de métodos de pago si no existe
        if (!document.getElementById('seccion-metodos')) {
            crearSeccionMetodosPago(data);
        }
    }

    // ===== CREAR SECCIONES DINÁMICAMENTE =====
    function crearSeccionContacto(data) {
        const contenedor = document.getElementById('df');
        const seccionHTML = `
            <div id="seccion-contacto" class="seccion-contenido">
                <h3 id="w1">Información de Contacto</h3>
                
                <div class="contacto-info">
                    <div class="campo-grupo">
                        <p class="raspa">Teléfono:</p>
                        <label class="jh">
                            <span class="subrayado" id="telefonoUsuario">${data.telefono || 'No registrado'}</span>
                        </label>
                    </div>
                    
                    <div class="campo-grupo">
                        <p class="raspa">Teléfono alternativo:</p>
                        <label class="jh">
                            <span class="subrayado" id="telefonoAltUsuario">${data.telefono_alt || 'No registrado'}</span>
                        </label>
                    </div>
                    
                    <div class="campo-grupo">
                        <p class="raspa">Dirección:</p>
                        <label class="jh">
                            <span class="subrayado" id="direccionUsuario">${data.direccion || 'No registrada'}</span>
                        </label>
                    </div>
                    
                    <div class="campo-grupo">
                        <p class="raspa">Ciudad:</p>
                        <label class="jh">
                            <span class="subrayado" id="ciudadUsuario">${data.ciudad || 'No registrada'}</span>
                        </label>
                    </div>
                    
                    <div class="campo-grupo">
                        <p class="raspa">Código Postal:</p>
                        <label class="jh">
                            <span class="subrayado" id="cpUsuario">${data.codigo_postal || 'No registrado'}</span>
                        </label>
                    </div>
                    
                    <div class="campo-grupo">
                        <p class="raspa">Fecha de registro:</p>
                        <label class="jh">
                            <span class="subrayado" id="fechaRegistro">${formatearFecha(data.fecha_registro) || 'No disponible'}</span>
                        </label>
                    </div>
                </div>
                
                <div class="acciones">
                    <button class="btn-accion btn-primary" onclick="editarContacto()">
                        <span class="material-symbols-outlined">edit</span>
                        Editar Información
                    </button>
                </div>
            </div>
        `;

        contenedor.insertAdjacentHTML('beforeend', seccionHTML);
    }

    function crearSeccionMetodosPago(data) {
        const contenedor = document.getElementById('df');
        const seccionHTML = `
            <div id="seccion-metodos" class="seccion-contenido">
                <h3 id="w1">Métodos de Pago</h3>
                
                <div class="metodos-pago">
                    <div class="tarjeta-pago">
                        <div class="icono-tarjeta">
                            <span class="material-symbols-outlined">credit_card</span>
                        </div>
                        <div class="info-tarjeta">
                            <h4>Tarjeta de Crédito</h4>
                            <p>**** **** **** 1234</p>
                        </div>
                    </div>
                    
                    <div class="tarjeta-pago">
                        <div class="icono-tarjeta">
                            <span class="material-symbols-outlined">account_balance</span>
                        </div>
                        <div class="info-tarjeta">
                            <h4>PayPal</h4>
                            <p>${data.email}</p>
                        </div>
                    </div>
                    
                    <div class="tarjeta-pago agregar-metodo" onclick="agregarMetodoPago()">
                        <div class="icono-tarjeta">
                            <span class="material-symbols-outlined">add</span>
                        </div>
                        <div class="info-tarjeta">
                            <h4>Agregar nuevo método</h4>
                            <p>Tarjeta de crédito, débito o cuenta bancaria</p>
                        </div>
                    </div>
                </div>
                
                <div class="acciones">
                    <button class="btn-accion btn-primary" onclick="gestionarPagos()">
                        <span class="material-symbols-outlined">payment</span>
                        Gestionar Pagos
                    </button>
                    <button class="btn-accion btn-secondary" onclick="historialPagos()">
                        <span class="material-symbols-outlined">history</span>
                        Historial
                    </button>
                </div>
            </div>
        `;

        contenedor.insertAdjacentHTML('beforeend', seccionHTML);
    }

    // ===== NAVEGACIÓN ENTRE SECCIONES =====
    function configurarNavegacion() {
        // Hacer que la primera sección (Personales) esté activa por defecto
        document.querySelector('#fe li:first-child').classList.add('active');

        menuItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const secciones = ['personales', 'contacto', 'metodos'];
                activarSeccion(secciones[index]);

                // Actualizar menú activo
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');

                // Actualizar título según la sección
                actualizarTitulo(secciones[index]);
            });
        });
    }

    function activarSeccion(seccion) {
        // Limpiar contenido anterior
        const df = document.getElementById('df');

        switch (seccion) {
            case 'personales':
                mostrarSeccionPersonales();
                break;
            case 'contacto':
                mostrarSeccionContacto();
                break;
            case 'metodos':
                mostrarSeccionMetodosPago();
                break;
        }
    }

    function mostrarSeccionPersonales() {
        const df = document.getElementById('df');
        df.innerHTML = `
            <h3 id="w1">Mis datos personales</h3>
            
            <div class="campo-grupo">
                <p class="raspa">Nombre(s):</p>
                <label class="jh">
                    <span class="subrayado" id="nombreUsuario">${userData.nombre || 'No disponible'}</span>
                </label>
            </div>

            <div class="campo-grupo">
                <p class="raspa">Apellido paterno:</p>
                <label class="jh">
                    <span class="subrayado" id="apellidoUsuario">${userData.apaterno || 'No disponible'}</span>
                </label>
            </div>
            
            <div class="campo-grupo">
                <p class="raspa">Apellido materno:</p>
                <label class="jh">
                    <span class="subrayado" id="apellidoMaternoUsuario">${userData.amaterno || 'No disponible'}</span>
                </label>
            </div>

            <div class="campo-grupo">
                <p class="raspa">Email:</p>
                <label class="jh">
                    <span class="subrayado" id="emailUsuario">${userData.email || 'No disponible'}</span>
                </label>
            </div>
            
            <div class="campo-grupo">
                <p class="raspa">Usuario:</p>
                <label class="jh">
                    <span class="subrayado" id="usernameUsuario">${userData.username || 'No disponible'}</span>
                </label>
            </div>
            
            <div class="acciones">
                <button class="btn-accion btn-primary" onclick="editarPerfil()">
                    <span class="material-symbols-outlined">edit</span>
                    Editar Perfil
                </button>
                <button class="btn-accion btn-secondary" onclick="cambiarPassword()">
                    <span class="material-symbols-outlined">lock</span>
                    Cambiar Contraseña
                </button>
            </div>
        `;
    }

    function mostrarSeccionContacto() {
        const df = document.getElementById('df');
        df.innerHTML = `
            <h3 id="w1">Información de Contacto</h3>
            
            <div class="contacto-info">
                <div class="campo-grupo">
                    <p class="raspa">Teléfono:</p>
                    <label class="jh">
                        <span class="subrayado" id="telefonoUsuario">${userData.telefono || 'No registrado'}</span>
                    </label>
                </div>
                
                <div class="campo-grupo">
                    <p class="raspa">Teléfono alternativo:</p>
                    <label class="jh">
                        <span class="subrayado" id="telefonoAltUsuario">${userData.telefono_alt || 'No registrado'}</span>
                    </label>
                </div>
                
                <div class="campo-grupo">
                    <p class="raspa">Dirección:</p>
                    <label class="jh">
                        <span class="subrayado" id="direccionUsuario">${userData.direccion || 'No registrada'}</span>
                    </label>
                </div>
                
                <div class="campo-grupo">
                    <p class="raspa">Ciudad:</p>
                    <label class="jh">
                        <span class="subrayado" id="ciudadUsuario">${userData.ciudad || 'No registrada'}</span>
                    </label>
                </div>
                
                <div class="campo-grupo">
                    <p class="raspa">Código Postal:</p>
                    <label class="jh">
                        <span class="subrayado" id="cpUsuario">${userData.codigo_postal || 'No registrado'}</span>
                    </label>
                </div>
                
                <div class="campo-grupo">
                    <p class="raspa">Fecha de registro:</p>
                    <label class="jh">
                        <span class="subrayado" id="fechaRegistro">${formatearFecha(userData.fecha_registro) || 'No disponible'}</span>
                    </label>
                </div>
            </div>
            
            <div class="acciones">
                <button class="btn-accion btn-primary" onclick="editarContacto()">
                    <span class="material-symbols-outlined">edit</span>
                    Editar Información
                </button>
            </div>
        `;
    }

    function mostrarSeccionMetodosPago() {
        const df = document.getElementById('df');
        df.innerHTML = `
            <h3 id="w1">Métodos de Pago</h3>
            
            <div class="metodos-pago">
                <div class="tarjeta-pago">
                    <div class="icono-tarjeta">
                        <span class="material-symbols-outlined">credit_card</span>
                    </div>
                    <div class="info-tarjeta">
                        <h4>Tarjeta de Crédito</h4>
                        <p>**** **** **** 1234</p>
                    </div>
                </div>
                
                <div class="tarjeta-pago">
                    <div class="icono-tarjeta">
                        <span class="material-symbols-outlined">account_balance</span>
                    </div>
                    <div class="info-tarjeta">
                        <h4>PayPal</h4>
                        <p>${userData.email || 'No disponible'}</p>
                    </div>
                </div>
                
                <div class="tarjeta-pago agregar-metodo" onclick="agregarMetodoPago()">
                    <div class="icono-tarjeta">
                        <span class="material-symbols-outlined">add</span>
                    </div>
                    <div class="info-tarjeta">
                        <h4>Agregar nuevo método</h4>
                        <p>Tarjeta de crédito, débito o cuenta bancaria</p>
                    </div>
                </div>
            </div>
            
            <div class="acciones">
                <button class="btn-accion btn-primary" onclick="gestionarPagos()">
                    <span class="material-symbols-outlined">payment</span>
                    Gestionar Pagos
                </button>
                <button class="btn-accion btn-secondary" onclick="historialPagos()">
                    <span class="material-symbols-outlined">history</span>
                    Historial
                </button>
            </div>
        `;
    }

    function actualizarTitulo(seccion) {
        const titulos = {
            'personales': 'Datos Personales',
            'contacto': 'Información de Contacto',
            'metodos': 'Métodos de Pago'
        };

        document.getElementById('t1').textContent = titulos[seccion] || 'Mi Cuenta';
    }

    // ===== UTILIDADES =====
    function mostrarCargando() {
        const elementos = ['nombreUsuario', 'apellidoUsuario', 'emailUsuario'];
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = 'Cargando...';
                elemento.classList.add('loading');
            }
        });
    }

    function mostrarError(mensaje) {
        if (typeof window.showToast === 'function') {
            showToast(mensaje, 'error');
        } else {
            console.error(mensaje);
        }
    }

    function formatearFecha(fecha) {
        if (!fecha) return null;
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // ===== FUNCIONES GLOBALES PARA BOTONES =====
    window.editarPerfil = function () {
        if (typeof window.showToast === 'function') {
            showToast('Función de editar perfil próximamente', 'peldoneme plofa aun no queda eto');
        }
    };

    window.cambiarPassword = function () {
        if (typeof window.showToast === 'function') {
            showToast('Función de cambiar contraseña próximamente', 'peldoneme plofa aun no queda eto');
        }
    };

    window.editarContacto = function () {
        if (typeof window.showToast === 'function') {
            showToast('Función de editar contacto próximamente', 'peldoneme plofa aun no queda eto');
        }
    };

    window.agregarMetodoPago = function () {
        if (typeof window.showToast === 'function') {
            showToast('Función de agregar método de pago próximamente', 'peldoneme plofa aun no queda eto');
        }
    };

    window.gestionarPagos = function () {
        if (typeof window.showToast === 'function') {
            showToast('Función de gestionar pagos próximamente', 'peldoneme plofa aun no queda eto');
        }
    };

    window.historialPagos = function () {
        if (typeof window.showToast === 'function') {
            showToast('Función de historial de pagos próximamente', 'peldoneme plofa aun no queda eto');
        }
    };

    // Activar primera sección por defecto
    document.querySelector('#fe li').classList.add('active');
});