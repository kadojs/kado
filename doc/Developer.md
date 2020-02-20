# Developer
> NOTICE: Kado 3 is **DEPRECATED**, see https://kado.org for the latest version.

This document is intended to overview the development process involving Kado and
Kado modules.

## Initial Checkout

The official modules are included in the core repo. 

Okay, that being said lets go through an initial checkout procedure.

```
$ cd /home/kado
$ git clone https://github.com/KadoOrg/kado
```

## Contributing

In order to have your changes accepted into the main Kado system please fork
the [kado/kado](https://git.nullivex.com/kado/kado) repository and once you have
finished your changes. Try to keep them in a single commit and then submit a
pull request using Github.

Kado has a set [release cycle](./Developer.md) please keep that in mind with
contributing new features. In the meantime, please use your fork to operate
systems with newer features.

If your change is going to require changing the module format it may either be
rejected or shelved for a Major LTS release. Kado attempts to protect the
modules at all costs.

## Pulling

Normal git updates.

```
$ git pull
```

## Pushing

Nothing special.

```
$ git push
```

## Merging

We will be accepting pull requests against the core and all of its modules
respectively.

There is nothing special that I know of working with submodules and merging.
If, though, something happens to come up I will add it here.

## Modules

Kado modules drive the entire user space system which comprises the actionable
code.

The plugin format follows a rather loose format to provide agility with
different programming languages and non web based programs.

### Example Module Structure

```
- kado_modules/mymodule
  - index.js (module entry point, called by system)
```

### `index.js`

This is the main entry point of the file and is used to either load
native JS routes or hand off and/or proxy to sub programs.

The properties of this object that Kado requires are:

| Name | Type | Description |
| --- | --- | --- |
| \_kado.enabled | `(bool)` | Must be set to `true` for module use |
| \_kado.name | `(string)` | Name of the module, usually lower case |
| \_kado.title | `(string)` | Title of the module |
| \_kado.description | `(string)` | Description of the module |
| config | `((config)=>{})` | Append configuration variables |
| db | `((K,db)=>{})` | Setup db requirements and key maps |
| authenticate | `((K,username,password,done)=>{})` | Authenticate system users, optional, rare |
| search | `((K,app,keywords,start,limit)=>{})` | Search provider system, map your models to provide search results. |
| admin | `((K,app)=>{})` | Register for use in the admin interface setup routes |
| main | `((K,app)=>{})` |  Register for use in the main interface setup routes |
| cli | `((K,app)=>{})` | Register for use in the cli routing engine hand off to module script |

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
