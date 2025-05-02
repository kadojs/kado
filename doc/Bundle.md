# Bundle
*Introduced in 4.5.0*
>Stability: 1 - Experimental

A zero-dependency bundling system for Kado. The Bundle module provides a way to package JavaScript applications and libraries with no external dependencies.

## Features

### Entry Point Detection

The Bundle module automatically detects entry points using:
- Package.json fields (`module`, `main`, `browser`, `exports`)
- Conventional file paths if no package.json is found (`./src/index.js`, `./index.js`, etc.)
- Support for both ESM and CommonJS modules

### Dependency Resolution

- Automatically parses JavaScript files to detect imports and requires
- Builds a complete dependency graph starting from entry points
- Handles circular dependencies gracefully
- Supports Node.js built-in modules

### Asset Handling

- Integrates with Kado's Asset system
- Supports CSS, images, and other non-JS assets
- Bundles assets based on references in code

### Configuration

- Default: Zero configuration using conventions
- Override: Optional `kado.bundle.js` for custom settings
- Support for output customization and environment-specific builds

### Output Generation

- Bundles JavaScript modules in correct order
- Generates source maps (optional)
- Supports multiple output formats (IIFE, CJS, ESM)
- License embedding option

### License Integration

- Option to embed license information in bundles
- Support for executable wrapping with license validation

## Creating Executables

Starting with Node.js 20.6.0, Kado's Bundle module supports creating standalone executable applications using Node.js Single Executable Applications (SEA) feature. This allows you to distribute your Kado applications as a single binary file without requiring users to install Node.js.

### `createExecutable(options)`

Creates a standalone executable from your bundled application.

- `options` {Object} - Configuration for the executable
  - `output` {string} - Output filename without extension (default: 'app')
  - `includeNode` {boolean} - Whether to include Node.js runtime (default: true)
  - `nodeVersion` {string} - Specific Node.js version to use (default: current version)
- Returns: {Promise<string>} - Path to the created executable

**Note:** Requires Node.js 20.6.0 or later.

Example:
```javascript
const Bundle = require('kado/lib/Bundle')

async function buildExecutable() {
  const bundle = new Bundle({
    entryPoint: './src/myApp.js',
    outputPath: './dist'
  })
  
  // Create an executable named 'myApp'
  const exePath = await bundle.createExecutable({
    output: 'myApp'
  })
  
  console.log(`Executable created at: ${exePath}`)
}

buildExecutable().catch(console.error)
```

### Platform-Specific Considerations

The created executable will have different extensions based on the platform:
- Windows: `.exe` 
- macOS/Linux: no extension (with executable permissions)

Windows example:
```javascript
// Creates dist/myApp.exe
const exePath = await bundle.createExecutable({ output: 'myApp' })
```

Unix example:
```javascript
// Creates dist/myApp
const exePath = await bundle.createExecutable({ output: 'myApp' })
```

### Executable Structure

The created executable includes:
1. A copy of the Node.js runtime
2. Your bundled application code
3. Any required assets or dependencies

This allows your application to run on systems that don't have Node.js installed.

### Requirements

- Node.js 20.6.0 or later
- On non-Windows platforms, the `postject` package may be required

### Advanced Usage

You can customize the SEA creation process with additional options:

```javascript
const bundle = new Bundle({ outputPath: './dist' })

// First build the dependency graph and generate the bundle
await bundle.detectEntryPoints()
await bundle.buildDependencyGraph()
await bundle.generateBundle()

// Then create an executable with custom options
const exePath = await bundle.createExecutable({
  output: 'myApp',
  nodeVersion: 'v20.10.0', // Use specific Node.js version
  includeNode: true // Include Node.js runtime (default)
})
```

If you're creating an executable from a CLI application that uses Kado's App module, the executable will maintain all CLI functionality, allowing users to interact with your app through command-line arguments.

## Usage

### Basic Usage

```javascript
const Bundle = require('kado/lib/Bundle')
// Create a new bundler with default options
const bundle = new Bundle()
// Detect entry points, build dependency graph, and generate bundle
bundle
.detectEntryPoints()
.buildDependencyGraph()
.generateBundle()
```

