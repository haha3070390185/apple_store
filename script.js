// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 应用状态
const App = {
    currentUser: null,
    sessionId: null,
    cart: [],
    products: []
};

// DOM元素
const elements = {
    // 页面
    loginPage: document.getElementById('login-page'),
    registerPage: document.getElementById('register-page'),
    storePage: document.getElementById('store-page'),
    cartPage: document.getElementById('cart-page'),
    checkoutPage: document.getElementById('checkout-page'),
    successPage: document.getElementById('success-page'),
    
    // 表单
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    checkoutForm: document.getElementById('checkout-form'),
    
    // 输入框
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    registerName: document.getElementById('register-name'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerConfirmPassword: document.getElementById('register-confirm-password'),
    shippingName: document.getElementById('shipping-name'),
    shippingPhone: document.getElementById('shipping-phone'),
    shippingAddress: document.getElementById('shipping-address'),
    
    // 链接和按钮
    goToRegister: document.getElementById('go-to-register'),
    goToLogin: document.getElementById('go-to-login'),
    logoutBtn: document.getElementById('logout-btn'),
    cartLogoutBtn: document.getElementById('cart-logout-btn'),
    checkoutLogoutBtn: document.getElementById('checkout-logout-btn'),
    successLogoutBtn: document.getElementById('success-logout-btn'),
    goShopping: document.getElementById('go-shopping'),
    checkoutBtn: document.getElementById('checkout-btn'),
    continueShopping: document.getElementById('continue-shopping'),
    
    // 显示区域
    productsGrid: document.getElementById('products-grid'),
    cartItems: document.getElementById('cart-items'),
    cartEmpty: document.getElementById('cart-empty'),
    cartSummary: document.getElementById('cart-summary'),
    totalItems: document.getElementById('total-items'),
    totalPrice: document.getElementById('total-price'),
    checkoutItems: document.getElementById('checkout-items'),
    checkoutTotalItems: document.getElementById('checkout-total-items'),
    checkoutTotalPrice: document.getElementById('checkout-total-price'),
    userName: document.getElementById('user-name'),
    cartUserName: document.getElementById('cart-user-name'),
    checkoutUserName: document.getElementById('checkout-user-name'),
    successUserName: document.getElementById('success-user-name'),
    message: document.getElementById('message'),
    
    // 导航链接
    navLinks: document.querySelectorAll('.nav-link')
};

// API请求工具函数
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    // 如果有sessionId，添加到请求头
    if (App.sessionId) {
        defaultHeaders['Authorization'] = App.sessionId;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求错误:', error);
        return {
            success: false,
            message: '网络错误，请稍后重试'
        };
    }
}

// 工具函数
function showMessage(text, type = 'success') {
    elements.message.textContent = text;
    elements.message.className = `message ${type} show`;
    
    setTimeout(() => {
        elements.message.classList.remove('show');
    }, 3000);
}

function showPage(pageName) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 显示指定页面
    switch(pageName) {
        case 'login':
            elements.loginPage.classList.add('active');
            break;
        case 'register':
            elements.registerPage.classList.add('active');
            break;
        case 'store':
            elements.storePage.classList.add('active');
            updateUserName();
            loadProducts();
            break;
        case 'cart':
            elements.cartPage.classList.add('active');
            updateUserName();
            loadCart();
            break;
        case 'checkout':
            elements.checkoutPage.classList.add('active');
            updateUserName();
            renderCheckout();
            break;
        case 'success':
            elements.successPage.classList.add('active');
            updateUserName();
            break;
    }
    
    // 更新导航链接状态
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
}

function updateUserName() {
    if (App.currentUser) {
        elements.userName.textContent = App.currentUser.name;
        elements.cartUserName.textContent = App.currentUser.name;
        elements.checkoutUserName.textContent = App.currentUser.name;
        elements.successUserName.textContent = App.currentUser.name;
    }
}

function saveSession() {
    if (App.currentUser && App.sessionId) {
        localStorage.setItem('currentUser', JSON.stringify(App.currentUser));
        localStorage.setItem('sessionId', App.sessionId);
    }
}

function clearSession() {
    App.currentUser = null;
    App.sessionId = null;
    App.cart = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionId');
}

