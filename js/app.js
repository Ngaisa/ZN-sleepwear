// Register Service Worker for caching and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  });
}

// Product Data
const products = [
  {
    id: 1,
    name: 'Soft Kiss Set',
    price: 725,
    category: 'pajamas',
    label: 'New',
    badge: 'New',
    img: 'img/ul ma rose stijn.jpeg',
    description: 'The Soft Kiss Set is playful, chic, and effortlessly comfortable.',
    images: ['img/ul ma rose stijn.jpeg', 'img/satij U M rose.jpeg'],
  },
  {
    id: 2,
    name: 'Sweetheart Set White',
    price: 725,
    category: 'robes',
    label: 'Best Seller',
    badge: 'Popular',
    img: 'img/ulle mani smile.jpeg',
    description: 'The perfect blend of comfort and charm.',
    images: ['img/ulle mani smile.jpeg', 'img/ulle wit.jpeg'],
    rating: 5,
    reviews: 62,
  },
  {
    id: 3,
    name: 'Pink Obsession Set',
    price: 700,
    category: 'lounge',
    label: 'New',
    badge: 'New',
    img: 'img/ulle satijn.jpeg',
    description: 'Bold, feminine, and impossible to ignore.',
    images: ['img/ulle satijn.jpeg', 'img/test nieuw.jpeg'],
    rating: 5,
    reviews: 35,
  },
  {
    id: 4,
    name: 'Sweet Heart Set Pink',
    price: 725,
    category: 'pajamas',
    label: 'Best Seller',
    badge: 'Popular',
    img: 'img/mani R.jpeg',
    description: 'Sweet, feminine, and irresistibly cute.',
    images: ['img/mani R.jpeg', 'img/U M achter rose.jpeg'],
    rating: 5,
    reviews: 41,
  },
  {
    id: 5,
    name: 'Blush Muse Set',
    price: 725,
    category: 'pajamas',
    label: 'New',
    badge: 'New',
    img: 'img/mani S rose.jpeg',
    description: 'Soft, elegant, and made to stand out.',
    images: ['img/mani S rose.jpeg', 'img/S Rose.jpeg'],
    rating: 5,
    reviews: 28,
  },
  {
    id: 6,
    name: 'White Muse Set',
    price: 725,
    category: 'lounge',
    label: 'New',
    badge: 'New',
    img: 'img/wit satijn.jpeg',
    description: 'Lightweight, elegant, and incredibly soft.',
    images: ['img/wit satijn.jpeg', 'img/Rose wit.jpeg'],
    rating: 5,
    reviews: 54,
  },
  {
    id: 7,
    name: ' Sweet Heart Set Long',
    price: 750,
    category: 'accessories',
    label: 'Best Seller',
    badge: 'Popular',
    img: 'img/Gaby lang.jpeg',
    description: 'Available in Pink & White',
    images: ['img/Gaby lang.jpeg', 'img/Gai lang.jpeg'],
    rating: 5,
    reviews: 87,
  },
  {
    id: 8,
    name: 'Soft Kiss Set Long',
    price: 750,
    category: 'pajamas',
    label: 'Best Seller',
    badge: 'Popular',
    img: 'img/test lang.jpeg',
    description: 'Soft and comfortable fit',
    images: ['img/test lang.jpeg'],
    rating: 5,
    reviews: 73,
  },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// State Management
let cart = JSON.parse(localStorage.getItem('znCart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('znWishlist') || '[]');
let currentPage = getCurrentPage();
let filteredCategory = new URLSearchParams(window.location.search).get('category') || 'all';
let sortBy = 'featured';
let searchTerm = '';
let cardRotationInterval = null;

// DOM Elements
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
const searchToggle = document.getElementById('searchToggle');
const searchPanel = document.getElementById('searchPanel');
const searchInput = document.getElementById('searchInput');
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartCount = document.getElementById('cartCount');
const backdrop = document.getElementById('backdrop');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderPage();
  updateCartCount();
  populateReviews();
});

function getCurrentPage() {
  const path = window.location.pathname || '/';
  const file = path.split('/').pop();
  const name = file ? file.split('.')[0].toLowerCase() : '';

  if (name === 'product' || path.endsWith('/product') || path.includes('/product/')) return 'product';
  if (name === 'shop' || path.endsWith('/shop') || path.includes('/shop')) return 'shop';
  if (name === 'about' || path.endsWith('/about')) return 'about';
  if (name === 'contact' || path.endsWith('/contact')) return 'contact';

  // Fallback to home for root or unknown paths
  return 'home';
}

function setupEventListeners() {
  // Navigation
  navToggle?.addEventListener('click', () => {
    mobileNav?.classList.toggle('hidden');
  });

  // Close mobile menu when clicking on a navigation link
  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav?.classList.add('hidden');
    });
  });

  // Search
  searchToggle?.addEventListener('click', () => {
    searchPanel?.classList.toggle('hidden');
    if (!searchPanel?.classList.contains('hidden')) {
      searchInput?.focus();
    }
  });

  searchInput?.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    performSearch();
  });

  // Cart
  cartToggle?.addEventListener('click', openCart);
  document.getElementById('closeCart')?.addEventListener('click', closeCart);
  backdrop?.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);

  // Modal
  closeModal?.addEventListener('click', closeProductModal);
  productModal?.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  // Lightbox
  document.getElementById('closeLightbox')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxBackdrop')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', prevLightboxImage);
  document.getElementById('lightboxNext')?.addEventListener('click', nextLightboxImage);
  document.getElementById('imageLightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'imageLightbox') closeLightbox();
  });

  // Close lightbox with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const imageLightbox = document.getElementById('imageLightbox');
      if (imageLightbox && !imageLightbox.classList.contains('hidden')) {
        closeLightbox();
      }
    }
  });

  // Filter & Sort (on shop page)
  document.querySelectorAll('[name="category"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      filteredCategory = e.target.value;
      renderShopProducts();
    });
  });

  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderShopProducts();
  });

  // Newsletter
  document.getElementById('newsletterForm')?.addEventListener('submit', handleNewsletter);

  // Contact Form
  document.getElementById('contactForm')?.addEventListener('submit', handleContact);
}

