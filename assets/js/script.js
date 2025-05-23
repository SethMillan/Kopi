document.addEventListener("DOMContentLoaded", function () {
  // Inicialización del primer swiper (coffee cards)

    // Verificación de sesión y control de botones

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

  var mainSwiper = new Swiper('.swiper', {
    effect: 'coverflow',
    loop: true,
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 1.8,
    spaceBetween: 30,
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
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    // Responsive breakpoints
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10
      },
      576: {
        slidesPerView: 1.2,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 1.5,
        spaceBetween: 30
      },
      992: {
        slidesPerView: 1.8,
        spaceBetween: 30
      }
    }
  });

  // Inicialización del swiper de testimonios (carrusel normal)
  var testimonialSwiper = new Swiper('.testimonial-swiper:not(.reverse)', {
    slidesPerView: 3,
    spaceBetween: 20,
    centeredSlides: true,
    loop: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      
    },
    speed: 6000, // Velocidad reducida para que vaya más lento
    pagination: {
      el: '.testimonial-swiper:not(.reverse) .swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 1.5,
        spaceBetween: 40
      },
      992: {
        slidesPerView: 2,
        spaceBetween: 50
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 50
      }
    }
  });

  // Inicialización del swiper de testimonios en sentido inverso
  var testimonialReverseSwiper = new Swiper('.testimonial-swiper-reverse', { // Corregido el selector
    slidesPerView: 3,
    spaceBetween: 20,
    centeredSlides: true,
    loop: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      reverseDirection: true, // Movimiento en sentido inverso
    },
    speed: 6000, // Velocidad reducida para que vaya más lento
    pagination: {
      el: '.testimonial-swiper.reverse .swiper-pagination', // Corregido el selector
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 1.5,
        spaceBetween: 40
      },
      992: {
        slidesPerView: 2,
        spaceBetween: 50
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 50
      }
    }
  });

  // Configuración de botones de compra
  var buyButtons = document.querySelectorAll(".btn_buy");
  buyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      window.location.href = "pages/buynv.html";
    });
  });
});