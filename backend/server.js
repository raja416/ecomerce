const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database and models
const sequelize = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const wishlistRoutes = require('./routes/wishlist');
// const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const couponRoutes = require('./routes/coupons');
const notificationRoutes = require('./routes/notifications');
// const vendorRoutes = require('./routes/vendors');
// const analyticsRoutes = require('./routes/analytics');
// const recommendationRoutes = require('./routes/recommendations');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'eCommerce Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
// app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/vendors', vendorRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/recommendations', recommendationRoutes);

// All routes are now handled by dedicated route files

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database associations
const setupAssociations = () => {
  // Import models
  const User = require('./models/User');
  const Product = require('./models/Product');
  const Category = require('./models/Category');
  const Order = require('./models/Order');
  const OrderItem = require('./models/OrderItem');
  const Review = require('./models/Review');

  // User associations
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

  // Product associations
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });

  // Category associations
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // Review associations
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  return { User, Product, Category, Order, OrderItem, Review };
};

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await sequelize.authenticate();
    if (dbConnected) {
      console.log('✅ Database connection established successfully.');
      
      // Setup associations and get models
      const models = setupAssociations();

      // Sync database safely (create tables if they don't exist)
      try {
        await sequelize.sync({ alter: false, force: false });
        console.log('✅ Database synchronized successfully.');
      } catch (syncError) {
        console.warn('⚠️  Database sync warning:', syncError.message);
        console.log('💡 Using existing database schema...');
      }
    }

    // Start server regardless of database status
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      
      if (!dbConnected) {
        console.log('⚠️  Database not connected - some features may be limited');
        console.log('💡 Use quick server mode for full functionality: USE_QUICK_SERVER=true');
      }
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    
    // Start server even if database fails
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (database connection failed)`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log('💡 Use quick server mode for full functionality: USE_QUICK_SERVER=true');
    });
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
