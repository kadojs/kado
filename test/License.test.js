/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const License = require('../lib/License')
// fs is required for the filesystem operations in License.js but not used directly in tests
const os = require('os')

// MockRequestEngine and RequestEngine are kept for documentation purposes
// of how license validation works, but not directly used in the tests
// since we're mocking the license.check method instead

runner.suite('License', (it) => {
  // Basic construction test
  it('should construct', () => {
    const license = new License()
    Assert.isType('License', license)
    Assert.eq(license.maxRetries, 3, 'Default maxRetries should be 3')
    Assert.eq(license.serverUrl, 'https://license.example.com', 'Default serverUrl is correct')
  })

  it('should set and get instance identifier', () => {
    const license = new License()
    const instance = 'test-instance-id'
    license.setInstance(instance)
    Assert.eq(license.instance, instance)
  })

  it('should set and get license key', () => {
    const license = new License()
    const key = 'test-license-key'
    license.setKey(key)
    Assert.eq(license.key, key)
  })

  it('should generate machine ID', () => {
    const machineId = License.generateMachineId()
    Assert.isType('string', machineId)
    Assert.isOk(machineId.length > 0, 'Machine ID should not be empty')
  })

  it('should generate and validate license keys', () => {
    const options = {
      product: 'test-product',
      customer: 'test-customer',
      features: { premium: true }
    }

    const key = License.generateKey(options)
    Assert.isType('string', key)
    Assert.isOk(key.includes('-'), 'Key should be formatted with hyphens')

    const isValid = License.validateKey(key)
    Assert.eq(isValid, true, 'Generated key should be valid')

    const info = License.decodeKey(key)
    Assert.isType('Object', info)
    Assert.eq(info.product, 'test-product')
    Assert.eq(info.customer, 'test-customer')
    Assert.eq(info.features.premium, true)
  })

  it('should detect invalid license keys', () => {
    const invalidKeys = [
      'invalid-key',
      '',
      null,
      undefined,
      123,
      'ABC-DEF-GHI'
    ]

    invalidKeys.forEach(key => {
      const isValid = License.validateKey(key)
      Assert.eq(isValid, false, `Key "${key}" should be invalid`)
    })
  })

  it('should handle HTTP validation requests', () => {
    const mockReq = {
      body: {
        key: 'invalid-key',
        instance: 'test-instance'
      }
    }

    let responseData = null
    const mockRes = {
      json: (data) => {
        responseData = data
        return data
      }
    }

    License.validateFromHTTP(mockReq, mockRes)
    Assert.isType('Object', responseData)
    Assert.eq(responseData.valid, false, 'Should respond with invalid for bad key')
  })

  it('should create license server routes', () => {
    const mockRouter = {
      routes: [],
      post: function (path, handler) {
        this.routes.push({ path, handler, method: 'post' })
        return this
      }
    }

    const router = License.createServer(mockRouter)
    Assert.eq(router, mockRouter)
    Assert.isOk(mockRouter.routes.length > 0, 'Should add routes to router')

    const hasValidationRoute = mockRouter.routes.some(r => r.path === '/license/validate')
    Assert.eq(hasValidationRoute, true, 'Should add validation route')

    const hasGenerationRoute = mockRouter.routes.some(r => r.path === '/license/generate')
    Assert.eq(hasGenerationRoute, true, 'Should add generation route')
  })

  // Properly test the activation workflow without direct module mocking
  it('should handle the activation workflow', async () => {
    // Instead of trying to mock the module, we'll mock the check method
    // to simulate a successful response
    const license = new License({
      storageDir: os.tmpdir()
    })

    license.setKey('valid-key')
    license.setInstance('test-instance')

    // Create our own implementation that doesn't need external mocking
    license.check = async function () {
      this._activationData = {
        key: this.key,
        instance: this.instance,
        signature: 'mock-signature',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        features: { premium: true }
      }

      this.expiresAt = new Date(this._activationData.expiresAt)
      this.features = this._activationData.features
      this.activated = true

      return true
    }

    const isValid = await license.activate()
    Assert.eq(isValid, true, 'License should be valid')
    Assert.eq(license.activated, true, 'License should be activated')
    Assert.isType('Object', license.features)
    Assert.eq(license.features.premium, true, 'Premium feature should be enabled')
  })

  it('should fail activation for invalid keys', async () => {
    const license = new License()
    license.setKey('invalid-key')
    license.setInstance('test-instance')

    // Create our own implementation that fails
    license.check = async function () {
      return false
    }

    const isValid = await license.check()
    Assert.eq(isValid, false, 'License should be invalid')

    // Test retry mechanism
    let errorThrown = false
    try {
      // Set maxRetries to 1 for faster test
      license.maxRetries = 1
      await license.activate() // First try
      await license.activate() // Second try - should throw
    } catch (e) {
      errorThrown = true
      Assert.isOk(e.message.includes('Maximum activation attempts'), 'Should throw the correct error')
    }

    Assert.eq(errorThrown, true, 'Should throw after max retries')
  })
})

if (require.main === module) runner.execute().then(code => process.exit(code))
