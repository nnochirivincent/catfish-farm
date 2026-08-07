// ===== 1. PRODUCT DATABASE - ONLY 1 TIME =====
const productData = [
  // LIVE & FRESH
  {id: 1, name: "Live Catfish - Table Size", price: 3500, desc: "1kg, 4-5 months. Fresh from pond", img: "./assets/images/tablle-size-fish.jpeg", unit: "/kg", category: "Live & Fresh"},
  {id: 2, name: "Live Catfish - Jumbo Size", price: 5500, desc: "2kg - 3kg. Big breeder size", img: "./assets/images/jumbo-fish.jpeg", unit: "/kg", category: "Live & Fresh"},
  {id: 3, name: "Live Catfish - Melange", price: 4000, desc: "Mixed sizes 500g - 1.5kg", img: "./assets/images/melagne.jpeg", unit: "/kg", category: "Live & Fresh"},
  {id: 'fresh-gutted', name: "Fresh Gutted & Cleaned", price: 4500, desc: "1kg. Ready to cook", img: "./assets/images/fresh-catfish.jpeg", unit: "/kg", category: "Live & Fresh"},
  {id: 10, name: "Broodstock Catfish", price: 12000, desc: "1kg+, for breeding", img: "./assets/images/brood-stuck-catfish.jpeg", unit: "/kg", category: "Live & Fresh"},

  // SMOKED & GRILLED
  {id: 4, name: "Smoked Catfish - Pack", price: 5000, desc: "Well dried, 4-5 pieces", img: "./assets/images/packet-fish.jpeg", unit: "/pack", category: "Smoked & Grilled"},
  {id: 5, name: "Smoked Catfish - 1kg", price: 7000, desc: "Oven dried, no chemicals", img: "./assets/images/1-kg-fish.jpeg", unit: "/kg", category: "Smoked & Grilled"},
  {id: 6, name: "Grilled Catfish", price: 6500, desc: "Freshly grilled with spices", img: "./assets/images/grilled-fish.jpeg", unit: "/kg", category: "Smoked & Grilled"},
  {id: 11, name: "Catfish Pepper Soup Pack", price: 3500, desc: "1kg live + pepper + spices", img: "./assets/images/catfish-peppersoup.jpeg", unit: "/pack", category: "Smoked & Grilled"},

  // FINGERLINGS & JUVENILE
  {id: 7, name: "Catfish Fingerlings", price: 8000, desc: "100pcs, 3-4 weeks old", img: "./assets/images/fingerlins.jpeg", unit: "/100pcs", category: "Fingerlings & Juvenile"},
  {id: 8, name: "Catfish Juvenile", price: 15000, desc: "200pcs, 6-8 weeks old", img: "./assets/images/juvenile.jpeg", unit: "/200pcs", category: "Fingerlings & Juvenile"},
  {id: 9, name: "Catfish Post-Juvenile", price: 25000, desc: "100pcs, 10-12 weeks old", img: "./assets/images/post-juvenile.jpeg", unit: "/100pcs", category: "Fingerlings & Juvenile"},
  {id: 12, name: "Farm Starter Kit", price: 50000, desc: "1000 fingerlings + feed + net", img: "https://images.unsplash.com/photo-1627926747454-3a6f64d0f5a4?w=500", unit: "/kit", category: "Fingerlings & Juvenile"},
];

// ===== 2. CART SYSTEM =====
let cart = JSON.parse(localStorage.getItem('cart')) || []; // [{id: 1, qty: 2}, {id: 2, qty: 1}]
let cartTotal = 0; // <-- ADDED THIS SO PAYSTACK KNOWS THE TOTAL

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id) {
  id = String(id);
  const product = productData.find(p => String(p.id) === id);
  if(!product) return alert("Product not found!");

  const existing = cart.find(item => String(item.id) === id);
  if(existing) {
    existing.qty += 1;
  } else {
    cart.push({id: id, qty: 1});
  }
  saveCart();
  updateCartCount();
  alert(`${product.name} added to cart! ✅`);
}

function removeFromCart(id) {
  id = String(id);
  cart = cart.filter(item => String(item.id) !== id);
  saveCart();
  loadCart();
  updateCartCount();
}

function updateQty(id, change) {
  id = String(id);
  const item = cart.find(i => String(i.id) === id);
  if(item) {
    item.qty += change;
    if(item.qty <= 0) removeFromCart(id);
    else { saveCart(); loadCart(); updateCartCount(); }
  }
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.innerText = count > 0 ? count : '';
  });
}