function renderPage() {
  if (currentPage === 'home') {
    renderHomePage();
  } else if (currentPage === 'shop') {
    renderShopProducts();
  } else if (currentPage === 'product') {
    renderProductPage();
  }
}

function renderHomePage() {
  const newArrivals = products
    .filter((p) => p.label?.toLowerCase() === 'new')
    .sort((a, b) => {
      if (a.name === 'Blush Muse Set') return -1;
      if (b.name === 'Blush Muse Set') return 1;
      return a.id - b.id;
    });
  renderProductGrid('newProducts', newArrivals);

  const bestSellers = products
    .filter((p) => p.badge?.toLowerCase() === 'popular' || p.label?.toLowerCase() === 'best seller')
    .sort((a, b) => {
      if (a.name === 'Sweetheart Set White') return -1;
      if (b.name === 'Sweetheart Set White') return 1;
      return a.id - b.id;
    });
  renderProductGrid('bestProducts', bestSellers);
}

function renderShopProducts() {
  let filtered = products;
  const pageTitle = document.querySelector('.shop-header h1');
  const pageDescription = document.querySelector('.shop-header p');

  if (filteredCategory === 'new') {
    filtered = products.filter((p) => p.label?.toLowerCase() === 'new');
    if (pageTitle) pageTitle.textContent = 'New Arrivals';
    if (pageDescription) pageDescription.textContent = 'Bekijk onze nieuwste modellen.';
  } else if (filteredCategory === 'best' || filteredCategory === 'popular') {
    filtered = products.filter((p) => p.badge?.toLowerCase() === 'popular' || p.label?.toLowerCase() === 'best seller');
    if (pageTitle) pageTitle.textContent = 'Best Sellers';
    if (pageDescription) pageDescription.textContent = 'Bekijk onze customers favorite.';
  } else if (filteredCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === filteredCategory);
    if (pageTitle) pageTitle.textContent = `${filteredCategory.charAt(0).toUpperCase() + filteredCategory.slice(1)}`;
    if (pageDescription) pageDescription.textContent = 'Bekijk onze collectie.';
  } else {
    if (pageTitle) pageTitle.textContent = 'Shop Our Collection';
    if (pageDescription) pageDescription.textContent = 'Discover luxury sleepwear and loungewear designed for ultimate comfort and style.';
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm)
    );
  }

  filtered = sortProducts(filtered, sortBy);

  const countEl = document.getElementById('productCount');
  if (countEl) {
    countEl.textContent = `${filtered.length} products`;
  }

  renderProductGrid('shopProducts', filtered);
}

