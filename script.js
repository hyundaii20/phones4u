// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Initialize cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
    }

    // Initialize filters if we're on browse page
    if (window.location.pathname.includes('browse.html')) {
        initializeFilters();
    }

    // Initialize home page if we're on it
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        initializeHomePage();
    }

    // Initialize checkout page if we're on it
    if (window.location.pathname.includes('checkout.html')) {
        initializeCheckoutPage();
        initializePaymentForm();
    }

    // Initialize thank you page if we're on it
    if (window.location.pathname.includes('thankyou.html')) {
        initializeThankYouPage();
    }

    // Newsletter subscription
    const subscribeBtn = document.querySelector('.subscribe-btn');
    const newsletterInput = document.querySelector('.newsletter-form input');

    if (subscribeBtn && newsletterInput) {
        subscribeBtn.addEventListener('click', function() {
            const email = newsletterInput.value.trim();
            
            if (!email) {
                showNotification('Please enter your email address', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Simulate subscription success
            showNotification('Thank you for subscribing to our newsletter!');
            newsletterInput.value = '';
        });
    }
});

function initializeCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartContainer = document.querySelector('.cart-container');
    const recommendedProducts = document.querySelector('.recommended-products');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        if (emptyCartMessage && cartContainer && recommendedProducts) {
            emptyCartMessage.style.display = 'block';
            cartContainer.style.display = 'none';
            recommendedProducts.style.display = 'none';
        }
        return;
    }

    if (emptyCartMessage && cartContainer) {
        emptyCartMessage.style.display = 'none';
        cartContainer.style.display = 'grid';
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Unit Price: ${formatPrice(item.price)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-price">
                ${formatPrice(item.price * item.quantity)}
            </div>
        </div>
    `).join('');

    updateCartSummary();
    initializeRecommendedProducts();
}

function addToCart(productName, price) {
    // Create a map for product images
    const productImages = {
        'iPhone 15': 'iphone15.avif',
        'Samsung Galaxy S24': 's24.avif',
        'Google Pixel 8': 'pixel8.avif',
        'iPhone 14': 'iphone14.avif',
        'iPhone 12': 'iphone12.avif'
    };

    const product = {
        name: productName,
        price: price,
        quantity: 1,
        image: productImages[productName] || `${productName.toLowerCase().replace(/\s+/g, '')}.avif`
    };

    const existingProductIndex = cart.findIndex(item => item.name === productName);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`Added ${productName} to cart`);

    // If we're on the cart page, update the display
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
    }
}

function updateQuantity(index, change) {
    const item = cart[index];
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        cart.splice(index, 1);
        showNotification(`Removed ${item.name} from cart`);
    } else {
        item.quantity = newQuantity;
        showNotification(`Updated ${item.name} quantity to ${newQuantity}`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    initializeCartPage();
}

function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const vat = subtotal * 0.23;
    const total = subtotal + vat;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('vat').textContent = formatPrice(vat);
    document.getElementById('total').textContent = formatPrice(total);
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const vat = subtotal * 0.23;
    const total = subtotal + vat;

    // Create order data
    const orderData = {
        items: cart,
        subtotal: subtotal,
        vat: vat,
        total: total,
        orderNumber: generateOrderNumber()
    };

    // Store order data for the checkout page
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // Redirect to checkout
    window.location.href = 'checkout.html';
}

// Add function to generate order number
function generateOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Add function to initialize checkout page
function initializeCheckoutPage() {
    const orderData = JSON.parse(localStorage.getItem('currentOrder'));
    if (!orderData) {
        window.location.href = 'cart.html';
        return;
    }

    // Update checkout summary if elements exist
    const summaryContainer = document.getElementById('checkout-summary');
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="order-summary">
                <h3>Order Summary</h3>
                ${orderData.items.map(item => `
                    <div class="summary-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                <div class="summary-item">
                    <span>Subtotal</span>
                    <span>${formatPrice(orderData.subtotal)}</span>
                </div>
                <div class="summary-item">
                    <span>VAT (23%)</span>
                    <span>${formatPrice(orderData.vat)}</span>
                </div>
                <div class="summary-item total">
                    <span>Total</span>
                    <span>${formatPrice(orderData.total)}</span>
                </div>
            </div>
        `;
    }
}

// Handle promo code
document.addEventListener('DOMContentLoaded', function() {
    const applyPromoButton = document.getElementById('apply-promo');
    if (applyPromoButton) {
        applyPromoButton.addEventListener('click', function() {
            const promoInput = document.getElementById('promo-input');
            if (!promoInput || !promoInput.value) {
                showNotification('Please enter a promo code', 'error');
                return;
            }

            // Simulate promo code validation
            setTimeout(() => {
                showNotification('Invalid promo code', 'error');
                promoInput.value = '';
            }, 1000);
        });
    }
});

// Initialize recommended products
function initializeRecommendedProducts() {
    const recommendedContainer = document.querySelector('.recommended-products .products-grid');
    if (!recommendedContainer) return;

    // Get all products except those in cart
    const cartProductNames = cart.map(item => item.name);
    const allProducts = [
        { name: 'iPhone 15', price: 999, image: 'iphone15.avif', badge: 'New', specs: ['A16 Bionic', '48MP Camera'] },
        { name: 'Samsung Galaxy S24', price: 899, image: 's24.avif', badge: 'Best Seller', specs: ['Snapdragon 8 Gen 3', '50MP Camera'] },
        { name: 'Google Pixel 8', price: 799, image: 'pixel8.avif', badge: 'Popular', specs: ['Tensor G3', '50MP Camera'] },
        { name: 'iPhone 14', price: 799, image: 'iphone14.avif', badge: 'Value', specs: ['A15 Bionic', '12MP Camera'] },
        { name: 'iPhone 12', price: 599, image: 'iphone12.avif', badge: 'Budget', specs: ['A14 Bionic', '12MP Camera'] }
    ];

    const recommendedProducts = allProducts
        .filter(product => !cartProductNames.includes(product.name))
        .slice(0, 3);

    recommendedContainer.innerHTML = recommendedProducts.map(product => `
        <div class="product">
            <div class="product-badge">${product.badge}</div>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="price">${formatPrice(product.price)}</p>
            <div class="product-details">
                <span><i class="fas fa-microchip"></i> ${product.specs[0]}</span>
                <span><i class="fas fa-camera"></i> ${product.specs[1]}</span>
            </div>
            <button onclick="addToCart('${product.name}', ${product.price})" class="add-to-cart">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `).join('');
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

// Global products data
const allProducts = [
    { name: 'iPhone 15', price: 999, image: 'iphone15.avif', badge: 'New', specs: ['A16 Bionic', '48MP Camera'], features: ['5G', 'All-day battery'] },
    { name: 'Samsung Galaxy S24', price: 899, image: 's24.avif', badge: 'Best Seller', specs: ['Snapdragon 8 Gen 3', '50MP Camera'], features: ['5G', 'Wireless charging'] },
    { name: 'Google Pixel 8', price: 799, image: 'pixel8.avif', badge: 'Popular', specs: ['Tensor G3', '50MP Camera'], features: ['AI features', 'Night Sight'] },
    { name: 'iPhone 14', price: 799, image: 'iphone14.avif', badge: 'Value', specs: ['A15 Bionic', '12MP Camera'], features: ['5G', 'Ceramic Shield'] },
    { name: 'iPhone 12', price: 599, image: 'iphone12.avif', badge: 'Budget', specs: ['A14 Bionic', '12MP Camera'], features: ['5G', 'Water resistant'] }
];

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    // Initialize home page if we're on it
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        initializeHomePage();
    }
});

function initializeHomePage() {
    const featuredContainer = document.querySelector('#featured .products-grid');
    if (!featuredContainer) return;

    // Display featured products
    featuredContainer.innerHTML = allProducts.map(product => `
        <div class="product">
            <div class="product-badge">${product.badge}</div>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="price">${formatPrice(product.price)}</p>
            <div class="product-details">
                <span><i class="fas fa-microchip"></i> ${product.specs[0]}</span>
                <span><i class="fas fa-camera"></i> ${product.specs[1]}</span>
            </div>
            <div class="product-features">
                <span><i class="fas fa-wifi"></i> ${product.features[0]}</span>
                <span><i class="fas fa-battery-full"></i> ${product.features[1]}</span>
            </div>
            <button onclick="addToCart('${product.name}', ${product.price})" class="add-to-cart">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `).join('');
}

function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
        showNotification('Please enter a search term', 'error');
        return;
    }

    searchTerm = searchTerm.toLowerCase().trim();
    
    // If we're not on browse.html, redirect there with search term
    if (!window.location.pathname.includes('browse.html')) {
        window.location.href = `browse.html?search=${encodeURIComponent(searchTerm)}`;
        return;
    }

    // Filter products based on search term
    const products = document.querySelectorAll('.product');
    let foundAny = false;

    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        const productDetails = product.querySelector('.product-details').textContent.toLowerCase();
        const productFeatures = product.querySelector('.product-features').textContent.toLowerCase();
        const allText = `${productName} ${productDetails} ${productFeatures}`;

        if (allText.includes(searchTerm)) {
            product.style.display = '';
            product.style.animation = 'fadeIn 0.5s ease-out forwards';
            foundAny = true;
        } else {
            product.style.display = 'none';
        }
    });

    // Show/hide no results message
    const noResultsMessage = document.querySelector('.no-results-message') || createNoResultsMessage();
    if (!foundAny) {
        noResultsMessage.style.display = 'block';
        showNotification('No products found matching your search');
    } else {
        noResultsMessage.style.display = 'none';
    }

    // Clear any active filters
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

function createNoResultsMessage() {
    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #64748b;">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <h3>No products found</h3>
            <p>Try different search terms or browse our categories.</p>
        </div>
    `;
    document.querySelector('.products-container').appendChild(message);
    return message;
}

// Check for search parameter on page load
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm && window.location.pathname.includes('browse.html')) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = searchTerm;
            performSearch(searchTerm);
        }
    }
});

