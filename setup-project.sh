#!/bin/bash

echo "🔧 Setting up eCommerce Project..."

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Development
REACT_APP_ENV=development
REACT_APP_DEBUG=true
EOF
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists"
fi

# Fix frontend dependencies
echo "📦 Fixing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the project:"
echo "   ./start-project.sh --quick"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env with your database credentials"
echo "   2. Edit frontend/.env with your API keys"
echo "   3. Run the improvement plan: cat IMPROVEMENT_PLAN.md"
