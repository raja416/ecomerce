const Category = require('./models/Category');
const Product = require('./models/Product');
const sequelize = require('./config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Get existing categories
    const categories = await Category.findAll();
    console.log(`✅ Found ${categories.length} existing categories`);

    if (categories.length === 0) {
      console.log('❌ No categories found. Please create categories first.');
      return;
    }

    // Get category IDs
    const electronicsId = categories.find(c => c.slug === 'electronics')?.id;
    const clothingId = categories.find(c => c.slug === 'clothing')?.id;
    const homeGardenId = categories.find(c => c.slug === 'home-garden')?.id;
    const sportsId = categories.find(c => c.slug === 'sports')?.id;
    const booksId = categories.find(c => c.slug === 'books')?.id;

    if (!electronicsId || !clothingId || !homeGardenId || !sportsId || !booksId) {
      console.log('❌ Missing required categories. Please ensure all categories exist.');
      return;
    }

    // Check if products already exist
    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      console.log(`🗑️ Found ${existingProducts} existing products. Clearing and re-seeding...`);
      await Product.destroy({ where: {} });
    }

    // Create products
    const products = await Product.bulkCreate([
      // Electronics
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with active noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
        price: 299.99,
        originalPrice: 399.99,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'],
        categoryId: electronicsId,
        stock: 50,
        brand: 'AudioTech',
        tags: 'headphones, wireless, bluetooth, noise-cancelling',
        rating: 4.8,
        reviews: 1247,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Smartphone Pro Max',
        description: 'Latest smartphone with advanced camera system, powerful processor, and all-day battery life. The ultimate mobile experience.',
        price: 1299.99,
        originalPrice: 1499.99,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'],
        categoryId: electronicsId,
        stock: 25,
        brand: 'TechPhone',
        tags: 'smartphone, mobile, camera, 5g',
        rating: 4.9,
        reviews: 2156,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Gaming Laptop Elite',
        description: 'High-performance gaming laptop with RTX graphics, fast refresh rate, and premium build quality. Built for gamers.',
        price: 2499.99,
        originalPrice: 2799.99,
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop'],
        categoryId: electronicsId,
        stock: 15,
        brand: 'GameTech',
        tags: 'laptop, gaming, rtx, performance',
        rating: 4.7,
        reviews: 892,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Smart Watch Series 5',
        description: 'Advanced smartwatch with health monitoring, GPS tracking, and seamless smartphone integration.',
        price: 399.99,
        originalPrice: 499.99,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'],
        categoryId: electronicsId,
        stock: 75,
        brand: 'SmartWear',
        tags: 'smartwatch, fitness, health, wearable',
        rating: 4.6,
        reviews: 634,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },

      // Clothing
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable and stylish cotton t-shirt made from 100% organic cotton. Available in multiple colors and sizes.',
        price: 29.99,
        originalPrice: 39.99,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop'],
        categoryId: clothingId,
        stock: 200,
        brand: 'FashionCo',
        tags: 't-shirt, cotton, casual, comfortable',
        rating: 4.5,
        reviews: 456,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Designer Jeans',
        description: 'Premium designer jeans with perfect fit and modern styling. Made from high-quality denim.',
        price: 89.99,
        originalPrice: 119.99,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop'],
        categoryId: clothingId,
        stock: 100,
        brand: 'DenimStyle',
        tags: 'jeans, denim, designer, fashion',
        rating: 4.4,
        reviews: 234,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Winter Jacket',
        description: 'Warm and stylish winter jacket perfect for cold weather. Waterproof and insulated.',
        price: 199.99,
        originalPrice: 249.99,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop'],
        categoryId: clothingId,
        stock: 60,
        brand: 'OutdoorGear',
        tags: 'jacket, winter, warm, waterproof',
        rating: 4.7,
        reviews: 189,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },

      // Home & Garden
      {
        name: 'Smart Home Hub',
        description: 'Central hub for controlling all your smart home devices. Compatible with major smart home platforms.',
        price: 149.99,
        originalPrice: 199.99,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
        categoryId: homeGardenId,
        stock: 40,
        brand: 'SmartHome',
        tags: 'smart home, hub, automation, iot',
        rating: 4.6,
        reviews: 312,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Garden Tool Set',
        description: 'Complete garden tool set with essential tools for maintaining your garden. Durable and ergonomic design.',
        price: 79.99,
        originalPrice: 99.99,
        images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop'],
        categoryId: homeGardenId,
        stock: 80,
        brand: 'GardenPro',
        tags: 'garden, tools, maintenance, outdoor',
        rating: 4.3,
        reviews: 156,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },

      // Sports
      {
        name: 'Professional Basketball',
        description: 'Official size and weight basketball for professional play. Premium leather construction.',
        price: 49.99,
        originalPrice: 69.99,
        images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop'],
        categoryId: sportsId,
        stock: 120,
        brand: 'SportPro',
        tags: 'basketball, sports, professional, leather',
        rating: 4.8,
        reviews: 423,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Yoga Mat Premium',
        description: 'High-quality yoga mat with excellent grip and cushioning. Perfect for yoga and fitness activities.',
        price: 39.99,
        originalPrice: 59.99,
        images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'],
        categoryId: sportsId,
        stock: 150,
        brand: 'FitLife',
        tags: 'yoga, mat, fitness, exercise',
        rating: 4.5,
        reviews: 267,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },

      // Books
      {
        name: 'The Art of Programming',
        description: 'Comprehensive guide to modern programming practices and techniques. Perfect for developers.',
        price: 49.99,
        originalPrice: 69.99,
        images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'],
        categoryId: booksId,
        stock: 200,
        brand: 'TechBooks',
        tags: 'programming, coding, software, development',
        rating: 4.9,
        reviews: 892,
        isActive: true,
        status: 'draft',
        createdBy: 1
      },
      {
        name: 'Business Strategy Guide',
        description: 'Essential business strategy book for entrepreneurs and business leaders.',
        price: 34.99,
        originalPrice: 44.99,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop'],
        categoryId: booksId,
        stock: 180,
        brand: 'BusinessPress',
        tags: 'business, strategy, entrepreneurship, leadership',
        rating: 4.6,
        reviews: 345,
        isActive: true,
        status: 'draft',
        createdBy: 1
      }
    ]);

    console.log('✅ Products created successfully');
    console.log(`📊 Created ${products.length} products`);
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the seeding
seedData();
