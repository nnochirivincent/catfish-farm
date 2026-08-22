// ===== GLOBAL CART ARRAY WITH LOCALSTORAGE =====
let cart = JSON.parse(localStorage.getItem('victory_catfish_cart')) || [];

// Base API URL
const API_BASE_URL = 'https://victory-backend-vt8k.onrender.com';

// Wait for DOM to load fully
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initTestimonials();
  initFeedCalculator();
  initProfitabilityEstimator();
  initMobileMenu();
  loadProductsFromBackend();
  renderCartPage();  // Renders cart items if on cart.html
  updateCartUI();    // Syncs badge counts across all pages
  initCheckoutModal();
  loadDiagnosticSymptoms();
});

// Helper: Save cart to browser storage
function saveCart() {
  localStorage.setItem('victory_catfish_cart', JSON.stringify(cart));
}

// Helper: Clear cart fully
window.clearCart = function() {
  cart = [];
  localStorage.removeItem('victory_catfish_cart');
  localStorage.removeItem('cart');
  updateCartUI();
  renderCartPage();
};

// ===== 0. HERO SLIDER =====
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dots = document.querySelectorAll('.hero-slider .dot');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    currentSlide = index;
  }

  function nextSlide() {
    let nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoPlay();
    });
  });

  startAutoPlay();
}

// ===== 0.1 TESTIMONIALS TOGGLE =====
function initTestimonials() {
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  if (!seeMoreBtn) return;

  seeMoreBtn.addEventListener('click', () => {
    const hiddenTestimonials = document.querySelectorAll('.hidden-testimonial');
    let isShowing = false;

    hiddenTestimonials.forEach(card => {
      card.classList.toggle('show');
      if (card.classList.contains('show')) isShowing = true;
    });

    seeMoreBtn.textContent = isShowing ? "Show Less Testimonials ↑" : "See More Testimonials ↓";
  });
}

// ===== 1. SMART FEED CALCULATOR =====
function initFeedCalculator() {
  const calculateBtn = document.getElementById('calc-feed-btn');
  if (!calculateBtn) return;

  calculateBtn.addEventListener('click', () => {
    const totalFish = parseFloat(document.getElementById('stock-count')?.value);
    const avgWeight = parseFloat(document.getElementById('avg-weight')?.value);

    if (!totalFish || !avgWeight || totalFish <= 0 || avgWeight <= 0) {
      alert("Please enter valid positive numbers for total fish and average weight.");
      return;
    }

    let feedingRatePercent = 2.5;
    let pelletSize = '3.0mm';
    let schedule = '2 times daily';

    if (avgWeight <= 5) {
      feedingRatePercent = 8.0;
      pelletSize = '0.5mm - 1.2mm Crumble';
      schedule = '4 - 6 times daily';
    } else if (avgWeight <= 20) {
      feedingRatePercent = 5.0;
      pelletSize = '1.5mm - 2.0mm Pellets';
      schedule = '3 - 4 times daily';
    } else if (avgWeight <= 100) {
      feedingRatePercent = 3.5;
      pelletSize = '2.0mm - 3.0mm Pellets';
      schedule = '2 - 3 times daily';
    } else if (avgWeight <= 400) {
      feedingRatePercent = 2.5;
      pelletSize = '4.0mm - 6.0mm Pellets';
      schedule = '2 times daily';
    } else {
      feedingRatePercent = 1.8;
      pelletSize = '6.0mm - 9.0mm Pellets';
      schedule = '1 - 2 times daily';
    }

    const totalBiomassKg = (totalFish * avgWeight) / 1000;
    const dailyFeedKg = (totalBiomassKg * feedingRatePercent) / 100;
    const monthlyFeedKg = dailyFeedKg * 30;
    const bags30Days = Math.ceil(monthlyFeedKg / 15);

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('res-daily-kg', `${dailyFeedKg.toFixed(2)} kg / day`);
    setTxt('res-feed-rate', `${feedingRatePercent}% Body Weight`);
    setTxt('res-pellet-size', pelletSize);
    setTxt('res-schedule', schedule);
    setTxt('res-monthly-bags', `${bags30Days} Bags (${monthlyFeedKg.toFixed(1)} kg)`);

    const resultsCard = document.getElementById('calc-results');
    if (resultsCard) resultsCard.classList.remove('hidden');
  });
}

