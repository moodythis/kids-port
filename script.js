// Global Variables
let cart = []
let customers = []
let packages = []
let sales = []
let selectedPaymentMethod = ""
let selectedCustomer = null

// Load data from localStorage
function loadDataFromStorage() {
  customers = JSON.parse(localStorage.getItem("customers") || "[]")
  packages = JSON.parse(localStorage.getItem("packages") || "[]")
  sales = JSON.parse(localStorage.getItem("sales") || "[]")

  // Add default packages if none exist
  if (packages.length === 0) {
    packages = [
      {
        id: "1",
        packageName: "باقة الساعة الواحدة",
        price: 3.0,
        duration: 60,
        packageDescription: "لعب حر لمدة ساعة واحدة",
        color: "bg-blue",
        packageType: "time",
        active: true,
      },
      {
        id: "2",
        packageName: "باقة الساعتين",
        price: 5.0,
        duration: 120,
        packageDescription: "لعب حر لمدة ساعتين",
        color: "bg-green",
        packageType: "time",
        active: true,
      },
      {
        id: "3",
        packageName: "باقة نصف يوم",
        price: 8.0,
        duration: 240,
        packageDescription: "لعب حر لمدة 4 ساعات",
        color: "bg-purple",
        packageType: "time",
        active: true,
      },
      {
        id: "4",
        packageName: "باقة اليوم الكامل",
        price: 12.0,
        duration: 480,
        packageDescription: "لعب حر طوال اليوم",
        color: "bg-orange",
        packageType: "time",
        active: true,
      },
      {
        id: "5",
        packageName: "باقة الحفلة",
        price: 25.0,
        duration: 180,
        packageDescription: "حجز غرفة حفلات لمدة 3 ساعات",
        color: "bg-pink",
        packageType: "party",
        active: true,
      },
      {
        id: "6",
        packageName: "وجبة سعيدة",
        price: 4.5,
        duration: 0,
        packageDescription: "وجبة أطفال مع لعبة",
        color: "bg-yellow",
        packageType: "food",
        active: true,
      },
    ]
    localStorage.setItem("packages", JSON.stringify(packages))
  }

  // Add default customers if none exist
  if (customers.length === 0) {
    customers = [
      { id: "1", customerName: "أحمد محمد", customerPhone: "33123456", visits: 5, lastVisit: "2024-01-15" },
      { id: "2", customerName: "فاطمة علي", customerPhone: "36789012", visits: 3, lastVisit: "2024-01-10" },
      { id: "3", customerName: "محمد سالم", customerPhone: "39456789", visits: 8, lastVisit: "2024-01-20" },
      { id: "4", customerName: "نورا أحمد", customerPhone: "33567890", visits: 2, lastVisit: "2024-01-12" },
    ]
    localStorage.setItem("customers", JSON.stringify(customers))
  }
}

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-btn")
const tabContents = document.querySelectorAll(".tab-content")
const productsGrid = document.getElementById("productsGrid")
const cartItems = document.getElementById("cartItems")
const cartTotal = document.getElementById("cartTotal")
const totalAmount = document.getElementById("totalAmount")
const customerSelect = document.getElementById("customerSelect")
const paymentButtons = document.querySelectorAll(".payment-btn")
const cashInput = document.getElementById("cashInput")
const cashReceived = document.getElementById("cashReceived")
const changeAmount = document.getElementById("changeAmount")
const processSaleBtn = document.getElementById("processSale")
const ticketModal = document.getElementById("ticketModal")
const ticketContent = document.getElementById("ticketContent")
const closeModal = document.getElementById("closeModal")
const printTicket = document.getElementById("printTicket")

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage()
  initializeTabs()
  loadProducts()
  loadCustomers()
  loadPackages()
  updateCart()
  updateReports()
  setupEventListeners()
})

// Tab Management
function initializeTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab")
      switchTab(tabId)
    })
  })
}

function switchTab(tabId) {
  // Update tab buttons
  tabButtons.forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active")

  // Update tab content
  tabContents.forEach((content) => content.classList.remove("active"))
  document.getElementById(tabId).classList.add("active")

  // Update reports when switching to reports tab
  if (tabId === "reports") {
    updateReports()
  }
}

// Product Management
function loadProducts() {
  if (!productsGrid) return

  productsGrid.innerHTML = ""
  packages
    .filter((pkg) => pkg.active !== false)
    .forEach((pkg) => {
      const productCard = createProductCard(pkg)
      productsGrid.appendChild(productCard)
    })
}

