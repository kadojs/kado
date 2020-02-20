# Reference
> NOTICE: Kado 3 is **DEPRECATED**, see https://kado.org for the latest version.

The primary Kado object comes with a wealth of resources to be used throughout
your system without the need to grab extra dependencies.

## Environment Variables

Kado uses a few environment variables to sync all the processes.

| Name | Description |
| --- | --- |
| KADO_ROOT | The folder where the actual Kado npm module is located. |
| KADO_HELPER | Folder containing the helpers for Kado. |
| KADO_INTERFACES | Folder containing Kado interfaces. |
| KADO_LANG | Folder containing Kado language packs. |
| KADO_MODULES | Folder containing Kado modules. |
| KADO_USER_MODULES | Folder pointing to userspace Kado modules. |
| KADO_USER_LANG | Folder pointing to userspace language pack overrides. |

## Resources

The below table assumes you have done `const K = require('kado')`

| Name | Description |
| --- | --- |
| iface | Interface helper |
| base64js | base64-js NPM module |
| b64 | Alias to base64-js |
| bluebird | Bluedbird Promises |
| infant | Infant process manager |
| isClientJSON | Check if a requesting client is using JSON |
| lifecycle | Infant lifecycle helper |
| datatable | sequelize-datatable NPM module |
| modelRemoveById | Remove rows from a Model `(Model,items)=>{}` where items is an array of row id's |
| ObjectManage | object-manage NPM module |
| Permission | Kado Permission helper |
| URI | Kado URI helper |
| View | Kado View helper |
| fs | Node.js fs module |
| config | Compiled config object |
| root | Function to return the application root |
| dir | Function to return the kado root |
| path | Function to return a path within the kado root |
| tailFile | Function to tail the contents of a file similar to `tail -f` in Linux |
| appendFile | Function to append data to a file `(path,data)=>{}` |
| printDate | Print a date using the Kado standardized date format |
| execSync | Function to execute a command and return the output without a callback (sync) |
| modulePath | Function to return the path to Kado modules |
| db | Object containing Database connectors |
| interfaces | Object containing configured interfaces |
| modules | Object containing the modules loaded by Kado |
| lang | Kado language pack helper |
| search | Kado search system |
| log | Kado logging system implements Winston logging eg: `K.log.info('something neat')` |
| initComplete | `(bool)` denouncing whether the system has been initialized |
| init | Function to initialize Kado |
| cli | CLI loader for modules |
| start | Start Kado |
| stop | Stop Kado |
| go | Rapidly start Kado `(name)=>{}` where name is the application name or `_appName` |
