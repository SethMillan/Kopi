document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el contenedor de los botones
    const botonesAgregarAlCarrito = document.querySelectorAll('.add-to-cart');
    
    // Asegúrate de que hay botones antes de añadir el evento
    botonesAgregarAlCarrito.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Aquí puedes colocar la lógica que debe suceder cuando se hace clic en el botón
            console.log("¡Producto añadido al carrito!");
            
            // Ejemplo de cómo obtener el producto asociado (si tienes más información en el botón o cerca)
            const producto = e.target.closest('.menu-item-content'); // Ajusta según la estructura de tu HTML
            if (producto) {
                const productoNombre = producto.querySelector('.menu-item-title').textContent;
                console.log(`Producto: ${productoNombre}`);

                // Datos a enviar al servidor
                const datos = {
                    accion: 'agg',
                    producto_nombre: productoNombre,  // Enviamos el nombre del producto
                };

                // Hacer la solicitud POST al PHP para agregar al carrito
                fetch('http://localhost:3000/php/carrito.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datos)  // Enviar el nombre del producto
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data);  // Muestra la respuesta del servidor en la consola
                })
                .catch(err => {
                    console.error('Error al agregar al carrito:', err);
                });
            }
        });
    });
});
