### 3.5.0 (planned)

### 3.4.11 (staged)

### 3.4.10
* Typo fix in staff variable name in default admin footer.
* Added `process.env.KADO_USER_HELPERS` environment variable to point
at the project helper locations.
* Added `K.helper()` method to find and return helper locations.
* Update to Infant 1.2.2: Added signal handler to properly handle graceful shutdowns through nodemon.
This should prevent stuck processes during development.

### 3.4.9
* Fixes #261 CLI access on Module creation points to the wrong title/name
* Fixes #262 Parenthesis placed is wrong place on main route generation
* Fixes #263 Generator needs to handle null value correctly on default fields
* Fixes #236 Module generator should automatically fill name based on title
* Fixes #238 Use of deprecated sequelize method
* Fixes #278 Typo in multi enable on table.js

### 3.4.8
* Better defaults for module generation.
* Fixes #235 Update dependencies to avoid a security vulnerability in dependency.

### 3.4.7
* Adjust `robots.txt` on Main interface to allow robots.
* Allow override of `robots.txt` and other default assets by moving the
load order of staticOverrides above application assets.

### 3.4.6
* Adjust static caching to improve performance over the wire.

### 3.4.5
* Fix to remove headers that disable caching of resources.

### 3.4.4
* Remove unused environment variable `KADO_BIN` from `kado.js`
* Fix issue with `package.json` repository URL.

### 3.4.3
* Tell the user when no search results are found in a nice subtle way.
* Add dynamic `_pageTitle` to be used in `admin` and `main` interface.
* Provide `_pageTitle` from `blog`, `content`, `doc`, `staff` modules.
* Add TUI resources to main interface to display content.
* Add pageTitle configuration param to provide default `_pageTitle`.
* Add middleware to expose default `_pageTitle` when set.
* Use proper `error` view in all modules and interfaces.
* Include `base64-js` into the main `Kado` object to help make base64
handling consistent. Includes `base64-js` into the browser bundle as well.
* Update `blog`, `content`, and `doc` module to properly base64 encode
content to be edited.
* Change default `{{{_baseUrl}}}` to `''` in order to support more installs
by default.
* Use `{{{_baseUrl}}` when loading all assets.
* URI usages should always use `{{{_u.name}}}` to avoid escaping issues.
* Fix bug in `staff` module when deleting a staff member would fail to redirect.
* Use TUI Viewer on content display pages.
* Add missing indexes to date fields on models.

### 3.4.2
* URI population should happen during initial setupUri call and then overrides
happen during the `worker.beforeStart` hook.

### 3.4.1
* Add `worker.beforeStart()` hook which allows overrides to made after
modules have been scanned.

### 3.4.0
* Fix sidebar issue with items with spaces in the name
* Fix missing lang pack issue with module generator
* Fix module generator issue with list edit links
* Add scriptServer config variable to interfaces and support in interface load
* Use URI system to print URIs in templates and generator
* Add overrides system to help application configuration provide overrides for
  * Language
  * Navigation
  * Permission
  * URI
* Add config to add more folders to serve static assets for interfaces
* Update to latest dependencies including Mustache 3 and Debug 4
* Working overrides system
* Include fs module with the main Kado object.
* Change default port of main system to 3001 (which was previously API)
* Fix signaling issue causing problems with system shutdown which stemmed
from an issue with the `infant` package. In addition to the primary fix in
the upstream package  The Kado shutdown procedures have been improved.
* Fix an issue with environment variable propagation.
* Add Content module to manage static pages for Main. Allowing the following
content retrieval methods, the Content module will also provide a navigation system
for the Main interface:
  * TUI Editor to Providing Markdown -> HTML
  * RAW Input to the database
  * Local path to a HTML view file
  * Remote URL to HTML file (for mirroring pages, will use an iframe)

### 3.3.2
* Fix issues with module generation.
* Add more missing lang pack entries.

### 3.3.1
* Update license header.

### 3.3.0
* Prefer `kado_modules` folder to contain Kado modules.

### 3.2.0
* Move utility script to kado module so proper CLI look backs can happen.
* Improve module generation to be interactive, save and use config files
* Fix and test module generation to generate working code.
* Improve bootstrap script to have less options and generate with simplicity
* Expose utility cli through module globally for system usage

### 3.1.1
* Login referrer now filters possible static files as a setup.

### 3.1.0
* Minor fix to CLI suite, moves kado commands into setting module

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
* Release under Lesser GNU Public Licenses 3.0

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
