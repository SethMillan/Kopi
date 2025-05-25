document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showParam = urlParams.get('show');


    // Para mostrar el Popup en ventana practicamente 
    function showErrorPopup(message) {
        const popup = document.getElementById('errorPopup');
        const messageEl = document.getElementById('popupMessage');

        // AGREGAR ESTAS VERIFICACIONES:
        if (!popup) {
            console.error('Elemento errorPopup no encontrado');
            alert(message); // Fallback a alert simple
            return;
        }

        if (!messageEl) {
            console.error('Elemento popupMessage no encontrado');
            alert(message); // Fallback a alert simple
            return;
        }

        messageEl.textContent = message;
        popup.classList.add('active');

        // Cierra el popup al hacer clic en la X
        document.getElementById('closePopup').onclick = function () {
            popup.classList.remove('active');
        };

    }

    window.addEventListener("click", function (event) {
        const popup = document.getElementById('errorPopup');
        if (popup && event.target === popup) {
            popup.classList.remove('active');
        }
    });



    // Si el URL tiene como parámetro 'show' igual a 'register', mostrar el registro
    if (showParam === 'register') {
        // Ocultar login
        document.querySelectorAll(".derecha").forEach(element => {
            element.style.display = "none";
        });

        // Mostrar registro
        document.querySelectorAll(".nuew_user").forEach(element => {
            element.style.display = "flex";
        });
    }

    // Para mostrar el crear usuario con 'Sign up'
    const signupElement = document.querySelector(".text_Signup");
    if (signupElement) {
        signupElement.addEventListener("click", function () {
            // Mostrar login
            document.querySelectorAll(".derecha").forEach(element => {
                element.style.display = "none";
            });

            // Ocultar registro
            document.querySelectorAll(".nuew_user").forEach(element => {
                element.style.display = "flex";
            });
        });
    }

    // Para mostrar el login con 'Log in'
    const loginElement = document.querySelector(".text_logIn");
    if (loginElement) {
        loginElement.addEventListener("click", function () {
            // Mostrar login
            document.querySelectorAll(".derecha").forEach(element => {
                element.style.display = "flex";
            });

            // Ocultar registro
            document.querySelectorAll(".nuew_user").forEach(element => {
                element.style.display = "none";
            });
        });
    }


    //PHP
    //Login 
    const botonSignIn = document.getElementById('button_sing');
    if (botonSignIn) {
        botonSignIn.addEventListener('click', async function (event) {

            event.preventDefault();

            //Optenemos los datos
            try {
                let correo = document.getElementById('lg_email').value;
                let password = document.getElementById('lg_ps').value;

                // Validación básica
                if (!correo || !password) {
                    console.error('Error: Correo vacío');
                    showErrorPopup("Error: Correo vacío");
                    showToast('warning', 'Campos Incompletos', 'Por favor completa todos los campos');

                    return;
                }

                // Crear objeto con datos
                const datos = {
                    accion: 'login',
                    email: correo,
                    password: password
                };

                console.log('Intentando login con email:', correo);

                const response = await fetch(`${window.location.origin}/php/login.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    console.log('Login correcto para el usuario:', correo);
                    window.location.href = `${window.location.origin}/index.html`;
                    showLoginSuccess('¡Iniciando sesión...');

                } else {
                    showLoginError(data.message);
                    console.error('Error en login:', data.message);
                }

            } catch (error) {
                console.error('error en el login js', error.message);
            }
        });
    }

    // Crear usuario
    const botonCrear = document.getElementById('button_create');
    if (botonCrear) {
        botonCrear.addEventListener('click', function (event) {
            event.preventDefault();

            // Obtener valores del formulario
            let nombre = document.getElementById('p_username').value;
            let lastName = document.getElementById('p_lastName').value.trim();
            let email = document.getElementById('p_email').value;
            let password = document.getElementById('p_password').value;
            let passwordConfirm = document.getElementById('p_passwordConfirm').value;

            // Proceso para separar los apellidos
            let apaterno = '';
            let amaterno = '';
            let partes = lastName.split(' ');

            if (partes.length === 1) {
                apaterno = partes[0];
                amaterno = '';
            } else {
                apaterno = partes[0];
                amaterno = partes.slice(1).join(' '); // Si hay más de dos, junta lo demás como segundo apellido
            }

            //Validación de los campos
            if (password !== passwordConfirm) {
                showErrorPopup("Las contraseñas no coinciden");
                return;
            }

            // Campos llenos
            if (!nombre || !lastName || !email || !password) {
                showErrorPopup("Todos los campos son obligatorios");
                return;
            }
            //Fin Validacion

            const datos = {
                accion: 'registro',
                nombre: nombre,
                apaterno: apaterno,
                amaterno: amaterno,
                email: email,
                password: password
            };


            fetch(`${window.location.origin}/php/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            })
                .then(res => res.text()) // <- ojo, primero como texto
                .then(texto => {
                    console.log("Respuesta cruda:", texto); // así ves si viene HTML
                    const data = JSON.parse(texto); // y lo parseás tú mismo
                    if (data.success) {
                        window.location.href = "/pages/login.html"
                    } else {
                        alert("Fallo: " + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error general:", error);
                    showErrorPopup("Error en la conexión con el servidor");
                });


            //console.log('Datos:\n'+ nombre + '\nApellidos ' + lastName + '\n' + email + '\n' + password + '\n' + passwordConfirm);
        });
    }
});
