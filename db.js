const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit with a failure code
    }
};

// Define Mongoose schemas
const productSchema = new mongoose.Schema({
    id: Number, // Keeping the old ID for consistency, but MongoDB uses _id by default
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    imageUrl: String,
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: { type: Array, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },
});

// Create Mongoose models
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = {
    connectDB,
    Product,
    User,
    Order,
};