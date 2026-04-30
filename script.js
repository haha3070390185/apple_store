// 应用状态
const App = {
    currentUser: null,
    cart: [],
    products: [
        {
            id: 1,
            name: "极简手表",
            description: "瑞士工艺，极简设计，精准计时",
            price: 2999,
            image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20luxury%20watch%20with%20clean%20design%20white%20background&image_size=square_hd"
        },
        {
            id: 2,
            name: "轻奢香水",
            description: "法国进口，持久留香，优雅气质",
            price: 899,
            image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20luxury%20perfume%20bottle%20minimalist%20design%20white%20background&image_size=square_hd"
        },
        {
            id: 3,
            name: "真皮钱包",
            description: "意大利小牛皮，手工缝制，品质之选",
            price: 1299,
            image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20luxury%20leather%20wallet%20clean%20design%20white%20background&image_size=square_hd"
        },
        {
            id: 4,
            name: "轻奢眼镜",
            description: "钛合金框架，防蓝光镜片，时尚百搭",
            price: 1599,
            image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20luxury%20eyeglasses%20clean%20design%20white%20background&image_size=square_hd"
        },
        {
            id: 5,
            name: "极简台灯",
            description: "北欧设计，LED光源，触控调节",
            price: 799,
            image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20luxury%20table%20lamp%20clean%20design%20white%20background&image_size=square_hd"
        },
        {
            id: 6,
            name: "轻奢保温杯",
            description: "316不锈钢，24小时保温，简约时尚",
            price: 399,
            image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20luxury%20thermos%20bottle%20clean%20design%20white%20background&image_size=square_hd"
        }
    ]
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
            renderProducts();
            break;
        case 'cart':
            elements.cartPage.classList.add('active');
            updateUserName();
            renderCart();
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

// 用户认证
function registerUser(name, email, password) {
    // 检查邮箱是否已注册
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        showMessage('该邮箱已被注册', 'error');
        return false;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password
    };
    
    // 保存用户
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('注册成功，请登录');
    return true;
}

function loginUser(email, password) {
    // 检查用户是否存在
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        showMessage('邮箱或密码错误', 'error');
        return false;
    }
    
    // 设置当前用户
    App.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // 加载用户购物车
    loadCart();
    
    showMessage(`欢迎回来，${user.name}！`);
    return true;
}

function logoutUser() {
    // 保存购物车
    saveCart();
    
    // 清除当前用户
    App.currentUser = null;
    App.cart = [];
    localStorage.removeItem('currentUser');
    
    showMessage('已退出登录');
    showPage('login');
}

function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        App.currentUser = JSON.parse(savedUser);
        loadCart();
        showPage('store');
        return true;
    }
    return false;
}

// 购物车功能
function saveCart() {
    if (App.currentUser) {
        localStorage.setItem(`cart_${App.currentUser.id}`, JSON.stringify(App.cart));
    }
}

function loadCart() {
    if (App.currentUser) {
        const savedCart = localStorage.getItem(`cart_${App.currentUser.id}`);
        App.cart = savedCart ? JSON.parse(savedCart) : [];
    }
}

function addToCart(productId) {
    // 检查用户是否登录
    if (!App.currentUser) {
        showMessage('请先登录', 'error');
        showPage('login');
        return;
    }
    
    // 查找商品
    const product = App.products.find(p => p.id === productId);
    if (!product) {
        showMessage('商品不存在', 'error');
        return;
    }
    
    // 检查商品是否已在购物车中
    const existingItem = App.cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        App.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // 保存购物车
    saveCart();
    
    showMessage('已添加到购物车');
}

function removeFromCart(productId) {
    App.cart = App.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function updateCartQuantity(productId, change) {
    const item = App.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCart();
        renderCart();
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
                showPage(page);
            }
        });
    });
    
    // 登录表单
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value;
        
        if (loginUser(email, password)) {
            showPage('store');
            elements.loginForm.reset();
        }
    });
    
    // 注册表单
    elements.registerForm.addEventListener('submit', (e) => {
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
        
        if (registerUser(name, email, password)) {
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
    elements.checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = elements.shippingName.value.trim();
        const phone = elements.shippingPhone.value.trim();
        const address = elements.shippingAddress.value.trim();
        
        if (!name || !phone || !address) {
            showMessage('请填写完整的收货信息', 'error');
            return;
        }
        
        // 清空购物车
        App.cart = [];
        saveCart();
        
        // 重置表单
        elements.checkoutForm.reset();
        
        // 显示成功页面
        showPage('success');
    });
    
    // 继续购物
    elements.continueShopping.addEventListener('click', () => {
        showPage('store');
    });
}

// 初始化应用
function init() {
    initEventListeners();
    
    // 检查登录状态
    if (!checkLoginStatus()) {
        showPage('login');
    }
}

// 启动应用
init();
