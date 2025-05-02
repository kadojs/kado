# Kado 4.5 Released
*By Bryan Tong 2/20/2025*

Kado 4.5 is a major release with many new features and improvements.

## Key Changes

### License

The license has been changed from GPLv3 to MIT. This change was made to allow for more flexibility in how Kado is used.

### NOTICE

A NOTICE file has been added to the project. This file contains the list of dependencies and the version of Kado that each dependency is using.

### GeoIP

A warning is now displayed if the GeoIP data is not present.

### Documentation

Example usage has been added to the documentation for the following libraries:

* Application
* Assert
* Asset
* ChildProcess
* Cluster
* Command
* CommandServer
* Connect

Additionally, unused build buttons have been removed from the README.

A much stronger argument for Why Kado is now available.

### Node 16

Kado now requires Node 16 or higher.

### Bundle

A new module has been added to Kado to bundle your application into a single executable file. This is useful for distributing your application to users who may not have Node.js installed. 

This is a new module and is still under development. It is not recommended for production use yet.

See the [Bundle documentation](../Bundle.md) for more information.

### License

Another new module has been introduced to Kado to handle license files. This module is used to embed the license file into the executable.

See the [License documentation](../License.md) for more information.    

What's exciting about this module is that it allows you to validate the license file when the application starts. This means that you can refuse to start the application if the license is invalid. Additionally, the License module is integrated with the Bundle module so that the license is embedded in the executable.

### ESM Modules

Kado now supports ESM modules. This means that you can use the import and export syntax to organize your code.

Below is an example of an ESM module:

```javascript
import { createApp } from 'kado/App'
```

Or using the FileSystem module:

```javascript
import { path } from 'kado/FileSystem'
```

### CommonJS Modules

Kado also supports CommonJS modules. This means that you can use the require syntax to import modules.

Below is an example of a CommonJS module:

```javascript
const { createApp } = require('kado/App')
```

Or using the FileSystem module:

```javascript
const { path } = require('kado/FileSystem')
```

## Bug Fixes

* Added `:_all` handling to PathExp to capture remaining URI [!349](https://git.nullivex.com/kado/kado/-/merge_requests/349)

## Future Plans

To make Kado even better for your development experience, we are adding support for React, GraphQL, and more. Remember that Kado already works excellently with Vue, which is my favorite framework combination for single-page applications.

Please try the new version and give us feedback! It's important for us to hear from you so that we know what to prioritize and to help you get the most out of Kado.

## Conclusion

Kado has now reached a mature version that is ready for production use. Kado 4.5 has been in testing for over 2 years and has been used to power many websites. Kado also works well for building REST APIs and is a great command-line tool.

After 10 years of working with Kado, I have learned a lot about what is important to create a great development experience. Kado is now a mature project that is ready for your next project.

I want to see you succeed in your development goals so that you can build powerful applications faster. Kado thoughtfully integrates all of the tools needed to build a modern application. This means that you do not need to live in dependency hell! Kado is designed to work with the best tools in the ecosystem.

Thank you for your continued support!

Bryan Tong,  
Author of Kado  
Founder of NULLIVEX LLC
