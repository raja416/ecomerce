const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return adminExists;
    }

    const hashedPassword = await bcrypt.hash('Arin@123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'arin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

const createSampleCategories = async () => {
  try {
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
        image: 'https://via.placeholder.com/300x200?text=Electronics'
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
        slug: 'clothing',
        image: 'https://via.placeholder.com/300x200?text=Clothing'
      },
      {
        name: 'Books',
        description: 'Books and literature',
        slug: 'books',
        image: 'https://via.placeholder.com/300x200?text=Books'
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        slug: 'home-garden',
        image: 'https://via.placeholder.com/300x200?text=Home+%26+Garden'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (!existingCategory) {
        const category = await Category.create(categoryData);
        createdCategories.push(category);
        console.log(`Category created: ${category.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`Category already exists: ${existingCategory.name}`);
      }
    }

    return createdCategories;
  } catch (error) {
    console.error('Error creating categories:', error.message);
  }
};

const createSampleProducts = async (categories) => {
  try {
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        category: categories[0]._id, // Electronics
        brand: 'TechBrand',
        stock: 50,
        images: [
          'https://via.placeholder.com/400x400?text=Headphones+1',
          'https://via.placeholder.com/400x400?text=Headphones+2'
        ],
        isFeatured: true,
        isOnSale: false,
        rating: 4.5,
        reviewCount: 25
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt in various colors',
        price: 19.99,
        category: categories[1]._id, // Clothing
        brand: 'FashionBrand',
        stock: 100,
        images: [
          'https://via.placeholder.com/400x400?text=T-Shirt+1',
          'https://via.placeholder.com/400x400?text=T-Shirt+2'
        ],
        isFeatured: false,
        isOnSale: true,
        salePrice: 14.99,
        rating: 4.2,
        reviewCount: 15
      },
      {
        name: 'Programming Book',
        description: 'Comprehensive guide to modern programming',
        price: 49.99,
        category: categories[2]._id, // Books
        brand: 'TechBooks',
        stock: 30,
        images: [
          'https://via.placeholder.com/400x400?text=Book+1',
          'https://via.placeholder.com/400x400?text=Book+2'
        ],
        isFeatured: true,
        isOnSale: false,
        rating: 4.8,
        reviewCount: 42
      },
      {
        name: 'Garden Tool Set',
        description: 'Complete set of essential garden tools',
        price: 79.99,
        category: categories[3]._id, // Home & Garden
        brand: 'GardenPro',
        stock: 25,
        images: [
          'https://via.placeholder.com/400x400?text=Tools+1',
          'https://via.placeholder.com/400x400?text=Tools+2'
        ],
        isFeatured: false,
        isOnSale: true,
        salePrice: 59.99,
        rating: 4.3,
        reviewCount: 18
      }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = await Product.create(productData);
        console.log(`Product created: ${product.name}`);
      } else {
        console.log(`Product already exists: ${existingProduct.name}`);
      }
    }
  } catch (error) {
    console.error('Error creating products:', error.message);
  }
};

const createSampleCoupons = async () => {
  try {
    const coupons = [
      {
        code: 'WELCOME20',
        type: 'percentage',
        value: 20,
        minOrderAmount: 50,
        maxDiscount: 100,
        usageLimit: 100,
        userUsageLimit: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: '20% off for new customers'
      },
      {
        code: 'SAVE10',
        type: 'fixed',
        value: 10,
        minOrderAmount: 25,
        usageLimit: 50,
        userUsageLimit: 1,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        description: '$10 off orders over $25'
      }
    ];

    for (const couponData of coupons) {
      const existingCoupon = await Coupon.findOne({ code: couponData.code });
      if (!existingCoupon) {
        const coupon = await Coupon.create(couponData);
        console.log(`Coupon created: ${coupon.code}`);
      } else {
        console.log(`Coupon already exists: ${existingCoupon.code}`);
      }
    }
  } catch (error) {
    console.error('Error creating coupons:', error.message);
  }
};

const setup = async () => {
  try {
    console.log('Starting setup...');
    
    // Connect to database
    await connectDB();
    
    // Create admin user
    await createAdminUser();
    
    // Create sample categories
    const categories = await createSampleCategories();
    
    // Create sample products
    await createSampleProducts(categories);
    
    // Create sample coupons
    await createSampleCoupons();
    
    console.log('Setup completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: arin@gmail.com');
    console.log('Password: Arin@123');
    console.log('\nSample coupon codes:');
    console.log('WELCOME20 - 20% off (min $50)');
    console.log('SAVE10 - $10 off (min $25)');
    
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };








