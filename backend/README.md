# eCommerce Backend API

A comprehensive Node.js/Express.js backend API for a full-featured eCommerce platform.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, remove, and manage cart items
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: Stripe payment processing
- **Review System**: Product reviews and ratings
- **Wishlist**: User wishlist management
- **Coupon System**: Discount codes and promotional offers
- **Admin Dashboard**: Comprehensive admin panel
- **Search & Filtering**: Advanced product search and filtering
- **File Upload**: Image upload support
- **Email Notifications**: Automated email sending

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   npm run setup
   ```
   This will create:
   - Admin user (admin@example.com / admin123)
   - Sample categories
   - Sample products
   - Sample coupons

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/on-sale` - Get products on sale
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/coupon` - Apply coupon
- `DELETE /api/cart/coupon` - Remove coupon

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order from cart
- `PUT /api/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/methods` - Get payment methods

### Reviews
- `GET /api/reviews/product/:id` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Wishlist
- `GET /api/wishlist` - Get user wishlists
- `POST /api/wishlist` - Create wishlist
- `POST /api/wishlist/:id/items` - Add item to wishlist
- `DELETE /api/wishlist/:id/items/:itemId` - Remove item

### Coupons
- `GET /api/coupons` - Get active coupons
- `GET /api/coupons/:code` - Get coupon by code
- `POST /api/coupons/validate` - Validate coupon

### Admin
- `GET /api/admin/dashboard` - Dashboard overview
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/alerts/low-stock` - Low stock alerts
- `GET /api/admin/alerts/pending-reviews` - Pending reviews

## Database Models

- **User**: User accounts and profiles
- **Product**: Product information and inventory
- **Category**: Product categories and hierarchy
- **Cart**: Shopping cart and items
- **Order**: Order management and tracking
- **Review**: Product reviews and ratings
- **Wishlist**: User wishlists
- **Coupon**: Discount codes and promotions

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Request size limits

## Error Handling

The API uses centralized error handling with consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": ["Validation errors"]
  }
}
```

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Database Seeding
```bash
npm run seed
```

### Environment Variables

See `env.example` for all required environment variables.

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up Stripe production keys
4. Configure email service
5. Set up proper CORS origins
6. Use environment-specific JWT secrets

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details








