#!/bin/bash

# Bruno's IMS Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Bruno's IMS Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

cd ..

# Start development database
echo "🐘 Starting development database..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Copy environment file
echo "📝 Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
fi

# Update database URL for development
echo "🔧 Updating database configuration for development..."
sed -i 's/localhost:5432/localhost:5433/g' backend/.env
sed -i 's/brunos_ims/brunos_ims_dev/g' backend/.env

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
if npm run db:generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "⚠️  Prisma client generation failed (network issue). Will try again later."
fi

# Run database migrations
echo "🗄️  Running database migrations..."
if npm run db:push; then
    echo "✅ Database schema pushed successfully"
else
    echo "⚠️  Database migration failed. Please check your database connection."
fi

# Seed the database
echo "🌱 Seeding database with sample data..."
if npm run db:seed; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Database seeding failed. You can seed manually later with: npm run db:seed"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Development database is running on localhost:5433"
echo "📍 Redis is running on localhost:6380"
echo ""
echo "To start the development servers:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "To stop the development database:"
echo "  docker-compose -f docker-compose.dev.yml down"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@brunos-restaurant.com"
echo "  Password: password123"
echo ""