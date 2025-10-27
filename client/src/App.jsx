import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import {
    ShoppingCart, Heart, User, LogIn, LogOut, Package, CreditCard, Lock, Trash2,
    ShoppingBag, UploadCloud, PlusCircle, Edit, AlertTriangle, Mail, Eye, EyeOff
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const ProductCard = (props) => {
    const { product, onAddToCart, onAddToWishlist, isWishlisted } = props;
    const formattedPrice = (product.price || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
    });
    return (
        <div className="product-card">
            <img src={product.image_url} alt={product.name} className="product-image" />
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{formattedPrice}</p>
            </div>
            <div className="product-buttons">
                <button className="btn btn-cart" onClick={() => onAddToCart(product)}>
                    <ShoppingCart size={18} style={{ marginRight: '0.5rem' }} /> Add To Cart
                </button>
                <button className={`btn btn-wishlist ${isWishlisted ? 'active' : ''}`} onClick={() => onAddToWishlist(product)}>
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
            </div>
        </div>
    );
};

const PaymentMethods = () => {
     return (
        <form className="payment-form">
            <h3 className="form-title">
                <CreditCard size={20} style={{ marginRight: '0.5rem' }} /> Pay with Card
            </h3>
            <div className="form-group"><label htmlFor="cardName" className="form-label">Name on Card</label><input type="text" id="cardName" name="cardName" className="form-input" placeholder="e.g. Jane Doe" required /></div>
            <div className="form-group"><label htmlFor="cardNumber" className="form-label">Card Number</label><input type="text" id="cardNumber" name="cardNumber" className="form-input" placeholder="1234 5678 9012 3456" required /></div>
            <div className="form-row"><div className="form-group" style={{ flex: 2 }}><label htmlFor="expiryDate" className="form-label">Expiry (MM/YY)</label><input type="text" id="expiryDate" name="expiryDate" className="form-input" placeholder="MM / YY" required /></div><div className="form-group" style={{ flex: 1 }}><label htmlFor="cvc" className="form-label">CVC</label><input type="text" id="cvc" name="cvc" className="form-input" placeholder="123" required /></div></div>
            <button type="submit" className="btn-pay">
                <Lock size={16} style={{ marginRight: '0.5rem' }} /> Pay Now
            </button>
            <div className="payment-options">
                <button type="button" className="btn-option">PayPal</button>
                <button type="button" className="btn-option">GPay</button>
                <button type="button" className="btn-option">PhonePe</button>
            </div>
        </form>
    );
};

function AdminForm({ onProductSubmit }) {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', category: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('No file chosen');
    const iconStyle = { marginRight: '0.5rem' };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
        } else {
            setSelectedFile(null);
            setFileName('No file chosen');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onProductSubmit({ ...formData }, selectedFile);
        setFormData({ name: '', description: '', price: '', stock: '', category: '' });
        setSelectedFile(null);
        setFileName('No file chosen');
    };

    return (
        <form className="admin-form" onSubmit={handleSubmit}>
            <h2 className="admin-form-title">Add New Product (Publish)</h2>
            <div className="form-group"><label htmlFor="name" className="form-label">Product Name</label><input type="text" id="name" name="name" className="form-input" value={formData.name} onChange={handleChange}/></div>
            <div className="form-group"><label htmlFor="description" className="form-label">Description</label><textarea id="description" name="description" className="form-textarea" rows="4" value={formData.description} onChange={handleChange}></textarea></div>

            <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label htmlFor="price" className="form-label">Price (₹)</label><input type="number" id="price" name="price" className="form-input" value={formData.price} onChange={handleChange} min="0.01" step="0.01" /></div>
                <div className="form-group" style={{ flex: 1 }}><label htmlFor="stock" className="form-label">Stock Qty</label><input type="number" id="stock" name="stock" className="form-input" value={formData.stock} onChange={handleChange} min="0" step="1" /></div>
            </div>

            <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <select id="category" name="category" className="form-input" value={formData.category} onChange={handleChange} required>
                    <option value="">-- Select Category --</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Stationary">Stationary</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Product Image (Upload)</label>
                <label htmlFor="file-upload" className="file-upload-label"><UploadCloud size={20} style={iconStyle} /><span>Click to Upload Image</span></label>
                <input type="file" id="file-upload" className="file-upload-input" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                <span className="file-name-display">{fileName}</span>
            </div>
            <button type="submit" className="btn-submit">
                <PlusCircle size={18} style={iconStyle} /> Publish Product
            </button>
        </form>
    );
}

