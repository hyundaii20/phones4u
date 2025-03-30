document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("card-name").value.trim();
    let number = document.getElementById("card-number").value.trim();
    let expiry = document.getElementById("expiry").value.trim();
    let cvv = document.getElementById("cvv").value.trim();

    if (name === "" || number.length !== 16 || expiry === "" || cvv.length !== 3) {
        alert("Please enter valid card details.");
        return;
    }

    alert("Payment successful! Your order has been placed.");
    localStorage.removeItem("cart"); // Clear cart after checkout
    window.location.href = "index.html";
});
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

/* Function to go to checkout page */
function goToCheckout() {
    window.location.href = "checkout.html";
}
