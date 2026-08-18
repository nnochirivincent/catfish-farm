// Global Cart Array
let cart = [];

// Base API URL
const API_BASE_URL = 'https://victory-backend-vt8k.onrender.com';

// Wait for DOM to load fully
document.addEventListener('DOMContentLoaded', () => {
  initFeedCalculator();
  initProfitabilityEstimator();
  initMobileMenu();
  loadProductsFromBackend();
  initCheckoutModal();
});

// ===== 1. SMART FEED CALCULATOR =====
function initFeedCalculator() {
  const calculateBtn = document.getElementById('calc-feed-btn');
  if (!calculateBtn) return;

  calculateBtn.addEventListener('click', () => {
    const totalFish = parseFloat(document.getElementById('stock-count')?.value);
    const avgWeight = parseFloat(document.getElementById('avg-weight')?.value);
    const species = document.getElementById('species')?.value;

    if (!totalFish || !avgWeight || totalFish <= 0 || avgWeight <= 0) {
      alert("Please enter valid positive numbers for total fish and average weight.");
      return;
    }

    // Determine stage & feeding rate based on average weight (grams)
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

    // Calculations
    const totalBiomassKg = (totalFish * avgWeight) / 1000;
    const dailyFeedKg = (totalBiomassKg * feedingRatePercent) / 100;
    const monthlyFeedKg = dailyFeedKg * 30;
    const bags30Days = Math.ceil(monthlyFeedKg / 15);

    // Update HTML Outputs
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
    if (resultsCard) {
      resultsCard.classList.remove('hidden');
      resultsCard.style.display = 'block';
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

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Calculation failed on backend');
      }

      const m = resData.data;

      // Safe Element Assigner
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

      if (save) {
        alert("Batch estimate saved successfully to database! 🚀");
      }

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
    hamburger.addEventListener('click', () => {
      navbar.classList.toggle('active');
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
  }
}

function renderProducts(products, container) {
  container.innerHTML = '';
  if (!products || products.length === 0) {
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
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItems;
}

// ===== 6. CHECKOUT MODAL =====
function initCheckoutModal() {
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('customerName')?.value;
      const email = document.getElementById('customerEmail')?.value;
      const phone = document.getElementById('customerPhone')?.value;

      if (!name || !email || !phone) {
        alert("Please complete all checkout fields.");
        return;
      }

      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, amount: totalAmount, customerName: name, phone, cart })
        });

        const data = await response.json();
        if (data.status && data.data.authorization_url) {
          window.location.href = data.data.authorization_url;
        } else {
          alert("Payment initialization failed: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        alert("Payment Error: " + err.message);
      }
    });
  }
}
