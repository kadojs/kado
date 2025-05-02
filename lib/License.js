/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** usage example
 * within the confines of lib/App.js which is the main file for the application.
 *
 * const license = new License();
 * license.setInstance(config.license.key)
 * license.setKey(config.license.key)
 * let isLicenseOk = await license.check()
 * // automatically throws an exception after 3 failed attempts
 * do { await license.activate() } while(!isLicenseOk)
 * // the real question we have to solve, is where to store the activation.
 * // also what about trust and revalidation?
 * // we also need statics for key generation and validation.
 * const key = License.generateKey()
 * const isLicenseKeyValid = License.validateKey(key)
 * // additionally we need a license server that can be used to validate the license key.
 * app.post('/license/validate', License.validateFromHTTP)
 */

const crypto = require('crypto')
const fs = require('./FileSystem')
const path = require('path')
const Assert = require('./Assert')
// const HyperText = require('./HyperText')
const RequestEngine = require('./RequestEngine')

/**
 * License Management System
 *
 * Provides functionality for generating, validating, and managing software licenses.
 * Can be used both for client-side license validation and server-side license issuance.
 */
class License {
  /**
   * Create a new License instance
   * @param {Object} options - Configuration options
   * @param {string} options.storageDir - Directory to store license data
   * @param {string} options.serverUrl - URL of the license server
   * @param {number} options.maxRetries - Maximum activation retries
   * @param {string} options.publicKey - Public key for license verification
   * @param {string} options.privateKey - Private key for license signing (server only)
   */
  constructor (options = {}) {
    this.instance = null
    this.key = null
    this.activated = false
    this.expiresAt = null
    this.features = {}
    this.retryCount = 0

    // Configuration
    this.storageDir = options.storageDir || process.cwd()
    this.serverUrl = options.serverUrl || 'https://license.example.com'
    this.maxRetries = options.maxRetries || 3
    this.publicKey = options.publicKey || null
    // this.privateKey = options.privateKey || null

    // Internal state
    this._activationData = null
  }

  /**
   * Set the instance identifier (usually a hardware/machine ID)
   * @param {string} instance - Unique identifier for this installation
   * @returns {License} - Returns this for chaining
   */
  setInstance (instance) {
    Assert.isType('string', instance, 'Instance must be a string')
    this.instance = instance
    return this
  }

  /**
   * Set the license key
   * @param {string} key - License key to validate
   * @returns {License} - Returns this for chaining
   */
  setKey (key) {
    Assert.isType('string', key, 'License key must be a string')
    this.key = key
    return this
  }

  /**
   * Generate a machine identifier based on hardware information
   * @returns {string} - Unique machine identifier
   */
  static generateMachineId () {
    // In a real implementation, this would use OS-specific methods to gather
    // hardware identifiers like MAC addresses, CPU IDs, etc.
    // For this example, we'll use a simplified approach
    const os = require('os')
    const networkInterfaces = os.networkInterfaces()
    const hostname = os.hostname()

    // Collect MAC addresses
    const macAddresses = []
    Object.keys(networkInterfaces).forEach(ifaceName => {
      networkInterfaces[ifaceName].forEach(iface => {
        if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
          macAddresses.push(iface.mac)
        }
      })
    })

