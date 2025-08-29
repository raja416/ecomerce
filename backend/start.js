const path = require('path');
require('dotenv').config();

console.log('🚀 Starting eCommerce Backend Server...');
console.log('📡 Environment:', process.env.NODE_ENV || 'development');

// Check if we should use the full server or quick server
const useFullServer = process.env.USE_FULL_SERVER === 'true' || !process.env.USE_QUICK_SERVER;

if (useFullServer) {
  console.log('🔗 Using Full Server with Database Integration');
  console.log('💾 Database: MySQL with Sequelize ORM');
  console.log('🔐 Authentication: JWT with bcrypt');
  console.log('📦 Features: Orders, Reviews, User Management');
  
  // Start the full server
  require('./server.js');
} else {
  console.log('⚡ Using Quick Server with Mock Data');
  console.log('💾 Database: Mock data (no database required)');
  console.log('🔐 Authentication: Mock authentication');
  console.log('📦 Features: Basic CRUD operations');
  
  // Start the quick server
  require('./quick-server.js');
}

console.log('✅ Server startup initiated...');
