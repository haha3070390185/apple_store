const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
function initDataFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

initDataFile(USERS_FILE, []);
initDataFile(CARTS_FILE, {});
initDataFile(SESSIONS_FILE, {});

// 商品数据（静态数据）
const products = [
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
];

// 工具函数
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        return false;
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 中间件：验证用户登录状态
function authMiddleware(req, res, next) {
    const sessionId = req.headers.authorization;
    
    if (!sessionId) {
        return res.status(401).json({
            success: false,
            message: '请先登录'
        });
    }
    
    const sessions = readJSONFile(SESSIONS_FILE);
    const session = sessions[sessionId];
    
    if (!session) {
        return res.status(401).json({
            success: false,
            message: '登录已过期，请重新登录'
        });
    }
    
    req.userId = session.userId;
    next();
}

// API路由

// 1. 用户注册
app.post('/api/register', (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // 验证输入
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '请填写所有必填字段'
            });
        }
        
        // 读取现有用户
        const users = readJSONFile(USERS_FILE) || [];
        
        // 检查邮箱是否已注册
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '该邮箱已被注册'
            });
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        // 保存用户
        users.push(newUser);
        writeJSONFile(USERS_FILE, users);
        
        // 返回成功响应（不返回密码）
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            success: true,
            message: '注册成功',
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 2. 用户登录
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 验证输入
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '请填写邮箱和密码'
            });
        }
        
        // 读取用户
        const users = readJSONFile(USERS_FILE) || [];
        
        // 查找用户
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '邮箱或密码错误'
            });
        }
        
        // 创建会话
        const sessionId = generateSessionId();
        const sessions = readJSONFile(SESSIONS_FILE) || {};
        
        sessions[sessionId] = {
            userId: user.id,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时过期
        };
        
        writeJSONFile(SESSIONS_FILE, sessions);
        
        // 返回成功响应
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: '登录成功',
            sessionId,
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 3. 用户退出登录
app.post('/api/logout', authMiddleware, (req, res) => {
    try {
        const sessionId = req.headers.authorization;
        const sessions = readJSONFile(SESSIONS_FILE) || {};
        
        // 删除会话
        if (sessions[sessionId]) {
            delete sessions[sessionId];
            writeJSONFile(SESSIONS_FILE, sessions);
        }
        
        res.json({
            success: true,
            message: '已退出登录'
        });
        
    } catch (error) {
        console.error('退出登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 4. 获取当前用户信息
app.get('/api/user', authMiddleware, (req, res) => {
    try {
        const users = readJSONFile(USERS_FILE) || [];
        const user = users.find(user => user.id === req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 5. 获取商品列表
app.get('/api/products', (req, res) => {
    try {
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('获取商品列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 6. 获取单个商品详情
app.get('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }
        
        res.json({
            success: true,
            product
        });
        
    } catch (error) {
        console.error('获取商品详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 7. 获取购物车
app.get('/api/cart', authMiddleware, (req, res) => {
    try {
        const carts = readJSONFile(CARTS_FILE) || {};
        const userCart = carts[req.userId] || [];
        
        res.json({
            success: true,
            cart: userCart
        });
        
    } catch (error) {
        console.error('获取购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 8. 添加商品到购物车
app.post('/api/cart/add', authMiddleware, (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: '请提供商品ID'
            });
        }
        
        // 查找商品
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }
        
        // 获取用户购物车
        const carts = readJSONFile(CARTS_FILE) || {};
        const userCart = carts[req.userId] || [];
        
        // 检查商品是否已在购物车中
        const existingItem = userCart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            userCart.push({
                ...product,
                quantity: 1
            });
        }
        
        // 保存购物车
        carts[req.userId] = userCart;
        writeJSONFile(CARTS_FILE, carts);
        
        res.json({
            success: true,
            message: '已添加到购物车',
            cart: userCart
        });
        
    } catch (error) {
        console.error('添加到购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 9. 更新购物车商品数量
app.put('/api/cart/update', authMiddleware, (req, res) => {
    try {
        const { productId, change } = req.body;
        
        if (productId === undefined || change === undefined) {
            return res.status(400).json({
                success: false,
                message: '请提供商品ID和数量变化'
            });
        }
        
        // 获取用户购物车
        const carts = readJSONFile(CARTS_FILE) || {};
        const userCart = carts[req.userId] || [];
        
        // 查找商品
        const itemIndex = userCart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '商品不在购物车中'
            });
        }
        
        // 更新数量
        userCart[itemIndex].quantity += change;
        
        // 如果数量小于等于0，删除商品
        if (userCart[itemIndex].quantity <= 0) {
            userCart.splice(itemIndex, 1);
        }
        
        // 保存购物车
        carts[req.userId] = userCart;
        writeJSONFile(CARTS_FILE, carts);
        
        res.json({
            success: true,
            message: '购物车已更新',
            cart: userCart
        });
        
    } catch (error) {
        console.error('更新购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 10. 从购物车删除商品
app.delete('/api/cart/remove/:productId', authMiddleware, (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        
        // 获取用户购物车
        const carts = readJSONFile(CARTS_FILE) || {};
        const userCart = carts[req.userId] || [];
        
        // 查找并删除商品
        const itemIndex = userCart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '商品不在购物车中'
            });
        }
        
        userCart.splice(itemIndex, 1);
        
        // 保存购物车
        carts[req.userId] = userCart;
        writeJSONFile(CARTS_FILE, carts);
        
        res.json({
            success: true,
            message: '已从购物车移除',
            cart: userCart
        });
        
    } catch (error) {
        console.error('删除购物车商品错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 11. 结算（创建订单）
app.post('/api/checkout', authMiddleware, (req, res) => {
    try {
        const { shippingName, shippingPhone, shippingAddress } = req.body;
        
        // 验证输入
        if (!shippingName || !shippingPhone || !shippingAddress) {
            return res.status(400).json({
                success: false,
                message: '请填写完整的收货信息'
            });
        }
        
        // 获取用户购物车
        const carts = readJSONFile(CARTS_FILE) || {};
        const userCart = carts[req.userId] || [];
        
        if (userCart.length === 0) {
            return res.status(400).json({
                success: false,
                message: '购物车是空的'
            });
        }
        
        // 计算总价
        let totalPrice = 0;
        userCart.forEach(item => {
            totalPrice += item.price * item.quantity;
        });
        
        // 创建订单（这里简单处理，实际项目中应该保存到订单表）
        const order = {
            id: Date.now().toString(),
            userId: req.userId,
            items: userCart,
            totalPrice,
            shipping: {
                name: shippingName,
                phone: shippingPhone,
                address: shippingAddress
            },
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // 清空购物车
        carts[req.userId] = [];
        writeJSONFile(CARTS_FILE, carts);
        
        res.json({
            success: true,
            message: '订单提交成功',
            order
        });
        
    } catch (error) {
        console.error('结算错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API文档:
  - POST /api/register - 用户注册
  - POST /api/login - 用户登录
  - POST /api/logout - 用户退出登录
  - GET /api/user - 获取当前用户信息
  - GET /api/products - 获取商品列表
  - GET /api/products/:id - 获取单个商品详情
  - GET /api/cart - 获取购物车
  - POST /api/cart/add - 添加商品到购物车
  - PUT /api/cart/update - 更新购物车商品数量
  - DELETE /api/cart/remove/:productId - 从购物车删除商品
  - POST /api/checkout - 结算（创建订单）`);
});
