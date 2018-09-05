# Kado [![Build Status](https://travis-ci.org/nullivex/kado.svg?branch=master)](https://travis-ci.org/nullivex/kado)

Modular application development framework based on Node.js

## Preface

Take a look at this blog post: https://www.nullivex.com/blog/kado-comeback

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
# npm install kado mysql2 --save
# node node_modules/kado/bin/kado bootstrap --app myproject --enable-staff
# node app
```

Simple blog website (equivalent of wordpress)

```
# mkdir myblog
# cd myblog
# npm install kado mysql2 --save
# node_modules/kado/bin/kado bootstrap --app myblog --enable-all
# node app
```

## Modules

Kado modules drive the entire user space system which comprises
the actionable code.

The plugin format follows a rather loose format to provide
agility with different progamming languages and non web
based programs.

### Example Module Structure

```
- kado/myplugin
  - index.js (plugin entry point, called by system)
  - kado.json (kado plugin definition)
```

### `index.js`

This is the main entry point of the file and is used to either load
native JS routes or hand off and/or proxy to sub programs.

The properties of this object that Kado requires are:
* `kado` - (bool) Must be set to `true` for module use
* `name` - (string) Name of the module
* `title` - (string) Title of the module
* `description` - (string) Description of the module
* `db` - ((K,db)=>{}) function to setup db requirements and key maps
* `authenticate` - (function(K,username,password,done)) function to authenticate system users, optional, rare
* `admin` - (function(K,app)) Register for use in the admin interface setup routes
* `api` - ((K,app)=>{}) Register for use in the API interface setup routes
* `main` - ((K,app)=>{}) Register for use in the main interface setup routes
* `cli` - ((K,app)=>{}) Register for use in the cli routing engine hand off to module script

Below is an abbreviated module

```js
exports.kado = true
exports.name = 'mymod'
exports.title = 'MyMod'
exports.description = 'My module'
exports.db = (K,db) => {
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/model/MyModel.js')
}
exports.authenticate = (K,username,password,done) => {
  //everyone wins
  done(null,true)
}
exports.admin = (K,app) => {
  let admin = require('./admin')
  app.get('/mymod/list',admin.list)
  app.post('/mymod/save',admin.save)
}
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/mymod')
}

```

#### `kado.json`

The plugin definition file will tell Kado how to handle the
plugin. This involves chain loading into other programming
languages (which may required a Javascript shim).

**NOTE** This format is under construction.

```json
{
  "enabled": false,
  "name": "myPlugin",
  "admin": {
    "enabled": true,
    "nav": {
      "sequence": 5,
      "name": "My Plugin",
      "uri" : "/myplugin"
    }
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

## Changelog

### 3.0.0
* Drop pug
* Implement mustache templates
* Implement Language Packs! And add the following languages:
  * English
  * Spanish
* Implement datatables.net for displaying data
* Adjust module format in the following ways
  * Drop kado.json and move config entries into main module follow
  * Rename module entry point from `index.js` to `kado.js`
  * Kado now scans for `kado.js` files as modules and has no path expectations
* Implement Bootstrap 4 styling
* Implement permission system from auth provider
* Implement navigation breadcrumb system
* Implement language switcher
* Implement default theme

### 2.1.0
* Add module generator
* Update dependencies

### 2.0.4
* Remove unused nav JSON structure from modules

### 2.0.3
* Fix user space module loading issue

### 2.0.2
* Fix staff handling in admin panel templates

### 2.0.1
* Small fix to template paths

### 2.0.0
* Remove SQLite, CouchDB, Couchbase connectors
* Implement ES6
* Update to latest dependencies
* Drop `user` module and implement more robust `staff` module for default login
* Implement blog cli
* Implement blog api
* Implement complete e2e testing of the system
* Add uri handing to blog module
* Drop `client` interface making core interfaces `admin`,`api`,`main
* Complete `main` interface to display properly

### 1.1.1
* Remove database connectors from dependencies they should be installed at
app build time.

### 1.1.0
* Remove couchdb connector
* Remove couchbase connector
* Fix failure on blog main startup

### 1.0.0
* Initial release