// ===== 3. LOAD CART PAGE =====
function loadCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  if(!cartItemsDiv) return;

  const emptyCartDiv = document.getElementById('empty-cart');
  const cartSummaryDiv = document.getElementById('cart-summary');

  if(cart.length === 0) {
    if(emptyCartDiv) emptyCartDiv.style.display = 'block';
    if(cartSummaryDiv) cartSummaryDiv.style.display = 'none';
    cartItemsDiv.innerHTML = '';
    return;
  }

  if(emptyCartDiv) emptyCartDiv.style.display = 'none';
  if(cartSummaryDiv) cartSummaryDiv.style.display = 'block';

  cartItemsDiv.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const product = productData.find(p => String(p.id) === String(item.id));
    if(!product) return;
    const itemTotal = product.price * item.qty;
    subtotal += itemTotal;

    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/100'">
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <p>${product.desc}</p>
          <div class="cart-qty">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
            <input type="text" class="qty-input" value="${item.qty}" readonly>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
          <p class="cart-item-price">₦${itemTotal.toLocaleString()}</p>
        </div>
        <button class="btn-remove" onclick="removeFromCart('${item.id}')">🗑️ Remove</button>
      </div>
    `;
  });

  const delivery = 2000;
  cartTotal = subtotal + delivery; // <-- SAVE TOTAL TO GLOBAL VARIABLE
  document.getElementById('subtotal').innerText = `₦${subtotal.toLocaleString()}`;
  document.getElementById('total').innerText = `₦${cartTotal.toLocaleString()}`;
}

// ===== 4. LOAD PRODUCTS ON SHOP PAGE =====
function loadProducts() {
  const productList = document.getElementById('product-list');
  const searchInput = document.getElementById('searchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  if(!productList) return;

  let currentCategory = 'all';

  function renderProducts() {
    productList.innerHTML = '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const filtered = productData.filter(p => {
      const matchCategory = currentCategory === 'all' || p.category === currentCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.desc.toLowerCase().includes(searchTerm);
      return matchCategory && matchSearch;
    });

    if(filtered.length === 0) {
      productList.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No products found 😔</p>';
      return;
    }

    filtered.forEach(product => {
      productList.innerHTML += `
        <div class="product-card">
          <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300'">
          <div class="product-card-content">
            <h3>${product.name}</h3>
            <p class="desc">${product.desc}</p>
            <p class="price">₦${product.price.toLocaleString()}<span style="font-size:0.9rem; color:#64748b;">${product.unit}</span></p>
            <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
          </div>
        </div>
      `;
    });
  }

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });

  // Search
  if(searchInput) searchInput.addEventListener('input', renderProducts);

  renderProducts();
}

// ===== 5. HERO SLIDER =====
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const prevBtn = document.querySelector('.slider-arrow.prev');

  if(slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if(dots[i]) dots[i].classList.remove('active');
    });
    slides[index].classList.add('active');
    if(dots[index]) dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    let newIndex = (currentSlide + 1) % slides.length;
    showSlide(newIndex);
  }

  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  if(nextBtn) nextBtn.onclick = () => { clearInterval(slideInterval); nextSlide(); startAutoSlide(); };
  if(prevBtn) prevBtn.onclick = () => { clearInterval(slideInterval); showSlide((currentSlide - 1 + slides.length) % slides.length); startAutoSlide(); };
  dots.forEach((dot, i) => dot.onclick = () => { clearInterval(slideInterval); showSlide(i); startAutoSlide(); });

  showSlide(0);
  startAutoSlide();
}

// ===== 6. SEE MORE TESTIMONIALS =====
function initTestimonials() {
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  const hiddenTestimonials = document.querySelectorAll('.hidden-testimonial');
  let isOpen = false;

  if(seeMoreBtn) {
    seeMoreBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      hiddenTestimonials.forEach(card => {
        card.classList.toggle('show');
      });
      seeMoreBtn.innerHTML = isOpen ? 'Show Less ↑' : 'See More Testimonials ↓';
    });
  }
}

// ===== 7. OTHER FUNCTIONS =====
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');
  if(hamburger) {
    hamburger.addEventListener('click', () => {
      navbar.classList.toggle('active');
      hamburger.innerHTML = navbar.classList.contains('active') ? '✕' : '☰';
    });
  }
}

function initWhatsAppForm() {
  document.getElementById('whatsappForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('w_name').value;
    const email = document.getElementById('w_email').value;
    const phone = document.getElementById('w_phone').value;
    const message = document.getElementById('w_message').value;
    const yourWhatsAppNumber = '2348034732228';
    const text = `*New Website Inquiry*%0A%0A*Name:* ${name}%0A*Email:* ${email}%0A*Phone:* ${phone}%0A*Message:* ${message}`;
    window.open(`https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(text)}`, '_blank');
    this.reset();
  });
}

// ===== 8. WHATSAPP CHECKOUT - KEEP THIS =====
function initWhatsAppCheckout() {
  document.getElementById('whatsappCheckoutBtn')?.addEventListener('click', () => {
    if(cart.length === 0) return alert("Your cart is empty!");
    let message = "Hello Victory Catfish Farm! I want to order:%0A%0A";
    let total = 0;
    cart.forEach(item => {
      const product = productData.find(p => String(p.id) === String(item.id));
      if(product) {
        total += product.price * item.qty;
        message += `• ${product.name} - Qty: ${item.qty} - ₦${(product.price * item.qty).toLocaleString()}%0A`;
      }
    });
    const delivery = 2000;
    message += `%0ASubtotal: ₦${(total).toLocaleString()}%0ADelivery: ₦${delivery.toLocaleString()}%0ATotal: ₦${(total + delivery).toLocaleString()}%0A%0AMy Name: %0AMy Address in Lagos:`;
    window.open(`https://wa.me/2348034732228?text=${message}`, '_blank');
  });
}

