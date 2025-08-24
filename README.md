# Bruno's IMS - Integrated Management System

A comprehensive inventory and order management system designed for multi-country restaurant groups. Built with Node.js, Express, MongoDB, and React TypeScript.

## 🚀 Features

### Core Functionality
- **Inventory Management**: Complete product catalog with stock tracking
- **Order Management**: Purchase, sale, and transfer order processing
- **User Management**: Role-based access control (admin, manager, staff)
- **Multi-Restaurant Support**: Separate data per restaurant and country
- **Real-time Stock Updates**: Automatic stock adjustments based on orders

### Security & Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based authorization
- Rate limiting and security headers
- Input validation and sanitization

### Modern Tech Stack
- **Backend**: Node.js, Express 4.x, MongoDB, Mongoose
- **Frontend**: React 18, TypeScript, Axios
- **Security**: Helmet, CORS, express-validator
- **Development**: Nodemon, Concurrently

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jackbruno1994/brunos-ims.git
   cd brunos-ims
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   cp .env.example backend/.env
   ```
   
   Update the backend/.env file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/brunos-ims
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   npm start
   ```
   
   This will start both backend (port 5000) and frontend (port 3000) concurrently.

## 🏗️ Project Structure

```
brunos-ims/
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication & security middleware
│   ├── models/             # Mongoose data models
│   ├── routes/             # API route handlers
│   └── server.js           # Main server file
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React context providers
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
└── package.json            # Root package.json with scripts
```

## 🔧 Available Scripts

### Root Level
- `npm start` - Start both backend and frontend
- `npm run backend` - Start only backend server
- `npm run frontend` - Start only frontend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install dependencies for all projects

### Backend (in `/backend`)
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

### Frontend (in `/frontend`)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📊 Data Models

### User
- Name, email, password (hashed)
- Role: admin, manager, staff
- Restaurant and country assignment
- Account status (active/inactive)

### Product
- Name, description, SKU
- Category association
- Price and cost tracking
- Stock management (current, minimum, maximum)
- Unit types (piece, kg, liter, etc.)
- Profit margin calculation

### Category
- Name and description
- Restaurant-specific categorization
- Active/inactive status

### Order
- Order types: purchase, sale, transfer
- Status tracking: pending → confirmed → shipped → delivered
- Line items with quantities and prices
- Supplier/customer information
- Automatic stock updates

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management
- **Manager**: Product and order management
- **Staff**: Read access, basic operations

### Security Features
- JWT tokens with configurable expiration
- Password strength requirements
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get current user profile

### Products
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update stock levels
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Orders
- `GET /api/orders` - List orders with filtering
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

## 🎨 Frontend Features

### Components
- **Login**: Secure authentication form
- **Dashboard**: Overview with statistics and quick actions
- **Navigation**: Role-based menu system
- **Forms**: Validated input components

### State Management
- React Context for authentication
- Local state management for forms
- Error handling and loading states

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Build and deploy to your server
4. Set up reverse proxy (nginx)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy static files to CDN or web server
3. Configure API URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Development Notes

### Database Warnings
The application may show MongoDB deprecation warnings. These are harmless and will be addressed in future updates.

### Express Version
The project uses Express 4.x for stability. Express 5.x support will be added in future releases.

### TypeScript
Frontend uses TypeScript for better development experience and type safety.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