// ===== 2. INTERACTIVE BATCH PROFITABILITY ESTIMATOR =====
function initProfitabilityEstimator() {
  const calcBtn = document.getElementById('calc-profit-btn');
  const saveBtn = document.getElementById('save-estimate-btn');
  if (!calcBtn) return;

  const getInputs = () => ({
    stockCount: parseFloat(document.getElementById('est-stock-count')?.value),
    targetWeightKg: parseFloat(document.getElementById('est-target-weight')?.value),
    mortalityRatePercent: parseFloat(document.getElementById('est-mortality')?.value),
    fingerlingCost: parseFloat(document.getElementById('est-fingerling-cost')?.value),
    feedCostPerBag: parseFloat(document.getElementById('est-feed-bag-cost')?.value),
    sellingPricePerKg: parseFloat(document.getElementById('est-selling-price')?.value),
    otherExpenses: parseFloat(document.getElementById('est-overheads')?.value) || 0
  });

  async function computeProfitability(save = false) {
    const inputs = getInputs();

    if (!inputs.stockCount || !inputs.targetWeightKg || !inputs.fingerlingCost || !inputs.feedCostPerBag || !inputs.sellingPricePerKg) {
      alert("Please fill in all required numbers.");
      return;
    }

    try {
      if (save && saveBtn) saveBtn.textContent = "Saving...";

      const response = await fetch(`${API_BASE_URL}/api/estimator/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, saveCalculation: save })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned HTML error (${response.status}). Check backend service.`);
      }

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Calculation failed on backend');
      }

      const m = resData.data;

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setTxt('res-surviving-fish', `${m.survivingFish.toLocaleString()} pcs`);
      setTxt('res-total-biomass', `${m.totalBiomassKg.toLocaleString()} kg`);
      setTxt('res-total-bags', `${m.totalFeedBagsNeeded} bags (${(m.totalFeedBagsNeeded * 15).toLocaleString()}kg)`);
      setTxt('res-total-cost', `₦${m.totalProductionCost.toLocaleString()}`);
      setTxt('res-revenue', `₦${m.projectedRevenue.toLocaleString()}`);
      setTxt('res-net-profit', `₦${m.projectedNetProfit.toLocaleString()}`);
      setTxt('res-roi', `${m.roiPercent}%`);
      setTxt('res-margin', `${m.profitMarginPercent}%`);

      if (save) alert("Batch estimate saved successfully to database! 🚀");

    } catch (err) {
      console.error("Estimator error:", err);
      alert("Estimator Error: " + err.message);
    } finally {
      if (saveBtn) saveBtn.textContent = "💾 Save Estimate to Database";
    }
  }

  calcBtn.addEventListener('click', () => computeProfitability(false));
  if (saveBtn) saveBtn.addEventListener('click', () => computeProfitability(true));
}

// ===== 3. MOBILE MENU TOGGLE =====
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');

  if (hamburger && navbar) {
    hamburger.addEventListener('click', () => navbar.classList.toggle('active'));
  }
}

// ===== 4. LOAD PRODUCTS FROM BACKEND =====
async function loadProductsFromBackend() {
  const container = document.getElementById('product-list') || document.getElementById('products-grid');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      throw new Error(`Failed to fetch products (Status: ${response.status})`);
    }

    const products = await response.json();
    renderProducts(products, container);
  } catch (error) {
    console.error('Error fetching products:', error);
    container.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">Unable to load products. Please refresh.</p>`;
  }
}