function loadSession() {
    const savedUser = localStorage.getItem('currentUser');
    const savedSessionId = localStorage.getItem('sessionId');
    
    if (savedUser && savedSessionId) {
        App.currentUser = JSON.parse(savedUser);
        App.sessionId = savedSessionId;
        return true;
    }
    return false;
}

// 用户认证
async function registerUser(name, email, password) {
    const response = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    
    if (response.success) {
        showMessage(response.message);
        return true;
    } else {
        showMessage(response.message, 'error');
        return false;
    }
}

async function loginUser(email, password) {
    const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
        App.currentUser = response.user;
        App.sessionId = response.sessionId;
        saveSession();
        showMessage(response.message);
        return true;
    } else {
        showMessage(response.message, 'error');
        return false;
    }
}

async function logoutUser() {
    const response = await apiRequest('/logout', {
        method: 'POST'
    });
    
    if (response.success) {
        showMessage(response.message);
    } else {
        showMessage(response.message, 'error');
    }
    
    clearSession();
    showPage('login');
}

async function checkLoginStatus() {
    if (loadSession()) {
        // 验证session是否有效
        const response = await apiRequest('/user');
        
        if (response.success) {
            App.currentUser = response.user;
            return true;
        } else {
            clearSession();
            return false;
        }
    }
    return false;
}

// 商品功能
async function loadProducts() {
    const response = await apiRequest('/products');
    
    if (response.success) {
        App.products = response.products;
        renderProducts();
    } else {
        showMessage('加载商品失败', 'error');
    }
}

// 购物车功能
async function loadCart() {
    const response = await apiRequest('/cart');
    
    if (response.success) {
        App.cart = response.cart;
        renderCart();
    } else {
        // 如果是未登录错误，跳转到登录页
        if (response.message === '请先登录' || response.message === '登录已过期，请重新登录') {
            showMessage(response.message, 'error');
            clearSession();
            showPage('login');
        } else {
            showMessage('加载购物车失败', 'error');
        }
    }
}

async function addToCart(productId) {
    // 检查用户是否登录
    if (!App.currentUser || !App.sessionId) {
        showMessage('请先登录', 'error');
        showPage('login');
        return;
    }
    
    const response = await apiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId })
    });
    
    if (response.success) {
        App.cart = response.cart;
        showMessage(response.message);
    } else {
        showMessage(response.message, 'error');
    }
}

async function removeFromCart(productId) {
    const response = await apiRequest(`/cart/remove/${productId}`, {
        method: 'DELETE'
    });
    
    if (response.success) {
        App.cart = response.cart;
        showMessage(response.message);
        renderCart();
    } else {
        showMessage(response.message, 'error');
    }
}

async function updateCartQuantity(productId, change) {
    const response = await apiRequest('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({ productId, change })
    });
    
    if (response.success) {
        App.cart = response.cart;
        renderCart();
    } else {
        showMessage(response.message, 'error');
    }
}

function calculateCartTotal() {
    let totalItems = 0;
    let totalPrice = 0;
    
    App.cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });
    
    return {
        totalItems,
        totalPrice
    };
}

// 结算功能
async function checkout(shippingName, shippingPhone, shippingAddress) {
    const response = await apiRequest('/checkout', {
        method: 'POST',
        body: JSON.stringify({ 
            shippingName, 
            shippingPhone, 
            shippingAddress 
        })
    });
    
    if (response.success) {
        App.cart = [];
        showMessage(response.message);
        return true;
    } else {
        showMessage(response.message, 'error');
        return false;
    }
}

