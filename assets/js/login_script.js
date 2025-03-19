
document.addEventListener("DOMContentLoaded", function () {
    const signupElement = document.querySelector(".text_Signup"); //Click en .text_Signup

    signupElement.addEventListener("click", function () {

        // Desaparecer el login 
        document.querySelectorAll(".derecha").forEach(element => {
            element.style.display = "none"; // Oculta los elementos
        });

        //Mostrar el nuevo usuario
        document.querySelectorAll(".nuew_user").forEach(element => {
            element.style.display = "flex";
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const signupElement = document.querySelector(".text_logIn"); //Click en .text_Signup

    signupElement.addEventListener("click", function () {

        // Desaparecer el login 
        document.querySelectorAll(".derecha").forEach(element => {
            element.style.display = "flex"; // Oculta los elementos
        });

        //Mostrar el nuevo usuario
        document.querySelectorAll(".nuew_user").forEach(element => {
            element.style.display = "none";
        });
    });
});
