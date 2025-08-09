const mongoose = require('mongoose');
const { Product } = require('./db');
require('dotenv').config();

const products = [
    {
        name: "Laptop",
        description: "Powerful and sleek laptop with a high-resolution display.",
        price: 1200,
        imageUrl: "/images/laptop.jpg",
    },
    {
        name: "Smartphone",
        description: "The latest smartphone with a cutting-edge camera and processor.",
        price: 800,
        imageUrl: "/images/smartphone.jpg",
    },
    {
        name: "Wireless Headphones",
        description: "High-fidelity sound with noise-cancellation technology.",
        price: 250,
        imageUrl: "/images/headphones.jpg",
    },
    {
        name: "Smartwatch",
        description: "Track your fitness, notifications, and more.",
        price: 350,
        imageUrl: "/images/smartwatch.jpg",
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for Seeding.');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedDB = async () => {
    await connectDB();
    try {
        console.log('Clearing existing products...');
        await Product.deleteMany({});
        
        console.log('Inserting new products...');
        await Product.insertMany(products);
        
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();