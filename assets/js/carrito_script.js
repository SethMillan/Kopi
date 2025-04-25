document.addEventListener('DOMContentLoaded', () => {
    const orderSummary = document.querySelector('.order-summary');
    const template = document.querySelector('.product-details');
    const carritoBasio = document.getElementById('carrito_basio');
    const carritoSubtotal = document.getElementById('subtotal');
    const carritoTotal = document.getElementById('total');
    const btnUser = document.getElementById('usuario');
    btnUser.style.display = 'none'
    let precioTotal = 0;
   

    //Para iniciar sección
    function verificar_sesion(){
        fetch('http://localhost:3000/php/carrito.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: 'secion' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.logueado) {
             const btnlogin = document.getElementById('btnlogin');
             const btnregister = document.getElementById('btnregister');
             const btnUser = document.getElementById('usuario');

             btnlogin.style.display = 'none';
             btnregister.style.display = 'none';
             btnUser.style.display = 'flex'
             btnUser.textContent = data.nombre;
           } else {
              console.log("Usuario NO logueado");
          }
        });
    }
    verificar_sesion()
    
// Función para cargar el carrito
function cargarCarrito() {
    fetch('http://localhost:3000/php/carrito.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion: 'ver' })
    })
    .then(res => res.json())
    .then(data => {
        // Vaciar el contenedor de productos antes de recargar
        orderSummary.innerHTML = '';

        // Reinsertar las secciones estáticas (título y línea)
        const h2 = document.createElement('h2');
        h2.classList.add('h2Or');
        h2.textContent = 'Carrito';
        orderSummary.appendChild(h2);

        const line = document.createElement('div');
        line.classList.add('s3');
        orderSummary.appendChild(line);

        // Ocultar el template original desde el principio
        template.style.display = 'none';
        precioTotal = 0;

        if (data.success && data.carrito.length > 0) {
            data.carrito.forEach(producto => {
                const clone = template.cloneNode(true);
                clone.style.display = 'flex'; // Mostramos el clon

                // Actualiza los datos del producto
                clone.querySelector('p:nth-of-type(2)').textContent = producto.nombre;
                let precioProducto = (producto.precio * producto.cantidad).toFixed(2);
                clone.querySelector('.price').textContent = `$${producto.precio}`;

                precioTotal += parseFloat(precioProducto);

                const imagenTag = clone.querySelector('img.product-icon');
                if (imagenTag && producto.imagen) {
                    imagenTag.src = producto.imagen;
                }

                // Establecer la cantidad en el input
                const label = clone.querySelector('label');
                label.textContent = producto.cantidad;

                // Añade el clon al DOM
                orderSummary.appendChild(clone);
            });

            // Ocultar mensaje de "carrito vacío"
            if (carritoBasio) carritoBasio.style.display = 'none';

        } else {
            // Mostrar mensaje de "carrito vacío"
            if (carritoBasio) carritoBasio.style.display = 'block';
        }

        const ha = document.createElement('h2');
        ha.classList.add('h2Or');
        ha.textContent = 'Guardado para mas';
        orderSummary.appendChild(ha);

        const line2 = document.createElement('div');
        line2.classList.add('s3');
        orderSummary.appendChild(line2);

        carritoSubtotal.textContent = "Subtotal " + "$" + precioTotal;
        carritoTotal.textContent = "Total " + "$" + (precioTotal + 10);
    })
    .catch(err => {
        console.error('Error al cargar el carrito', err);
        if (carritoBasio) carritoBasio.style.display = 'block';
    });
}


    // Cargar el carrito cuando se carga la página
    cargarCarrito();


    orderSummary.addEventListener('click', (e) => {
        if (e.target.classList.contains('mas') || e.target.classList.contains('menos')) {
            const container = e.target.parentElement;
            const label = container.querySelector('label');
            let count = parseInt(label.textContent);
            const producto = container.closest('.product-details');
            const productoNombre = producto.querySelector('.nombre').textContent;
    
            if (e.target.classList.contains('mas')) {
                count++;
            } else if (e.target.classList.contains('menos') && count > 1) {
                count--;
            }
    
            label.textContent = count;
    
            // Enviar la actualización de la cantidad al servidor
            fetch('http://localhost:3000/php/carrito.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accion: 'actualizar',  // Acción para actualizar la cantidad
                    nombre: productoNombre,
                    cantidad: count
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log(`Cantidad de ${productoNombre} actualizada a ${count}`);
                    cargarCarrito();  // Recargar el carrito después de la actualización
                } else {
                    alert("No se pudo actualizar la cantidad del producto.");
                }
            })
            .catch(err => {
                console.error('Error al actualizar producto', err);
            });
        }else if (e.target.classList.contains('eliminar')) {
            const producto = e.target.closest('.product-details');
            const productoNombre = producto.querySelector('.nombre').textContent;
        
            console.log(`Producto a eliminar: ${productoNombre}`);
        
            fetch('http://localhost:3000/php/carrito.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accion: 'eliminar',
                    nombre: productoNombre
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    producto.remove();  // Eliminar producto del DOM
                    cargarCarrito();  // Recargar el carrito después de la eliminación
                } else {
                    alert("No se pudo eliminar el producto.");
                }
            })
            .catch(err => {
                console.error('Error al eliminar producto', err);
            });
        } else if (e.target.classList.contains('guardar')) {
            console.log("guardar");
        } else if (e.target.classList.contains('similares')) {
            window.location.href = 'http://localhost:3000/pages/menu.html'; 
        } else if (e.target.classList.contains('compartir')) {
            console.log("compartir");
        }
    });
});
