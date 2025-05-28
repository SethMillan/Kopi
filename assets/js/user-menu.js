// user-menu.js
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

