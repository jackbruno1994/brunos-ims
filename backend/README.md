# Bruno's IMS Backend

This is the backend API for Bruno's Integrated Management System, built with Node.js, Express.js, TypeScript, and MongoDB.

## Features

- ✅ MongoDB integration with Mongoose ODM
- ✅ TypeScript for type safety
- ✅ Express.js REST API framework
- ✅ Comprehensive error handling
- ✅ Request logging with Winston
- ✅ Environment configuration
- ✅ Database models for restaurant management

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/brunos-ims
PORT=5000
NODE_ENV=development
```

## Database Models

### Category
- `name` (String, required, unique)
- `description` (String, optional)

### User
- `username` (String, required, unique)
- `email` (String, required, unique)
- `password` (String, required)
- `role` (String, enum: ['admin', 'user'])
- `createdAt` (Date, auto-generated)

### Product
- `name` (String, required)
- `description` (String, optional)
- `price` (Number, required)
- `quantity` (Number, required)
- `category` (ObjectId, ref: 'Category')
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

### Order
- `user` (ObjectId, ref: 'User')
- `products` (Array of { product: ObjectId, quantity: Number })
- `totalAmount` (Number, required)
- `status` (String, enum: ['pending', 'completed', 'cancelled'])
- `createdAt` (Date, auto-generated)

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### API Info
- `GET /api` - Get API information and available endpoints

## Development

To start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

## Production

To build and start the production server:

```bash
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts              # MongoDB connection configuration
│   ├── models/
│   │   ├── Category.ts        # Category model
│   │   ├── User.ts           # User model
│   │   ├── Product.ts        # Product model
│   │   └── Order.ts          # Order model
│   ├── middleware/
│   │   └── errorHandler.ts   # Global error handling middleware
│   ├── utils/
│   │   └── logger.ts         # Winston logging configuration
│   └── server.ts             # Main application entry point
├── dist/                     # Compiled JavaScript files
├── logs/                     # Application logs
├── .env                      # Environment variables
├── package.json              # NPM dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Error Handling

The application includes comprehensive error handling for:
- MongoDB connection errors
- Validation errors
- Cast errors (invalid ObjectIds)
- Duplicate key errors
- General server errors

All errors are logged using Winston and returned as JSON responses with appropriate HTTP status codes.

## Logging

Logs are written to:
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs
- Console - Development mode only

## Next Steps

This backend foundation provides:
1. ✅ MongoDB connection and configuration
2. ✅ Database models for core entities
3. ✅ Error handling and logging
4. ✅ Basic Express server setup

To extend this foundation:
1. Add authentication/authorization middleware
2. Create API routes and controllers
3. Add input validation
4. Implement business logic services
5. Add unit and integration tests
6. Set up API documentation (Swagger)