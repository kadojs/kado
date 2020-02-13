# Configuration

Kado is very extensible. As such requires a flexible configuration system. To help explain how the Kado configuration works it might be worth taking a look at [object manage](https://www.npmjs.com/package/object-manage#usage) which will overview the technical details of how the Kado configuration system processes parameters.

In order to illustrate the configuration of Kado please consider the example below:

```js
const K = require('kado')
let viewFolder = __dirname + '/interface/main/view'
//application config
K.configure({
  db: {
    sequelize: {
      name: 'kadoweb',
      user: 'kadoweb',
      password: 'kadoweb'
    }
  },
  interface: {
    main: {
      staticRoot: [
        __dirname + '/interface/main/public'
      ],
      override: {
        view: {
          //blog views
          'blog/entry': viewFolder + '/blog/entry.html',
          'blog/list': viewFolder + '/blog/list.html'
        }
      }
    }
  }
})
//load config file called 'config.local.js' from the application folder
let localConfig = __dirname + '/config.local.js'
if(K.fs.existsSync(localConfig)) K.configure(require(localConfig))
//load config file named by an environment variable
if(process.env.KADO_CONFIG) K.configure(process.env.KADO_CONFIG)
//start kado
K.go('kado-web')
```

In the example above there is a lot going on, so I will break it down by section.

First, to understand how Kado configuration works, it is imperative to understand the configuration system cascades, meaning that there is a base schema which can be [viewed here](https://github.com/KadoOrg/kado/blob/master/helpers/kado.js#L106) after which the parameters are overridden continuously to arrive at a "run time configuration".

Second, our `app.js` contains a set of configuration overrides that are passed to Kado using the `K.configure()` function. This method accepts an `object` to define configuration parameters. Or it will also accept a string which represents a file name that contains a JavaScript object that will override the Kado configuration parameters.

Third, to load our private configuration details such as the actual database password and other system specific parameters the following code handles the task:

```js
//load config file called 'config.local.js' from the application folder
let localConfig = __dirname + '/config.local.js'
if(K.fs.existsSync(localConfig)) K.configure(require(localConfig))
```

This code will check to see if we have defined a `config.local.js` in our application folder and then attempt to load that file in order override the Kado configuration. An example `config.local.js` may look like this.

```js
module.exports = {db: {sequelize: {password: 'somethingnew'}}}
```

Finally, the code checks to see if there is an environmental configuration asked for. This is typically used to run multiple instances of Kado off of the same base code and having the instances use different resources, databases, etc.

```js
//load config file named by an environment variable
if(process.env.KADO_CONFIG) K.configure(process.env.KADO_CONFIG)
```

After checking for the existing of the `KADO_CONFIG` environment variable a call is made to `K.configure()` to process the environment variable and possibly load the configuration contained in the named file.

## Configuration Reference

Below is a sparse list of configuration variables contained within the Kado system.


| Path | Description | Default Value |
| --- | --- | --- |
| title | Title of the application | Kado |
| name | Name of the application (typically lower case) | kado |
| version | Version of Kado | DO NOT EDIT |
| log.dateFormat | Date format used when printing log messages | YYYY-MM-DD HH:mm:ss.SSS |
| db.sequelize.enabled | Turn sequelize on or off | true |
| db.sequelize.load | Load the sequelize connector | true |
| db.sequelize.name | The name of the database to use | kado |
| db.sequelize.host | The SQL server host | 127.0.0.1 |
| db.sequelize.user | The SQL server user |  |
| db.sequelize.password | The SQL server password |  |
| db.sequelize.logging | Function to log queries | false |
| db.sequelize.dialect | Dialect of the SQL server | mysql |
| interface.admin.enabled | Turn the Admin interface on or off | false |
| interface.admin.title | Title of the Admin interface | Kado Admin |
| interface.admin.transport | Protocol(s) the Admin interface uses | \['http'\] |
| interface.admin.path | Path to the Admin interface | DO NOT EDIT |
| interface.admin.port | Port for the Admin interface to listen on | 3000 |
| interface.admin.host | Host for the Admin interface to listen on | null |
| interface.admin.baseUrl | Base URL to Admin interface | http://localhost:3000 |
| interface.admin.viewCache | Enable use of the Mustache view cache | true |
| interface.admin.scriptServer | Additional web facing assets from these node_modules | \[\] |
| interface.admin.staticRoot | Additional folders to obtain web static assets from | \[\] |
| interface.admin.override.lang | Runtime language pack overrides | {} |
| interface.admin.override.nav | Runtime navigation overrides | {} |
| interface.admin.override.permission.allowed | Runtime permission allowances | {} |
| interface.admin.override.permission.available | Runtime permission available | \[\] |
| interface.admin.override.uri | Runtime URI overrdies | {} |
| interface.admin.override.view | Runtime View overrides | {} |
| interface.admin.workers.count | Number of worker processes to spawn | 1 | 
| interface.admin.workers.maxConnections | Number of connections to accept before restarting a worker process | 10000 |
| interface.admin.cookie.secret | Secret string used to generate cookie encryption | |
| interface.admin.cookie.maxAge | Max age of cookies in ms (default 30 days) | 2592000000 |
| cli.enabled | Enable the Kado CLI system | true | 
| cli.title. | Title of the CLI system | Kado CLI |
| cli.trasnport | Transports used by the CLI system | \['tty','system'\] |
| cli.path | Path to the CLI system | DO NOT EDIT |
| interface.main.enabled | Turn the Main interface on or off | false |
| interface.main.title | Title of the Main interface | Kado Admin |
| interface.main.transport | Protocol(s) the Main interface uses | \['http'\] |
| interface.main.path | Path to the Main interface | DO NOT EDIT |
| interface.main.port | Port for the Main interface to listen on | 3000 |
| interface.main.host | Host for the Main interface to listen on | null |
| interface.main.baseUrl | Base URL to Main interface | http://localhost:3000 |
| interface.main.viewCache | Enable use of the Mustache view cache | true |
| interface.main.scriptServer | Additional web facing assets from these node_modules | \[\] |
| interface.main.staticRoot | Additional folders to obtain web static assets from | \[\] |
| interface.main.override.lang | Runtime language pack overrides | {} |
| interface.main.override.nav | Runtime navigation overrides | {} |
| interface.main.override.permission.allowed | Runtime permission allowances | {} |
| interface.main.override.permission.available | Runtime permission available | \[\] |
| interface.main.override.uri | Runtime URI overrdies | {} |
| interface.main.override.view | Runtime View overrides | {} |
| interface.main.workers.count | Number of worker processes to spawn | 1 | 
| interface.main.workers.maxConnections | Number of connections to accept before restarting a worker process | 10000 |
| interface.main.cookie.secret | Secret string used to generate cookie encryption | |
| interface.main.cookie.maxAge | Max age of cookies in ms (default 30 days) | 2592000000 |
| interface.module.blog | Definition of blog module configuration | {} |
| interface.module.content | Definition of content module configuration | {} |
| interface.module.doc | Definition of documentation module configuration | {} |
| interface.module.kado | Definition of kado internal module configuration | {} |
| interface.module.setting | Definition of setting module configuration | {} |
| interface.module.staff | Definition of staff module configuration | {} |

## Configuration Design

One of the big challenges with a modular system is basically tackling the same challenges an operating system faces. Mostly with regards to how we share and use global resources.

Node.JS actually makes this possible. But it doesnt necessarily make it easy as there are still some broad scoping concerns and race conditions that need to be thought of.

Also important is how we load and execute modules.

So, the first and biggest challenge is the configuration. First thing is that we want to be able to obtain a copy of the configuration from any module.

Second, modules need to be able to add to the config.

Third, users need to be able to override the config through the admin interface.

The basic idea is to treat the config like an interface however it is integrated with the system slightly different than the rest of the interfaces.

Access of the configuration is provided through the `K.configure()` function provided by the main Kado object.

### Loading Order

Best to go over this early, the configuration is loaded and merged in the order below. It should be noted that any time you call the config through `require('kado').config` it will be fully overridden so keep that in mind when working with user overrides done from the panel.

* helpers/kado.js - Defaults and system wide config
* Module config - loaded from each module for defaults
* config.local.js - User overrides in the Kado root folder
* KADO_CONFIG - path to a config file using the KADO_CONFIG environment variable
* User overrides - obtained from the `settings.json` table

I understand that with node and many other apps configuration is half the battle to being able to work in multiple environments. This config loading order has been established over years of production work in a multitude of environments.