function renderProductPage() {
  const productDetail = document.getElementById('productDetail');
  if (!productDetail) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get('id')) || null;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    productDetail.innerHTML = `
      <div class="product-not-found">
        <h1>Product not found</h1>
        <p>We couldn't find the product you were looking for. Please return to the shop to browse our collection.</p>
        <a class="btn btn-primary" href="shop.html">Back to Shop</a>
      </div>
    `;
    return;
  }

  productDetail.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-image">
        <img src="${product.images[0]}" alt="${product.name}" />
      </div>
      <div class="product-detail-copy">
        <p class="section-label">${product.badge || product.label || 'Sleepwear'}</p>
        <h1>${product.name}</h1>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p>${product.description}</p>
        <div class="size-selector">
          <h3>Select Size *</h3>
          <div class="size-grid product-page-sizes">
            ${sizes.map((size) => `
              <button class="size-option" data-size="${size}">${size}</button>
            `).join('')}
          </div>
        </div>
        <div class="quantity-selector">
          <button class="qty-btn" id="qtyMinus">−</button>
          <input type="number" id="qtyInput" class="qty-input" value="1" min="1" max="10" />
          <button class="qty-btn" id="qtyPlus">+</button>
        </div>
        <button class="btn btn-primary" id="addToCartProduct">Add to Cart</button>
      </div>
    </div>
  `;

  let selectedSize = '';
  productDetail.querySelectorAll('.size-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      productDetail.querySelectorAll('.size-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.dataset.size;
    });
  });

  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    if (qtyInput.value > 1) qtyInput.value--;
  });
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    if (qtyInput.value < 10) qtyInput.value++;
  });

  document.getElementById('addToCartProduct')?.addEventListener('click', () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(productId, selectedSize, Number(qtyInput.value));
    openCart();
  });
}

function sortProducts(prods, by) {
  const sorted = [...prods];
  switch (by) {
    case 'newest':
      return sorted.reverse();
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'best-sellers':
      return sorted.sort((a, b) => b.reviews - a.reviews);
    default:
      return sorted;
  }
}

function renderProductGrid(elementId, prods) {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.innerHTML = prods.map((product) => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img class="product-img-clickable" src="${product.img}" alt="${product.name}" loading="lazy" data-id="${product.id}" data-images="${product.images.join('|')}" />
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-copy">
        <h3>${product.name}</h3>
        <p class="price">$${product.price.toFixed(2)}</p>
        <div class="product-actions">
          <a class="btn btn-primary" href="product.html?id=${product.id}">View</a>
          <button class="wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}" data-id="${product.id}" aria-label="Add to wishlist">♡</button>
        </div>
      </div>
    </article>
  `).join('');

  setupProductCardRotations(container);

  // Bind events
  container.querySelectorAll('.product-img-clickable').forEach((img) => {
    img.addEventListener('click', () => {
      const productId = Number(img.dataset.id);
      openImageLightbox(productId);
    });
  });

  container.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = Number(btn.dataset.id);
      toggleWishlist(productId, btn);
    });
  });
}

function setupProductCardRotations(container) {
  // Clear previous interval to prevent memory leaks
  if (cardRotationInterval) {
    clearInterval(cardRotationInterval);
    cardRotationInterval = null;
  }

  // Get all product images with multiple variations
  const productCards = Array.from(container.querySelectorAll('.product-card')).map((card) => {
    const img = card.querySelector('.product-img-clickable');
    if (!img) return null;
    
    const imageList = img.dataset.images?.split('|') || [];
    if (imageList.length <= 1) return null;
    
    return {
      card,
      img,
      imageList,
      currentIndex: 0,
      rotationInterval: null,
      isHovering: false
    };
  }).filter(Boolean);

  if (productCards.length === 0) return;

  // Add hover listeners for image rotation
  productCards.forEach(({ card, img, imageList, rotationInterval }) => {
    const productData = productCards.find(p => p.img === img);
    
    // Hover to start rotation
    card.addEventListener('mouseenter', () => {
      if (productData.isHovering) return;
      productData.isHovering = true;
      
      // Rotate every 800ms on hover instead of 2800ms globally
      productData.rotationInterval = setInterval(() => {
        productData.currentIndex = (productData.currentIndex + 1) % imageList.length;
        img.src = imageList[productData.currentIndex];
      }, 800);
    });
    
    // Stop rotation on mouse leave
    card.addEventListener('mouseleave', () => {
      productData.isHovering = false;
      if (productData.rotationInterval) {
        clearInterval(productData.rotationInterval);
        productData.rotationInterval = null;
      }
      // Reset to first image
      productData.currentIndex = 0;
      img.src = imageList[0];
    });
  });
}


