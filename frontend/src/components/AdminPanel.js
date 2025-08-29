import React, { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 4,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data.products);
        setStats({
          totalProducts: response.data.data.products.length,
          totalCategories: 4,
          totalOrders: 0,
          totalRevenue: response.data.data.products.reduce((sum, p) => sum + p.price, 0)
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductWithData = async (formDataObj) => {
    console.log('Form data being submitted:', formDataObj);
    try {
      const response = await productsAPI.create(formDataObj);
      if (response.data.success) {
        setShowAddModal(false);
        setFormData({ name: '', description: '', price: '', category: '', image: '', inStock: true });
        loadProducts();
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleEditProductWithData = async (formDataObj) => {
    try {
      const response = await productsAPI.update(editingProduct.id, formDataObj);
      if (response.data.success) {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', category: '', image: '', inStock: true });
        loadProducts();
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await productsAPI.update(editingProduct.id, formData);
      if (response.data.success) {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', category: '', image: '', inStock: true });
        loadProducts();
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await productsAPI.delete(productId);
        if (response.data.success) {
          loadProducts();
          alert('Product deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category ? product.category.name : '',
      image: product.images && product.images.length > 0 ? product.images[0] : product.image || '',
      inStock: product.inStock
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: '', image: '', inStock: true });
  };

  const addSampleProduct = () => {
    const sampleData = {
      name: 'Sample Product',
      description: 'This is a sample product description for testing purposes.',
      price: '99.99',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      inStock: true
    };
    setFormData(sampleData);
    setShowAddModal(true);
  };



  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ email: '', password: '' });
  };

  const LoginForm = () => {
    const handleLoginSubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      const email = form.email.value;
      const password = form.password.value;
      
      console.log('Login attempt:', { email, password });
      
      if (email === 'arin@gmail.com' && password === 'Arin@123') {
        console.log('Login successful!');
        setIsAuthenticated(true);
        // Smooth transition - no alert
      } else {
        console.log('Login failed!');
        alert('Invalid credentials. Use arin@gmail.com / Arin@123');
      }
    };

    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h2>🔐 Admin Login</h2>
            <p>Enter your credentials to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
          
          <div className="login-help">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: arin@gmail.com</p>
            <p>Password: Arin@123</p>
          </div>
        </div>
      </div>
    );
  };

  const ProductModal = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get form data from form elements
      const form = e.target;
      const formDataObj = {
        name: form.name.value,
        description: form.description.value,
        price: form.price.value,
        category: form.category.value,
        image: form.image.value,
        inStock: form.inStock.checked
      };
      
      if (editingProduct) {
        // Update existing product
        handleEditProductWithData(formDataObj);
      } else {
        // Add new product
        handleAddProductWithData(formDataObj);
      }
    };

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                name="name"
                defaultValue={formData.name || ''}
                placeholder="Enter product name"
                maxLength="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                defaultValue={formData.description || ''}
                placeholder="Enter product description"
                rows="4"
                maxLength="500"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price ($):</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  defaultValue={formData.price || ''}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category:</label>
                <select name="category" required>
                  <option value="">Select Category</option>
                  <option value="Electronics" selected={formData.category === 'Electronics'}>Electronics</option>
                  <option value="Clothing" selected={formData.category === 'Clothing'}>Clothing</option>
                  <option value="Books" selected={formData.category === 'Books'}>Books</option>
                  <option value="Sports" selected={formData.category === 'Sports'}>Sports</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Image URL:</label>
              <input
                type="url"
                name="image"
                defaultValue={formData.image || ''}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  defaultChecked={formData.inStock || false}
                />
                In Stock
              </label>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="admin-dashboard">
      <h2>📊 Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <h3>{stats.totalCategories}</h3>
            <p>Categories</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>🕒 Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">2 min ago</span>
            <span className="activity-text">New product "Smart Watch Series X" added</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">5 min ago</span>
            <span className="activity-text">Product "Gaming Laptop Elite" updated</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">10 min ago</span>
            <span className="activity-text">New order #12345 received</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Products = () => (
    <div className="admin-products">
      <div className="section-header">
        <h2>📦 Product Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={addSampleProduct}
          >
            🧪 Test Product
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Product
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : product.image || 'https://via.placeholder.com/100x100/2a2a2a/ffffff?text=Image'} 
                      alt={product.name} 
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category ? product.category.name : 'N/A'}</td>
                  <td>${product.price}</td>
                  <td>{product.inStock ? 'In Stock' : 'Out of Stock'}</td>
                  <td>
                    <span className={`status ${product.inStock ? 'active' : 'inactive'}`}>
                      {product.inStock ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-small btn-edit"
                        onClick={() => openEditModal(product)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Orders = () => (
    <div className="admin-orders">
      <h2>📋 Order Management</h2>
      <div className="no-data">
        <p>📭 No orders yet</p>
        <p>Orders will appear here when customers make purchases</p>
      </div>
    </div>
  );

  const Settings = () => (
    <div className="admin-settings">
      <h2>⚙️ Admin Settings</h2>
      
      <div className="settings-section">
        <h3>🔐 Account Settings</h3>
        <div className="setting-item">
          <label>Admin Email:</label>
          <input type="email" defaultValue="arin@gmail.com" />
        </div>
        <div className="setting-item">
          <label>Password:</label>
          <input type="password" defaultValue="••••••••" />
        </div>
        <button className="btn btn-primary">Update Settings</button>
      </div>

      <div className="settings-section">
        <h3>🏪 Store Settings</h3>
        <div className="setting-item">
          <label>Store Name:</label>
          <input type="text" defaultValue="eCommerce Pro" />
        </div>
        <div className="setting-item">
          <label>Store Description:</label>
          <textarea defaultValue="Your trusted destination for premium products"></textarea>
        </div>
        <button className="btn btn-primary">Save Settings</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>🛒 Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        <div className="admin-topbar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="admin-user">
            <span>👤 Admin</span>
            <button className="btn btn-small" onClick={handleLogout}>Logout</button>
            <button 
              className="btn btn-small btn-store"
              onClick={() => window.location.href = '/'}
            >
              🏪 Back to Store
            </button>
          </div>
        </div>
        
        <div className="admin-main">
          {renderContent()}
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {(showAddModal || editingProduct) && (
        <ProductModal key={editingProduct ? `edit-${editingProduct.id}` : 'add-new'} />
      )}
    </div>
  );
};

export default AdminPanel;