    // Create a hash of the collected information
    const hash = crypto.createHash('sha256')
    hash.update(hostname + macAddresses.join(''))
    return hash.digest('hex')
  }

  /**
   * Check if the current license is valid
   * @returns {Promise<boolean>} - True if license is valid
   */
  async check () {
    if (!this.key) {
      throw new Error('License key not set')
    }

    // First check local activation data
    try {
      await this._loadActivation()
      if (this._isActivationValid()) {
        return true
      }
    } catch (err) {
      // No local activation or invalid, continue to online check
    }

    // Perform online validation
    try {
      const request = new RequestEngine({
        baseUrl: this.serverUrl
      })

      const response = await request.post('/validate', {
        key: this.key,
        instance: this.instance || License.generateMachineId()
      })

      // Validate the response
      if (!response) {
        throw new Error('No response received from license server')
      }

      if (!response.valid) {
        const reason = response.error || 'Unknown validation failure'
        throw new Error(`License validation failed: ${reason}`)
      }

      // Process the valid response
      this._activationData = {
        key: this.key,
        instance: this.instance,
        signature: response.signature,
        expiresAt: response.expiresAt,
        features: response.features || {}
      }

      this.expiresAt = new Date(response.expiresAt)
      this.features = response.features || {}
      this.activated = true

      await this._saveActivation()
      return true
    } catch (err) {
      console.error('License validation error:', err.message)
    }

    return false
  }

  /**
   * Activate the license
   * @returns {Promise<boolean>} - True if activation succeeded
   * @throws {Error} - If maximum retries exceeded
   */
  async activate () {
    if (this.retryCount >= this.maxRetries) {
      throw new Error(`Maximum activation attempts (${this.maxRetries}) exceeded`)
    }

    this.retryCount++
    const result = await this.check()

    if (result) {
      this.retryCount = 0
      return true
    }

    return false
  }

  /**
   * Load activation data from storage
   * @private
   */
  async _loadActivation () {
    const activationPath = path.join(this.storageDir, '.license-activation')

    try {
      const data = await fs.readFile(activationPath, 'utf8')
      this._activationData = JSON.parse(data)
      this.expiresAt = new Date(this._activationData.expiresAt)
      this.features = this._activationData.features || {}

      // Verify the activation data
      if (this._verifyActivation()) {
        this.activated = true
      } else {
        throw new Error('Invalid activation data')
      }
    } catch (err) {
      throw new Error('Failed to load activation data: ' + err.message)
    }
  }

  /**
   * Save activation data to storage
   * @private
   */
  async _saveActivation () {
    const activationPath = path.join(this.storageDir, '.license-activation')

    try {
      await fs.writeFile(
        activationPath,
        JSON.stringify(this._activationData),
        'utf8'
      )
    } catch (err) {
      throw new Error('Failed to save activation data: ' + err.message)
    }
  }

  /**
   * Verify the activation data signature
   * @private
   * @returns {boolean} - True if signature is valid
   */
  _verifyActivation () {
    if (!this._activationData || !this._activationData.signature) {
      return false
    }

    // In a real implementation, this would verify the cryptographic signature
    // using the public key
    if (this.publicKey) {
      try {
        const verify = crypto.createVerify('SHA256')
        const dataToVerify = JSON.stringify({
          key: this._activationData.key,
          instance: this._activationData.instance,
          expiresAt: this._activationData.expiresAt,
          features: this._activationData.features
        })

        verify.update(dataToVerify)
        return verify.verify(
          this.publicKey,
          this._activationData.signature,
          'base64'
        )
      } catch (err) {
        return false
      }
    }

    // Fallback simple verification (not secure for production)
    return this._activationData.key === this.key
  }

  /**
   * Check if the activation is still valid (not expired)
   * @private
   * @returns {boolean} - True if activation is valid
   */
  _isActivationValid () {
    if (!this._activationData || !this.expiresAt) {
      return false
    }

    // Check expiration
    if (this.expiresAt < new Date()) {
      return false
    }

    // Verify signature
    return this._verifyActivation()
  }

  /**
   * Generate a new license key
   * @param {Object} options - License generation options
   * @param {string} options.product - Product identifier
   * @param {string} options.customer - Customer identifier
   * @param {Date} options.expiresAt - Expiration date
   * @param {Object} options.features - Feature flags
   * @returns {string} - Generated license key
   */
  static generateKey (options = {}) {
    Assert.isType('Object', options, 'Options must be an object')

    const product = options.product || 'default'
    const customer = options.customer || 'unknown'
    const expiresAt = options.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    const features = options.features || {}

    // Create a payload
    const payload = {
      p: product,
      c: customer,
      e: Math.floor(expiresAt.getTime() / 1000),
      f: features,
      t: Date.now()
    }

    // Encode the payload
    const payloadStr = JSON.stringify(payload)
    const payloadBase64 = Buffer.from(payloadStr).toString('base64')

    // Generate a checksum
    const checksum = crypto.createHash('sha256')
      .update(payloadBase64)
      .digest('hex')
      .substring(0, 8)

    // Format the key in a readable format
    const parts = []
    const combined = payloadBase64 + checksum

    for (let i = 0; i < combined.length; i += 6) {
      parts.push(combined.substring(i, i + 6))
    }

    return parts.join('-')
  }

  /**
   * Validate a license key format
   * @param {string} key - License key to validate
   * @returns {boolean} - True if the key format is valid
   */
  static validateKey (key) {
    if (typeof key !== 'string') return false

    // Remove any formatting
    const cleanKey = key.replace(/-/g, '')

    if (cleanKey.length < 10) return false

    // Extract payload and checksum
    const checksum = cleanKey.substring(cleanKey.length - 8)
    const payloadBase64 = cleanKey.substring(0, cleanKey.length - 8)

    // Verify checksum
    const calculatedChecksum = crypto.createHash('sha256')
      .update(payloadBase64)
      .digest('hex')
      .substring(0, 8)

    return checksum === calculatedChecksum
  }

  /**
   * Decode a license key to extract its information
   * @param {string} key - License key to decode
   * @returns {Object|null} - Decoded license information or null if invalid
   */
  static decodeKey (key) {
    if (!License.validateKey(key)) return null

    // Remove any formatting and extract payload
    const cleanKey = key.replace(/-/g, '')
    const payloadBase64 = cleanKey.substring(0, cleanKey.length - 8)

    try {
      const payloadStr = Buffer.from(payloadBase64, 'base64').toString()
      const payload = JSON.parse(payloadStr)

      return {
        product: payload.p,
        customer: payload.c,
        expiresAt: new Date(payload.e * 1000),
        features: payload.f,
        timestamp: new Date(payload.t)
      }
    } catch (err) {
      return null
    }
  }

  /**
   * HTTP handler for license validation requests
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   */
  static validateFromHTTP (req, res) {
    // Extract license key and instance from request
    const { key, instance } = req.body || {}

    if (!key || !instance) {
      return res.json({
        valid: false,
        error: 'Missing license key or instance identifier'
      })
    }

    // Validate the license key format
    if (!License.validateKey(key)) {
      return res.json({
        valid: false,
        error: 'Invalid license key format'
      })
    }

    // Decode the license information
    const licenseInfo = License.decodeKey(key)

    if (!licenseInfo) {
      return res.json({
        valid: false,
        error: 'Could not decode license key'
      })
    }

    // Check if license is expired
    if (licenseInfo.expiresAt < new Date()) {
      return res.json({
        valid: false,
        error: 'License has expired',
        expiresAt: licenseInfo.expiresAt
      })
    }

    // In a real implementation, you would check against a database
    // to verify the license is valid and not overused

    // Generate a signature for the activation
    // This would use the server's private key in a real implementation
    const dataToSign = JSON.stringify({
      key: key,
      instance: instance,
      expiresAt: licenseInfo.expiresAt,
      features: licenseInfo.features
    })
    Assert.isType('object', dataToSign)

    // This is a placeholder for actual signature generation
    // In a real implementation, we would use dataToSign with the private key
    const signature = 'signature-placeholder'
    // const signature = crypto.createSign('SHA256').update(dataToSign).sign(privateKey, 'base64')

    return res.json({
      valid: true,
      signature: signature,
      expiresAt: licenseInfo.expiresAt,
      features: licenseInfo.features
    })
  }

  /**
   * Create HTTP routes for a license server
   * @param {Object} router - Router object to add routes to
   * @param {Object} options - Configuration options
   * @returns {Object} - Router with license routes added
   */
  static createServer (router, options = {}) {
    Assert.isType('Object', router, 'Router must be an object')

    // Add validation endpoint
    router.post('/license/validate', License.validateFromHTTP)

    // Add key generation endpoint (should be protected)
    router.post('/license/generate', (req, res) => {
      // In a real implementation, this would be protected by authentication
      const { product, customer, expiresAt, features } = req.body || {}

      const key = License.generateKey({
        product,
        customer,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        features
      })

      res.json({ key })
    })

    return router
  }
}

module.exports = License
