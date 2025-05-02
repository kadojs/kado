# Building a License Server

## Overview

A license server is a simple HTTP server that serves a license file to the application. The application will request the license file from the license server when it starts. If the license is valid, the application will continue to run. If the license is invalid, the application will exit.

This guide will show you not only how to build a license server, but also how to build an administration panel where you can manage the licenses for your application.

## Prerequisites

* Node.js 16 or higher
* Kado 4.5 or higher   

## Step 1: Create a new Project

First, create a new project directory and initialize it with npm:

```bash
mkdir license-server
cd license-server
npm init -y
npm install kado
```

This will create a new project with a `package.json` file and install Kado as a dependency.

## Step 2: Create the License Server

Create a new file `server.js` in your project root:

```javascript
const HyperText = require('kado/lib/HyperText');
const License = require('kado/lib/License');
const Router = require('kado/lib/Router');

// Create the HTTP server
const http = new HyperText.HyperTextServer();
http.setPort(3000);

// Create the router
const router = new Router();

// Add license routes
License.createServer(router);

// Set up the server
http.setRouter(router);
http.start();

console.log('License server running on port 3000');
```

## Step 3: Create the License Administration Panel

Create a new file `admin.js` in your project root:

```javascript
const HyperText = require('kado/lib/HyperText');
const License = require('kado/lib/License');
const Router = require('kado/lib/Router');
const StaticServer = require('kado/lib/HyperText').StaticServer;

// Create the HTTP server
const http = new HyperText.HyperTextServer();
http.setPort(3001);

// Create the router
const router = new Router();

// Serve static files
router.use(StaticServer.getMiddleware('public'));

// Admin routes
router.post('/admin/generate-license', (req, res) => {
  const { product, customer, expiresAt, features } = req.body;
  
  const key = License.generateKey({
    product,
    customer,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    features
  });
  
  res.json({ key });
});

router.get('/admin/licenses', (req, res) => {
  // In a real application, you would fetch licenses from a database
  res.json({ licenses: [] });
});

// Set up the server
http.setRouter(router);
http.start();

console.log('Admin panel running on port 3001');
```

## Step 4: Create the Admin Panel UI

Create a new directory `public` and add an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en-US">
<head>
    <title>License Administration Panel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input, select { width: 100%; padding: 8px; }
        button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>License Administration Panel</h1>
    
    <form id="licenseForm">
        <div class="form-group">
            <label for="product">Product:</label>
            <input type="text" id="product" required>
        </div>
        
        <div class="form-group">
            <label for="customer">Customer:</label>
            <input type="text" id="customer" required>
        </div>
        
        <div class="form-group">
            <label for="expiresAt">Expiration Date:</label>
            <input type="date" id="expiresAt">
        </div>
        
        <div class="form-group">
            <label for="features">Features (JSON):</label>
            <textarea id="features" rows="4">{"premium": true}</textarea>
        </div>
        
        <button type="submit">Generate License</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.getElementById('licenseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                product: document.getElementById('product').value,
                customer: document.getElementById('customer').value,
                expiresAt: document.getElementById('expiresAt').value,
                features: JSON.parse(document.getElementById('features').value)
            };
            
            try {
                const response = await fetch('/admin/generate-license', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                document.getElementById('result').innerHTML = `
                    <h2>Generated License Key:</h2>
                    <pre>${result.key}</pre>
                `;
            } catch (error) {
                document.getElementById('result').innerHTML = `
                    <h2>Error:</h2>
                    <pre>${error.message}</pre>
                `;
            }
        });
    </script>
</body>
</html>
```

## Step 5: Start the Servers

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "admin": "node admin.js"
  }
}
```

You can now start both servers:

```bash
# Terminal 1
npm start

# Terminal 2
npm run admin
```

## Step 6: Using the License Server

To use the license server in your application:

```javascript
const License = require('kado/lib/License');

const license = new License({
  serverUrl: 'http://localhost:3000'
});

license.setInstance(License.generateMachineId());
license.setKey('YOUR-LICENSE-KEY');

// Check license validity
const isValid = await license.check();
if (isValid) {
  console.log('License is valid!');
  console.log('Features:', license.features);
} else {
  console.error('License is invalid!');
}
```

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for the admin panel
3. Store license data in a secure database
4. Use proper key management for cryptographic operations
5. Implement rate limiting for license validation requests
6. Log all license validation attempts
7. Consider implementing IP whitelisting for the admin panel

## Next Steps

1. Implement a database to store license information
2. Add user authentication to the admin panel
3. Create an API for license management
4. Implement license revocation
5. Add usage tracking and reporting
6. Set up automated license expiration notifications