function showProductModal(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const modalContent = document.getElementById('productModalContent');
  if (!modalContent) return;

  let selectedSize = '';

  modalContent.innerHTML = `
    <div class="product-modal-inner">
      <div class="product-modal-gallery">
        <img class="product-modal-image" src="${product.images[0]}" alt="${product.name}" />
      </div>
      <div class="product-modal-details">
        <h2>${product.name}</h2>
        <div class="product-modal-price">$${product.price.toFixed(2)}</div>
        <p class="product-modal-description">${product.description}</p>

        <div class="size-selector">
          <h3>Select Size *</h3>
          <div class="size-grid">
            ${sizes.map((size) => `
              <button class="size-option" data-size="${size}">${size}</button>
            `).join('')}
          </div>
        </div>

        <div class="quantity-selector">
          <button class="qty-btn" id="qtyMinus">−</button>
          <input type="number" id="qtyInput" class="qty-input" value="1" min="1" max="10" />
          <button class="qty-btn" id="qtyPlus">+</button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" id="addToCartModal" style="width: 100%;">Add to Cart</button>
          <button class="btn btn-outline" id="buyNowModal" style="width: 100%;">Buy Now</button>
        </div>
      </div>
    </div>
  `;

  // Size selection
  modalContent.querySelectorAll('.size-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.dataset.size;
    });
  });

  // Quantity controls
  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    if (qtyInput.value > 1) qtyInput.value--;
  });
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    if (qtyInput.value < 10) qtyInput.value++;
  });

  // Add to cart
  document.getElementById('addToCartModal')?.addEventListener('click', () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    const qty = parseInt(qtyInput.value);
    addToCart(productId, selectedSize, qty);
    closeProductModal();
  });

  document.getElementById('buyNowModal')?.addEventListener('click', () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    const qty = parseInt(qtyInput.value);
    addToCart(productId, selectedSize, qty);
    openCart();
  });

  productModal?.classList.remove('hidden');
  backdrop?.classList.remove('hidden');
}

function closeProductModal() {
  productModal?.classList.add('hidden');
  backdrop?.classList.add('hidden');
}

// Lightbox state
let lightboxState = {
  productId: null,
  currentImageIndex: 0,
  images: [],
};

function openImageLightbox(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  lightboxState.productId = productId;
  lightboxState.images = product.images || [product.img];
  lightboxState.currentImageIndex = 0;

  updateLightboxImage();

  const imageLightbox = document.getElementById('imageLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  imageLightbox?.classList.remove('hidden');
  lightboxBackdrop?.classList.remove('hidden');
}

function updateLightboxImage() {
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (!lightboxImage) return;

  const img = lightboxState.images[lightboxState.currentImageIndex];
  lightboxImage.src = img;

  // Update counter
  if (lightboxCounter) {
    lightboxCounter.textContent = `${lightboxState.currentImageIndex + 1} / ${lightboxState.images.length}`;
  }

  // Show/hide navigation buttons based on image count
  if (lightboxPrev && lightboxNext) {
    const hasMultipleImages = lightboxState.images.length > 1;
    lightboxPrev.style.display = hasMultipleImages ? 'flex' : 'none';
    lightboxNext.style.display = hasMultipleImages ? 'flex' : 'none';
  }
}

function nextLightboxImage() {
  if (lightboxState.images.length <= 1) return;
  lightboxState.currentImageIndex = (lightboxState.currentImageIndex + 1) % lightboxState.images.length;
  updateLightboxImage();
}

function prevLightboxImage() {
  if (lightboxState.images.length <= 1) return;
  lightboxState.currentImageIndex = (lightboxState.currentImageIndex - 1 + lightboxState.images.length) % lightboxState.images.length;
  updateLightboxImage();
}

function closeLightbox() {
  const imageLightbox = document.getElementById('imageLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  imageLightbox?.classList.add('hidden');
  lightboxBackdrop?.classList.add('hidden');

  lightboxState.productId = null;
  lightboxState.currentImageIndex = 0;
  lightboxState.images = [];
}

function performSearch() {
  if (searchTerm.length === 0) {
    document.getElementById('searchResults')?.classList.add('hidden');
    return;
  }

  const results = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm)
  );

  const resultsDiv = document.getElementById('searchResults');
  if (!resultsDiv) return;

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p style="padding: 16px 18px; color: #999;">No products found</p>';
  } else {
    resultsDiv.innerHTML = results.map((p) => `
      <div class="search-result-item" data-id="${p.id}">
        <strong>${p.name}</strong>
        <span>$${p.price.toFixed(2)}</span>
      </div>
    `).join('');

    resultsDiv.querySelectorAll('.search-result-item').forEach((item) => {
      item.addEventListener('click', () => {
        const productId = Number(item.dataset.id);
        window.location.href = `product.html?id=${productId}`;
      });
    });
  }

  resultsDiv.classList.remove('hidden');
}

