const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect directly to ecommerce database
const sequelize = new Sequelize(
  'ecommerce',
  'ecommerce',
  '',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
  }
);

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection successful');
    
    // Import only Sequelize models
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Product = require('./models/Product');
    
    console.log('✅ Models imported successfully');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully');
    
    await sequelize.close();
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    process.exit(1);
  }
};

setupDatabase();