```javascript
const Bundle = require('kado/lib/Bundle')
// Create a new bundler with custom options
const bundle = new Bundle({
entryPoint: './src/custom-entry.js',
outputPath: './build',
format: 'cjs',
sourceMap: true,
embedLicense: true
})
// Generate bundle
bundle.generateBundle()
```

```javascript
// kado.bundle.js
module.exports = {
entryPoint: './src/index.js',
outputPath: './dist',
format: 'esm',
sourceMap: true,
embedLicense: true
}
```

```javascript
const Bundle = require('kado/lib/Bundle')
new Bundle().generateBundle()
```

```javascript
new Bundle(options)
```

Options:
- `entryPoint`: Manual entry point override (string, optional)
- `outputPath`: Path for bundle output (string, default: './dist')
- `format`: Output format - 'esm', 'cjs', or 'iife' (string, default: 'esm')
- `sourceMap`: Generate source maps (boolean, default: false)
- `embedLicense`: Embed license information (boolean, default: false)
- `configPath`: Custom config path (string, default: './kado.bundle.js')

### Methods

#### `loadConfig()`
Loads configuration from `kado.bundle.js` if it exists.

Example:
```javascript
const bundle = new Bundle()

// Load configuration from default location (./kado.bundle.js)
bundle.loadConfig()

// Configuration can be chained with other methods
bundle.loadConfig().detectEntryPoints().generateBundle()
```

#### `detectEntryPoints(basePath)`
Detects entry points based on package.json or conventions.
- `basePath`: Base path to search from (string, default: process.cwd())
- Returns: Array of detected entry point paths

Example:
```javascript
const bundle = new Bundle()

// Detect entry points from current directory
const entryPoints = bundle.detectEntryPoints()
console.log('Detected entry points:', entryPoints)

// Detect entry points from a specific directory
const customEntryPoints = bundle.detectEntryPoints('./src/app')
console.log('Custom directory entry points:', customEntryPoints)
```

#### `parseDependencies(filePath)`
Parses a file to extract its dependencies.
- `filePath`: Path to the file to parse (string)
- Returns: Array of dependency paths

Example:
```javascript
const bundle = new Bundle()

// Parse dependencies in a specific file
const dependencies = bundle.parseDependencies('./src/index.js')
console.log('Dependencies:', dependencies)
// Output might be: ['./utils', './components/Button', 'lodash']
```

#### `buildDependencyGraph()`
Builds the dependency graph starting from entry points.
- Returns: Map containing the dependency graph

Example:
```javascript
const bundle = new Bundle()
bundle.detectEntryPoints()

// Build the dependency graph
const graph = bundle.buildDependencyGraph()

// Examine the graph
for (const [filePath, info] of graph.entries()) {
  console.log(`File: ${filePath}`)
  console.log(`  Is built-in: ${info.isBuiltIn}`)
  console.log(`  Dependencies: ${info.dependencies.join(', ')}`)
}
```

#### `processAssets(assetsDir)`
Processes asset references in files.
- `assetsDir`: Assets directory (string, default: './src/assets')
- Returns: Bundle instance for chaining

Example:
```javascript
const bundle = new Bundle()

// Process assets from the default directory
bundle.processAssets()

// Process assets from a custom directory
bundle.processAssets('./public/assets')

// Chain with other methods
bundle
  .detectEntryPoints()
  .processAssets('./public/assets')
  .generateBundle()
```

#### `generateBundle()`
Generates bundles based on the dependency graph.
- Returns: Object containing bundle information

Example:
```javascript
const bundle = new Bundle({
  outputPath: './dist', 
  format: 'esm',
  sourceMap: true
})

// Generate bundles
const result = bundle
  .detectEntryPoints()
  .buildDependencyGraph()
  .generateBundle()

// Review the generated bundles
console.log('Bundle results:', result)
// Output might be: 
// {
//   'index.bundle.js': {
//     entryPoint: '/path/to/src/index.js',
//     outputPath: '/path/to/dist/index.bundle.js',
//     size: 12345
//   }
// }

// You can also generate bundles with license embedding
const bundleWithLicense = new Bundle({
  embedLicense: true
})
bundleWithLicense.generateBundle()
```
