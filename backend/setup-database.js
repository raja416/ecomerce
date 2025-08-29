const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'ecommerce_db';
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' ready`);
    
    // Import and sync models
    const Product = require('./models/Product');
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Order = require('./models/Order');
    const OrderItem = require('./models/OrderItem');
    const Review = require('./models/Review');
    
    // Sync models with force: false to avoid data loss
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database tables synchronized');
    
    console.log('🎉 Database setup complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('ER_TOO_MANY_KEYS')) {
      console.log('\n💡 Solution: Use the simplified Product model');
      console.log('   The database has too many indexes. Use quick server mode:');
      console.log('   USE_QUICK_SERVER=true npm start');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Start MySQL server or use quick server mode');
      console.log('   USE_QUICK_SERVER=true npm start');
    }
    
    return false;
  } finally {
    await sequelize.close();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = setupDatabase;