const Navbar = ({ isLoggedIn, userRole, onLogout }) => {
    const iconStyle = { marginRight: '0.25rem' };
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="logo"><Package size={28} style={{ marginRight: '0.5rem' }} />eCommerce</Link>
                    <div className="desktop-nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        {userRole === 'admin' && (<Link to="/admin" className="nav-link">Admin</Link>)}
                    </div>
                </div>
                <div className="navbar-right">
                    <Link to="/cart" className="icon-button" aria-label="View Cart"><ShoppingCart size={22} /></Link>
                    <Link to="/wishlist" className="icon-button" aria-label="View Wishlist"><Heart size={22} /></Link>
                    <span className="separator" aria-hidden="true" />
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="nav-link profile-link" aria-label="View Profile">
                                <User size={20} style={iconStyle} />
                                <span className="nav-link-text">{userRole}</span>
                            </Link>
                            <button onClick={onLogout} className="nav-link logout-button" aria-label="Logout">
                                <LogOut size={20} style={iconStyle} />
                                <span className="nav-link-text">Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link login-button">
                            <LogIn size={20} style={iconStyle} />
                            <span className="nav-link-text">Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

function Home({ authToken, handleWishlistChange, handleCartChange, isLoggedIn }) {
    const [products, setProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('All');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsResponse = await fetch(`${API_BASE_URL}/products?category=${category}`);
            const productsData = await productsResponse.json();

            let wishlistData = [];
            if (isLoggedIn && authToken) {
                const wishlistResponse = await fetch(`${API_BASE_URL}/wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (wishlistResponse.ok) {
                    wishlistData = await wishlistResponse.json();
                } else {
                    console.error("Wishlist fetch failed with status:", wishlistResponse.status);
                    wishlistData = [];
                }
            }
            setProducts(productsData);
            setWishlistIds(wishlistData.map(item => item.product_id));
            setError(null);
        } catch (e) {
            setError('Failed to fetch products or wishlist.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [authToken, isLoggedIn, category]);

    const handleAddToCart = async (product) => {
        if (!isLoggedIn) return alert('Please log in to add items to your cart.');
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ product_id: product.id, quantity: 1 })
            });
            if (!response.ok) throw new Error('Failed to add to cart.');
            alert(`${product.name} added to cart!`);
            handleCartChange();
        } catch (e) {
            alert('Error adding item to cart.');
        }
    };

    const handleAddToWishlist = async (product) => {
        if (!isLoggedIn) return alert('Please log in to manage your wishlist.');
        const isWishlisted = wishlistIds.includes(product.id);
        const method = isWishlisted ? 'DELETE' : 'POST';
        const url = isWishlisted ? `${API_BASE_URL}/wishlist/${product.id}` : `${API_BASE_URL}/wishlist`;
        const body = isWishlisted ? null : JSON.stringify({ product_id: product.id });

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: body
            });
            if (!response.ok) throw new Error('Failed to update wishlist.');

            const newWishlistIds = isWishlisted
                ? wishlistIds.filter(id => id !== product.id)
                : [...wishlistIds, product.id];
            setWishlistIds(newWishlistIds);
            handleWishlistChange();
        } catch (e) {
            alert('Error updating wishlist.');
        }
    };

    if (loading) return <div className="page-message">Loading products...</div>;
    if (error) return <div className="page-message error">Error: {error}</div>;

    const categories = ['All', 'Furniture', 'Clothes', 'Stationary'];

    return (
        <div className="page-container">
            <h1 className="page-title">Featured Products</h1>
            <div className="category-nav">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`btn-category ${category === cat ? 'active' : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="product-grid">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                        isWishlisted={wishlistIds.includes(product.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const iconStyle = { marginRight: '0.5rem' };

    const handleAuth = async (endpoint) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Something went wrong');
            }
            if (endpoint.startsWith('login')) {
                onLoginSuccess(data.access_token, data.user);
                navigate('/');
            } else if (endpoint === 'register') {
                alert("Registration successful! Please log in.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <h2 className="login-title">Welcome</h2>
                <div className="form-group"><label htmlFor="email" className="form-label">Email</label><input type="email" id="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required/></div>
                <div className="form-group"><label htmlFor="password" className="form-label">Password</label><input type="password" id="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required/></div>
                {error && (<div className="error-message"><AlertTriangle size={18} style={iconStyle} />{error}</div>)}

                <div className="button-group">
                    <button type="button" className="btn-login" onClick={() => handleAuth('login/user')} disabled={isLoading}><LogIn size={18} style={iconStyle} />{isLoading ? 'Logging in...' : 'User Login'}</button>
                    <button type="button" className="btn-admin-login" onClick={() => handleAuth('login/admin')} disabled={isLoading}><Lock size={18} style={iconStyle} />{isLoading ? 'Checking Admin...' : 'Admin Login'}</button>
                </div>
                <div className="button-group" style={{marginTop: '0.75rem'}}>
                    <button type="button" className="btn-register" onClick={() => handleAuth('register')} disabled={isLoading}><User size={18} style={iconStyle} />{isLoading ? 'Registering...' : 'Register'}</button>
                </div>
            </form>
        </div>
    );
}

function Cart({ authToken, isLoggedIn, cartUpdateFlag, handleCartChange }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (response.status === 401) throw new Error('Session expired. Please log in.');
            if (!response.ok) throw new Error('Failed to fetch cart data.');
            const data = await response.json();
            setCartItems(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [authToken, isLoggedIn]);

	const updateCartQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        const item = cartItems.find(i => i.id === cartItemId);
        console.log("Checking stock:", item?.product?.stock, "against new quantity:", newQuantity);
        if (item && item.product && typeof item.product.stock === 'number' && newQuantity > item.product.stock) {
             alert(`Cannot add more than available stock (${item.product.stock}).`);
             return;
        }

		const previousCartItems = [...cartItems];

        console.log("Attempting to update item", cartItemId, "to quantity", newQuantity);
        setCartItems(currentItems =>
            currentItems.map(currentItem =>
                currentItem.id === cartItemId ? { ...currentItem, quantity: newQuantity } : currentItem
            )
        );
        console.log("State update requested for item", cartItemId);
        handleCartChange();

        try {
            const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
                method: 'PUT',
                headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to update quantity on server.');
            }
            console.log(`Successfully updated item ${cartItemId} quantity to ${newQuantity} on server.`);
        } catch (e) {
            console.error("API Error updating quantity:", e);
            alert(`Error updating quantity: ${e.message}. Reverting changes.`);
            setCartItems(previousCartItems);
            handleCartChange();
        }

        console.log(`Simulating update item ${cartItemId} to quantity ${newQuantity}`);
    };


    const handleRemoveItem = async (cartItemId, productName) => {
        if (!window.confirm(`Remove ${productName} from cart?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) throw new Error('Failed to remove item.');

            setCartItems(items => items.filter(item => item.id !== cartItemId));
            handleCartChange();
        } catch (e) {
            alert('Error removing item from cart.');
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 50;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const formatCurrency = (amount) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

    if (!isLoggedIn) return <div className="page-message empty-cart"><LogIn size={48} /><h2>Please Log In</h2><p>Log in to view your shopping cart.</p></div>;
    if (loading) return <div className="page-message">Loading your cart...</div>;
    if (error) return <div className="page-message error">Error: {error}</div>;
    if (cartItems.length === 0) {
        return (<div className="page-message empty-cart"><ShoppingBag size={48} /><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p></div>);
    }

    return (
        <div className="cart-container">
            <h1 className="cart-title">Your Shopping Cart</h1>
            <div className="cart-layout">
                <div className="cart-items-list">
                    {cartItems.map(item => (
                        <div className="cart-item" key={item.id}>
                            <img src={item.product.image_url} alt={item.product.name} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3 className="cart-item-name">{item.product.name}</h3>
                                <p className="cart-item-price">{formatCurrency(item.product.price)}</p>
                            </div>
                            <div className="cart-item-controls">
                                <div className="quantity-control-group">
                                    <button
                                        className="quantity-btn decrease-btn"
                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        aria-label={`Decrease quantity of ${item.product.name}`}
                                    >
                                        -
                                    </button>
                                    <span className="quantity-display-text">{item.quantity}</span>
                                    <button
                                        className="quantity-btn increase-btn"
                                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.product.stock}
                                        aria-label={`Increase quantity of ${item.product.name}`}
                                    >
                                        +
                                    </button>
                                </div>
                                <button className="remove-button" onClick={() => handleRemoveItem(item.id, item.product.name)}><Trash2 size={18} /> Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="order-summary-card">
                    <h2>Order Summary</h2>
                    <div className="summary-line"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="summary-line"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
                    <div className="summary-line"><span>Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
                    <div className="summary-divider" />
                    <div className="summary-total"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    <div className="summary-divider" />
                    <PaymentMethods />
                </div>
            </div>
        </div>
    );
}

function AdminDashboard({ authToken, isAdmin }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            setProducts(data);
        } catch (e) {
            console.error('Failed to fetch products:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchProducts();
    }, [isAdmin]);

    const handleAddNewProduct = async (formData, file) => {
        const priceFloat = parseFloat(formData.price);
        const stockInt = parseInt(formData.stock, 10);

        if (
            !formData.name || !formData.description || !formData.category ||
            !file || isNaN(priceFloat) || isNaN(stockInt) || priceFloat <= 0 || stockInt < 0
        ) {
            return alert("Please ensure all fields are filled, an image is uploaded, and Price/Stock are valid numbers.");
        }
        const dataToSubmit = new FormData();
        dataToSubmit.append('name', formData.name);
        dataToSubmit.append('description', formData.description);
        dataToSubmit.append('price', priceFloat);
        dataToSubmit.append('stock', stockInt);
        dataToSubmit.append('category', formData.category);
        dataToSubmit.append('image', file);
		console.log("Using authToken:", authToken);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: dataToSubmit,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server failed with status ${response.status}.`);
            }
            alert('Product published successfully!');
            fetchProducts();
        } catch (e) {
            alert(`Error publishing product: ${e.message}`);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (!response.ok) throw new Error('Deletion failed.');
            alert('Product deleted.');
            setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
        } catch (e) {
            alert('Error deleting product.');
        }
    };

    if (!isAdmin) {
        return (<div className="permission-denied"><AlertTriangle size={48} color="#ef4444" /><h2>Permission Denied</h2><p>You do not have access to this page.</p></div>);
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <div className="dashboard-layout">
                <div className="form-section">
                    <AdminForm onProductSubmit={handleAddNewProduct} />
                </div>
                <div className="list-section">
                    <h2>Existing Products</h2>
                    {loading ? (<p>Loading products...</p>) : (
                        <div className="product-list">
                            {products.map(product => (
                                <div className="product-list-item" key={product.id}>
                                    <img src={product.image_url} alt={product.name} className="list-item-image" />
                                    <div className="list-item-info">
                                        <h3>{product.name}</h3>
                                        <p>Price: ₹{product.price.toFixed(2)} | Stock: {product.stock} | Cat: {product.category}</p>
                                    </div>
                                    <div className="list-item-actions">
                                        <button className="btn-icon delete" aria-label="Delete" onClick={() => handleDeleteProduct(product.id)}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function LayoutAndRoutes() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [wishlistUpdateFlag, setWishlistUpdateFlag] = useState(0);
    const [cartUpdateFlag, setCartUpdateFlag] = useState(0);

    const navigate = useNavigate();

    const handleLoginSuccess = (token, user) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.is_admin ? 'admin' : 'user');
        setAuthToken(token);
        setUserRole(user.is_admin ? 'admin' : 'user');
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setAuthToken(null);
        setUserRole(null);
        setIsLoggedIn(false);
        try {
            await fetch(`${API_BASE_URL}/logout`, { method: 'POST' });
        } catch (e) {
            console.error('Logout communication error:', e);
        }
        navigate('/');
    };

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />
            <main>
                <Routes>
                     <Route path="/" element={<Home
                        authToken={authToken}
                        isLoggedIn={isLoggedIn}
                        handleWishlistChange={() => setWishlistUpdateFlag(prev => prev + 1)}
                        handleCartChange={() => setCartUpdateFlag(prev => prev + 1)}
                    />} />
                    <Route path="/cart" element={<Cart
                        authToken={authToken}
                        isLoggedIn={isLoggedIn}
                        cartUpdateFlag={cartUpdateFlag}
                        handleCartChange={() => setCartUpdateFlag(prev => prev + 1)}
                    />} />
                    <Route path="/admin" element={<AdminDashboard authToken={authToken} isAdmin={userRole === 'admin'} />} />
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/wishlist" element={<WishlistPage
                        authToken={authToken}
                        isLoggedIn={isLoggedIn}
                        wishlistUpdateFlag={wishlistUpdateFlag}
                        handleWishlistChange={() => setWishlistUpdateFlag(prev => prev + 1)}
                        handleCartChange={() => setCartUpdateFlag(prev => prev + 1)}
                    />} />
                    <Route path="/profile" element={<div className="page-message"><h2>User Profile</h2><p>{isLoggedIn ? `You are logged in as a ${userRole}.` : 'You are not logged in.'}</p></div>} />
                    <Route path="*" element={<div className="page-message"><h2>404 - Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div>} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <LayoutAndRoutes />
        </BrowserRouter>
    );
}

function WishlistPage({ authToken, isLoggedIn, wishlistUpdateFlag, handleWishlistChange, handleCartChange }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/wishlist`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (response.status === 401) throw new Error('Session expired. Please log in.');
            if (!response.ok) throw new Error('Failed to fetch wishlist.');
            const data = await response.json();
            setItems(data.map(item => item.product));
            setError(null);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [authToken, isLoggedIn, wishlistUpdateFlag]);

    const handleAddToCart = async (product) => {
         if (!isLoggedIn) return alert('Please log in to add items to your cart.');
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ product_id: product.id, quantity: 1 })
            });
            if (!response.ok) throw new Error('Failed to add to cart.');
            alert(`${product.name} added to cart!`);
            handleCartChange();
        } catch (e) {
            alert('Error adding item to cart.');
        }
    };

    const handleRemoveFromWishlist = async (product) => {
        try {
            const response = await fetch(`${API_BASE_URL}/wishlist/${product.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to remove item.');
            setItems(currentItems => currentItems.filter(item => item.id !== product.id));
            handleWishlistChange();
        } catch (e) {
            alert('Error removing item from wishlist.');
        }
    };

    if (!isLoggedIn) return <div className="page-message empty-cart"><LogIn size={48} /><h2>Please Log In</h2><p>Log in to view your wishlist.</p></div>;
    if (loading) return <div className="page-message">Loading your wishlist...</div>;
    if (error) return <div className="page-message error">Error: {error}</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Your Wishlist</h1>
            {items.length === 0 ? (
                <div className="page-message"><Heart size={48} /><h2>Your wishlist is empty</h2><p>Save items you love by clicking the heart icon.</p></div>
            ) : (
                <div className="product-grid">
                    {items.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            onAddToWishlist={handleRemoveFromWishlist}
                            isWishlisted={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;