// 渲染功能
function renderProducts() {
    elements.productsGrid.innerHTML = '';
    
    App.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">¥${product.price.toLocaleString()}</div>
                <button class="add-to-cart-btn" data-id="${product.id}">加入购物车</button>
            </div>
        `;
        elements.productsGrid.appendChild(productCard);
    });
    
    // 为加入购物车按钮添加事件监听
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });
}

function renderCart() {
    elements.cartItems.innerHTML = '';
    
    if (App.cart.length === 0) {
        elements.cartEmpty.style.display = 'block';
        elements.cartSummary.style.display = 'none';
        return;
    }
    
    elements.cartEmpty.style.display = 'none';
    elements.cartSummary.style.display = 'block';
    
    App.cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">¥${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">¥${(item.price * item.quantity).toLocaleString()}</div>
            <button class="remove-item-btn" data-id="${item.id}">×</button>
        `;
        elements.cartItems.appendChild(cartItem);
    });
    
    // 计算并显示总价
    const { totalItems, totalPrice } = calculateCartTotal();
    elements.totalItems.textContent = totalItems;
    elements.totalPrice.textContent = `¥${totalPrice.toLocaleString()}`;
    
    // 为数量按钮添加事件监听
    const decreaseBtns = document.querySelectorAll('.quantity-btn.decrease');
    const increaseBtns = document.querySelectorAll('.quantity-btn.increase');
    const removeBtns = document.querySelectorAll('.remove-item-btn');
    
    decreaseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            updateCartQuantity(productId, -1);
        });
    });
    
    increaseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            updateCartQuantity(productId, 1);
        });
    });
    
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        });
    });
}

function renderCheckout() {
    elements.checkoutItems.innerHTML = '';
    
    App.cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
            <div class="checkout-item-info">
                <h4 class="checkout-item-name">${item.name}</h4>
                <p class="checkout-item-price">¥${item.price.toLocaleString()}</p>
            </div>
            <div class="checkout-item-quantity">x${item.quantity}</div>
            <div class="checkout-item-total">¥${(item.price * item.quantity).toLocaleString()}</div>
        `;
        elements.checkoutItems.appendChild(checkoutItem);
    });
    
    // 计算并显示总价
    const { totalItems, totalPrice } = calculateCartTotal();
    elements.checkoutTotalItems.textContent = totalItems;
    elements.checkoutTotalPrice.textContent = `¥${totalPrice.toLocaleString()}`;
}

// 事件监听
function initEventListeners() {
    // 页面切换
    elements.goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register');
    });
    
    elements.goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login');
    });
    
    // 导航链接
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) {
                // 检查是否登录
                if (!App.currentUser && (page === 'store' || page === 'cart')) {
                    showMessage('请先登录', 'error');
                    showPage('login');
                    return;
                }
                showPage(page);
            }
        });
    });
    
    // 登录表单
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value;
        
        const success = await loginUser(email, password);
        if (success) {
            showPage('store');
            elements.loginForm.reset();
        }
    });
    
    // 注册表单
    elements.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = elements.registerName.value.trim();
        const email = elements.registerEmail.value.trim();
        const password = elements.registerPassword.value;
        const confirmPassword = elements.registerConfirmPassword.value;
        
        // 验证密码
        if (password !== confirmPassword) {
            showMessage('两次输入的密码不一致', 'error');
            return;
        }
        
        const success = await registerUser(name, email, password);
        if (success) {
            showPage('login');
            elements.registerForm.reset();
        }
    });
    
    // 退出登录
    elements.logoutBtn.addEventListener('click', logoutUser);
    elements.cartLogoutBtn.addEventListener('click', logoutUser);
    elements.checkoutLogoutBtn.addEventListener('click', logoutUser);
    elements.successLogoutBtn.addEventListener('click', logoutUser);
    
    // 去购物
    elements.goShopping.addEventListener('click', () => {
        showPage('store');
    });
    
    // 结算按钮
    elements.checkoutBtn.addEventListener('click', () => {
        if (App.cart.length === 0) {
            showMessage('购物车是空的', 'error');
            return;
        }
        showPage('checkout');
    });
    
    // 结算表单
    elements.checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = elements.shippingName.value.trim();
        const phone = elements.shippingPhone.value.trim();
        const address = elements.shippingAddress.value.trim();
        
        if (!name || !phone || !address) {
            showMessage('请填写完整的收货信息', 'error');
            return;
        }
        
        const success = await checkout(name, phone, address);
        if (success) {
            elements.checkoutForm.reset();
            showPage('success');
        }
    });
    
    // 继续购物
    elements.continueShopping.addEventListener('click', () => {
        showPage('store');
    });
}

// 初始化应用
async function init() {
    initEventListeners();
    
    // 检查登录状态
    const isLoggedIn = await checkLoginStatus();
    if (isLoggedIn) {
        showPage('store');
    } else {
        showPage('login');
    }
}

// 启动应用
init();
