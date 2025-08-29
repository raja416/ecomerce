const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect to MySQL with ecommerce user
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

// Load only essential models for seeding to avoid association issues
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Connect to MySQL
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample categories data
const categoriesData = [
  // Electronics - Main Category
  { name: 'Electronics', description: 'Latest electronic gadgets and devices', slug: 'electronics', icon: 'smartphone', isActive: true, isFeatured: true, sortOrder: 1 },
  
  // Electronics Subcategories
  { name: 'Smartphones', description: 'Mobile phones and accessories', slug: 'smartphones', icon: 'phone', isActive: true, parentId: null, sortOrder: 11 },
  { name: 'Laptops & Computers', description: 'Computers, laptops, and accessories', slug: 'laptops-computers', icon: 'laptop', isActive: true, parentId: null, sortOrder: 12 },
  { name: 'Audio & Headphones', description: 'Speakers, headphones, and audio equipment', slug: 'audio-headphones', icon: 'headphones', isActive: true, parentId: null, sortOrder: 13 },
  { name: 'Cameras & Photography', description: 'Digital cameras and photography equipment', slug: 'cameras-photography', icon: 'camera', isActive: true, parentId: null, sortOrder: 14 },
  { name: 'Gaming', description: 'Gaming consoles and accessories', slug: 'gaming', icon: 'gamepad', isActive: true, parentId: null, sortOrder: 15 },
  { name: 'Smart Home', description: 'Smart home devices and automation', slug: 'smart-home', icon: 'home', isActive: true, parentId: null, sortOrder: 16 },
  
  // Clothing & Fashion - Main Category
  { name: 'Clothing & Fashion', description: 'Fashion and apparel for all', slug: 'clothing-fashion', icon: 'shirt', isActive: true, isFeatured: true, sortOrder: 2 },
  
  // Clothing Subcategories
  { name: "Men's Clothing", description: 'Clothing for men', slug: 'mens-clothing', icon: 'user', isActive: true, parentId: null, sortOrder: 21 },
  { name: "Women's Clothing", description: 'Clothing for women', slug: 'womens-clothing', icon: 'user', isActive: true, parentId: null, sortOrder: 22 },
  { name: "Kids' Clothing", description: 'Clothing for children', slug: 'kids-clothing', icon: 'user', isActive: true, parentId: null, sortOrder: 23 },
  { name: 'Shoes & Footwear', description: 'Shoes, sneakers, and footwear', slug: 'shoes-footwear', icon: 'shoe', isActive: true, parentId: null, sortOrder: 24 },
  { name: 'Accessories', description: 'Fashion accessories and jewelry', slug: 'accessories', icon: 'watch', isActive: true, parentId: null, sortOrder: 25 },
  { name: 'Sportswear', description: 'Athletic and sports clothing', slug: 'sportswear', icon: 'activity', isActive: true, parentId: null, sortOrder: 26 },
  
  // Home & Garden - Main Category
  { name: 'Home & Garden', description: 'Everything for your home and garden', slug: 'home-garden', icon: 'home', isActive: true, isFeatured: true, sortOrder: 3 },
  
  // Home Subcategories
  { name: 'Furniture', description: 'Home and office furniture', slug: 'furniture', icon: 'sofa', isActive: true, parentId: null, sortOrder: 31 },
  { name: 'Kitchen & Dining', description: 'Kitchen appliances and dining items', slug: 'kitchen-dining', icon: 'utensils', isActive: true, parentId: null, sortOrder: 32 },
  { name: 'Bedding & Bath', description: 'Bedding, towels, and bathroom items', slug: 'bedding-bath', icon: 'bed', isActive: true, parentId: null, sortOrder: 33 },
  { name: 'Home Decor', description: 'Decorative items for home', slug: 'home-decor', icon: 'image', isActive: true, parentId: null, sortOrder: 34 },
  { name: 'Garden & Outdoor', description: 'Garden tools and outdoor items', slug: 'garden-outdoor', icon: 'tree', isActive: true, parentId: null, sortOrder: 35 },
  { name: 'Tools & Hardware', description: 'Tools and hardware supplies', slug: 'tools-hardware', icon: 'wrench', isActive: true, parentId: null, sortOrder: 36 },
  
  // Sports & Outdoors - Main Category
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', slug: 'sports-outdoors', icon: 'activity', isActive: true, isFeatured: true, sortOrder: 4 },
  
  // Sports Subcategories
  { name: 'Fitness & Exercise', description: 'Fitness equipment and accessories', slug: 'fitness-exercise', icon: 'dumbbell', isActive: true, parentId: null, sortOrder: 41 },
  { name: 'Team Sports', description: 'Equipment for team sports', slug: 'team-sports', icon: 'football', isActive: true, parentId: null, sortOrder: 42 },
  { name: 'Outdoor Recreation', description: 'Camping and outdoor activities', slug: 'outdoor-recreation', icon: 'tent', isActive: true, parentId: null, sortOrder: 43 },
  { name: 'Water Sports', description: 'Swimming and water activities', slug: 'water-sports', icon: 'droplet', isActive: true, parentId: null, sortOrder: 44 },
  { name: 'Cycling', description: 'Bicycles and cycling gear', slug: 'cycling', icon: 'bike', isActive: true, parentId: null, sortOrder: 45 },
  
  // Books & Media - Main Category
  { name: 'Books & Media', description: 'Books, movies, and educational materials', slug: 'books-media', icon: 'book', isActive: true, isFeatured: false, sortOrder: 5 },
  
  // Books Subcategories
  { name: 'Fiction Books', description: 'Novels and fiction literature', slug: 'fiction-books', icon: 'book-open', isActive: true, parentId: null, sortOrder: 51 },
  { name: 'Non-Fiction Books', description: 'Educational and reference books', slug: 'non-fiction-books', icon: 'book', isActive: true, parentId: null, sortOrder: 52 },
  { name: 'Children\'s Books', description: 'Books for children and young adults', slug: 'childrens-books', icon: 'book', isActive: true, parentId: null, sortOrder: 53 },
  { name: 'Movies & TV Shows', description: 'DVDs and streaming content', slug: 'movies-tv-shows', icon: 'tv', isActive: true, parentId: null, sortOrder: 54 },
  { name: 'Music & Audio', description: 'CDs, vinyl, and digital music', slug: 'music-audio', icon: 'music', isActive: true, parentId: null, sortOrder: 55 },
  
  // Beauty & Personal Care
  { name: 'Beauty & Personal Care', description: 'Beauty products and personal care items', slug: 'beauty-personal-care', icon: 'heart', isActive: true, isFeatured: true, sortOrder: 6 },
  
  // Beauty Subcategories
  { name: 'Skincare', description: 'Facial and body skincare products', slug: 'skincare', icon: 'droplet', isActive: true, parentId: null, sortOrder: 61 },
  { name: 'Makeup', description: 'Cosmetics and makeup products', slug: 'makeup', icon: 'palette', isActive: true, parentId: null, sortOrder: 62 },
  { name: 'Hair Care', description: 'Hair styling and care products', slug: 'hair-care', icon: 'scissors', isActive: true, parentId: null, sortOrder: 63 },
  { name: 'Fragrances', description: 'Perfumes and colognes', slug: 'fragrances', icon: 'zap', isActive: true, parentId: null, sortOrder: 64 },
  { name: 'Personal Care', description: 'Hygiene and personal care items', slug: 'personal-care', icon: 'user', isActive: true, parentId: null, sortOrder: 65 },
  
  // Toys & Games
  { name: 'Toys & Games', description: 'Toys, games, and entertainment for all ages', slug: 'toys-games', icon: 'gamepad', isActive: true, isFeatured: false, sortOrder: 7 },
  
  // Toys Subcategories
  { name: 'Building Toys', description: 'LEGO and construction toys', slug: 'building-toys', icon: 'puzzle', isActive: true, parentId: null, sortOrder: 71 },
  { name: 'Board Games', description: 'Family and strategy board games', slug: 'board-games', icon: 'grid', isActive: true, parentId: null, sortOrder: 72 },
  { name: 'Educational Toys', description: 'Learning and educational toys', slug: 'educational-toys', icon: 'book', isActive: true, parentId: null, sortOrder: 73 },
  { name: 'Action Figures', description: 'Collectible action figures and dolls', slug: 'action-figures', icon: 'user', isActive: true, parentId: null, sortOrder: 74 },
  { name: 'Outdoor Toys', description: 'Toys for outdoor play', slug: 'outdoor-toys', icon: 'sun', isActive: true, parentId: null, sortOrder: 75 }
];

// Sample products data
const productsData = [
  // Smartphones - Multiple similar items for filtering
  {
    name: 'iPhone 15 Pro Max',
    description: 'The most advanced iPhone with A17 Pro chip and titanium design',
    shortDescription: 'Latest iPhone with pro camera system',
    price: 1199.99,
    comparePrice: 1299.99,
    brand: 'Apple',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'iPhone 15 Pro Max', isPrimary: true }],
    tags: ['smartphone', 'iphone', 'apple', '5g'],
    attributes: [{ name: 'Color', value: 'Natural Titanium' }, { name: 'Storage', value: '256GB' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 8,
    status: 'published',
    viewCount: 1250,
    purchaseCount: 89
  },
  {
    name: 'iPhone 15 Pro',
    description: 'Premium iPhone with A17 Pro chip and titanium design',
    shortDescription: 'Premium iPhone with pro features',
    price: 999.99,
    comparePrice: 1099.99,
    brand: 'Apple',
    stock: 75,
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'iPhone 15 Pro', isPrimary: true }],
    tags: ['smartphone', 'iphone', 'apple', '5g'],
    attributes: [{ name: 'Color', value: 'Natural Titanium' }, { name: 'Storage', value: '128GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 9,
    status: 'published',
    viewCount: 980,
    purchaseCount: 67
  },
  {
    name: 'iPhone 15',
    description: 'Latest iPhone with A16 Bionic chip',
    shortDescription: 'Latest iPhone with great features',
    price: 799.99,
    comparePrice: 899.99,
    brand: 'Apple',
    stock: 120,
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'iPhone 15', isPrimary: true }],
    tags: ['smartphone', 'iphone', 'apple', '5g'],
    attributes: [{ name: 'Color', value: 'Blue' }, { name: 'Storage', value: '128GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 11,
    status: 'published',
    viewCount: 890,
    purchaseCount: 45
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and AI features',
    shortDescription: 'Premium Android smartphone with AI',
    price: 1299.99,
    comparePrice: 1399.99,
    brand: 'Samsung',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', alt: 'Samsung Galaxy S24 Ultra', isPrimary: true }],
    tags: ['smartphone', 'samsung', 'android', '5g'],
    attributes: [{ name: 'Color', value: 'Titanium Gray' }, { name: 'Storage', value: '512GB' }],
    isFeatured: true,
    isOnSale: false,
    status: 'published',
    viewCount: 980,
    purchaseCount: 67
  },
  {
    name: 'Samsung Galaxy S24+',
    description: 'Advanced Android smartphone with AI features',
    shortDescription: 'Advanced Android smartphone',
    price: 999.99,
    comparePrice: 1099.99,
    brand: 'Samsung',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', alt: 'Samsung Galaxy S24+', isPrimary: true }],
    tags: ['smartphone', 'samsung', 'android', '5g'],
    attributes: [{ name: 'Color', value: 'Onyx Black' }, { name: 'Storage', value: '256GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 9,
    status: 'published',
    viewCount: 756,
    purchaseCount: 34
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Google\'s flagship with advanced AI and camera',
    shortDescription: 'Google\'s flagship smartphone',
    price: 999.99,
    comparePrice: 1099.99,
    brand: 'Google',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'Google Pixel 8 Pro', isPrimary: true }],
    tags: ['smartphone', 'google', 'pixel', '5g'],
    attributes: [{ name: 'Color', value: 'Obsidian' }, { name: 'Storage', value: '256GB' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 9,
    status: 'published',
    viewCount: 678,
    purchaseCount: 23
  },
  {
    name: 'OnePlus 12',
    description: 'Fast and smooth Android experience',
    shortDescription: 'Fast Android smartphone',
    price: 799.99,
    comparePrice: 899.99,
    brand: 'OnePlus',
    stock: 55,
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'OnePlus 12', isPrimary: true }],
    tags: ['smartphone', 'oneplus', 'android', '5g'],
    attributes: [{ name: 'Color', value: 'Silk Black' }, { name: 'Storage', value: '256GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 11,
    status: 'published',
    viewCount: 445,
    purchaseCount: 28
  },

  // Laptops & Computers - Multiple similar items
  {
    name: 'MacBook Pro 16-inch M3 Max',
    description: 'Ultimate MacBook Pro with M3 Max chip for professional workflows',
    shortDescription: 'Ultimate MacBook Pro with M3 Max chip',
    price: 3499.99,
    comparePrice: 3699.99,
    brand: 'Apple',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'MacBook Pro 16-inch', isPrimary: true }],
    tags: ['laptop', 'macbook', 'apple', 'm3-max'],
    attributes: [{ name: 'Color', value: 'Space Black' }, { name: 'Storage', value: '1TB' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 5,
    status: 'published',
    viewCount: 756,
    purchaseCount: 23
  },
  {
    name: 'MacBook Pro 14-inch M3 Pro',
    description: 'Powerful MacBook Pro with M3 Pro chip',
    shortDescription: 'Powerful MacBook Pro',
    price: 1999.99,
    comparePrice: 2199.99,
    brand: 'Apple',
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'MacBook Pro 14-inch', isPrimary: true }],
    tags: ['laptop', 'macbook', 'apple', 'm3-pro'],
    attributes: [{ name: 'Color', value: 'Space Gray' }, { name: 'Storage', value: '512GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 9,
    status: 'published',
    viewCount: 567,
    purchaseCount: 18
  },
  {
    name: 'MacBook Air 15-inch M2',
    description: 'Lightweight and powerful MacBook Air',
    shortDescription: 'Lightweight MacBook Air',
    price: 1299.99,
    comparePrice: 1399.99,
    brand: 'Apple',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'MacBook Air 15-inch', isPrimary: true }],
    tags: ['laptop', 'macbook', 'apple', 'm2'],
    attributes: [{ name: 'Color', value: 'Midnight' }, { name: 'Storage', value: '256GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 7,
    status: 'published',
    viewCount: 890,
    purchaseCount: 45
  },
  {
    name: 'Dell XPS 15',
    description: 'Premium Windows laptop with OLED display',
    shortDescription: 'Premium Windows laptop',
    price: 1899.99,
    comparePrice: 2099.99,
    brand: 'Dell',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'Dell XPS 15', isPrimary: true }],
    tags: ['laptop', 'dell', 'windows', 'oled'],
    attributes: [{ name: 'Color', value: 'Platinum Silver' }, { name: 'Storage', value: '1TB' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 10,
    status: 'published',
    viewCount: 445,
    purchaseCount: 12
  },
  {
    name: 'HP Spectre x360',
    description: 'Convertible laptop with premium design',
    shortDescription: 'Convertible premium laptop',
    price: 1499.99,
    comparePrice: 1699.99,
    brand: 'HP',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'HP Spectre x360', isPrimary: true }],
    tags: ['laptop', 'hp', 'windows', 'convertible'],
    attributes: [{ name: 'Color', value: 'Nightfall Black' }, { name: 'Storage', value: '512GB' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 12,
    status: 'published',
    viewCount: 334,
    purchaseCount: 19
  },

  // Audio & Headphones - Multiple similar items
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise-canceling headphones',
    shortDescription: 'Premium noise-canceling headphones',
    price: 399.99,
    comparePrice: 449.99,
    brand: 'Sony',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Sony WH-1000XM5', isPrimary: true }],
    tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
    attributes: [{ name: 'Color', value: 'Black' }, { name: 'Battery Life', value: '30 hours' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 11,
    status: 'published',
    viewCount: 1234,
    purchaseCount: 89
  },
  {
    name: 'Bose QuietComfort 45',
    description: 'Comfortable noise-canceling headphones',
    shortDescription: 'Comfortable noise-canceling headphones',
    price: 329.99,
    comparePrice: 379.99,
    brand: 'Bose',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Bose QuietComfort 45', isPrimary: true }],
    tags: ['headphones', 'bose', 'wireless', 'noise-canceling'],
    attributes: [{ name: 'Color', value: 'Triple Black' }, { name: 'Battery Life', value: '24 hours' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 13,
    status: 'published',
    viewCount: 987,
    purchaseCount: 67
  },
  {
    name: 'Apple AirPods Pro 2',
    description: 'Premium wireless earbuds with active noise cancellation',
    shortDescription: 'Premium wireless earbuds',
    price: 249.99,
    comparePrice: 279.99,
    brand: 'Apple',
    stock: 80,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Apple AirPods Pro 2', isPrimary: true }],
    tags: ['earbuds', 'apple', 'wireless', 'noise-canceling'],
    attributes: [{ name: 'Color', value: 'White' }, { name: 'Battery Life', value: '6 hours' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 11,
    status: 'published',
    viewCount: 2345,
    purchaseCount: 156
  },
  {
    name: 'Samsung Galaxy Buds2 Pro',
    description: 'Premium wireless earbuds with 24-bit audio',
    shortDescription: 'Premium wireless earbuds',
    price: 229.99,
    comparePrice: 259.99,
    brand: 'Samsung',
    stock: 70,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Samsung Galaxy Buds2 Pro', isPrimary: true }],
    tags: ['earbuds', 'samsung', 'wireless', '24-bit'],
    attributes: [{ name: 'Color', value: 'Phantom Black' }, { name: 'Battery Life', value: '5 hours' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 12,
    status: 'published',
    viewCount: 678,
    purchaseCount: 34
  },

  // Shoes & Footwear - Multiple similar items
  {
    name: 'Nike Air Jordan 1 Retro High OG',
    description: 'Classic Air Jordan 1 in Chicago colorway',
    shortDescription: 'Classic Air Jordan 1 Chicago',
    price: 179.99,
    comparePrice: 199.99,
    brand: 'Nike',
    stock: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Nike Air Jordan 1', isPrimary: true }],
    tags: ['shoes', 'nike', 'jordan', 'basketball'],
    attributes: [{ name: 'Color', value: 'Chicago' }, { name: 'Size', value: 'US 10' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 10,
    status: 'published',
    viewCount: 2340,
    purchaseCount: 156
  },
  {
    name: 'Nike Air Jordan 1 Retro High OG Shadow',
    description: 'Classic Air Jordan 1 in Shadow colorway',
    shortDescription: 'Classic Air Jordan 1 Shadow',
    price: 169.99,
    comparePrice: 189.99,
    brand: 'Nike',
    stock: 85,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Nike Air Jordan 1 Shadow', isPrimary: true }],
    tags: ['shoes', 'nike', 'jordan', 'basketball'],
    attributes: [{ name: 'Color', value: 'Shadow' }, { name: 'Size', value: 'US 10' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 11,
    status: 'published',
    viewCount: 1890,
    purchaseCount: 123
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with responsive cushioning',
    shortDescription: 'Premium running shoes',
    price: 189.99,
    comparePrice: 209.99,
    brand: 'Adidas',
    stock: 75,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Adidas Ultraboost 22', isPrimary: true }],
    tags: ['shoes', 'adidas', 'running', 'ultraboost'],
    attributes: [{ name: 'Color', value: 'Core Black' }, { name: 'Size', value: 'US 10' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 10,
    status: 'published',
    viewCount: 1456,
    purchaseCount: 89
  },
  {
    name: 'Adidas Stan Smith',
    description: 'Classic tennis shoes with timeless design',
    shortDescription: 'Classic tennis shoes',
    price: 89.99,
    comparePrice: 99.99,
    brand: 'Adidas',
    stock: 120,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Adidas Stan Smith', isPrimary: true }],
    tags: ['shoes', 'adidas', 'tennis', 'classic'],
    attributes: [{ name: 'Color', value: 'White/Green' }, { name: 'Size', value: 'US 10' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 10,
    status: 'published',
    viewCount: 2345,
    purchaseCount: 178
  },
  {
    name: 'Converse Chuck Taylor All Star',
    description: 'Iconic canvas sneakers for everyday wear',
    shortDescription: 'Iconic canvas sneakers',
    price: 69.99,
    comparePrice: 79.99,
    brand: 'Converse',
    stock: 200,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Converse Chuck Taylor', isPrimary: true }],
    tags: ['shoes', 'converse', 'canvas', 'classic'],
    attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'US 10' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 13,
    status: 'published',
    viewCount: 3456,
    purchaseCount: 234
  },

  // Smart Home - Multiple similar items
  {
    name: 'Philips Hue Smart Bulb Starter Kit',
    description: 'Smart lighting system with voice control and app management',
    shortDescription: 'Smart lighting system',
    price: 199.99,
    comparePrice: 249.99,
    brand: 'Philips',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Philips Hue Smart Bulb', isPrimary: true }],
    tags: ['smart home', 'lighting', 'philips', 'hue'],
    attributes: [{ name: 'Color', value: 'White and Color' }, { name: 'Wattage', value: '9W' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 20,
    status: 'published',
    viewCount: 567,
    purchaseCount: 89
  },
  {
    name: 'Philips Hue White Ambiance Starter Kit',
    description: 'Smart white lighting with warm to cool white control',
    shortDescription: 'Smart white lighting system',
    price: 149.99,
    comparePrice: 179.99,
    brand: 'Philips',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Philips Hue White Ambiance', isPrimary: true }],
    tags: ['smart home', 'lighting', 'philips', 'hue'],
    attributes: [{ name: 'Color', value: 'White Ambiance' }, { name: 'Wattage', value: '9W' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 17,
    status: 'published',
    viewCount: 445,
    purchaseCount: 67
  },
  {
    name: 'Amazon Echo Dot (5th Gen)',
    description: 'Smart speaker with Alexa voice assistant',
    shortDescription: 'Smart speaker with Alexa',
    price: 49.99,
    comparePrice: 59.99,
    brand: 'Amazon',
    stock: 150,
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Amazon Echo Dot', isPrimary: true }],
    tags: ['smart home', 'speaker', 'amazon', 'alexa'],
    attributes: [{ name: 'Color', value: 'Charcoal' }, { name: 'Power', value: '15W' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 17,
    status: 'published',
    viewCount: 2345,
    purchaseCount: 189
  },
  {
    name: 'Google Nest Hub (2nd Gen)',
    description: 'Smart display with Google Assistant',
    shortDescription: 'Smart display with Google Assistant',
    price: 99.99,
    comparePrice: 119.99,
    brand: 'Google',
    stock: 80,
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Google Nest Hub', isPrimary: true }],
    tags: ['smart home', 'display', 'google', 'assistant'],
    attributes: [{ name: 'Color', value: 'Chalk' }, { name: 'Screen', value: '7-inch' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 17,
    status: 'published',
    viewCount: 890,
    purchaseCount: 56
  },

  // Beauty & Hair Care - Multiple similar items
  {
    name: 'Dyson Airwrap Multi-styler Complete',
    description: 'Revolutionary hair styling tool with multiple attachments',
    shortDescription: 'Revolutionary hair styling tool',
    price: 599.99,
    comparePrice: 699.99,
    brand: 'Dyson',
    stock: 12,
    images: [{ url: 'https://images.unsplash.com/photo-1522338146-11119349c441?w=500', alt: 'Dyson Airwrap Multi-styler', isPrimary: true }],
    tags: ['beauty', 'hair', 'dyson', 'styling'],
    attributes: [{ name: 'Color', value: 'Nickel/Copper' }, { name: 'Power', value: '1300W' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 14,
    status: 'published',
    viewCount: 2345,
    purchaseCount: 178
  },
  {
    name: 'Dyson Supersonic Hair Dryer',
    description: 'Revolutionary hair dryer with intelligent heat control',
    shortDescription: 'Revolutionary hair dryer',
    price: 429.99,
    comparePrice: 499.99,
    brand: 'Dyson',
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1522338146-11119349c441?w=500', alt: 'Dyson Supersonic', isPrimary: true }],
    tags: ['beauty', 'hair', 'dyson', 'dryer'],
    attributes: [{ name: 'Color', value: 'Nickel/Copper' }, { name: 'Power', value: '1600W' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 14,
    status: 'published',
    viewCount: 1890,
    purchaseCount: 134
  },
  {
    name: 'Revlon One-Step Hair Dryer & Volumizer',
    description: '2-in-1 hair dryer and volumizer for salon-quality results',
    shortDescription: '2-in-1 hair dryer and volumizer',
    price: 39.99,
    comparePrice: 49.99,
    brand: 'Revlon',
    stock: 200,
    images: [{ url: 'https://images.unsplash.com/photo-1522338146-11119349c441?w=500', alt: 'Revlon One-Step', isPrimary: true }],
    tags: ['beauty', 'hair', 'revlon', 'styling'],
    attributes: [{ name: 'Color', value: 'Black' }, { name: 'Power', value: '1100W' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 20,
    status: 'published',
    viewCount: 4567,
    purchaseCount: 345
  },
  {
    name: 'BaBylissPRO Nano Titanium Hair Dryer',
    description: 'Professional hair dryer with nano titanium technology',
    shortDescription: 'Professional hair dryer',
    price: 89.99,
    comparePrice: 109.99,
    brand: 'BaBylissPRO',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1522338146-11119349c441?w=500', alt: 'BaBylissPRO Nano', isPrimary: true }],
    tags: ['beauty', 'hair', 'babylisspro', 'professional'],
    attributes: [{ name: 'Color', value: 'Black' }, { name: 'Power', value: '2000W' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 18,
    status: 'published',
    viewCount: 1234,
    purchaseCount: 78
  },

  // Building Toys - Multiple similar items
  {
    name: 'LEGO Star Wars Millennium Falcon',
    description: 'Iconic Star Wars spaceship with 1,329 pieces',
    shortDescription: 'Iconic Star Wars spaceship',
    price: 159.99,
    comparePrice: 179.99,
    brand: 'LEGO',
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500', alt: 'LEGO Star Wars Millennium Falcon', isPrimary: true }],
    tags: ['lego', 'star wars', 'toy', 'building'],
    attributes: [{ name: 'Pieces', value: '1,329' }, { name: 'Age Range', value: '9+' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 11,
    status: 'published',
    viewCount: 1234,
    purchaseCount: 89
  },
  {
    name: 'LEGO Star Wars AT-AT Walker',
    description: 'Imperial AT-AT Walker with 1,267 pieces',
    shortDescription: 'Imperial AT-AT Walker',
    price: 139.99,
    comparePrice: 159.99,
    brand: 'LEGO',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500', alt: 'LEGO Star Wars AT-AT', isPrimary: true }],
    tags: ['lego', 'star wars', 'toy', 'building'],
    attributes: [{ name: 'Pieces', value: '1,267' }, { name: 'Age Range', value: '9+' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 13,
    status: 'published',
    viewCount: 890,
    purchaseCount: 67
  },
  {
    name: 'LEGO Architecture Empire State Building',
    description: 'Iconic New York skyscraper with 1,767 pieces',
    shortDescription: 'Iconic New York skyscraper',
    price: 119.99,
    comparePrice: 139.99,
    brand: 'LEGO',
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500', alt: 'LEGO Architecture Empire State', isPrimary: true }],
    tags: ['lego', 'architecture', 'toy', 'building'],
    attributes: [{ name: 'Pieces', value: '1,767' }, { name: 'Age Range', value: '12+' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 14,
    status: 'published',
    viewCount: 567,
    purchaseCount: 34
  },
  {
    name: 'LEGO Technic Bugatti Chiron',
    description: 'Detailed sports car replica with 3,599 pieces',
    shortDescription: 'Detailed sports car replica',
    price: 379.99,
    comparePrice: 399.99,
    brand: 'LEGO',
    stock: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500', alt: 'LEGO Technic Bugatti', isPrimary: true }],
    tags: ['lego', 'technic', 'toy', 'building'],
    attributes: [{ name: 'Pieces', value: '3,599' }, { name: 'Age Range', value: '16+' }],
    isFeatured: true,
    isOnSale: true,
    salePercentage: 5,
    status: 'published',
    viewCount: 234,
    purchaseCount: 12
  },

  // Outdoor Recreation - Multiple similar items
  {
    name: 'Yeti Tundra 65 Cooler',
    description: 'Premium cooler with superior ice retention',
    shortDescription: 'Premium cooler with ice retention',
    price: 399.99,
    comparePrice: 449.99,
    brand: 'Yeti',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', alt: 'Yeti Tundra 65 Cooler', isPrimary: true }],
    tags: ['cooler', 'outdoor', 'yeti', 'camping'],
    attributes: [{ name: 'Color', value: 'White' }, { name: 'Capacity', value: '65 quarts' }],
    isFeatured: true,
    isOnSale: false,
    status: 'published',
    viewCount: 789,
    purchaseCount: 45
  },
  {
    name: 'Yeti Tundra 45 Cooler',
    description: 'Medium-sized cooler with superior ice retention',
    shortDescription: 'Medium-sized cooler',
    price: 299.99,
    comparePrice: 349.99,
    brand: 'Yeti',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', alt: 'Yeti Tundra 45 Cooler', isPrimary: true }],
    tags: ['cooler', 'outdoor', 'yeti', 'camping'],
    attributes: [{ name: 'Color', value: 'White' }, { name: 'Capacity', value: '45 quarts' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 14,
    status: 'published',
    viewCount: 567,
    purchaseCount: 34
  },
  {
    name: 'Coleman 6-Person Tent',
    description: 'Spacious tent for family camping adventures',
    shortDescription: 'Spacious family tent',
    price: 149.99,
    comparePrice: 179.99,
    brand: 'Coleman',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', alt: 'Coleman 6-Person Tent', isPrimary: true }],
    tags: ['tent', 'outdoor', 'coleman', 'camping'],
    attributes: [{ name: 'Color', value: 'Green' }, { name: 'Capacity', value: '6 people' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 17,
    status: 'published',
    viewCount: 1234,
    purchaseCount: 89
  },
  {
    name: 'REI Co-op Half Dome 2 Plus Tent',
    description: 'Lightweight backpacking tent for two people',
    shortDescription: 'Lightweight backpacking tent',
    price: 229.99,
    comparePrice: 259.99,
    brand: 'REI Co-op',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', alt: 'REI Co-op Half Dome Tent', isPrimary: true }],
    tags: ['tent', 'outdoor', 'rei', 'backpacking'],
    attributes: [{ name: 'Color', value: 'Orange' }, { name: 'Capacity', value: '2 people' }],
    isFeatured: false,
    isOnSale: true,
    salePercentage: 12,
    status: 'published',
    viewCount: 678,
    purchaseCount: 23
  }
];

// Sample users data
const usersData = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'Admin123!',
    role: 'admin',
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'User123!',
    role: 'user',
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'User123!',
    role: 'user',
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Tech Vendor',
    email: 'tech@vendor.com',
    password: 'Vendor123!',
    role: 'vendor',
    isEmailVerified: true,
    isActive: true
  }
];



// Seed function
const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Create admin user first
    const adminUser = await User.create(usersData[0]);
    console.log('Created admin user');

    // Create regular users
    const regularUsers = await User.create(usersData.slice(1, 3));
    console.log('Created regular users');

    // Create vendor user
    const vendorUser = await User.create(usersData[3]);
    console.log('Created vendor user');

    // Create categories
    const categories = await Category.create(
      categoriesData.map(cat => ({ ...cat, createdBy: adminUser.id }))
    );
    console.log(`Created ${categories.length} categories`);

    // Create products with proper category mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Map products to their appropriate categories
    const productsWithCategories = productsData.map(product => {
      let categoryId;
      
      // Smartphones
      if (product.tags.includes('smartphone')) {
        categoryId = categoryMap['Smartphones'];
      }
      // Laptops
      else if (product.tags.includes('laptop') || product.tags.includes('macbook')) {
        categoryId = categoryMap['Laptops & Computers'];
      }
      // Audio & Headphones
      else if (product.tags.includes('headphones') || product.tags.includes('earbuds')) {
        categoryId = categoryMap['Audio & Headphones'];
      }
      // Shoes & Footwear
      else if (product.tags.includes('shoes')) {
        categoryId = categoryMap['Shoes & Footwear'];
      }
      // Smart Home
      else if (product.tags.includes('smart home')) {
        categoryId = categoryMap['Smart Home'];
      }
      // Beauty & Hair Care
      else if (product.tags.includes('beauty') || product.tags.includes('hair')) {
        categoryId = categoryMap['Hair Care'];
      }
      // Building Toys
      else if (product.tags.includes('lego')) {
        categoryId = categoryMap['Building Toys'];
      }
      // Outdoor Recreation
      else if (product.tags.includes('outdoor') || product.tags.includes('camping') || product.tags.includes('cooler') || product.tags.includes('tent')) {
        categoryId = categoryMap['Outdoor Recreation'];
      }
      // Default to Electronics if no match
      else {
        categoryId = categoryMap['Electronics'];
      }

      return {
        ...product,
        categoryId,
        createdBy: adminUser.id,
        vendorId: vendorUser.id
      };
    });

    const products = await Product.create(productsWithCategories);
    console.log(`Created ${products.length} products`);

    console.log('Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${categories.length} categories`);
    console.log(`- ${products.length} products`);
    console.log(`- ${usersData.length} users (including admin and vendor)`);
    console.log('\nAdmin credentials:');
    console.log('Email: admin@ecommerce.com');
    console.log('Password: Admin123!');
    console.log('\nRegular user credentials:');
    console.log('Email: john@example.com');
    console.log('Password: User123!');
    console.log('\nVendor credentials:');
    console.log('Email: tech@vendor.com');
    console.log('Password: Vendor123!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedData();
  });
}

module.exports = { seedData };