function renderProducts(products, container) {
  container.innerHTML = '';
  if (!products || products.length === 0) {
    container.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No products available at the moment.</p>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
      <div class="product-card-content">
        <h3>${product.name}</h3>
        <p class="desc">${product.description || ''}</p>
        <span class="price">₦${Number(product.price).toLocaleString()}</span>
        <button class="btn btn-primary" onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image || ''}')">
          Add to Cart
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ===== 5. SHOPPING CART MANAGEMENT =====
window.addToCart = function(id, name, price, image) {
  const existingIndex = cart.findIndex(item => String(item.id) === String(id));
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ id, name, price: Number(price), image, quantity: 1 });
  }
  saveCart();
  updateCartUI();
  renderCartPage();
  alert(`${name} added to cart!`);
};

window.removeFromCart = function(id) {
  cart = cart.filter(item => String(item.id) !== String(id));
  saveCart();
  updateCartUI();
  renderCartPage();
};

window.updateQuantity = function(id, change) {
  const item = cart.find(item => String(item.id) === String(id));
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    window.removeFromCart(id);
  } else {
    saveCart();
    updateCartUI();
    renderCartPage();
  }
};

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const cartBadge = document.getElementById('cart-count');
  if (cartBadge) cartBadge.textContent = totalItems;

  const floatCartCount = document.getElementById('float-cart-count');
  if (floatCartCount) floatCartCount.textContent = totalItems;

  const cartBar = document.getElementById('cartBar');
  const cartBarText = document.getElementById('vc-cart-summary');
  if (cartBar) {
    if (totalItems > 0) {
      cartBar.style.display = 'flex';
      if (cartBarText) {
        cartBarText.textContent = `${totalItems} item(s) selected - Total: ₦${totalPrice.toLocaleString()}`;
      }
    } else {
      cartBar.style.display = 'none';
    }
  }

  const floatBtn = document.getElementById('floatingCheckoutBtn');
  if (floatBtn) floatBtn.style.display = totalItems > 0 ? 'block' : 'none';

  const finalAmountEl = document.getElementById('finalAmount');
  if (finalAmountEl) finalAmountEl.textContent = totalPrice.toLocaleString();
}

// ===== 6. RENDER CART PAGE (cart.html) =====
function renderCartPage() {
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartDiv = document.getElementById('empty-cart');
  const cartSummaryDiv = document.getElementById('cart-summary');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    if (emptyCartDiv) emptyCartDiv.style.display = 'block';
    if (cartSummaryDiv) cartSummaryDiv.style.display = 'none';
    cartItemsContainer.innerHTML = '';
    return;
  }

  if (emptyCartDiv) emptyCartDiv.style.display = 'none';
  if (cartSummaryDiv) cartSummaryDiv.style.display = 'block';

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;';
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
        <div>
          <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
          <p style="margin: 0; color: #666; font-size: 0.9rem;">₦${item.price.toLocaleString()} each</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <button onclick="updateQuantity('${item.id}', -1)" style="padding: 2px 8px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px;">-</button>
            <span><b>${item.quantity}</b></span>
            <button onclick="updateQuantity('${item.id}', 1)" style="padding: 2px 8px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px;">+</button>
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <p style="font-weight: bold; color: #27ae60; margin: 0 0 8px 0;">₦${itemTotal.toLocaleString()}</p>
        <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #e74c3c; cursor: pointer; text-decoration: underline; font-size: 0.85rem;">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(row);
  });

  const deliveryFee = 2000;
  if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `₦${(subtotal + deliveryFee).toLocaleString()}`;
}

// ===== 7. CHECKOUT MODAL & PAYSTACK CONTROLS =====
window.openCheckoutModal = function() {
  if (cart.length === 0) {
    alert("Your cart is empty. Add items before checking out.");
    return;
  }
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.style.display = 'flex';
};

