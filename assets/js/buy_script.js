document.addEventListener('DOMContentLoaded', () => {
    const productDetails = document.querySelector('.product-details');
    const orderSummary = document.querySelector('.order-summary');

    const repeatCount = 8; // Número de veces que quieres repetir el bloque

    for (let i = 0; i < repeatCount; i++) {
        const clone = productDetails.cloneNode(true);
        orderSummary.appendChild(clone);
    }
});