function createProductCard(pkg) {
  const card = document.createElement("div")
  card.className = "product-card"
  card.onclick = () => addToCart(pkg)

  card.innerHTML = `
        <div class="product-color ${pkg.color}"></div>
        <h4>${pkg.packageName}</h4>
        <p>${pkg.packageDescription}</p>
        <div class="product-footer">
            <span class="product-price">${pkg.price.toFixed(3)} د.ب</span>
            ${
              pkg.duration > 0
                ? `
                <span class="product-duration">
                    <i class="fas fa-clock"></i>
                    ${pkg.duration} دقيقة
                </span>
            `
                : ""
            }
        </div>
    `

  return card
}

// Cart Management
function addToCart(pkg) {
  const existingItem = cart.find((item) => item.package.id === pkg.id)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ package: pkg, quantity: 1 })
  }
  updateCart()
  updateProcessSaleButton()
}

function removeFromCart(packageId) {
  cart = cart.filter((item) => item.package.id !== packageId)
  updateCart()
  updateProcessSaleButton()
}

function updateQuantity(packageId, quantity) {
  if (quantity === 0) {
    removeFromCart(packageId)
  } else {
    const item = cart.find((item) => item.package.id === packageId)
    if (item) {
      item.quantity = quantity
    }
  }
  updateCart()
  updateProcessSaleButton()
}

function updateCart() {
  if (!cartItems) return

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>'
    if (cartTotal) cartTotal.style.display = "none"
  } else {
    cartItems.innerHTML = ""
    cart.forEach((item) => {
      const cartItem = createCartItem(item)
      cartItems.appendChild(cartItem)
    })
    if (cartTotal) cartTotal.style.display = "block"
    if (totalAmount) totalAmount.textContent = `${getCartTotal().toFixed(3)} د.ب`
  }
}

function createCartItem(item) {
  const div = document.createElement("div")
  div.className = "cart-item"

  div.innerHTML = `
        <div class="cart-item-info">
            <h4>${item.package.packageName}</h4>
            <p>${item.package.price.toFixed(3)} د.ب</p>
        </div>
        <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQuantity('${item.package.id}', ${item.quantity - 1})">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.package.id}', ${item.quantity + 1})">+</button>
        </div>
    `

  return div
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.package.price * item.quantity, 0)
}

// Customer Management
async function loadCustomers() {
  try {
    const response = await fetch('customers.php?action=get');
    const result = await response.json();
    
    if (result.success) {
      customers = result.customers;

      // Load customers in select dropdown
      if (customerSelect) {
        customerSelect.innerHTML = '<option value="">اختر عميل (اختياري)</option>';
        customers.forEach(customer => {
          const option = document.createElement('option');
          option.value = customer.id;
          option.textContent = `${customer.customerName} - ${customer.customerPhone}`;
          customerSelect.appendChild(option);
        });
      }

      // Load customers table
      const customersTable = document.getElementById('customersTable');
      if (customersTable) {
        customersTable.innerHTML = '';
        customers.forEach(customer => {
          const row = createCustomerRow(customer);
          customersTable.appendChild(row);
        });
      }
    } else {
      console.error('Failed to load customers:', result.error);
    }
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

function createCustomerRow(customer) {
  const tr = document.createElement("tr")
  tr.innerHTML = `
        <td>${customer.customerName}</td>
        <td>${customer.customerPhone}</td>
        <td><span class="badge">${customer.visits || 0}</span></td>
        <td>${customer.lastVisit || "لا توجد زيارات"}</td>
        <td><button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">تعديل</button></td>
    `
  return tr
}

// Payment Management
function setupEventListeners() {
  // Payment method selection
  if (paymentButtons) {
    paymentButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPaymentMethod = btn.getAttribute("data-method")
        updatePaymentButtons()
        updateCashInput()
        updateProcessSaleButton()
      })
    })
  }

  // Customer selection
  if (customerSelect) {
    customerSelect.addEventListener("change", (e) => {
      const customerId = e.target.value
      selectedCustomer = customers.find((c) => c.id === customerId) || null
    })
  }

  // Cash input
  if (cashReceived) {
    cashReceived.addEventListener("input", () => {
      updateChangeAmount()
      updateProcessSaleButton()
    })
  }

  // Process sale
  if (processSaleBtn) {
    processSaleBtn.addEventListener("click", processSale)
  }

  // Add Customer button
  const addCustomerBtn = document.getElementById("addCustomer");
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener("click", () => {
      window.location.href = "add-customer.html";
    });
  }

  // Add Package button
  const addPackageBtn = document.getElementById("addPackage");
  if (addPackageBtn) {
    addPackageBtn.addEventListener("click", () => {
      window.location.href = "add-package.html";
    });
  }

  // Modal controls
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      ticketModal.classList.remove("show")
    })
  }

  if (printTicket) {
    printTicket.addEventListener("click", () => {
      window.print()
      ticketModal.classList.remove("show")
    })
  }

  // Close modal when clicking outside
  if (ticketModal) {
    ticketModal.addEventListener("click", (e) => {
      if (e.target === ticketModal) {
        ticketModal.classList.remove("show")
      }
    })
  }
}

