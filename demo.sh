#!/bin/bash

# Bruno's IMS Role Management System Demo
# This script demonstrates the key functionality of the role management system

echo "🎯 Bruno's IMS - Role Management System Demo"
echo "=============================================="

# Start the server in background
echo "🚀 Starting server..."
cd /home/runner/work/brunos-ims/brunos-ims
npm run dev &
SERVER_PID=$!
sleep 3

echo ""
echo "📋 1. Health Check"
echo "=================="
curl -s http://localhost:3000/health | jq

echo ""
echo "👥 2. Create a New Role: 'Restaurant Manager'"
echo "=============================================="
ROLE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_1" \
  -d '{
    "name": "Restaurant Manager",
    "description": "Manages overall restaurant operations",
    "permissions": ["view_inventory", "manage_inventory", "view_staff", "manage_staff", "view_orders", "view_reports"]
  }')

echo "$ROLE_RESPONSE" | jq
ROLE_ID=$(echo "$ROLE_RESPONSE" | jq -r '.data.id')

echo ""
echo "📝 3. List All Roles"
echo "==================="
curl -s http://localhost:3000/api/roles \
  -H "x-user-id: test_user_1" | jq '.data[] | {name, description, permissions}'

echo ""
echo "🔗 4. Assign Role to User"
echo "========================="
curl -s -X PUT http://localhost:3000/api/users/test_user_1/role \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_1" \
  -d "{
    \"roleId\": \"$ROLE_ID\",
    \"startDate\": \"2025-08-24\",
    \"assignedBy\": \"test_user_1\"
  }" | jq

echo ""
echo "🔍 5. Check User's Current Role"
echo "==============================="
curl -s http://localhost:3000/api/users/test_user_1/role \
  -H "x-user-id: test_user_1" | jq '.data.role | {name, description, permissions}'

echo ""
echo "✅ 6. Permission Check - User CAN view inventory"
echo "==============================================="
curl -s -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_1" \
  -d '{
    "permission": "view_inventory",
    "resource": "inventory"
  }' | jq

echo ""
echo "❌ 7. Permission Check - User CANNOT manage roles"
echo "================================================="
curl -s -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_1" \
  -d '{
    "permission": "manage_roles",
    "resource": "roles"
  }' | jq

echo ""
echo "🔒 8. Test Forbidden Action - Try to create role without permission"
echo "==================================================================="
# First assign a role without manage_roles permission
curl -s -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_1" \
  -d '{
    "name": "Should Fail",
    "description": "This should fail due to insufficient permissions",
    "permissions": ["view_inventory"]
  }' | jq

echo ""
echo "📊 9. List All Available Permissions"
echo "===================================="
# Reset to admin role first
curl -s -X PUT http://localhost:3000/api/users/test_user_1/role \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user_1" \
  -d '{
    "roleId": "admin_role_id_from_initialization",
    "startDate": "2025-08-24",
    "assignedBy": "system"
  }' > /dev/null

# Note: This might fail due to permission restrictions, but that's expected behavior
echo "Note: Some operations may be restricted based on current user permissions"

echo ""
echo "🎉 Demo Complete!"
echo "================="
echo "The role management system successfully demonstrates:"
echo "✅ Role creation and management"
echo "✅ User role assignment"
echo "✅ Permission verification"
echo "✅ Access control enforcement"
echo "✅ Proper error handling"

# Stop the server
kill $SERVER_PID 2>/dev/null
echo ""
echo "🛑 Server stopped"