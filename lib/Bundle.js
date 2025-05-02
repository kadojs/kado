/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')
const fs = require('./FileSystem')
const License = require('./License')

/**
 * Bundle - Zero-dependency bundling system for Kado
 * @class
 */
class Bundle {
  /**
   * Create a new Bundle instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.entryPoint] - Manual entry point override
   * @param {string} [options.outputPath='./dist'] - Path for bundle output
   * @param {string} [options.format='esm'] - Output format (esm, cjs, iife)
   * @param {boolean} [options.sourceMap=false] - Generate source maps
   * @param {boolean} [options.embedLicense=false] - Embed license information
   * @param {string} [options.configPath='./kado.bundle.js'] - Custom config path
   */
  constructor (options = {}) {
    this.options = {
      entryPoint: null,
      outputPath: './dist',
      format: 'esm',
      sourceMap: false,
      embedLicense: false,
      configPath: './kado.bundle.js',
      ...options
    }

    this.dependencies = new Map()
    this.entryPoints = []
    // this.assets = new Map()
    this.configLoaded = false
  }

  /**
   * Create a Single Executable Application (SEA) from the bundle
   * @param {Object} options - SEA options
   * @param {string} [options.output='app'] - Output filename
   * @param {boolean} [options.includeNode=true] - Include Node.js runtime
   * @param {string} [options.nodeVersion] - Specific Node.js version to use
   * @return {Promise<string>} - Path to the created executable
   */
  async createExecutable (options = {}) {
    const defaultOptions = {
      output: 'app',
      includeNode: true,
      nodeVersion: process.version
    }

    const seaOptions = { ...defaultOptions, ...options }

    // Ensure we have a bundle
    if (this.dependencies.size === 0) {
      await this.buildDependencyGraph()
    }

    // Generate the bundle if not already done
    const bundleResult = this.generateBundle()
    if (Object.keys(bundleResult).length === 0) {
      throw new Error('No bundles generated')
    }

    // Get the main bundle
    const mainBundle = Object.values(bundleResult)[0]

    // Create a wrapper script
    const wrapperPath = fs.path.join(this.options.outputPath, 'sea-prep.js')
    const wrapperContent = `
      // SEA wrapper for ${mainBundle.entryPoint}
      const app = require('${fs.path.relative(this.options.outputPath, mainBundle.outputPath)}')
      
      // Run the app if it has a run method
      if (typeof app.run === 'function') {
        app.run().catch(err => {
          console.error('Error:', err.message)
          process.exit(1)
        })
      } else {
        // Otherwise, just use the exported module
        console.log('Application loaded')
      }
    `
    fs.writeFileSync(wrapperPath, wrapperContent)

    // Create SEA config
    const seaConfigPath = fs.path.join(this.options.outputPath, 'sea-config.json')
    const seaConfig = {
      main: fs.path.basename(wrapperPath),
      output: `${seaOptions.output}.sea`
    }
    fs.writeFileSync(seaConfigPath, JSON.stringify(seaConfig, null, 2))

    // Generate the SEA blob
    try {
      const { execSync } = require('child_process')
      execSync('node --experimental-sea-config sea-config.json', {
        cwd: this.options.outputPath,
        stdio: 'inherit'
      })

      // Get the path to the node executable
      const nodePath = process.execPath
      const seaPath = fs.path.join(this.options.outputPath, `${seaOptions.output}.sea`)
      const exePath = fs.path.join(this.options.outputPath, seaOptions.output +
                                  (process.platform === 'win32' ? '.exe' : ''))

      // Copy node executable
      fs.copyFileSync(nodePath, exePath)

      // Make the file executable on Unix
      if (process.platform !== 'win32') {
        fs.chmodSync(exePath, 0o755)
      }

      // Inject the SEA blob
      if (process.platform === 'win32') {
        execSync(`node --experimental-sea-blob-inject "${exePath}" "${seaPath}"`, {
          stdio: 'inherit'
        })
      } else {
        execSync(`npx postject "${exePath}" NODE_SEA_BLOB "${seaPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, {
          stdio: 'inherit'
        })
      }

      return exePath
    } catch (err) {
      throw new Error(`Failed to create executable: ${err.message}`)
    }
  }

  /**
   * Load configuration from kado.bundle.js if it exists
   * @return {Bundle} - Returns self for chaining
   */
  loadConfig () {
    if (this.configLoaded) return this

    try {
      const configPath = fs.path.resolve(process.cwd(), this.options.configPath)
      if (fs.exists(configPath)) {
        const config = require(configPath)
        this.options = { ...this.options, ...config }
      }
      this.configLoaded = true
    } catch (err) {
      // Silent fail on config loading - use defaults
    }

    return this
  }

  /**
   * Detect entry points based on package.json or conventions
   * @param {string} [basePath=process.cwd()] - Base path to search from
   * @return {string[]} - Detected entry points
   */
  detectEntryPoints (basePath = process.cwd()) {
    // If entry point was manually specified in options
    if (this.options.entryPoint) {
      this.entryPoints = [this.options.entryPoint]
      return this.entryPoints
    }

    // Check package.json for entry points
    try {
      const packagePath = fs.path.join(basePath, 'package.json')
      if (fs.exists(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

        // Check exports field (ESM)
        if (pkg.exports) {
          if (typeof pkg.exports === 'string') {
            this.entryPoints.push(pkg.exports)
          } else if (pkg.exports['.']) {
            if (typeof pkg.exports['.'] === 'string') {
              this.entryPoints.push(pkg.exports['.'])
            } else if (pkg.exports['.'].default) {
              this.entryPoints.push(pkg.exports['.'].default)
            }
          }
        }

        // Check module field (ESM)
        if (pkg.module && !this.entryPoints.includes(pkg.module)) {
          this.entryPoints.push(pkg.module)
        }

        // Check browser field
        if (pkg.browser && !this.entryPoints.includes(pkg.browser)) {
          this.entryPoints.push(pkg.browser)
        }

        // Check main field (CJS)
        if (pkg.main && !this.entryPoints.includes(pkg.main)) {
          this.entryPoints.push(pkg.main)
        }
      }
    } catch (err) {
      // Silently fail and move to conventional paths
    }

    // Check conventional paths if no entry points found
    if (!this.entryPoints.length) {
      const conventionalPaths = [
        './src/index.js',
        './src/index.mjs',
        './index.js',
        './index.mjs'
      ]

      for (const conventionalPath of conventionalPaths) {
        const fullPath = fs.path.join(basePath, conventionalPath)
        if (fs.exists(fullPath)) {
          this.entryPoints.push(conventionalPath)
          break
        }
      }
    }

    // Resolve paths to absolute paths
    this.entryPoints = this.entryPoints.map(entryPoint =>
      fs.path.isAbsolute(entryPoint) ? entryPoint : fs.path.resolve(basePath, entryPoint)
    )

    return this.entryPoints
  }

  /**
   * Parse a file to extract its dependencies
   * @param {string} filePath - Path to the file to parse
   * @return {string[]} - Array of dependency paths
   */
  parseDependencies (filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const dependencies = []

    // Match ES imports
    const esImportRegex = /import\s+(?:[\w*{}$\s,]+\s+from\s+)?["']([^"']+)["']/g
    let match
    while ((match = esImportRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    // Match CommonJS requires
    const cjsRequireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g
    while ((match = cjsRequireRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    return dependencies
  }

  /**
   * Build the dependency graph starting from entry points
   * @return {Map} - Dependency graph
   */
  buildDependencyGraph () {
    if (!this.entryPoints.length) {
      this.detectEntryPoints()
    }

    const visited = new Set()

    const processFile = (filePath) => {
      if (visited.has(filePath)) return
      visited.add(filePath)

      // Skip Node.js built-in modules
      if (!filePath.startsWith('/') && !filePath.startsWith('.')) {
        this.dependencies.set(filePath, { isBuiltIn: true, dependencies: [] })
        return
      }

      try {
        const resolvedPath = this._resolveFilePath(filePath)
        if (!resolvedPath) return

        const dependencies = this.parseDependencies(resolvedPath)
        this.dependencies.set(resolvedPath, {
          isBuiltIn: false,
          dependencies: dependencies
        })

        for (const dep of dependencies) {
          processFile(this._resolveModuleImport(dep, fs.path.dirname(resolvedPath)))
        }
      } catch (err) {
        // Skip files that can't be processed
      }
    }

    for (const entryPoint of this.entryPoints) {
      processFile(entryPoint)
    }

    return this.dependencies
  }

  /**
   * Resolve a file path, handling extensions
   * @private
   * @param {string} filePath - Path to resolve
   * @return {string|null} - Resolved path or null if not found
   */
  _resolveFilePath (filePath) {
    // Skip node built-ins
    if (!filePath.startsWith('/') && !filePath.startsWith('.')) {
      return filePath
    }

    if (fs.exists(filePath)) {
      return filePath
    }

    // Try with extensions
    const extensions = ['.js', '.mjs', '.cjs', '.json']
    for (const ext of extensions) {
      const pathWithExt = `${filePath}${ext}`
      if (fs.exists(pathWithExt)) {
        return pathWithExt
      }
    }

    // Try index files in directories
    for (const ext of extensions) {
      const indexPath = fs.path.join(filePath, `index${ext}`)
      if (fs.exists(indexPath)) {
        return indexPath
      }
    }

    return null
  }

  /**
   * Resolve a module import to a file path
   * @private
   * @param {string} importPath - Import path from code
   * @param {string} basePath - Base directory path
   * @return {string} - Resolved file path
   */
  _resolveModuleImport (importPath, basePath) {
    // Handle node built-ins and node_modules
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return importPath // Just return the module name for now
    }

    // Resolve relative imports
    return fs.path.resolve(basePath, importPath)
  }

  /**
   * Process assets references in files
   * @param {string} [assetsDir='./src/assets'] - Assets directory
   * @return {Bundle} - Returns self for chaining
   */
  processAssets (assetsDir = './src/assets') {
    // Implementation will use Kado's Asset system
    // This is a stub for now - will be implemented in full version
    Assert.isOk(assetsDir)
    return this
  }

  /**
   * Generate bundles based on the dependency graph
   * @return {Object} - Object containing bundle information
   */
  generateBundle () {
    if (this.dependencies.size === 0) {
      this.buildDependencyGraph()
    }

    // Ensure output directory exists
    const outputDir = fs.path.resolve(process.cwd(), this.options.outputPath)
    if (!fs.exists(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const bundleResults = {}

    // For now, we'll create a simple bundle for each entry point
    for (const entryPoint of this.entryPoints) {
      const outputFileName = fs.path.basename(entryPoint).replace(/\.[^.]+$/, '.bundle.js')
      const outputPath = fs.path.join(outputDir, outputFileName)

      // Create a simple concatenated bundle (simplified for now)
      let bundleContent = ''

      // Optional license embedding
      if (this.options.embedLicense) {
        bundleContent += this._generateLicenseHeader()
      }

      // Add the entry point code
      bundleContent += fs.readFileSync(entryPoint, 'utf8')

      // Write the bundle
      fs.writeFileSync(outputPath, bundleContent)

      bundleResults[outputFileName] = {
        entryPoint,
        outputPath,
        size: bundleContent.length
      }
    }

    return bundleResults
  }

  /**
   * Generate license header for bundle
   * @private
   * @return {string} - License header string
   */
  _generateLicenseHeader () {
    try {
      const license = new License()
      return `/**\n * ${license.getName()}\n * ${license.getDescription()}\n */\n\n`
    } catch (err) {
      return '/** Bundle generated by Kado **/\n\n'
    }
  }
}

module.exports = Bundle