function updatePaymentButtons() {
  if (!paymentButtons) return

  paymentButtons.forEach((btn) => {
    btn.classList.remove("active")
    if (btn.getAttribute("data-method") === selectedPaymentMethod) {
      btn.classList.add("active")
    }
  })
}

function updateCashInput() {
  if (!cashInput) return

  if (selectedPaymentMethod === "cash") {
    cashInput.style.display = "block"
  } else {
    cashInput.style.display = "none"
  }
}

function updateChangeAmount() {
  if (!changeAmount || !cashReceived) return

  const total = getCartTotal()
  const received = Number.parseFloat(cashReceived.value) || 0
  const change = received - total

  if (received > 0 && change >= 0) {
    changeAmount.textContent = `الباقي: ${change.toFixed(3)} د.ب`
    changeAmount.style.display = "block"
  } else {
    changeAmount.style.display = "none"
  }
}

function updateProcessSaleButton() {
  if (!processSaleBtn) return

  const hasItems = cart.length > 0
  const hasPayment = selectedPaymentMethod !== ""
  const validCash =
    selectedPaymentMethod !== "cash" || (Number.parseFloat(cashReceived?.value || "0") || 0) >= getCartTotal()

  processSaleBtn.disabled = !(hasItems && hasPayment && validCash)
}

