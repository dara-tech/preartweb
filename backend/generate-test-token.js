#!/usr/bin/env node

const jwt = require('jsonwebtoken');

// JWT secret from .env
const JWT_SECRET = 'your_super_secret_jwt_key_here';

// Create a token for admin user (ID: 1)
const payload = {
  userId: 1,
  username: 'admin',
  role: 'super_admin'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 Generated JWT Token for testing:');
console.log(token);
console.log('\n📋 Use this token in your frontend localStorage:');
console.log(`localStorage.setItem('token', '${token}');`);
console.log('\n🧪 Test API with curl:');
console.log(`curl -X GET "http://localhost:3001/apiv1/mortality-retention-indicators/sites/1705?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer ${token}"`);



