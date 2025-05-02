# License
*Introduced in 4.5.0*
>Stability: 1 - Experimental
```js
const License = require('kado/lib/License')
```
This is a module that helps manage and validate software licenses. It provides
functionality for generating, validating, and managing software licenses.
Can be used both for client-side license validation and server-side license issuance.

Example Usage:
```js
// Client-side license validation
const license = new License();
license.setInstance('unique-machine-id')
license.setKey('your-license-key')
const isValid = await license.check()

// Server-side license generation
const key = License.generateKey({
  product: 'your-product',
  customer: 'customer-id',
  features: { premium: true }
})
```

## Class: License

### License.constructor(options)
* `options` {Object} Configuration options
  * `storageDir` {string} Directory to store license data
  * `serverUrl` {string} URL of the license server
  * `maxRetries` {number} Maximum activation retries
  * `publicKey` {string} Public key for license verification
  * `privateKey` {string} Private key for license signing (server only)
* Return: {License} new license management instance

```js
// Basic initialization
const license = new License()

// Advanced configuration
const license = new License({
  storageDir: '/path/to/license/storage',
  serverUrl: 'https://license.myapp.com',
  maxRetries: 5,
  publicKey: fs.readFileSync('/path/to/public.key', 'utf8')
})
```

### License.setInstance(instance)
* `instance` {string} Unique identifier for this installation
* Return: {License} Returns this for chaining

Sets the instance identifier (usually a hardware/machine ID).

```js
// Manual instance ID setting
license.setInstance('machine-xyz-123')

// Using the built-in machine ID generator
license.setInstance(License.generateMachineId())

// Chaining example
license.setInstance('machine-123').setKey('LICENSE-KEY-456')
```

### License.setKey(key)
* `key` {string} License key to validate
* Return: {License} Returns this for chaining

Sets the license key to be used for validation.

```js
// Set the license key from configuration
license.setKey(config.licenseKey)

// Set the key from environment variable
license.setKey(process.env.APP_LICENSE_KEY)

// With chaining
license.setKey('MY-LICENSE-KEY').check().then(isValid => {
  if (isValid) console.log('License is valid!')
})
```

### License.check()
* Return: {Promise<boolean>} True if license is valid

Checks if the current license is valid by first looking for local activation data
and then performing online validation if needed.

```js
// Basic check
const isValid = await license.check()
if (isValid) {
  console.log('License is valid until:', license.expiresAt)
  console.log('Features:', license.features)
} else {
  console.error('License validation failed')
}

// With error handling
try {
  const isValid = await license.check()
  if (!isValid) {
    console.error('Please purchase a valid license')
  }
} catch (err) {
  console.error('License validation error:', err.message)
}
```

### License.activate()
* Return: {Promise<boolean>} True if activation succeeded
* Throws: {Error} If maximum retries exceeded

Activates the license. Will throw an error if maximum retry count is exceeded.

```js
// Activate with retry
try {
  let activated = false
  do {
    activated = await license.activate()
    if (!activated) {
      console.log('Activation failed, retrying...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  } while (!activated)
  
  console.log('License activated successfully!')
} catch (err) {
  console.error('Maximum activation attempts exceeded:', err.message)
}

// Simple activation with error handling
try {
  const success = await license.activate()
  if (success) {
    startApplication()
  } else {
    showActivationDialog()
  }
} catch (error) {
  showActivationFailedError(error)
}
```

### static License.generateMachineId()
* Return: {string} Unique machine identifier

Generates a machine identifier based on hardware information.

```js
// Generate a machine ID
const machineId = License.generateMachineId()
console.log('Your machine ID:', machineId)

// Use with setInstance
const license = new License()
license.setInstance(License.generateMachineId())

// Store for future reference
fs.writeFileSync('.machine-id', License.generateMachineId())
```

### static License.generateKey(options)
* `options` {Object} License generation options
  * `product` {string} Product identifier
  * `customer` {string} Customer identifier
  * `expiresAt` {Date} Expiration date
  * `features` {Object} Feature flags
* Return: {string} Generated license key

Generates a new license key with embedded information.

```js
// Generate a basic license key
const basicKey = License.generateKey({
  product: 'my-app',
  customer: 'customer@example.com'
})

// Generate a trial license (expires in 30 days)
const trialKey = License.generateKey({
  product: 'my-app',
  customer: 'trial-user',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})

// Generate a premium license with specific features
const premiumKey = License.generateKey({
  product: 'my-app',
  customer: 'premium-customer',
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  features: {
    premium: true,
    maxProjects: 50,
    teamSize: 10
  }
})
```

### static License.validateKey(key)
* `key` {string} License key to validate
* Return: {boolean} True if the key format is valid

Validates a license key format by checking its structure and checksum.

```js
// Validate user input
function onLicenseKeyInput(key) {
  const isValidFormat = License.validateKey(key)
  if (isValidFormat) {
    document.getElementById('keyStatus').textContent = 'Valid key format'
  } else {
    document.getElementById('keyStatus').textContent = 'Invalid key format'
  }
}

// Check a key from the command line
const keyToCheck = process.argv[2]
if (License.validateKey(keyToCheck)) {
  console.log('Key format is valid')
} else {
  console.error('Invalid key format')
  process.exit(1)
}
```

### static License.decodeKey(key)
* `key` {string} License key to decode
* Return: {Object|null} Decoded license information or null if invalid

Decodes a license key to extract its information like product, customer, expiration date, and features.

```js
// Decode and display license information
const licenseInfo = License.decodeKey('YOUR-LICENSE-KEY-HERE')
if (licenseInfo) {
  console.log('Product:', licenseInfo.product)
  console.log('Customer:', licenseInfo.customer)
  console.log('Expires:', licenseInfo.expiresAt.toLocaleDateString())
  console.log('Features:', JSON.stringify(licenseInfo.features, null, 2))
} else {
  console.error('Could not decode license key')
}

// Check if license is expired
function isLicenseExpired(key) {
  const info = License.decodeKey(key)
  if (!info) return true
  return info.expiresAt < new Date()
}
```

### static License.validateFromHTTP(req, res)
* `req` {Object} HTTP request object
* `res` {Object} HTTP response object

HTTP handler for license validation requests. This can be used as a route handler
in a web server to validate license keys.

```js
// In an Express.js server
const express = require('express')
const app = express()
const License = require('kado/lib/License')

app.use(express.json())

// Set up a validation endpoint
app.post('/api/validate-license', License.validateFromHTTP)

// Usage:
// POST /api/validate-license
// Body: { "key": "YOUR-LICENSE-KEY", "instance": "MACHINE-ID" }
```

### static License.createServer(router, options)
* `router` {Object} Router object to add routes to
* `options` {Object} Configuration options
* Return: {Object} Router with license routes added

Creates HTTP routes for a license server, adding validation and key generation endpoints.

```js
// Create a license server with Express
const express = require('express')
const app = express()
const License = require('kado/lib/License')

app.use(express.json())

// Add license routes to the router
License.createServer(app)

// Now the server has these endpoints:
// POST /license/validate - Validates a license key
// POST /license/generate - Generates a new license key

app.listen(3000, () => {
  console.log('License server running on port 3000')
})
```
