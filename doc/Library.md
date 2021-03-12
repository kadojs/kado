# Library
*Introduced in 3.0.0 as Helper*

*Renamed to Library in 4.0.0*
>Stability: 2 - Stable
```js
const Library = require('kado/lib/Library')
```
This is searching library the helps locate other libraries in various system
paths. Essentially, this is an extension of the `require()` system provided
internally by Node.js and provides a layer of abstraction so that any underlying
module loader may be used.

Example Usage:
```js
const app = require('kado').getInstance()
const Foo = app.lib('foo')
const Bar = app.lib('bar')
const BarFile = app.lib.resolve('bar')
const Bar2 = require(BarFile)
```

## Class: Library

### static Library.getInstance()
* Return {Library} new library searching system

### Library.constructor()
* Return {Library} new library searching system

### Library.nextKey(obj)
* `obj` {object} to find the next key of
* Return {number} next numeric key to use in an object

### Library.addPath(path)
* `path` {string} path to search for libraries at
* Return {string} new path added to the system

### Library.existsPath(path)
* `path` {string} path to check for existence
* Return {boolean} `true` when the path has been registered

### Library.add(name, file)
* `name` {string} name of a library to add such as a package name
* `file` {string} path to the entry point of the library
Return {string} the newly added library file

### Library.exists(name)
* `name` {string} name of the library to check existence of
* Return {boolean} `true` when the library exists

### Library.remove(name)
* `name` {string} name of the library to remove
* Return {string} name of the library removed

### Library.search(name)
* `name` {string} name of the library to search for
* Return {string} path to the library if found.

Throws an error if no library is found.
