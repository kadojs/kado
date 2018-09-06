# Kado Development
by Bryan Tong, August 27th 2015

This document is intended to overview the development process involving Kado
core and Kado modules.

Furthermore, it is imperative to install the core when working on modules to
make testing a more enjoyable and cut down on commits.

## Initial Checkout

Kado makes the use of submodules when working on the core system. The official
modules are included in the core repo. Custom modules will need to be added
using a fork of the core. That fork will then still be able to see module
changes from the master as long as the remote is watched.

Okay, that being said lets go through an initial checkout procedure. In our
case we use Webstorm, which I would highly recommend.

There are two options, first lets go with the generic.

```
$ cd /home/kado
$ git clone --recursive https://github.com/nullivex/kado
```

In Webstorm, we use *VCS -> Checkout From Version Control -> GitHub*
once the repository is checked out. Open the new project. Once the project
has opened we can import the submodules.

*Note for Windows* if you want to avoid the typing of credentials on the
following commands use the following.

```
$ git config --global credential.helper wincred
```

Now to import the submodules

```
$ git submodule update --init --recursive
```

You will most likely have to enter your credentials once but it will be cached
into the future. Since submodules are only loosely supported in Webstorm it
is neccessary to do most of the git work on command line. However, it seems
the typical development cycle works nicely through Webstorm.

## Pulling

When starting the day its best to pull first and get synced up. I always
recommend to developers to commit at the end of the day. If you cant wrap it up
in a day you have bitten off too much.

```
$ git pull --recurse-submodules
```

This will update the core and all of the submodules.

## Pushing

Although, I highly recommend pushing submodules individually to avoid having
unexpected changes pushed. If you are making largescale changes such as code
standards changes. Run the following.

```
$ git push --recurse submodules
```

## Merging

At the time of writing, it is unclear how much of the Kado core will be open
source. However, in the event that it is. We will be accepting pull requests
against the core and all of its modules respectively.

There is nothing special that I know of working with submodules and merging.
If, though, something happens to come up I will add it here.

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
