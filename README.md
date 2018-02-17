# Kado

Modular application development framework based on Node.js

## What does it do

Kado provides a simple extensible environment to run
modules that group together to become an application.

This is contrary to the traditional approach of starting with
base code and assets then providing routes on top of that.
Kado aims to compress the duplicated code created during this
process and provide a simpler workflow for developers that
remains consistent regardless of a changing environment.

## Usage

Basic administration panel

```
# mkdir myproject
# cd myproject
# npm install kado kado-admin --save
# node_modules/kado/bin/kado bootstrap
# node app
```

Simple blog website (equivalent of wordpress)

```
# mkdir myblog
# cd myblog
# npm install kado-blog --save
# node_modules/kado/bin/kado bootstrap
# node app
```

## Plugins

Kado plugins drive the entire user space system which comprises
the actionable code.

The plugin format follows a rather loose format to provide
agility with different progamming languages and non web
based programs.

### Example Plugin Structure

```
- kado/myplugin
  - view
    main.pug (view files, could be html)
  - hook.js (hooks called by the system, cli, other plugins)
  - kado.json (kado plugin definition)
  - route.js (content for routes registered in plugin.json)
```

#### Kado.json

The plugin definition file will tell Kado how to handle the
plugin. This involves chain loading into other programming
languages (which may required a Javascript shim).

**NOTE** This format is under construction.

```json
{
  "enabled": true,
  "name": "myPlugin",
  "admin": {
    "enabled": true,
    "nav": {
      "sequence": 5,
      "name": "My Plugin",
      "uri" : "/myplugin"
    },
    "routes": [
      {"uri": "/myplugin/save", "method": "post", "fn": "save"},
      {"uri": "/myplugin/edit", "method": "get", "fn": "edit"}
    ]
  }
}
```

This format is somewhat self explanatory. However in detail:

* `enabled` - Control plugin being loaded at runtime
* `name` - Plugin name when addressed by the system
* `admin` - Object containing admin panel definitions
  * `enabled` - Load this module into the admin panel
  * `nav` - Object containing admin navigation properties
    * `sequence` - Order to display the nav in, conflicts go alphabetical
    * `name` - Name of the plugin to display in the nav bar
    * `uri` - URI to the admin plugin
  * `routes` - Object containing admin panel routes
    * `uri` - URI to the route of the plugin
    * `method` - HTTP method to access the route
    * `fn` - Function to call the route from must be in `routes.js`


## Changelog

### 1.0.0
* Initial release