function toggleWishlist(productId, btn) {
  const index = wishlist.indexOf(productId);
  if (index === -1) {
    wishlist.push(productId);
    btn.classList.add('active');
  } else {
    wishlist.splice(index, 1);
    btn.classList.remove('active');
  }
  localStorage.setItem('znWishlist', JSON.stringify(wishlist));
}

function addToCart(productId, size, quantity = 1) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId && item.size === size);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      size,
      quantity,
      img: product.img,
    });
  }

  localStorage.setItem('znCart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function removeFromCart(productId, size) {
  cart = cart.filter((item) => !(item.id === productId && item.size === size));
  localStorage.setItem('znCart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateQuantity(productId, size, delta) {
  const item = cart.find((entry) => entry.id === productId && entry.size === size);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity < 1) {
    removeFromCart(productId, size);
  } else {
    localStorage.setItem('znCart', JSON.stringify(cart));
    renderCart();
  }
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function renderCart() {
  const cartList = document.getElementById('cartItemsList') || document.getElementById('cartItems');
  if (!cartList) return;
  const totalEl = document.getElementById('cartSubtotal') || document.getElementById('cartTotal');
  const checkoutButtonEl = document.getElementById('checkoutBtn') || document.getElementById('checkoutButton');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="cart-empty">Your bag is empty. Start shopping!</p>';
    if (totalEl) totalEl.textContent = '$0.00';
    if (checkoutButtonEl) checkoutButtonEl.disabled = true;
    return;
  }

  if (checkoutButtonEl) checkoutButtonEl.disabled = false;

  cartList.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-details">
        <div>
          <strong>${item.name}</strong>
          <div class="item-meta">Size: ${item.size} | $${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-controls">
          <button class="qty-btn qty-decrease" data-id="${item.id}" data-size="${item.size}">−</button>
          <span style="min-width: 40px; text-align: center;">${item.quantity}</span>
          <button class="qty-btn qty-increase" data-id="${item.id}" data-size="${item.size}">+</button>
          <button class="qty-btn" data-id="${item.id}" data-size="${item.size}" style="margin-left: auto; background: #fde2e9; color: #d32f2f;">✕</button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind cart events
  cartList.querySelectorAll('.qty-decrease').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateQuantity(Number(btn.dataset.id), btn.dataset.size, -1);
    });
  });

  cartList.querySelectorAll('.qty-increase').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateQuantity(Number(btn.dataset.id), btn.dataset.size, 1);
    });
  });

  cartList.querySelectorAll('.qty-btn:last-child').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(Number(btn.dataset.id), btn.dataset.size);
    });
  });

  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
  renderCart();
  cartDrawer?.classList.remove('hidden');
  cartDrawer?.classList.add('open');
  backdrop?.classList.remove('hidden');
  backdrop?.classList.add('open');
}

function closeCart() {
  cartDrawer?.classList.add('hidden');
  cartDrawer?.classList.remove('open');
  backdrop?.classList.add('hidden');
  backdrop?.classList.remove('open');
}

function handleCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  const cartSummary = cart.map((item) => `${item.name} (${item.size}) x${item.quantity}`).join('\n');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(`Order Summary:\n${cartSummary}\n\nTotal: $${total.toFixed(2)}\n\nProceeding to checkout...`);
}

function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail')?.value;
  if (!email) return;
  alert(`Thank you! We'll send updates to ${email}`);
  document.getElementById('newsletterForm')?.reset();
}

function handleContact(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name');
  alert(`Thank you, ${name}! We'll get back to you soon.`);
  e.target.reset();
}

function populateReviews() {
  for (let i = 1; i <= 3; i++) {
    const starsDiv = document.getElementById(`stars${i}`);
    if (starsDiv) {
      starsDiv.innerHTML = '★★★★★';
    }
  }
}
