var swiper = new Swiper('.swiper', {
    effect: 'coverflow',
    loop: true,
    grabCursor: true,
    centeredSlides: true, // Mantén esto en true si quieres que la slide activa quede al centro
    slidesPerView: 1.8,     // Ahora se mostrarán 3 slides visibles
    spaceBetween: 30,     // Espacio entre cada slide (opcional)
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 350,
      slideShadows: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next', // flecha "Siguiente"
        prevEl: '.swiper-button-prev'  // flecha "Anterior"
      }
      
  });

  
  document.addEventListener("DOMContentLoaded", function () {
    // Botón Login
    document.getElementById("loginButton").addEventListener("click", function () {
        window.location.href = "pages/login.html"; // Redirige a la página de login
    });

    // Botón Join
    document.getElementById("joinButton").addEventListener("click", function () {
        window.location.href = "pages/join.html"; // Redirige a la página de registro (asegúrate de que esta página exista)
    });
});