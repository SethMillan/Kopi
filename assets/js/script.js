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

  overlay.classList.toggle('active');
  dropdown.classList.toggle('active');
}

function closeUserMenu() {
  const overlay = document.getElementById('userMenuOverlay');
  const dropdown = document.getElementById('userMenuDropdown');

  overlay.classList.remove('active');
  dropdown.classList.remove('active');
}


function cerrarSesion() {
  closeUserMenu(); // Cerrar el menú primero

  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    fetch('php/logout.php', {
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
          // Mostrar mensaje de despedida (opcional)
          console.log(data.message);

          // Recargar la página para actualizar el estado de la sesión
          window.location.reload();
        } else {
          alert('Error al cerrar sesión: ' + data.message);
          console.error('Error en logout:', data.message);
        }
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
        // Fallback: recargar la página de todas formas
        alert('Hubo un problema al cerrar sesión, pero se recargará la página.');
        window.location.reload();
      });
  }
}
function verificarSesion() {
  fetch('php/carrito.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accion: 'secion' })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const btnlogin = document.querySelector('.btnLogin');
      const btnregister = document.querySelector('.btnRegister');
      const btnUser = document.getElementById('usuario');

      if (data.logueado) {
        // Usuario logueado
        if (btnlogin) btnlogin.style.display = 'none';
        if (btnregister) btnregister.style.display = 'none';
        if (btnUser) {
          btnUser.style.display = 'flex';
          const nombreElemento = btnUser.querySelector('#nombreUsuario');
          const nombreMenu = document.getElementById('userMenuName');

          if (nombreElemento) nombreElemento.textContent = data.nombre;
          if (nombreMenu) nombreMenu.textContent = data.nombre;
        }
      } else {
        // Usuario no logueado
        if (btnlogin) btnlogin.style.display = 'flex';
        if (btnregister) btnregister.style.display = 'flex';
        if (btnUser) btnUser.style.display = 'none';
      }
    })
    .catch(err => {
      console.error("Error verificando sesión:", err);
      // En caso de error, mostrar botones de login por defecto
      const btnlogin = document.querySelector('.btnLogin');
      const btnregister = document.querySelector('.btnRegister');
      const btnUser = document.getElementById('usuario');

      if (btnlogin) btnlogin.style.display = 'flex';
      if (btnregister) btnregister.style.display = 'flex';
      if (btnUser) btnUser.style.display = 'none';
    });
}


// Sistema de Toast Notifications
function showToast(type = 'info', title = '', message = '', duration = 3000) {
  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon;
  switch (type) {
    case 'error':
      icon = 'error';
      break;
    case 'success':
      icon = 'check_circle';
      break;
    case 'warning':
      icon = 'warning';
      break;
    default:
      icon = 'info';
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

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => closeToast(toast), duration);

  return toast;
}

function closeToast(toast) {
  if (toast && toast.classList.contains('toast')) {
    toast.classList.add('hide');
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }
}

// Funciones específicas para tu login
function showLoginError(message) {
  showToast('error', 'Error de Login', message, 3000);
}

function showLoginSuccess(message = '¡Bienvenido!') {
  showToast('success', 'Login Exitoso', message, 2000);
}