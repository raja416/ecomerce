# 🛒 eCommerce Full-Stack Application

A complete eCommerce platform built with React, Node.js, and MySQL. This project demonstrates full-stack development skills with modern web technologies.

## 🚀 Live Demo

[View Live Demo](https://your-demo-link.com) *(Coming Soon)*

## ✨ Features

### 🛍️ E-commerce Functionality
- **Product Catalog** - Browse and search products
- **Shopping Cart** - Add, remove, and manage items
- **User Authentication** - Secure login/registration system
- **Checkout Process** - Multi-step checkout with payment
- **Admin Panel** - Product and order management
- **Responsive Design** - Mobile-friendly interface

### 🔧 Technical Features
- **Full-Stack Architecture** - React frontend + Node.js backend
- **RESTful API** - Well-structured API endpoints
- **Database Integration** - MySQL with Sequelize ORM
- **JWT Authentication** - Secure user sessions
- **Error Handling** - Graceful error management
- **Security** - CORS, Helmet, Rate limiting

## 🛠️ Tech Stack

### Frontend
- **React 17** - User interface
- **CSS3** - Styling and animations
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Helmet** - Security middleware

### Development
- **Git** - Version control
- **npm** - Package management
- **ESLint** - Code linting

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL (optional - mock data available)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/raja416/ecomerce.git
   cd ecomerce
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install:all
   ```

3. **Set up environment**
   ```bash
   # Create environment files
   ./setup-project.sh
   ```

4. **Start the application**
   ```bash
   # Quick mode (no database required)
   ./start-project.sh --quick
   
   # Full mode (with database)
   ./start-project.sh
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 🏗️ Project Structure

```
ecomerce/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main application
│   └── package.json
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── config/             # Configuration files
│   └── package.json
├── start-project.sh        # Startup script
├── setup-project.sh        # Setup script
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## 🎯 Key Features Demo

### 🛍️ Shopping Experience
1. Browse products in the catalog
2. Add items to shopping cart
3. Proceed through checkout process
4. Complete order with payment

### 👤 User Management
1. Register new account
2. Login with credentials
3. Manage profile and orders
4. Access admin panel (if admin)

### 🔧 Admin Features
1. Product management (CRUD)
2. Order management
3. User management
4. Analytics dashboard

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables
# Deploy to platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Raja** - Full-Stack Developer

- GitHub: [@raja416](https://github.com/raja416)
- Portfolio: [Your Portfolio Link]
- Email: [your-email@example.com]

## 🙏 Acknowledgments

- React team for the amazing framework
- Node.js community for excellent tools
- Unsplash for beautiful product images
- All contributors and supporters

---

⭐ **Star this repository if you found it helpful!**