// ===== 9. PAYSTACK CHECKOUT SYSTEM =====
function initPaystackCheckout() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutForm = document.getElementById('checkoutForm');

  // OPEN MODAL FROM CART PAGE
  checkoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // Calculate total
    let subtotal = 0;
    cart.forEach(item => {
      const product = productData.find(p => String(p.id) === String(item.id));
      if (product) subtotal += product.price * item.qty;
    });
    cartTotal = subtotal + 2000;

    const finalAmountEl = document.getElementById('finalAmount');
    if (finalAmountEl) finalAmountEl.textContent = cartTotal.toLocaleString();
    if (checkoutModal) checkoutModal.style.display = 'flex';
  });

  // SUBMIT CHECKOUT FORM (WORKS FOR BOTH MODAL & CHECKOUT.HTML PAGE)
  checkoutForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payNowBtn = document.getElementById('payNowBtn');
    payNowBtn.disabled = true;
    payNowBtn.textContent = "Processing...";

    // 1. Prepare items array
    let subtotal = 0;
    const formattedItems = cart.map(item => {
      const p = productData.find(prod => String(prod.id) === String(item.id));
      if (p) {
        subtotal += p.price * item.qty;
        return {
          name: p.name,
          price: p.price,
          qty: item.qty,
          image: p.img
        };
      }
      return null;
    }).filter(Boolean);

    const totalAmount = subtotal + 2000;

    // 2. Build Payload
    const payload = {
      name: document.getElementById('customerName').value,
      email: document.getElementById('customerEmail').value,
      phone: document.getElementById('customerPhone').value,
      address: document.getElementById('customerAddress').value,
      items: formattedItems,
      totalAmount: totalAmount
    };

    try {
      // Step A: Save Order in Database
      const orderRes = await fetch('http://localhost:3000/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // Step B: Initialize Paystack
      const payRes = await fetch('http://localhost:3000/api/payment/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          amount: orderData.amount,
          orderId: orderData.orderId
        })
      });
      const payData = await payRes.json();

      if (payData.status === true && payData.data?.authorization_url) {
        // Clear local cart and redirect
        localStorage.removeItem('cart');
        window.location.href = payData.data.authorization_url;
      } else {
        throw new Error(payData.message || "Paystack initialization failed");
      }

    } catch (error) {
      alert("Payment Error: " + error.message);
      payNowBtn.disabled = false;
      payNowBtn.textContent = "🔒 Pay with Paystack";
    }
  });
}

// ===== SHOW/HIDE FLOATING CHECKOUT BUTTON =====
function initFloatingCheckout() {
  const btn = document.getElementById('floatingCheckoutBtn');
  if(!btn) return;

  function toggleBtn() {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    if(count > 0) {
      btn.style.display = 'block';
      btn.innerHTML = `🛒 Proceed to Checkout (${count})`;
    } else {
      btn.style.display = 'none';
    }
  }

  toggleBtn(); // run on page load
  // Also run whenever cart changes
  window.addEventListener('storage', toggleBtn); 
}

// Update addToCart and removeFromCart to also toggle button
const oldAddToCart = addToCart;
addToCart = function(id) {
  oldAddToCart(id);
  initFloatingCheckout();
}

const oldRemoveFromCart = removeFromCart;
removeFromCart = function(id) {
  oldRemoveFromCart(id);
  initFloatingCheckout();
}

const oldUpdateQty = updateQty;
updateQty = function(id, change) {
  oldUpdateQty(id, change);
  initFloatingCheckout();
}

// ===== 10. INITIALIZE ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  loadProducts();
  loadCart();
  initSlider();
  initMobileMenu();
  initWhatsAppForm();
  initWhatsAppCheckout();
  initPaystackCheckout(); // Attach paystack handler
  initTestimonials();
  initFloatingCheckout();
});




