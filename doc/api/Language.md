# Language
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Language = require('kado/lib/Language')
```
This library is the primary point of localization within the Kado system and
serves a dual purpose of compiling and accessing language packs as well as
providing internationalization helpers.

## Class: Language

### static Language.hasFulIntl()
* Return {boolean} `true` when JavaScript instance has Full ICU support

### static Language.getInstance()
* Return {Language} new instance of language system

### Language.constructor()
* Return {Language} new instance of language system

### Language.getSupportedSC()
* Return {array} of supported SC codes by this language system.

### Language.getPack(locale, override)
* `locale` {string} SC code of the pack to load
* `override` {object} Extra language pack overrides at call time
Return {object} compiled language pack for use

### Language.addPack(name, content)
* `name` {string} name of the new language pack which should be an SC code
* `pack` {object} the base language pack object
Return {string} name of the newly added pack

### Language.addModule(name, module, content)
* `name` {string} key name of the pack to add a module to
* `module` {string} name of the module to add
* `content` {object} module language pack contents.
Return {string} name of the module added

### Language.loadModule(name, module, pack)
* `name` {string} key name of the pack
* `module` {string} key name of the module to load more content into
* `content` {object} language pack to be loaded into module

### Language.removeModule(name, module)
* `name` {string} key name of the language pack
* `module` {string} key name of the module to remove.
* Return {string} name of the module removed.

### Language.removePack(name)
* `name` {string} key name of the pack
* Return {string} name of the pack removed

### Language.all()
* Return {object} all stored language packs
