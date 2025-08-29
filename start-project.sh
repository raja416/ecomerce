#!/bin/bash

echo "🚀 Starting eCommerce Project..."

# Function to start backend with quick server (no database)
start_quick_backend() {
    echo "📡 Starting Backend Server (Quick Mode - No Database Required)..."
    cd backend
    USE_QUICK_SERVER=true npm start &
    BACKEND_PID=$!
    cd ..
}

# Function to start backend with full server (database required)
start_full_backend() {
    echo "📡 Starting Backend Server (Full Mode - Database Required)..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
}

# Check if user wants to use quick mode
if [ "$1" = "--quick" ] || [ "$1" = "-q" ]; then
    echo "⚡ Using Quick Mode (No Database Required)"
    start_quick_backend
else
    echo "🔗 Using Full Mode (Database Required)"
    echo "💡 If you encounter database errors, run: ./start-project.sh --quick"
    start_full_backend
fi

# Wait a moment for backend to start
sleep 5

# Check if backend is running
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "❌ Backend failed to start. Trying quick mode..."
    # Kill the failed backend process
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    sleep 2
    start_quick_backend
    sleep 3
fi

# Start frontend
start_frontend

echo "✅ Both servers are starting..."
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend: http://localhost:5000"
echo ""
echo "💡 Usage:"
echo "   ./start-project.sh          - Start with full database mode"
echo "   ./start-project.sh --quick  - Start with quick mode (no database)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
