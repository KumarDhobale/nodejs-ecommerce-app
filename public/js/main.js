document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const cartCountSpan = document.getElementById('cart-count');
    const logoutBtn = document.getElementById('logout-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortByDropdown = document.getElementById('sort-by');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalSpan = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    let products = [];

    // Header logic (logout, login)
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (user) {
        const loginLink = document.querySelector('a[href="/views/login.html"]');
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline';
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }

    // Cart count update karein
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartCountSpan) {
            cartCountSpan.textContent = cart.length;
        }
    }
    
    // Slider functionality
    const sliderImages = document.querySelectorAll('.slider img');
    let currentImageIndex = 0;
    function nextImage() {
        if (sliderImages[currentImageIndex]) {
            sliderImages[currentImageIndex].classList.remove('active');
        }
        currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
        if (sliderImages[currentImageIndex]) {
            sliderImages[currentImageIndex].classList.add('active');
        }
    }
    if (sliderImages.length > 1) {
        setInterval(nextImage, 4000);
    }

    // Server se products fetch karein
    function fetchProducts(searchQuery = '') {
        const url = searchQuery ? `/api/products?search=${encodeURIComponent(searchQuery)}` : '/api/products';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                products = data;
                if (sortByDropdown) sortProducts();
                else renderProducts();
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                if (productList) {
                    productList.innerHTML = '<p class="empty-cart-message">Failed to load products. Please try again later.</p>';
                }
            });
    }

    // Products ko sort karein
    function sortProducts() {
        if (!sortByDropdown || !products) return;
        const sortValue = sortByDropdown.value;
        if (sortValue === 'price-low-to-high') {
            products.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-high-to-low') {
            products.sort((a, b) => b.price - a.price);
        }
        renderProducts();
    }

    // Products ko UI par render karein (Home/Products page)
    function renderProducts() {
        if (!productList) return;
        productList.innerHTML = '';
        if (products.length === 0) {
            productList.innerHTML = '<p class="empty-cart-message">No products found.</p>';
            return;
        }
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image-box">
                    <img src="${product.imageUrl}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="description">${product.description}</p>
                    <div class="button-group">
                        <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
                        <a href="/views/product-detail.html?id=${product._id}" class="details-btn">View Details</a>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    // "Add to Cart" button par click event handle karein
    if (productList) {
        productList.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = e.target.dataset.id;
                const productToAdd = products.find(p => p._id.toString() === productId);
                if (productToAdd) {
                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                    cart.push(productToAdd);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    alert(`${productToAdd.name} added to cart!`);
                }
            }
        });
    }

    // Search functionality (Click event par trigger hoga)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            fetchProducts(searchInput.value);
        });
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                fetchProducts(searchInput.value);
            }
        });
    }

    // Price sorting functionality
    if (sortByDropdown) {
        sortByDropdown.addEventListener('change', sortProducts);
    }

    // --- Cart Page Logic ---
    function renderCartItems() {
        if (!cartItemsList || !cartTotalSpan) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
        }

        cart.forEach((item, index) => {
            total += item.price;
            const cartItemCard = document.createElement('div');
            cartItemCard.className = 'cart-item-card';
            cartItemCard.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart" data-index="${index}">Remove</button>
            `;
            cartItemsList.appendChild(cartItemCard);
        });

        cartTotalSpan.textContent = total.toFixed(2);
    }

    // Remove from cart logic
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-from-cart')) {
                const itemIndex = parseInt(e.target.dataset.index);
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                if (itemIndex >= 0 && itemIndex < cart.length) {
                    cart.splice(itemIndex, 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    renderCartItems(); // Re-render the cart after removing
                }
            }
        });
    }
    
    // Checkout logic
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            if (!token) {
                alert('Please log in to complete your purchase.');
                window.location.href = '/views/login.html';
                return;
            }

            if (cart.length === 0) {
                alert('Your cart is empty. Please add items before checking out.');
                return;
            }

            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ cartItems: cart })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Order placed successfully! Thank you for shopping with us.');
                    localStorage.removeItem('cart');
                    updateCartCount();
                    renderCartItems();
                } else if (response.status === 401) {
                    alert('Session expired. Please log in again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/views/login.html';
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.message}`);
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('An error occurred during checkout. Please try again.');
            }
        });
    }

    // Initial functions to run based on the page
    if (productList) {
        fetchProducts();
    }
    if (cartItemsList) {
        renderCartItems();
    }
    updateCartCount();
});