// Notification system
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }

    // Add notification styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.transform = 'translateY(100px)';
    notification.style.transition = 'all 0.3s ease';

    // Set message and show notification
    notification.textContent = message;
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Loading screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
});

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all products and features
document.querySelectorAll('.product, .feature').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.5s ease-out';
    observer.observe(element);
});

// Price formatter
function formatPrice(price) {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Update all price displays
document.querySelectorAll('.price').forEach(priceElement => {
    const price = parseFloat(priceElement.textContent.replace('€', ''));
    priceElement.textContent = formatPrice(price);
});

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Trade-in functionality
const deviceModels = {
    apple: [
        { name: 'iPhone 15 Pro Max', value: 1000 },
        { name: 'iPhone 15 Pro', value: 900 },
        { name: 'iPhone 15', value: 800 },
        { name: 'iPhone 14 Pro Max', value: 800 },
        { name: 'iPhone 14 Pro', value: 700 },
        { name: 'iPhone 14', value: 600 },
        { name: 'iPhone 13', value: 500 },
        { name: 'iPhone 12', value: 400 }
    ],
    samsung: [
        { name: 'Galaxy S24 Ultra', value: 900 },
        { name: 'Galaxy S24+', value: 800 },
        { name: 'Galaxy S24', value: 700 },
        { name: 'Galaxy S23 Ultra', value: 700 },
        { name: 'Galaxy S23+', value: 600 },
        { name: 'Galaxy S23', value: 500 }
    ],
    google: [
        { name: 'Pixel 8 Pro', value: 700 },
        { name: 'Pixel 8', value: 600 },
        { name: 'Pixel 7 Pro', value: 500 },
        { name: 'Pixel 7', value: 400 }
    ],
    oneplus: [
        { name: 'OnePlus 12', value: 700 },
        { name: 'OnePlus 11', value: 500 },
        { name: 'OnePlus 10 Pro', value: 400 }
    ]
};

const storageOptions = {
    apple: ['64GB', '128GB', '256GB', '512GB', '1TB'],
    samsung: ['128GB', '256GB', '512GB', '1TB'],
    google: ['128GB', '256GB', '512GB'],
    oneplus: ['128GB', '256GB', '512GB']
};

// Initialize trade-in form if on trade-in page
if (window.location.pathname.includes('tradein.html')) {
    initializeTradeIn();
}

function initializeTradeIn() {
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');
    const storageSelect = document.getElementById('storage');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.form-section');

    // Brand selection handler
    brandSelect?.addEventListener('change', function() {
        const brand = this.value;
        if (!brand) {
            modelSelect.disabled = true;
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            return;
        }

        modelSelect.disabled = false;
        modelSelect.innerHTML = `
            <option value="">Select Model</option>
            ${deviceModels[brand].map(model => 
                `<option value="${model.name}" data-value="${model.value}">${model.name}</option>`
            ).join('')}
        `;
    });

    // Model selection handler
    modelSelect?.addEventListener('change', function() {
        const brand = brandSelect.value;
        if (!this.value || !brand) {
            storageSelect.disabled = true;
            storageSelect.innerHTML = '<option value="">Select Storage</option>';
            return;
        }

        storageSelect.disabled = false;
        storageSelect.innerHTML = `
            <option value="">Select Storage</option>
            ${storageOptions[brand].map(storage => 
                `<option value="${storage}">${storage}</option>`
            ).join('')}
        `;
    });

    // Next step handler
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentSection = this.closest('.form-section');
            const currentIndex = Array.from(sections).indexOf(currentSection);
            
            if (validateSection(currentIndex)) {
                if (currentIndex < sections.length - 1) {
                    sections[currentIndex].classList.add('hidden');
                    sections[currentIndex + 1].classList.remove('hidden');
                    
                    steps[currentIndex].classList.add('completed');
                    steps[currentIndex + 1].classList.add('active');

                    if (currentIndex + 1 === sections.length - 1) {
                        calculateQuote();
                    }
                }
            }
        });
    });

    // Previous step handler
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentSection = this.closest('.form-section');
            const currentIndex = Array.from(sections).indexOf(currentSection);
            
            if (currentIndex > 0) {
                sections[currentIndex].classList.add('hidden');
                sections[currentIndex - 1].classList.remove('hidden');
                
                steps[currentIndex].classList.remove('active');
                steps[currentIndex - 1].classList.remove('completed');
                steps[currentIndex - 1].classList.add('active');
            }
        });
    });

    // Book appointment handler
    document.getElementById('book-appointment')?.addEventListener('click', function() {
        showNotification('Appointment request sent! We will contact you shortly.');
    });
}