window.closeCheckoutModal = function() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.style.display = 'none';
};

function initCheckoutModal() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckoutModal);
  }

  const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');
  if (whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      let message = "Hello Victory Catfish Farm, I want to order:\n\n";
      let total = 0;
      cart.forEach(item => {
        message += `• ${item.name} (${item.quantity}x) - ₦${(item.price * item.quantity).toLocaleString()}\n`;
        total += item.price * item.quantity;
      });
      message += `\nSubtotal: ₦${total.toLocaleString()}\nDelivery: ₦2,000\nTotal: ₦${(total + 2000).toLocaleString()}`;
      window.open(`https://wa.me/2348034732228?text=${encodeURIComponent(message)}`, '_blank');
    });
  }

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      const name = document.getElementById('customerName')?.value;
      const email = document.getElementById('customerEmail')?.value;
      const phone = document.getElementById('customerPhone')?.value;

      if (!name || !email || !phone) {
        alert("Please complete all checkout fields.");
        return;
      }

      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 2000;
      const payBtn = document.getElementById('payNowBtn');

      try {
        if (payBtn) payBtn.textContent = "Processing...";

        let response = await fetch(`${API_BASE_URL}/api/payment/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, amount: totalAmount, customerName: name, phone, cart })
        });

        if (response.status === 404) {
          response = await fetch(`${API_BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, amount: totalAmount, customerName: name, phone, cart })
          });
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Server payment route not found or sleeping (${response.status}). Check backend status on Render.`);
        }

        const data = await response.json();
        
        const authUrl = data.status && data.data?.authorization_url ? data.data.authorization_url : data.authorization_url;

        if (authUrl) {
          // Clear cart right before moving to Paystack checkout portal
          window.clearCart();
          window.location.href = authUrl;
        } else {
          alert("Payment initialization response: " + (data.message || "Endpoint returned without authorization URL"));
        }
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Payment Error: " + err.message);
      } finally {
        if (payBtn) payBtn.innerHTML = `Pay Now ₦<span id="finalAmount">${totalAmount.toLocaleString()}</span>`;
      }
    });
  }
}

// ===== REAL-TIME BATCH & INVENTORY TRACKER =====
async function loadBatchTrackerData() {
  const container = document.getElementById('batch-cards-container');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/batch`);
    const contentType = response.headers.get("content-type");

    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      throw new Error(`Failed to load batch records (Status: ${response.status})`);
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "Invalid payload structure");
    }

    renderBatchCards(result.data, container);
  } catch (error) {
    console.error("Batch Telemetry Error:", error);
    container.innerHTML = `<div style="text-align: center; grid-column: 1/-1; color: #e74c3c;">
      <p>Unable to sync live inventory data right now. Please refresh.</p>
    </div>`;
  }
}