// Sales Processing
async function processSale() {
  if (cart.length === 0) return;

  const ticketNumber = `TK${Date.now().toString().slice(-6)}`;
  const newSale = {
    items: [...cart],
    total: getCartTotal(),
    paymentMethod: selectedPaymentMethod,
    customer: selectedCustomer,
    timestamp: new Date().toISOString(),
    ticketNumber: ticketNumber,
  };

  try {
    const response = await fetch('sales.php?action=add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSale)
    });

    const result = await response.json();
    
    if (result.success) {
      showTicket(newSale);

      // Reset form
      cart = [];
      selectedPaymentMethod = "";
      selectedCustomer = null;
      if (cashReceived) cashReceived.value = "";
      if (customerSelect) customerSelect.value = "";

      updateCart();
      updatePaymentButtons();
      updateCashInput();
      updateProcessSaleButton();
      loadCustomers(); // Refresh customers list to update visits
      updateReports();
    } else {
      alert('Error: ' + (result.error || 'Failed to process sale'));
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function showTicket(sale) {
  if (!ticketModal || !ticketContent) return

  const ticket = createTicketContent(sale)
  ticketContent.innerHTML = ticket
  ticketModal.classList.add("show")
}

function createTicketContent(sale) {
  const customerInfo = sale.customer ? `<div class="ticket-customer">العميل: ${sale.customer.customerName}</div>` : ""

  const itemsHtml = sale.items
    .map(
      (item) => `
        <div class="ticket-item">
            <span>${item.package.packageName} × ${item.quantity}</span>
            <span>${(item.package.price * item.quantity).toFixed(3)} د.ب</span>
        </div>
    `,
    )
    .join("")

  return `
        <div class="ticket print-area">
            <div class="ticket-header">
                <h3>🏰 مرفأ الأطفال</h3>
                <div class="ticket-number">رقم التذكرة: ${sale.ticketNumber}</div>
                <div class="ticket-date">${new Date(sale.timestamp).toLocaleString("ar-BH")}</div>
            </div>
            
            <div class="ticket-items">
                ${itemsHtml}
                <div class="ticket-total">
                    <span>المجموع:</span>
                    <span>${sale.total.toFixed(3)} د.ب</span>
                </div>
            </div>
            
            ${customerInfo}
            
            <div class="ticket-instructions">
                <p>تعليمات مهمة:</p>
                <p>• احتفظ بالتذكرة طوال فترة الزيارة</p>
                <p>• يُرجى اتباع قواعد السلامة</p>
                <p>• نتمنى لكم وقتاً ممتعاً! 🎉</p>
            </div>
        </div>
    `
}

// Reports
function updateReports() {
  const todaysSales = getTodaysSales()
  const todaysRevenue = getTodaysRevenue()
  const averageTicket = todaysSales.length > 0 ? todaysRevenue / todaysSales.length : 0

  // Update stats
  const todayRevenueEl = document.getElementById("todayRevenue")
  const todaySalesEl = document.getElementById("todaySales")
  const todayVisitorsEl = document.getElementById("todayVisitors")
  const averageTicketEl = document.getElementById("averageTicket")

  if (todayRevenueEl) todayRevenueEl.textContent = `${todaysRevenue.toFixed(3)} د.ب`
  if (todaySalesEl) todaySalesEl.textContent = `${todaysSales.length} عملية بيع`
  if (todayVisitorsEl) todayVisitorsEl.textContent = todaysSales.length.toString()
  if (averageTicketEl) averageTicketEl.textContent = `${averageTicket.toFixed(3)} د.ب`

  // Update sales table
  const salesTable = document.getElementById("salesTable")
  if (salesTable) {
    salesTable.innerHTML = ""
    sales
      .slice(-10)
      .reverse()
      .forEach((sale) => {
        const row = createSaleRow(sale)
        salesTable.appendChild(row)
      })
  }
}

function createSaleRow(sale) {
  const tr = document.createElement("tr")
  const paymentMethodText = {
    cash: "نقدي",
    card: "بطاقة",
    transfer: "تحويل",
  }

  tr.innerHTML = `
        <td>${sale.ticketNumber}</td>
        <td>${sale.customer?.customerName || "زائر"}</td>
        <td>${sale.total.toFixed(3)} د.ب</td>
        <td><span class="badge">${paymentMethodText[sale.paymentMethod]}</span></td>
        <td>${new Date(sale.timestamp).toLocaleString("ar-BH")}</td>
    `
  return tr
}

function getTodaysSales() {
  const today = new Date().toDateString()
  return sales.filter((sale) => new Date(sale.timestamp).toDateString() === today)
}

function getTodaysRevenue() {
  return getTodaysSales().reduce((total, sale) => total + sale.total, 0)
}

// Packages Management
async function loadPackages() {
  try {
    const response = await fetch('packages.php?action=get');
    const result = await response.json();
    
    if (result.success) {
      packages = result.packages;

      // Load packages in products grid
      if (productsGrid) {
        productsGrid.innerHTML = '';
        packages
          .filter(pkg => pkg.active !== false)
          .forEach(pkg => {
            const productCard = createProductCard(pkg);
            productsGrid.appendChild(productCard);
          });
      }

      // Load packages in packages grid
      const packagesGrid = document.getElementById('packagesGrid');
      if (packagesGrid) {
        packagesGrid.innerHTML = '';
        packages.forEach(pkg => {
          const packageCard = createPackageCard(pkg);
          packagesGrid.appendChild(packageCard);
        });
      }
    } else {
      console.error('Failed to load packages:', result.error);
    }
  } catch (error) {
    console.error('Error loading packages:', error);
  }
}

function createPackageCard(pkg) {
  const card = document.createElement("div")
  card.className = "card"

  card.innerHTML = `
        <div class="card-content">
            <div class="product-color ${pkg.color}"></div>
            <h4 style="margin-bottom: 8px;">${pkg.packageName}</h4>
            <p style="color: #6b7280; margin-bottom: 15px;">${pkg.packageDescription}</p>
            <div class="product-footer" style="margin-bottom: 15px;">
                <span class="product-price">${pkg.price.toFixed(3)} د.ب</span>
                ${
                  pkg.duration > 0
                    ? `
                    <span class="product-duration">
                        <i class="fas fa-clock"></i>
                        ${pkg.duration} دقيقة
                    </span>
                `
                    : ""
                }
            </div>
            <button class="btn-secondary" style="width: 100%; padding: 8px;">تعديل الباقة</button>
        </div>
    `

  return card
}

// Utility Functions
function formatCurrency(amount) {
  return `${amount.toFixed(3)} د.ب`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ar-BH")
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("ar-BH")
}
