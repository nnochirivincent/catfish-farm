// Global Cart Array
let cart = [];

// Base API URL
const API_BASE_URL = 'https://victory-backend-vt8k.onrender.com';

// Wait for DOM to load fully
document.addEventListener('DOMContentLoaded', () => {
  initFeedCalculator();
  initProfitabilityEstimator(); // Initialized Profitability Estimator
  initMobileMenu();
  loadProductsFromBackend();
  initCheckoutModal();
});

// ===== 1. SMART FEED CALCULATOR =====
function initFeedCalculator() {
  const calculateBtn = document.getElementById('calculate-feed-btn');
  if (!calculateBtn) return;

  calculateBtn.addEventListener('click', () => {
    const totalFish = parseFloat(document.getElementById('calc-total-fish')?.value);
    const avgWeight = parseFloat(document.getElementById('calc-avg-weight')?.value);
    const growthStage = document.getElementById('calc-stage')?.value;

    if (!totalFish || !avgWeight || totalFish <= 0 || avgWeight <= 0) {
      alert("Please enter valid positive numbers for total fish and average weight.");
      return;
    }

    // Determine Feeding Rate percentage based on growth stage
    let feedingRatePercent = 0;
    let pelletSize = '';
    let feedingFrequency = '';

    if (growthStage === 'fry') {
      feedingRatePercent = 8.0;
      pelletSize = '0.5mm - 1.2mm (Powder / Micro Crumble)';
      feedingFrequency = '4 - 6 times daily';
    } else if (growthStage === 'fingerling') {
      feedingRatePercent = 5.0;
      pelletSize = '1.5mm - 2.0mm Pellets';
      feedingFrequency = '3 - 4 times daily';
    } else if (growthStage === 'juvenile') {
      feedingRatePercent = 3.5;
      pelletSize = '3.0mm - 4.0mm Pellets';
      feedingFrequency = '2 - 3 times daily';
    } else if (growthStage === 'growout') {
      feedingRatePercent = 2.0;
      pelletSize = '6.0mm - 9.0mm Pellets';
      feedingFrequency = '1 - 2 times daily';
    }

    // Calculations
    const totalBiomassKg = (totalFish * avgWeight) / 1000; // grams to kg
    const dailyFeedKg = (totalBiomassKg * feedingRatePercent) / 100;
    const monthlyFeedKg = dailyFeedKg * 30;
    const bags30Days = Math.ceil(monthlyFeedKg / 15); // 15kg per bag standard

    // Render Results
    document.getElementById('res-biomass').textContent = `${totalBiomassKg.toFixed(2)} kg`;
    document.getElementById('res-daily-feed').textContent = `${dailyFeedKg.toFixed(2)} kg / day`;
    document.getElementById('res-monthly-feed').textContent = `${monthlyFeedKg.toFixed(1)} kg (${bags30Days} bags/month)`;
    document.getElementById('res-pellet-size').textContent = pelletSize;
    document.getElementById('res-frequency').textContent = feedingFrequency;

    const resultBox = document.getElementById('calculator-results');
    if (resultBox) {
      resultBox.style.display = 'block';
    }
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
      alert("Please fill in all mandatory numerical fields.");
      return;
    }

    try {
      if (save && saveBtn) saveBtn.textContent = "Saving...";

      const response = await fetch(`${API_BASE_URL}/api/estimator/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, saveCalculation: save })
      });

      const resData = await response.json();
      if (!resData.success) throw new Error(resData.message || 'Calculation failed');

      const m = resData.data;

      // Render Outputs
      document.getElementById('res-surviving-fish').textContent = `${m.survivingFish.toLocaleString()} pcs`;
      document.getElementById('res-total-biomass').textContent = `${m.totalBiomassKg.toLocaleString()} kg`;
      document.getElementById('res-total-bags').textContent = `${m.totalFeedBagsNeeded} bags (${(m.totalFeedBagsNeeded * 15).toLocaleString()}kg)`;
      document.getElementById('res-total-cost').textContent = `₦${m.totalProductionCost.toLocaleString()}`;
      document.getElementById('res-revenue').textContent = `₦${m.projectedRevenue.toLocaleString()}`;
      document.getElementById('res-net-profit').textContent = `₦${m.projectedNetProfit.toLocaleString()}`;
      document.getElementById('res-roi').textContent = `${m.roiPercent}%`;
      document.getElementById('res-margin').textContent = `${m.profitMarginPercent}%`;

      if (save) {
        alert("Batch estimate saved successfully to database! 🚀");
      }

    } catch (err) {
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
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// ===== 4. LOAD PRODUCTS FROM BACKEND =====
async function loadProductsFromBackend() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');

    const products = await response.json();
    renderProducts(products, container);
  } catch (error) {
    console.error('Error fetching products:', error);
    container.innerHTML = `<p style="color: red; text-align: center;">Unable to load products. Please refresh or try again later.</p>`;
  }
}

// Render Products Grid
function renderProducts(products, container) {
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `<p style="text-align: center;">No products available at the moment.</p>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="description">${product.description || ''}</p>
        <div class="product-bottom">
          <span class="price">₦${product.price.toLocaleString()}</span>
          <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ===== 5. SHOPPING CART MANAGEMENT =====
function addToCart(id, name, price, image) {
  const existingIndex = cart.findIndex(item => item.id === id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }

  updateCartUI();
  alert(`${name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    updateCartUI();
  }
}

function updateCartUI() {
  const cartBadge = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalElement = document.getElementById('cart-total');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartBadge) cartBadge.textContent = totalItems;
  if (cartTotalElement) cartTotalElement.textContent = `₦${totalPrice.toLocaleString()}`;

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p>Your cart is empty.</p>`;
      return;
    }

    cart.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';
      itemRow.style.display = 'flex';
      itemRow.style.alignItems = 'center';
      itemRow.style.justifyContent = 'space-between';
      itemRow.style.marginBottom = '10px';

      itemRow.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div>₦${item.price.toLocaleString()} x ${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}</div>
        </div>
        <div style="display: flex; gap: 5px; align-items: center;">
          <button onclick="updateQuantity('${item.id}', -1)">-</button>

          <span>${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', 1)">+</button>
          <button onclick="removeFromCart('${item.id}')" style="background: red; color: white; border: none; border-radius: 3px; cursor: pointer;">&times;</button>
        </div>
      `;

      cartItemsContainer.appendChild(itemRow);
    });
  }
}

// ===== 6. CHECKOUT & PAYMENT MODAL =====
function initCheckoutModal() {
  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('checkout-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const checkoutForm = document.getElementById('checkout-form');

  if (checkoutBtn && modal) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      modal.style.display = 'block';
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('customer-name')?.value;
      const email = document.getElementById('customer-email')?.value;
      const phone = document.getElementById('customer-phone')?.value;

      if (!name || !email || !phone) {
        alert("Please complete all checkout fields.");
        return;
      }

      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            amount: totalAmount,
            customerName: name,
            phone,
            cart
          })
        });

        const data = await response.json();

        if (data.status && data.data.authorization_url) {
          // Redirect user to Paystack checkout URL
          window.location.href = data.data.authorization_url;
        } else {
          alert("Payment initialization failed: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Payment Error: " + err.message);
      }
    });
  }
}
