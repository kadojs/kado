# Asset
*Introduced in 4.0.0*
> Stability: 2 - Stable

The `Assert` library manages static assets such as JavaScript, CSS, HTML, Images and more.
With methods to filter these assets for one time and global use.

```js
const { Asset } = require('kado')
```

## Class Asset

### static Asset.getInstance()
* Return {Asset} a new instance of the Asset library.

### Asset.constructor()
Construct a new instance of the Assert library.

### Asset.get(mimeType)
* `mimeType` {string} Optional mime type to filter assets by.
* Return {Array} set of assets matching filter

Note these assets are registered for all queries and persist until removal.

### Asset.getOnce(mimeType)
* `mimeType` {string} Optional mime type filter
* Return {Array} set of assets matching filter

Note these assets only exist until `all()` is called with `clearOnce` set to `true`

### Asset.exists(uri)
* `uri` {string} Check if an asset exists by URI
* Return {boolean} `true` when URI is found otherwise `false`

### Asset.existsOnce(uri)
* `uri` {string} Check if an asset is registered for one time use by URI.
* Return {boolean} `true` when URI is found set for once otherwise `false`

### Asset.nextKey(obj)
* `obj` {object} source object to generate next key for
* Return {number} the next key to use for a new object member

### Asset.add(uri,mimeType,defer)
* `uri` {string} URI to locate the asset via HTTP
* `mimeType` {string} Mime type of the new asset
* `defer` {boolean:true|object} when `true` will defer the asset loading,
  while an {object} will look for `{ defer: true }`
* Return {string} `uri` passed for addition

### Asset.addCss(uri)
* `uri` {string} URI of the CSS file to locate via HTTP
* Return {string} `uri` passed for addition

Uses the `Asset.add()` method and automatically sets mime type

### Asset.addScript(uri,defer)
* `uri` {string} URI of the JavaScript file to locate via HTTP
* Return {string} `uri` passed for addition

Uses the `Asset.add()` method and automatically sets the mime type while passing
 the `defer` argument.

### Asset.addOnce(uri,mimeType,defer)
* `uri` {string} URI of asset to be located via HTTP
* `mimeType` {string} mime type of the new asset such as `text/plain`
* `defer` {boolean:true|object} when `true` will defer the asset loading,
  while an {object} will look for `{ defer: true }`
* Return {string} `uri` passed for addition

### Asset.addCssOnce(uri)
* `uri` {string} URI of the CSS file to locate via HTTP
* Return {string} `uri` passed for addition

Uses the `Asset.addOnce()` method and automatically sets mime type

### Asset.addScriptOnce(uri,defer)
* `uri` {string} URI of the JavaScript file to locate via HTTP
* Return {string} `uri` passed for addition

Uses the `Asset.addOnce()` method and automatically sets the mime type while passing
 the `defer` argument.

### Asset.remove(uri)
* `uri` {string} URI of asset to remove
* Return {object} record of the asset removed or `null`

### Asset.removeOnce(uri)
* `uri` {string} URI of the asset to remove from once register
* Return {object} record of the asset removed or `null`

### Asset.all(mimeType,clearOnce)
* `mimeType` {string} Filter the all request by mime type
* `clearOnce` {boolean} When `true` will clear the once registry upon return
* Return {Array} set of assets to be displayed.