function renderBatchCards(batches, container) {
  container.innerHTML = '';

  if (batches.length === 0) {
    container.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No active pond batches recorded yet.</p>`;
    return;
  }

  batches.forEach(batch => {
    const totalBiomassKg = ((batch.currentStockCount * batch.averageWeightGrams) / 1000).toFixed(1);
    const mortalityRate = batch.initialStockCount > 0 
      ? ((batch.mortalityCount / batch.initialStockCount) * 100).toFixed(1) 
      : 0;

    const card = document.createElement('div');
    card.style.cssText = `
      background: #ffffff;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border-left: 5px solid #27ae60;
    `;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 1.2rem; color: #2c3e50;">${batch.pondIdentifier} - ${batch.batchName}</h3>
        <span style="background: #e8f8f5; color: #27ae60; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
          ${batch.stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem; color: #555;">
        <div><b>Current Stock:</b> ${batch.currentStockCount.toLocaleString()} pcs</div>
        <div><b>Total Biomass:</b> ${totalBiomassKg} kg</div>
        <div><b>Avg Weight:</b> ${batch.averageWeightGrams}g</div>
        <div><b>Mortality:</b> ${batch.mortalityCount} pcs (${mortalityRate}%)</div>
        <div><b>Feed Inventory:</b> ${batch.feedInventoryBags} bags</div>
        <div><b>Started:</b> ${new Date(batch.startDate).toLocaleDateString()}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ===== TRACEABILITY & QUALITY VERIFICATION SYSTEM =====
async function verifyBatchCode() {
  const inputField = document.getElementById('traceability-search-input');
  const resultContainer = document.getElementById('traceability-result-container');

  if (!inputField || !resultContainer) return;

  const code = inputField.value.trim().toUpperCase();
  if (!code) {
    resultContainer.innerHTML = `<p style="text-align: center; color: #e74c3c;">Please enter a batch code to verify.</p>`;
    return;
  }

  resultContainer.innerHTML = `<p style="text-align: center; color: #3498db;">Fetching traceability records for <b>${code}</b>...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/traceability/${code}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      resultContainer.innerHTML = `
        <div style="background: #fde8e8; color: #c81e1e; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #f8b4b4;">
          <b>Verification Failed:</b> ${result.message || 'No matching quality record found.'}
        </div>`;
      return;
    }

    const data = result.data;
    const hatch = new Date(data.hatchDate).toLocaleDateString();
    const harvest = new Date(data.harvestDate).toLocaleDateString();

    resultContainer.innerHTML = `
      <div style="background: #ffffff; border: 2px solid #27ae60; border-radius: 10px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #2c3e50;">Batch: ${data.batchCode}</h3>
          <span style="background: #27ae60; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">
            ✓ VERIFIED AUTHENTIC
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem; color: #444;">
          <div><b>Pond Origin:</b> ${data.pondIdentifier}</div>
          <div><b>Species:</b> ${data.species}</div>
          <div><b>Hatch Date:</b> ${hatch}</div>
          <div><b>Harvest Date:</b> ${harvest}</div>
          <div><b>Feed Grade:</b> ${data.feedTypeUsed}</div>
          <div><b>Harvest Biomass:</b> ${data.harvestWeightKg} kg</div>
          <div><b>Water Quality:</b> <span style="color: #27ae60; font-weight: bold;">${data.waterQualityStatus}</span></div>
          <div><b>Organic Certified:</b> ${data.organicCertified ? 'Yes ✅' : 'No ❌'}</div>
          <div><b>Vet Inspection:</b> ${data.veterinaryInspectionPassed ? 'PASSED ✅' : 'FAILED ❌'}</div>
        </div>

        <div style="margin-top: 15px; background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 0.88rem; color: #555;">
          <b>Quality Officer Notes:</b> ${data.notes}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Traceability verification error:", error);
    resultContainer.innerHTML = `
      <div style="background: #fde8e8; color: #c81e1e; padding: 15px; border-radius: 8px; text-align: center;">
        Unable to complete verification right now. Please check your backend connection.
      </div>`;
  }
}

// ===== 8. INTERACTIVE POND DIAGNOSTIC WIZARD (FRONTEND CONTROLLER) =====
async function loadDiagnosticSymptoms() {
  const container = document.getElementById('symptoms-checkbox-grid');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/diagnostic/symptoms`);
    const result = await response.json();

    if (!response.ok || !result.success || result.data.length === 0) {
      container.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1; text-align: center;">Unable to load diagnostic checklist options.</p>`;
      return;
    }

    container.innerHTML = result.data.map(item => `
      <label style="background: #ffffff; padding: 14px 16px; border-radius: 10px; border: 1px solid #cbd5e1; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#16a34a'; this.style.boxShadow='0 4px 10px rgba(22,163,74,0.1)';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.02)';">
        <input type="checkbox" value="${item.symptomKey}" class="diagnostic-symptom-checkbox" style="width: 20px; height: 20px; accent-color: #16a34a; cursor: pointer;" />
        <span style="font-size: 0.95rem; font-weight: 600; color: #1e293b;">${item.symptomName}</span>
      </label>
    `).join('');
  } catch (error) {
    console.error("Error loading symptoms:", error);
    container.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1; text-align: center;">Error connecting to diagnostic service.</p>`;
  }
}

