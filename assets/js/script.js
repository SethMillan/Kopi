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

  
  document.addEventListener("DOMContentLoaded", function(){
    var buyButtons = document.querySelectorAll(".btn_buy");
    
    buyButtons.forEach(function(button) {
      button.addEventListener("click", function () {
        window.location.href = "pages/buy.html";
      });
    });
  });
  