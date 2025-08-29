const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'eCommerce Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Mock data mode'
  });
});

// Mock products data (mutable for demo)
let mockProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    description: 'High-quality wireless headphones with active noise cancellation',
    category: 'Electronics',
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    discount: 25
  },
  {
    id: 2,
    name: 'Smartphone Pro Max',
    price: 1299.99,
    originalPrice: 1499.99,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    description: 'Latest smartphone with advanced camera system',
    category: 'electronics',
    rating: 4.9,
    reviews: 2156,
    inStock: true,
    discount: 13
  },
  {
    id: 3,
    name: 'Gaming Laptop Elite',
    price: 2499.99,
    originalPrice: 2799.99,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',
    description: 'High-performance gaming laptop with RTX graphics',
    category: 'electronics',
    rating: 4.7,
    reviews: 892,
    inStock: true,
    discount: 11
  },
  {
    id: 4,
    name: 'Smart Watch Series X',
    price: 499.99,
    originalPrice: 599.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    description: 'Advanced smartwatch with health tracking',
    category: 'electronics',
    rating: 4.6,
    reviews: 1567,
    inStock: true,
    discount: 17
  },
  {
    id: 5,
    name: 'Wireless Earbuds Pro',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    description: 'Premium wireless earbuds with noise cancellation',
    category: 'electronics',
    rating: 4.5,
    reviews: 2341,
    inStock: true,
    discount: 20
  },
  {
    id: 6,
    name: '4K Smart TV',
    price: 899.99,
    originalPrice: 1199.99,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
    description: 'Ultra HD smart TV with HDR and voice control',
    category: 'electronics',
    rating: 4.4,
    reviews: 678,
    inStock: true,
    discount: 25
  },
  {
    id: 7,
    name: 'Designer T-Shirt',
    price: 49.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    description: 'Premium cotton designer t-shirt',
    category: 'clothing',
    rating: 4.3,
    reviews: 445,
    inStock: true,
    discount: 38
  },
  {
    id: 8,
    name: 'Running Shoes',
    price: 129.99,
    originalPrice: 159.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    description: 'Comfortable running shoes for athletes',
    category: 'clothing',
    rating: 4.6,
    reviews: 892,
    inStock: true,
    discount: 19
  }
];

// Products API
app.get('/api/products', (req, res) => {
  const { category, search, sortBy = 'name' } = req.query;
  
  let filteredProducts = [...mockProducts];
  
  // Filter by category
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // Filter by search
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Sort products
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      products: filteredProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: filteredProducts.length,
        itemsPerPage: filteredProducts.length
      }
    }
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Product not found'
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, image, inStock } = req.body;
  
  if (!name || !price || !category || !image) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Missing required fields: name, price, category, image'
      }
    });
  }
  
  const newProduct = {
    id: Math.max(...mockProducts.map(p => p.id)) + 1,
    name,
    description: description || '',
    price: parseFloat(price),
    originalPrice: parseFloat(price),
    image,
    category,
    rating: 0,
    reviews: 0,
    inStock: inStock !== undefined ? inStock : true,
    discount: 0
  };
  
  mockProducts.push(newProduct);
  
  res.status(201).json({
    success: true,
    data: newProduct,
    message: 'Product created successfully'
  });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Product not found'
      }
    });
  }
  
  const { name, description, price, category, image, inStock } = req.body;
  
  // Update the product
  mockProducts[productIndex] = {
    ...mockProducts[productIndex],
    name: name || mockProducts[productIndex].name,
    description: description || mockProducts[productIndex].description,
    price: price ? parseFloat(price) : mockProducts[productIndex].price,
    category: category || mockProducts[productIndex].category,
    image: image || mockProducts[productIndex].image,
    inStock: inStock !== undefined ? inStock : mockProducts[productIndex].inStock
  };
  
  res.status(200).json({
    success: true,
    data: mockProducts[productIndex],
    message: 'Product updated successfully'
  });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Product not found'
      }
    });
  }
  
  const deletedProduct = mockProducts[productIndex];
  mockProducts.splice(productIndex, 1);
  
  res.status(200).json({
    success: true,
    data: deletedProduct,
    message: 'Product deleted successfully'
  });
});

// Categories API
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 1, name: 'Electronics', slug: 'electronics' },
    { id: 2, name: 'Clothing', slug: 'clothing' },
    { id: 3, name: 'Home & Garden', slug: 'home' },
    { id: 4, name: 'Sports', slug: 'sports' }
  ];
  
  res.status(200).json({
    success: true,
    data: categories
  });
});

// Simple Auth API
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Mock registration
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: 1,
        name,
        email,
        role: 'user',
        isEmailVerified: true
      },
      token: 'mock-jwt-token'
    },
    message: 'User registered successfully.'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock login
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: 1,
        name: 'Test User',
        email,
        role: 'user',
        isEmailVerified: true
      },
      token: 'mock-jwt-token'
    },
    message: 'Login successful'
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Quick Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Mock data mode - No database required`);
});

module.exports = app;