async function runPondDiagnosis() {
  const reportContainer = document.getElementById('diagnostic-report-container');
  const btn = document.getElementById('run-diagnostic-btn');
  if (!reportContainer) return;

  const checkboxes = document.querySelectorAll('.diagnostic-symptom-checkbox:checked');
  const selectedKeys = Array.from(checkboxes).map(cb => cb.value);

  if (selectedKeys.length === 0) {
    reportContainer.innerHTML = `
      <div style="background: #fef2f2; color: #991b1b; padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #fecaca; font-weight: 600;">
        ⚠️ Please check at least one symptom observed in your pond to generate an analysis.
      </div>`;
    return;
  }

  if (btn) btn.textContent = "⌛ Analyzing Symptoms...";
  reportContainer.innerHTML = `<p style="text-align: center; color: #2563eb; font-weight: 600;">Evaluating pond parameters and preparing diagnostic action report...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/diagnostic/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedKeys })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      reportContainer.innerHTML = `
        <div style="background: #fef2f2; color: #991b1b; padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #fecaca;">
          ${result.message || 'Diagnostic analysis failed.'}
        </div>`;
      return;
    }

    const { riskLevel, possibleCauses, recommendedActions } = result.data;

    let badgeBg = '#dcfce7';
    let badgeColor = '#15803d';
    let borderColor = '#22c55e';

    if (riskLevel === 'Medium') {
      badgeBg = '#fef3c7';
      badgeColor = '#b45309';
      borderColor = '#f59e0b';
    } else if (riskLevel === 'High' || riskLevel === 'Critical') {
      badgeBg = '#fee2e2';
      badgeColor = '#b91c1c';
      borderColor = '#ef4444';
    }

    reportContainer.innerHTML = `
      <div style="background: #ffffff; border: 2px solid ${borderColor}; border-radius: 12px; padding: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.06);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0; color: #0f172a; font-size: 1.3rem;">📋 Diagnostic Report Summary</h3>
            <small style="color: #64748b;">Generated from Victory Farm Knowledge Base</small>
          </div>
          <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 8px 16px; border-radius: 30px; font-weight: 800; font-size: 0.85rem; letter-spacing: 0.5px;">
            RISK LEVEL: ${riskLevel.toUpperCase()}
          </span>
        </div>

        <div style="margin-bottom: 20px; background: #f8fafc; padding: 18px; border-radius: 10px;">
          <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 10px; font-size: 1.05rem;">⚠️ Potential Underlying Causes:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6;">
            ${possibleCauses.map(c => `<li style="margin-bottom: 6px;"><b>${c}</b></li>`).join('')}
          </ul>
        </div>

        <div style="background: #f0fdf4; padding: 18px; border-radius: 10px; border: 1px solid #bbf7d0;">
          <h4 style="color: #166534; margin-top: 0; margin-bottom: 10px; font-size: 1.05rem;">🛠️ Recommended Remedial Actions:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #14532d; font-weight: 600; line-height: 1.6;">
            ${recommendedActions.map(a => `<li style="margin-bottom: 8px;">${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Diagnostic execution error:", error);
    reportContainer.innerHTML = `
      <div style="background: #fef2f2; color: #991b1b; padding: 16px; border-radius: 10px; text-align: center;">
        Unable to complete diagnosis. Check your network or server status.
      </div>`;
  } finally {
    if (btn) btn.textContent = "🔬 Analyze Symptoms & Generate Report";
  }
}

// Auto-load batch tracker on page load
document.addEventListener('DOMContentLoaded', () => {
  loadBatchTrackerData();
});