function validateSection(sectionIndex) {
    switch(sectionIndex) {
        case 0: // Device Details
            const brand = document.getElementById('brand').value;
            const model = document.getElementById('model').value;
            const storage = document.getElementById('storage').value;
            
            if (!brand || !model || !storage) {
                showNotification('Please fill in all device details', 'error');
                return false;
            }
            return true;

        case 1: // Condition
            const condition = document.querySelector('input[name="condition"]:checked');
            const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            if (!condition) {
                showNotification('Please select device condition', 'error');
                return false;
            }
            if (!allChecked) {
                showNotification('Please confirm all device requirements', 'error');
                return false;
            }
            return true;

        default:
            return true;
    }
}

function calculateQuote() {
    const modelSelect = document.getElementById('model');
    const storageSelect = document.getElementById('storage');
    const condition = document.querySelector('input[name="condition"]:checked');
    
    const baseValue = Number(modelSelect.selectedOptions[0].dataset.value);
    const storage = storageSelect.value;
    const storageMultiplier = getStorageMultiplier(storage);
    const conditionMultiplier = getConditionMultiplier(condition.value);

    const finalValue = Math.round(baseValue * storageMultiplier * conditionMultiplier);

    // Update quote display
    document.querySelector('.quote-value .value').textContent = formatPrice(finalValue);
    document.getElementById('summary-brand').textContent = `Brand: ${document.getElementById('brand').value}`;
    document.getElementById('summary-model').textContent = `Model: ${modelSelect.value}`;
    document.getElementById('summary-storage').textContent = `Storage: ${storage}`;
    document.getElementById('summary-condition').textContent = `Condition: ${condition.value.charAt(0).toUpperCase() + condition.value.slice(1)}`;
}

