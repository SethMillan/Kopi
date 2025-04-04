document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showParam = urlParams.get('show');
    
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
    botonSignIn.addEventListener('click', async function(event) {
        
        event.preventDefault();  

        //Optenemos los datos
        try {
            let correo = document.getElementById('lg_email').value;
            let password = document.getElementById('lg_ps').value;
            
            // Validación básica
            if (!correo || !password) {
                console.error('Error: Correo o contraseña vacíos');
                alert("Correo o contraseña vacios")
                 return;
            }

            // Crear objeto con datos
            const datos = {
                email: correo,
                password: password
            };
            
            console.log('Intentando login con email:', correo);
            
             const response = await fetch('http://localhost/Kopi/php/login.php', {
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
                 window.location.href = 'http://localhost/Kopi/index.html';  
            } else {
                 console.error('Error en login:', data.message);
             }

        } catch (error) {
            console.error('Error en el proceso de login:', error.message);
            logError('login_error', error);
        }
    });
}   

    // Crear usuario
    const botonCrear = document.getElementById('button_create');
    if (botonCrear) {
        botonCrear.addEventListener('click', function(event) {
            event.preventDefault();  
    
            // Obtener valores del formulario
            let nombre = document.getElementById('p_username').value;
            let lastName = document.getElementById('p_lastName').value;
            let email = document.getElementById('p_email').value;
            let password = document.getElementById('p_password').value;
            let passwordConfirm = document.getElementById('p_passwordConfirm').value;
    
        
            // Contraseñas iguales
            if (password !== passwordConfirm) {
                alert('Las contraseñas no coinciden');
                return; 
            }
    
            // Campos llenos
            if (!nombre || !lastName || !email || !password) {
                alert('Todos los campos son obligatorios');
                return;  
            }
    
            const datos = {
                accion: 'crearUsuario',
                nombre: nombre,
                lastName: lastName,
                email: email,
                password: password
            };
    
             fetch('http://localhost/Kopi/php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            })
            .then(response => response.json())
            .then(data => {
                // Manejar la respuesta del servidor
                if (data.success) {
                    alert(data.message); // Mensaje de éxito
                } else {
                    alert(data.message); // Mensaje de error
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
                alert('Hubo un error al procesar la solicitud.');
            });
    
            // Depuración
            console.log('Datos:', nombre, lastName, email, password, passwordConfirm);
        });
    }
});
