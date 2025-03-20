document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showParam = urlParams.get('show');
    
    // si el URL tiene como nombre 'register', mostrar el registro
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
    
    // Para mostrar el crear usuario con Sig up
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
    
    // Para mostrar el login con Log in
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
});