function getStorageMultiplier(storage) {
    const size = parseInt(storage);
    if (size <= 128) return 1;
    if (size <= 256) return 1.1;
    if (size <= 512) return 1.2;
    return 1.3; // 1TB
}

function getConditionMultiplier(condition) {
    switch(condition) {
        case 'perfect': return 1;
        case 'good': return 0.8;
        case 'fair': return 0.6;
        default: return 0.5;
    }
}

// Add updateCartCount function
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Initialize filters when on browse page
function initializeFilters() {
    const applyFiltersButton = document.getElementById('apply-filters');
    const sortSelect = document.getElementById('sort-select');
    
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyFilters);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    const products = document.querySelectorAll('.product');
    const selectedBrands = Array.from(document.querySelectorAll('.filter-group:nth-child(1) input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const selectedPriceRanges = Array.from(document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const selectedFeatures = Array.from(document.querySelectorAll('.filter-group:nth-child(3) input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const sortValue = document.getElementById('sort-select').value;

    // Create a map for brand matching
    const brandMap = {
        'apple': ['iphone'],
        'samsung': ['galaxy', 'samsung'],
        'google': ['pixel']
    };

    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        const priceText = product.querySelector('.price').textContent.toLowerCase();
        const price = parseFloat(priceText.replace('€', '').replace(',', ''));
        const featuresElement = product.querySelector('.product-features');
        const productDetails = product.querySelector('.product-details');
        
        // Brand matching using the map
        const brandMatch = selectedBrands.length === 0 || 
            selectedBrands.some(brand => 
                brandMap[brand].some(keyword => productName.includes(keyword))
            );
        
        // Price range matching
        const priceMatch = selectedPriceRanges.length === 0 || 
            selectedPriceRanges.some(range => {
                if (range === '0-500') return price <= 500;
                if (range === '501-800') return price > 500 && price <= 800;
                if (range === '801+') return price > 800;
                return false;
            });
        
        // Feature matching
        const featureMatch = selectedFeatures.length === 0 || 
            selectedFeatures.every(feature => {
                const featureText = (featuresElement ? featuresElement.textContent.toLowerCase() : '') +
                                  (productDetails ? productDetails.textContent.toLowerCase() : '');
                switch(feature) {
                    case '5g':
                        return featureText.includes('5g');
                    case 'wireless':
                        return featureText.includes('wireless charging');
                    case 'dual-sim':
                        return featureText.includes('dual sim');
                    default:
                        return false;
                }
            });

        // Show/hide product based on all filters
        if (brandMatch && priceMatch && featureMatch) {
            product.style.display = '';
            product.style.animation = 'fadeIn 0.5s ease-out forwards';
        } else {
            product.style.display = 'none';
        }
    });

    // Apply sorting to visible products only
    const productsContainer = document.querySelector('.products-grid');
    const visibleProducts = Array.from(products).filter(p => p.style.display !== 'none');
    
    visibleProducts.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.price').textContent.replace('€', '').replace(',', ''));
        const priceB = parseFloat(b.querySelector('.price').textContent.replace('€', '').replace(',', ''));
        
        switch(sortValue) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'newest':
                const badgeA = a.querySelector('.product-badge').textContent;
                const badgeB = b.querySelector('.product-badge').textContent;
                if (badgeA === 'New') return -1;
                if (badgeB === 'New') return 1;
                return 0;
            default: // featured
                return 0;
        }
    });

    // Clear and re-append sorted products
    visibleProducts.forEach(product => {
        productsContainer.appendChild(product);
    });

    // Show "No products found" message if no products are visible
    const noProductsMessage = document.querySelector('.no-products-message') || createNoProductsMessage();
    if (visibleProducts.length === 0) {
        noProductsMessage.style.display = 'block';
    } else {
        noProductsMessage.style.display = 'none';
    }
}

