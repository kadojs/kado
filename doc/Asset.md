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

Example:
```js
const asset = Asset.getInstance()
// Add some assets
asset.addCss('/css/style.css')
asset.addScript('/js/main.js')

// Get all assets
const allAssets = asset.get()
// Get only CSS assets
const cssAssets = asset.get('text/css')
// Get only JavaScript assets
const jsAssets = asset.get('text/javascript')
```

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

Example:
```js
const asset = Asset.getInstance()
// Add a regular asset
asset.add('/css/style.css', 'text/css')
// Add a deferred script
asset.add('/js/main.js', 'text/javascript', true)
// Add with defer object
asset.add('/js/analytics.js', 'text/javascript', { defer: true })
```

### Asset.addCss(uri)
* `uri` {string} URI of the CSS file to locate via HTTP
* Return {string} `uri` passed for addition

Uses the `Asset.add()` method and automatically sets mime type

Example:
```js
const asset = Asset.getInstance()
asset.addCss('/css/bootstrap.css')
asset.addCss('/css/custom.css')
```

### Asset.addScript(uri,defer)
* `uri` {string} URI of the JavaScript file to locate via HTTP
* Return {string} `uri` passed for addition

Uses the `Asset.add()` method and automatically sets the mime type while passing
 the `defer` argument.

Example:
```js
const asset = Asset.getInstance()
// Add script without defer
asset.addScript('/js/jquery.js')
// Add script with defer
asset.addScript('/js/app.js', true)
```

### Asset.addOnce(uri,mimeType,defer)
* `uri` {string} URI of asset to be located via HTTP
* `mimeType` {string} mime type of the new asset such as `text/plain`
* `defer` {boolean:true|object} when `true` will defer the asset loading,
  while an {object} will look for `{ defer: true }`
* Return {string} `uri` passed for addition

Example:
```js
const asset = Asset.getInstance()
// Add asset for one-time use
asset.addOnce('/css/page-specific.css', 'text/css')
// Add deferred script for one-time use
asset.addOnce('/js/page-specific.js', 'text/javascript', true)
```

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

Example:
```js
const asset = Asset.getInstance()
// Add regular and one-time assets
asset.add('/css/global.css', 'text/css')
asset.addOnce('/css/special.css', 'text/css')

// Get all CSS assets and clear one-time assets
const allCssAssets = asset.all('text/css', true)
// Get all assets without clearing one-time assets
const allAssets = asset.all()
```
