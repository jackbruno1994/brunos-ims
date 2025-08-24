#!/bin/bash

echo "Testing Bruno's IMS Backend Setup..."

# Check if all required files exist
echo "Checking file structure..."

files=(
    "src/config/db.ts"
    "src/models/Category.ts"
    "src/models/User.ts"
    "src/models/Product.ts"
    "src/models/Order.ts"
    "src/middleware/errorHandler.ts"
    "src/utils/logger.ts"
    "src/server.ts"
    ".env"
    "package.json"
    "tsconfig.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

echo ""
echo "Checking TypeScript compilation..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ TypeScript compilation successful"
else
    echo "✗ TypeScript compilation failed"
    exit 1
fi

echo ""
echo "Checking if dist files were generated..."
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    echo "✓ JavaScript files generated successfully"
else
    echo "✗ JavaScript files not generated"
    exit 1
fi

echo ""
echo "✅ All tests passed! Backend foundation is ready."
echo ""
echo "To start the server:"
echo "  npm run dev    # Development mode with auto-reload"
echo "  npm start      # Production mode"
echo ""
echo "Make sure MongoDB is running on mongodb://localhost:27017/brunos-ims"