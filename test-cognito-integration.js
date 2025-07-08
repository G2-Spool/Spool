#!/usr/bin/env node

/**
 * Cognito Integration Test Script
 * 
 * This script tests the authentication flow between:
 * - Frontend (Spool - Next.js) at localhost:3000
 * - Backend (spool-auth-service) at localhost:3001
 * - AWS Cognito User Pool: us-east-1_TBQtRz0K6
 */

const https = require('https');
const http = require('http');

// Configuration from your infrastructure
const CONFIG = {
  COGNITO_USER_POOL_ID: 'us-east-1_TBQtRz0K6',
  COGNITO_APP_CLIENT_ID: '2qlls9iq8b2des063h1prtoh66',
  COGNITO_APP_CLIENT_SECRET: 'sngm5ajntbl2i89ic3940a3ooe1k3lkgi4295kjndh9rlhndc5k',
  AWS_REGION: 'us-east-1',
  
  // Service URLs
  FRONTEND_URL: 'http://localhost:3000',
  AUTH_SERVICE_URL: 'http://localhost:3001',
  
  // Test user credentials
  TEST_USER: {
    email: 'test@example.com',
    password: 'TestPassword123!'
  }
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: null
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Check if auth service is running
async function testAuthServiceHealth() {
  console.log('\n🔍 Testing Auth Service Health...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Auth Service is running and healthy');
      return true;
    } else {
      console.log(`❌ Auth Service health check failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Auth Service is not running: ${error.message}`);
    return false;
  }
}

// Test 2: Check if frontend is running
async function testFrontendHealth() {
  console.log('\n🔍 Testing Frontend Health...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Frontend is running');
      return true;
    } else {
      console.log(`❌ Frontend health check failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend is not running: ${error.message}`);
    return false;
  }
}

// Test 3: Test user registration via backend
async function testUserRegistration() {
  console.log('\n🔍 Testing User Registration via Backend...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, CONFIG.TEST_USER);
    
    console.log(`📡 Registration Response: ${response.statusCode}`);
    console.log(`📋 Response Data:`, response.data);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ User registration successful');
      return true;
    } else if (response.statusCode === 400 && response.data?.error?.includes('already exists')) {
      console.log('✅ User already exists (expected for repeat tests)');
      return true;
    } else {
      console.log(`❌ User registration failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Registration request failed: ${error.message}`);
    return false;
  }
}

// Test 4: Test user sign-in via backend
async function testUserSignIn() {
  console.log('\n🔍 Testing User Sign-In via Backend...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, CONFIG.TEST_USER);
    
    console.log(`📡 Sign-in Response: ${response.statusCode}`);
    console.log(`📋 Response Data:`, response.data);
    
    if (response.statusCode === 200 && response.data?.accessToken) {
      console.log('✅ User sign-in successful');
      return response.data.accessToken;
    } else {
      console.log(`❌ User sign-in failed: ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Sign-in request failed: ${error.message}`);
    return null;
  }
}

// Test 5: Test authenticated request to /auth/me
async function testAuthenticatedRequest(accessToken) {
  console.log('\n🔍 Testing Authenticated Request (/auth/me)...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 /auth/me Response: ${response.statusCode}`);
    console.log(`📋 Response Data:`, response.data);
    
    if (response.statusCode === 200 && response.data?.sub) {
      console.log('✅ Authenticated request successful');
      return true;
    } else {
      console.log(`❌ Authenticated request failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authenticated request failed: ${error.message}`);
    return false;
  }
}

// Test 6: Test frontend API route
async function testFrontendApiRoute() {
  console.log('\n🔍 Testing Frontend API Route (/api/auth/me)...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Frontend API Response: ${response.statusCode}`);
    console.log(`📋 Response Data:`, response.data);
    
    if (response.statusCode === 200 || response.statusCode === 401) {
      console.log('✅ Frontend API route is working');
      return true;
    } else {
      console.log(`❌ Frontend API route failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend API request failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Cognito Integration Tests...');
  console.log('=' .repeat(60));
  
  // Display configuration
  console.log('\n📋 Configuration:');
  console.log(`   User Pool ID: ${CONFIG.COGNITO_USER_POOL_ID}`);
  console.log(`   App Client ID: ${CONFIG.COGNITO_APP_CLIENT_ID}`);
  console.log(`   AWS Region: ${CONFIG.AWS_REGION}`);
  console.log(`   Auth Service: ${CONFIG.AUTH_SERVICE_URL}`);
  console.log(`   Frontend: ${CONFIG.FRONTEND_URL}`);
  
  const results = [];
  
  // Run tests
  results.push(await testAuthServiceHealth());
  results.push(await testFrontendHealth());
  results.push(await testUserRegistration());
  
  const accessToken = await testUserSignIn();
  if (accessToken) {
    results.push(await testAuthenticatedRequest(accessToken));
  } else {
    results.push(false);
  }
  
  results.push(await testFrontendApiRoute());
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Cognito integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  // Instructions
  console.log('\n📝 Next Steps:');
  console.log('1. Make sure both services are running:');
  console.log('   - Frontend: npm run dev (port 3000)');
  console.log('   - Backend: cd ../spool-auth-service && npm run dev (port 3001)');
  console.log('2. Test the integration in your browser');
  console.log('3. Check the AWS Cognito console for user management');
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(console.error); 