function createNoProductsMessage() {
    const message = document.createElement('div');
    message.className = 'no-products-message';
    message.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #64748b;">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <h3>No products found</h3>
            <p>Try adjusting your filters to find what you're looking for.</p>
        </div>
    `;
    document.querySelector('.products-container').appendChild(message);
    return message;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializePaymentForm() {
    const form = document.getElementById('payment-form');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validate form
        const cardName = document.getElementById('card-name').value.trim();
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const expiry = document.getElementById('expiry').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        if (!cardName || !cardNumber || !expiry || !cvv) {
            showNotification('Please fill in all payment details', 'error');
            return;
        }

        if (cardNumber.length !== 16) {
            showNotification('Please enter a valid card number', 'error');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return;
        }

        if (!/^\d{3}$/.test(cvv)) {
            showNotification('Please enter a valid CVV', 'error');
            return;
        }

        // Get order data
        const orderData = JSON.parse(localStorage.getItem('currentOrder'));
        
        // Store completed order
        const completedOrder = {
            ...orderData,
            paymentDate: new Date().toISOString(),
            customerName: cardName
        };
        
        // Store in completed orders
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrders.push(completedOrder);
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Redirect to thank you page
        window.location.href = `thankyou.html?orderId=${orderData.orderNumber}`;
    });

    // Format card number input
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
        });
    }

    // Format expiry date input
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }
}

function initializeThankYouPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        window.location.href = 'index.html';
        return;
    }

    // Get completed orders
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    const order = completedOrders.find(o => o.orderNumber === orderId);
    
    if (!order) {
        window.location.href = 'index.html';
        return;
    }

    // Display order details
    const orderNumberElement = document.getElementById('order-number');
    const orderSummaryElement = document.getElementById('order-summary');
    
    if (orderNumberElement) {
        orderNumberElement.innerHTML = `
            <strong>Order Number:</strong> ${order.orderNumber}<br>
            <strong>Order Date:</strong> ${new Date(order.paymentDate).toLocaleDateString()}
        `;
    }
    
    if (orderSummaryElement) {
        orderSummaryElement.innerHTML = `
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="summary-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                <div class="summary-item">
                    <span>Subtotal</span>
                    <span>${formatPrice(order.subtotal)}</span>
                </div>
                <div class="summary-item">
                    <span>VAT (23%)</span>
                    <span>${formatPrice(order.vat)}</span>
                </div>
                <div class="summary-item total">
                    <span>Total</span>
                    <span>${formatPrice(order.total)}</span>
                </div>
            </div>
        `;
    }
}
