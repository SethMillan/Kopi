document.addEventListener("DOMContentLoaded", function () {
    // Check URL parameters to see if we need to show registration form
    const urlParams = new URLSearchParams(window.location.search);
    const showParam = urlParams.get('show');
    
    // If URL parameter is 'register', show registration form
    if (showParam === 'register') {
        // Hide login
        document.querySelectorAll(".derecha").forEach(element => {
            element.style.display = "none";
        });
        
        // Show registration
        document.querySelectorAll(".nuew_user").forEach(element => {
            element.style.display = "flex";
        });
    }
    
    // Event handler for signup link
    const signupElement = document.querySelector(".text_Signup");
    if (signupElement) {
        signupElement.addEventListener("click", function () {
            // Hide login
            document.querySelectorAll(".derecha").forEach(element => {
                element.style.display = "none";
            });
            
            // Show registration
            document.querySelectorAll(".nuew_user").forEach(element => {
                element.style.display = "flex";
            });
        });
    }
    
    // Event handler for login link
    const loginElement = document.querySelector(".text_logIn");
    if (loginElement) {
        loginElement.addEventListener("click", function () {
            // Show login
            document.querySelectorAll(".derecha").forEach(element => {
                element.style.display = "flex";
            });
            
            // Hide registration
            document.querySelectorAll(".nuew_user").forEach(element => {
                element.style.display = "none";
            });
        });
    }
});