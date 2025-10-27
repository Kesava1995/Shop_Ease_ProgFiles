# Shop_Ease

# Full-Stack E-commerce Application

A web application built with React and Flask, featuring a user-facing storefront and an administrative dashboard for managing products.

---

## Features

**User Features:**

* **Browse Products:** View published products fetched dynamically from the backend API.
* **Category Filtering:** Filter products by categories (Furniture, Clothes, Stationary).
* **Shopping Cart:** Add products to the cart, view cart contents, adjust quantity (+/- buttons), and remove items.
* **Wishlist:** Add/remove products to a personal wishlist.
* **User Authentication:** Register new accounts and log in securely using JWT.
* **Payment Form:** Displays a basic payment interface on the cart page.
* **Persistent Login:** Uses `localStorage` to keep users logged in across sessions.

**Admin Features:**

* **Secure Admin Login:** Separate login endpoint for administrators.
* **Product Management:**
    * **Publish Products:** Add new products with name, description, price (INR), stock quantity, category, and image upload.
    * **View Products:** See a list of existing products on the dashboard.
    * **Delete Products:** Remove products from the store (including associated image files and cascading deletion of related cart/wishlist items).
* **Basic User Monitoring:** View a list of registered users (excluding sensitive data).
* **Protected Routes:** Admin dashboard access restricted to users with the `is_admin` flag set to true.

---

## Tech Stack

* **Frontend:**
    * React (`useState`, `useEffect`)
    * React Router (`BrowserRouter`, `Routes`, `Route`, `useNavigate`)
    * JavaScript (ES6+)
    * CSS3
    * Lucide React (Icons)
    * Fetch API (for backend communication)
* **Backend:**
    * Flask (Python Web Framework)
    * Flask-SQLAlchemy (ORM)
    * Flask-Migrate (Database Migrations)
    * Flask-JWT-Extended (Authentication)
    * Flask-Bcrypt (Password Hashing)
    * Flask-CORS (Cross-Origin Resource Sharing)
    * Werkzeug (File Handling)
* **Database:**
    * SQLite (Default development database)
    * *(Easily configurable for PostgreSQL, MySQL, etc., via `config.py`)*

---

## Project Structure

/ecommerce-app
│
├── /client               → React Frontend
│   ├── /src
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│
├── /server               → Flask Backend
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   │   ├── admin_routes.py
│   │   ├── user_routes.py
│   │   └── product_routes.py
│   ├── static/
│   └── uploads/          → Product Images
│
└── requirements.txt
