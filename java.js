// Importar funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCHOirhFYXoDaPHS5W3BMa_oNR--uYwVr4",
    authDomain: "futbolstore-1ab3a.firebaseapp.com",
    projectId: "futbolstore-1ab3a",
    storageBucket: "futbolstore-1ab3a.appspot.com",
    messagingSenderId: "502063090279",
    appId: "1:502063090279:web:79c39f68cc37133493e2c2",
    measurementId: "G-PN0FV9DC7Y"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Formatear el teléfono
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }
    input.value = value;
}

// Formatear el DUI
function formatDUI(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) {
        value = value.slice(0, 8) + '-' + value.slice(8, 9);
    }
    input.value = value;
}

// Manejar el evento de entrada para el teléfono y DUI
document.getElementById('phone').addEventListener('input', function() {
    formatPhone(this);
});
document.getElementById('dui').addEventListener('input', function() {
    formatDUI(this);
});

// Manejo del registro de usuario
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const dui = document.getElementById('dui').value;

    // Validaciones
    let isValid = true;
    if (name.length < 4) {
        document.getElementById('nameError').textContent = 'El nombre debe tener al menos 4 caracteres.';
        isValid = false;
    } else {
        document.getElementById('nameError').textContent = '';
    }

    if (lastname.length < 4) {
        document.getElementById('lastnameError').textContent = 'El apellido debe tener al menos 4 caracteres.';
        isValid = false;
    } else {
        document.getElementById('lastnameError').textContent = '';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Email no válido.';
        isValid = false;
    } else {
        document.getElementById('emailError').textContent = '';
    }

    if (!/^(?=.*[A-Z]).{8,}$/.test(password)) {
        document.getElementById('passwordError').textContent = 'La contraseña debe tener al menos 8 caracteres y al menos una letra mayúscula.';
        isValid = false;
    } else {
        document.getElementById('passwordError').textContent = '';
    }

    if (!/^\d{4}-\d{4}$/.test(phone)) {
        document.getElementById('phoneError').textContent = 'Teléfono debe estar en formato 7001-2610.';
        isValid = false;
    } else {
        document.getElementById('phoneError').textContent = '';
    }

    if (!/^\d{8}-\d$/.test(dui)) {
        document.getElementById('duiError').textContent = 'DUI debe estar en formato 24689887-1.';
        isValid = false;
    } else {
        document.getElementById('duiError').textContent = '';
    }

    if (isValid) {
        try {
            // Crear cuenta de usuario con Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Guardar datos adicionales en Firestore
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                name,
                lastname,
                email,
                phone,
                dui
            });

            // Mensaje de éxito y limpieza de campos
            alert('Cuenta creada exitosamente.');
            document.getElementById('registerForm').reset();
            //window.location.href = 'principal.html'; // Redirige al usuario a la página principal
        } catch (error) {
            console.error("Error al crear la cuenta: ", error);
            alert('Error al crear la cuenta. Inténtalo de nuevo.');
        }
    }
});

// Manejo del inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailLogin = document.getElementById('email-login').value;
    const passwordLogin = document.getElementById('password-login').value;

    try {
        // Iniciar sesión con Firebase Auth
        await signInWithEmailAndPassword(auth, emailLogin, passwordLogin);
        window.location.href = 'principal.html'; // Redirige al usuario a la página principal
    } catch (error) {
        console.error("Error al iniciar sesión: ", error);
        document.getElementById('loginEmailError').textContent = 'Email o contraseña incorrectos.';
        document.getElementById('loginPasswordError').textContent = 'Email o contraseña incorrectos.';
    }
});

// Función para mostrar productos en el carrito
function displayCartItems(products) {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    cartItemsContainer.innerHTML = '';
    products.forEach(product => {
        const itemTotal = product.price * product.quantity;
        total += itemTotal;

        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}">
                <div>
                    <h4>${product.name}</h4>
                    <p>Precio: $${product.price.toFixed(2)}</p>
                    <p>Cantidad: ${product.quantity}</p>
                    <p>Total: $${itemTotal.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart('${product.id}')">Eliminar</button>
            </div>
        `;
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Función para eliminar producto del carrito
function removeFromCart(id) {
    const updatedProducts = defaultProducts.filter(product => product.id !== id);
    displayCartItems(updatedProducts);
}

// Inicializar el carrito con productos predeterminados
document.addEventListener('DOMContentLoaded', () => {
    const defaultProducts = [
        { id: 'barcelona', name: 'Camiseta del FC Barcelona 2023', price: 24.99, quantity: 1, image: 'barcelona.jpg' },
        { id: 'real-madrid', name: 'Camiseta del FC Real Madrid 2023', price: 17.99, quantity: 2, image: 'real-madrid.jpg' },
        { id: 'alianza', name: 'Camiseta del FC Alianza 2023', price: 70.99, quantity: 1, image: 'alianza.jpg' }
    ];

    displayCartItems(defaultProducts);

    // Mostrar productos en el carrito de compras
    const cartItems = [
        { id: 'barcelona', name: 'Camiseta del FC Barcelona 2023', price: 24.99, quantity: 1 },
        { id: 'real-madrid', name: 'Camiseta del FC Real Madrid 2023', price: 17.99, quantity: 2 },
        { id: 'alianza', name: 'Camiseta del FC Alianza 2023', price: 70.99, quantity: 1 }
    ];

    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        let total = 0;

        cartItemsContainer.innerHTML = '';
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <img src="../${item.id}.jpg" alt="${item.name}">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Precio: $${item.price.toFixed(2)}</p>
                        <p>Cantidad: ${item.quantity}</p>
                        <p>Total: $${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
        });

        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    }

    if (document.getElementById('cart-items')) {
        updateCartDisplay();

        document.getElementById('checkout-button').addEventListener('click', () => {
            alert('Compra finalizada exitosamente.');
            window.location.href = 'principal.html'; // Redirige a la página principal
        });
    }
});

// Función de búsqueda por filtro
document.getElementById('search-input').addEventListener('input', function() {
    let filter = this.value.toLowerCase();
    let items = document.querySelectorAll('#product-list .product-item');

    items.forEach(function(item) {
        let name = item.getAttribute('data-name').toLowerCase();
        if (name.includes(filter)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});
