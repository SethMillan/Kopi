document.addEventListener('DOMContentLoaded', function() {
    const codigoCupon = document.getElementById('codigoCupon');
    const botonCanjear = document.getElementById('botonCanjear');
    const mensaje = document.getElementById('mensaje');

    // Limitar a 10 caracteres
    codigoCupon.addEventListener('input', function() {
        if (this.value.length > 10) {
            this.value = this.value.substring(0, 10);
        }
    });

    // Manejar el clic del botón
    botonCanjear.addEventListener('click', function() {
        if (codigoCupon.value.trim() === '') {
            mensaje.textContent = 'Por favor ingresa un código';
        } else {
            // Siempre muestra "Cupón expirado"
            mensaje.textContent = 'Cupón expirado';
        }
    });

    // También Enter
    codigoCupon.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            botonCanjear.click();
        }
    });
});