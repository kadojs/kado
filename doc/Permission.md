# Permission
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Permission = require('kado/lib/Permission')
```
This library provides permission validation against sets that can be loaded at
run time. URIs are used to test against.

When a permission set has no restrictions defined it will be allowed all
permissions. Thus, its a common practice to always have a permission set defined
when created a new permission user.

## Class: Permission

### static Permission.getInstance()
* Return {Permission} new instance of the permission system

### Permission.constructor()
* Return {Permission} new instance of the permission system

### Permission.add(name, description)
* `name` {string} name of the permission, usually a URI
* `description` {string} description of the permission used for listing
available permissions.
* Return {object} the object added to the permission set.

### Permission.remove(name)
* `name` {string} name of the permission to remove
* Return {boolean} `true` when the permission exists and is deleted
and `false` when no permission was found or deleted.

### Permission.get(name)
* `name` {string} name of the permission to get
* Return {object} of the permission when exists, or `false` when no permission
is found.

### Permission.exists(name)
* `name` {string} name of the permission to check existence of
* Return {boolean} `true` when the permission exists `false` otherwise

### Permission.allowed(name, set)
* `name` {string} name of the permission to check for
* `set` {object} permission set to check against
* Return {boolean} `true` when the permission is allowed against the set and
`false` otherwise.

### Permission.digest()
* Return {Array} of permission names available

### Permission.all()
* Return {Array} of permission objects registered in the system
