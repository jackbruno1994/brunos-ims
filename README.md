# Bruno's IMS
Integrated Management System for multi-country restaurant groups

## Project Structure

This project is organized as a full-stack application:

```
brunos-ims/
├── backend/                 # Node.js/Express/MongoDB backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   ├── dist/               # Compiled JavaScript (generated)
│   ├── logs/               # Application logs
│   └── README.md           # Backend documentation
└── README.md               # This file
```

## Backend Foundation

✅ **MongoDB Integration**
- MongoDB connection configuration with error handling
- Environment-based configuration (.env)
- Connection event handling and logging

✅ **Database Models**
- **Product**: name, description, price, quantity, category reference, timestamps
- **Category**: name (unique), description
- **User**: username (unique), email (unique), password, role (admin/user), createdAt
- **Order**: user reference, products array, totalAmount, status (pending/completed/cancelled), createdAt

✅ **Server Setup**
- Express.js with TypeScript
- Request logging with Winston
- Global error handling middleware
- Environment variable configuration
- Health check and API info endpoints

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

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

4. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### API Endpoints

- `GET /health` - Health check
- `GET /api` - API information

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Winston
- **Environment**: dotenv

## Development

See the [backend README](./backend/README.md) for detailed development instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
