## Shopify E-commerce Clone
    This is a full-stack e-commerce web application built using Node.js, Express, and MongoDB. The project features user authentication, a dynamic product catalog, a shopping cart, and a checkout process that saves orders to a database.


## Features
* User Authentication: Secure user registration, login, and logout with JWT (JSON Web Tokens).

* Dynamic Product Catalog: Fetch and display a list of products from a MongoDB database.

* Product Search & Sorting: Search for products by name or description and sort them by price.

* Shopping Cart: Add and remove items from a local cart using localStorage.

* Secure Checkout: Authenticated users can place an order, which is then saved to the orders collection in the database.

* Responsive Design: A clean and simple UI that works well on both desktop and mobile devices.


## Technologies Used
* Backend: Node.js, Express.js

* Database: MongoDB

* Authentication: JSON Web Tokens (JWT), bcrypt for password hashing

* Client-side: HTML, CSS, JavaScript (Vanilla JS)

* Package Manager: npm


## Project Structure
├──ecommerce-project/
├── node_modules/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   │   ├── slider1.jpg
│   │   ├── slider2.jpg
│   │   ├── slider3.jpg
│   │   └── products-images
│   └── js/
│       └── main.js
├── views/
│   ├── cart.html
│   ├── index.html
│   ├── login.html
│   ├── product-detail.html
│   └── register.html
├── .env
├── .gitignore
├── db.js
├── package.json
└── server.js
└── README.md


## Getting Started
Follow these steps to set up and run the project on your local machine.

* Prerequisites
Make sure you have the following software installed:
Node.js
MongoDB Community Edition

* Setup Instructions
1. Clone the repository:
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name 

2. Install dependencies:
   npm install

3. Create a .env file:
   Create a new file named .env in the root directory of your project and add the following content.
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/shopify
     JWT_SECRET=your_super_secret_jwt_key

    * MONGO_URI: Update this if your MongoDB connection string is different.
    * JWT_SECRET: Replace this with a long, random string.

4. Start the server:
   Run the following command to start the Express server.
   node server.js 

   The server will start, and you can access the website in your browser at http://localhost:3000.


## Usage
Register: Go to /views/register.html to create a new user account.

Login: Log in at /views/login.html to authenticate.

Browse: The homepage (/) and products page (/views/products.html) display all products.

Add to Cart: Click "Add to Cart" on any product card to add it to your cart.

Checkout: After logging in, you can click "Checkout" on the cart page to place an order. The order details will be saved in the orders collection in your MongoDB database.



