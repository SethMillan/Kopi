document.addEventListener('DOMContentLoaded', () => {
    const productDetails = document.querySelector('.product-details');
    const orderSummary = document.querySelector('.order-summary');

    const repeatCount = 8;

    for (let i = 0; i < repeatCount; i++) {
        const clone = productDetails.cloneNode(true);
        orderSummary.appendChild(clone);
    }

    // 🔄 Funcionalidad de botones + y -
    orderSummary.addEventListener('click', (e) => {
        if (e.target.classList.contains('mas') || e.target.classList.contains('menos')) {
            const container = e.target.parentElement;
            const label = container.querySelector('label');
            let count = parseInt(label.textContent);

            if (e.target.classList.contains('mas')) {
                count++;
            } else if (e.target.classList.contains('menos') && count > 1) {
                count--;
            }

            label.textContent = count;
        }
    });

    // Activar animación de las líneas y el texto "MENU"
    const lineas = document.querySelectorAll('.kopi nav.encabezado .btnMenu .linea');
    const menuText = document.querySelector('.menu-text');

    // Añadir las clases de animación
    lineas.forEach(linea => {
        linea.classList.add('linea-animation');
    });

    menuText.classList.add('menu-text-animation');
});
