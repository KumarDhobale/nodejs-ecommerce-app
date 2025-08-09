const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, Product, User, Order } = require('./db');
require('dotenv').config();

// Database se connect karein
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT secret key ko apne .env file se lein
const jwtSecret = 'YOUR_SUPER_SECRET_JWT_KEY'; 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// ==================================
// Database mein initial products add karne ke liye (sirf ek baar)
// ==================================
const addInitialProducts = async () => {
    try {
        const existingProducts = await Product.countDocuments();
        if (existingProducts === 0) {
            const productsToAdd = [
                {
                    name: 'Latest Laptop Model',
                    description: 'A high-performance laptop with 16GB RAM and 512GB SSD.',
                    price: 1200.00,
                    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3ade1?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: '4K Ultra HD TV',
                    description: '55-inch smart TV with stunning 4K resolution and built-in streaming.',
                    price: 750.50,
                    imageUrl: 'https://images.unsplash.com/photo-1593786273181-e2343b46eb24?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: 'Wireless Bluetooth Headphones',
                    description: 'Noise-cancelling headphones with long battery life and crisp audio.',
                    price: 150.75,
                    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06a43e?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: 'Smart Watch Series 7',
                    description: 'Track your fitness, heart rate, and notifications on this stylish smartwatch.',
                    price: 299.99,
                    imageUrl: 'https://images.unsplash.com/photo-1546868840-a393961f71f6?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: 'Digital Camera DSLR',
                    description: 'Capture professional-quality photos with this advanced DSLR camera.',
                    price: 899.00,
                    imageUrl: 'https://images.unsplash.com/photo-1516035069371-857560a80e46?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: 'Ergonomic Office Chair',
                    description: 'Comfortable and adjustable chair for long hours of work or gaming.',
                    price: 250.00,
                    imageUrl: 'https://images.unsplash.com/photo-1594098670138-043743c4a453?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: 'Gaming Mouse RGB',
                    description: 'High-precision gaming mouse with customizable RGB lighting and side buttons.',
                    price: 55.00,
                    imageUrl: 'https://images.unsplash.com/photo-1587840131109-960241b71239?q=80&w=2670&auto=format&fit=crop',
                },
                {
                    name: 'Portable Power Bank',
                    description: '20,000mAh power bank to charge your devices on the go.',
                    price: 45.00,
                    imageUrl: 'https://images.unsplash.com/photo-1628174062095-d24c01f60049?q=80&w=2670&auto=format&fit=crop',
                },
            ];
            await Product.insertMany(productsToAdd);
            console.log('Initial products added to the database.');
        }
    } catch (error) {
        console.error('Error adding initial products:', error);
    }
};

// ==================================
// API Routes
// ==================================

// 1. User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Get all products (with search functionality)
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query;
        let products;
        if (search) {
            products = await Product.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        } else {
            products = await Product.find({});
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 4. Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 5. Process an order at checkout
app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { cartItems } = req.body;
    const userId = req.user.userId;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    try {
        const newOrder = await Order.create({
            userId: userId,
            items: cartItems,
        });
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================================
// Routes for serving HTML files
// ==================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/views/:page.html', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'views', `${page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err.message);
            res.status(404).send('Page not found');
        }
    });
});

// ==================================
// Server Initialization
// ==================================
app.listen(PORT, () => {
    addInitialProducts();
    console.log(`Server is running on http://localhost:${PORT}`);
});