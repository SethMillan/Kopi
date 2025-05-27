// address_script.js - Manejo de direcciones y tipo de entrega

document.addEventListener('DOMContentLoaded', function () {
    let selectedAddressId = null;
    let savedAddresses = [];

    // Cargar direcciones al iniciar
    loadUserAddresses();

    // Event listeners para tipo de entrega
    const deliveryTypeInputs = document.querySelectorAll('input[name="delivery_type"]');
    deliveryTypeInputs.forEach(input => {
        input.addEventListener('change', function () {
            toggleAddressSection();
        });
    });

    // Event listener para el formulario de dirección
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveNewAddress();
        });
    }

    // Función para alternar la visibilidad de la sección de direcciones
    function toggleAddressSection() {
        const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;
        const addressSection = document.getElementById('addressSection');

        if (deliveryType === 'delivery') {
            addressSection.style.display = 'block';
        } else {
            addressSection.style.display = 'none';
            selectedAddressId = null;
        }
    }

    // Cargar direcciones del usuario
    async function loadUserAddresses() {
        try {
            const response = await fetch('../php/direcciones.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accion: 'obtener'
                })
            });

            const data = await response.json();

            if (data.success) {
                savedAddresses = data.direcciones;
                renderAddresses();

                // Seleccionar dirección principal por defecto
                const principalAddress = savedAddresses.find(addr => addr.es_principal);
                if (principalAddress) {
                    selectAddress(principalAddress.id);
                }
            } else {
                console.error('Error al cargar direcciones:', data.message);
            }
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
        }
    }

    // Renderizar lista de direcciones
    function renderAddresses() {
        const container = document.getElementById('savedAddresses');
        if (!container) return;

        container.innerHTML = '';

        savedAddresses.forEach(address => {
            const addressElement = createAddressElement(address);
            container.appendChild(addressElement);
        });
    }

    // Crear elemento de dirección
    function createAddressElement(address) {
        const addressItem = document.createElement('div');
        addressItem.className = 'address-item';
        addressItem.onclick = () => selectAddress(address.id);

        const fullAddress = `${address.calle} ${address.numero_exterior}${address.numero_interior ? ' ' + address.numero_interior : ''}, ${address.colonia}, ${address.ciudad}, ${address.estado} ${address.codigo_postal}`;

        addressItem.innerHTML = `
            <input type="radio" name="selected_address" value="${address.id}" ${selectedAddressId === address.id ? 'checked' : ''}>
            <div class="address-info">
                <div class="address-alias">
                    ${address.alias || 'Sin alias'}
                    ${address.es_principal ? '<span class="address-principal">Principal</span>' : ''}
                </div>
                <div class="address-details">
                    ${fullAddress}
                    ${address.referencias ? `<br><small>Ref: ${address.referencias}</small>` : ''}
                </div>
            </div>
        `;

        return addressItem;
    }

    // Seleccionar dirección
    function selectAddress(addressId) {
        selectedAddressId = addressId;

        // Actualizar UI
        document.querySelectorAll('.address-item').forEach(item => {
            item.classList.remove('selected');
        });

        const selectedItem = document.querySelector(`input[value="${addressId}"]`).closest('.address-item');
        selectedItem.classList.add('selected');

        // Marcar radio button
        document.querySelector(`input[value="${addressId}"]`).checked = true;

        console.log('Dirección seleccionada:', addressId);
    }

    // Abrir popup de nueva dirección
    window.openAddressPopup = function () {
        const overlay = document.getElementById('addressPopupOverlay');
        const popup = document.getElementById('addressPopup');

        overlay.classList.add('active');
        popup.classList.add('active');

        // Limpiar formulario
        document.getElementById('addressForm').reset();
    };

    // Cerrar popup de dirección
    window.closeAddressPopup = function () {
        const overlay = document.getElementById('addressPopupOverlay');
        const popup = document.getElementById('addressPopup');

        overlay.classList.remove('active');
        popup.classList.remove('active');
    };

    // Guardar nueva dirección
    async function saveNewAddress() {
        const formData = new FormData(document.getElementById('addressForm'));
        const addressData = {
            accion: 'crear',
            alias: formData.get('alias'),
            calle: formData.get('calle'),
            numero_exterior: formData.get('numero_exterior'),
            numero_interior: formData.get('numero_interior'),
            colonia: formData.get('colonia'),
            codigo_postal: formData.get('codigo_postal'),
            ciudad: formData.get('ciudad'),
            estado: formData.get('estado'),
            referencias: formData.get('referencias'),
            es_principal: formData.get('es_principal') ? true : false
        };

        try {
            const response = await fetch('../php/direcciones.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressData)
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar mensaje de éxito
                if (typeof showToast === 'function') {
                    showToast('success', 'Dirección guardada', 'La dirección se guardó correctamente');
                }

                // Cerrar popup
                closeAddressPopup();

                // Recargar direcciones
                await loadUserAddresses();

                // Seleccionar la nueva dirección
                if (data.direccion_id) {
                    selectAddress(data.direccion_id);
                }
            } else {
                if (typeof showToast === 'function') {
                    showToast('error', 'Error', data.message || 'No se pudo guardar la dirección');
                } else {
                    alert('Error: ' + (data.message || 'No se pudo guardar la dirección'));
                }
            }
        } catch (error) {
            console.error('Error al guardar dirección:', error);
            if (typeof showToast === 'function') {
                showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
            } else {
                alert('Error de conexión');
            }
        }
    }

    // Función para obtener datos de entrega (para usar en el checkout)
    window.getDeliveryData = function () {
        const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;

        const data = {
            tipo_entrega: deliveryType
        };

        if (deliveryType === 'delivery' && selectedAddressId) {
            data.direccion_id = selectedAddressId;
            data.direccion = savedAddresses.find(addr => addr.id == selectedAddressId);
        }

        return data;
    };

    // Inicializar la sección
    toggleAddressSection();
});