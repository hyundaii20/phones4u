document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
});

/* Function to add item to cart */
function addToCart(itemName, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: itemName, price: price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${itemName} added to cart!`);
    updateCartCount();
}

/* Function to update cart count in navbar */
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cart-count").innerText = cartCount;
}
document.addEventListener("DOMContentLoaded", function () {
    updateCartDisplay();
});

/* Function to update the cart page */
function updateCartDisplay() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItemsContainer = document.getElementById("cart-items");
    let totalContainer = document.getElementById("cart-total");

    if (!cartItemsContainer || !totalContainer) return;

    cartItemsContainer.innerHTML = ""; // Clear existing content
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalContainer.innerText = "Total: €0.00";
        return;
    }

    cart.forEach((item, index) => {
        let itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");

        itemElement.innerHTML = `
            <p><strong>${item.name}</strong> - €${item.price.toFixed(2)} x ${item.quantity}</p>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;

        cartItemsContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    totalContainer.innerText = `Total: €${total.toFixed(2)}`;
}

/* Function to remove item from cart */
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}
window.addEventListener("load", function() {
    // Hide the loading screen after the page has loaded
    document.getElementById("loading-screen").style.display = "none";
});

// Function to show the loading screen and wait for 3 seconds before redirecting
function showLoadingScreen(event) {
    // Prevent the default action (which is the immediate navigation)
    event.preventDefault();

    // Show the loading screen (GIF)
    document.getElementById("loading-screen").style.display = "flex";

    // Set a timeout for 3 seconds before redirecting
    setTimeout(function() {
        // Hide the loading screen after 3 seconds
        document.getElementById("loading-screen").style.display = "none";

        // Redirect to the clicked link
        window.location.href = event.target.href;
    }, 3000);  // Delay of 3 seconds
}

// Attach the function to all navbar links
document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', showLoadingScreen);
});
// Function to extract query parameters from URL
function getQueryParams() {
    let params = {};
    let queryString = window.location.search.substring(1);
    let urlParams = new URLSearchParams(queryString);

    params.orderNumber = urlParams.get('orderNumber');
    params.totalAmount = urlParams.get('totalAmount');
    params.items = JSON.parse(decodeURIComponent(urlParams.get('items')));

    return params;
}

// Function to display the receipt
function displayReceipt() {
    let params = getQueryParams();
    
    // Populate the receipt with order data
    document.getElementById('order-number').textContent = params.orderNumber;
    document.getElementById('total-amount').textContent = '€' + params.totalAmount;

    let itemsList = document.getElementById('items-list');
    params.items.forEach(item => {
        let listItem = document.createElement('li');
        listItem.textContent = item.name + ' - €' + item.price;
        itemsList.appendChild(listItem);
    });
}

// Call the function when the page loads
window.onload = displayReceipt;
