# Changelog

### 4.3.0
*Released 2/23/21*
* Fix bug in Format.cookie() [!277](https://git.nullivex.com/kado/kado/-/merge_requests/277)
* Use +00:00 for SQL timezone [!288](https://git.nullivex.com/kado/kado/-/merge_requests/288)
* Raise cluster default timeouts [!284](https://git.nullivex.com/kado/kado/-/merge_requests/284)
* Fix URI Decoding [!283](https://git.nullivex.com/kado/kado/-/merge_requests/283)
* Parameters are now sent through JSON first [!282](https://git.nullivex.com/kado/kado/-/merge_requests/282)
* Improved query string handling [!274](https://git.nullivex.com/kado/kado/-/merge_requests/274)
* Add BigInteger library [!271](https://git.nullivex.com/kado/kado/-/merge_requests/271)
* Add PromiseMore library [!264](https://git.nullivex.com/kado/kado/-/merge_requests/264)
* Add LogRelay via UDP [!261](https://git.nullivex.com/kado/kado/-/merge_requests/261)
* Add logging support [!253](https://git.nullivex.com/kado/kado/-/merge_requests/253)
* Continuously build Kado against Node 10, 12, 14 [!289](https://git.nullivex.com/kado/kado/-/merge_requests/289)
* Fix static file handling with query args [!275](https://git.nullivex.com/kado/kado/-/merge_requests/275)
* Add Cookie Builder [!276](https://git.nullivex.com/kado/kado/-/merge_requests/276)
* Add HTTP request logger [!256](https://git.nullivex.com/kado/kado/-/merge_requests/256)
* Add Mutlipart processing [!244](https://git.nullivex.com/kado/kado/-/merge_requests/244)
* Add foreign key support to schema [!222](https://git.nullivex.com/kado/kado/-/merge_requests/222)
* Various other improvements and fixes see [%v4.3.0](https://git.nullivex.com/kado/kado/-/milestones/5#tab-merge-requests)

### 4.2.1
*Released 5/7/20*
* Add MariaDB support.
* Add notify support for showing notifications to end users, such as a save
being successful. This is done with `req.notify('some message')` which defaults
to a level of `ok` or success, if there is an error
`req.notify(new Error('some Error'))` sending an error object will automatically
set a level of 'error' or failure. Lastly, custom levels support is done through
class names such as:
```js
class MyWarning extends Error {}
req.notify(new MyWarning('something is broken'))
```
NOTE: Sessions must be enabled for notifications to be saved.
In order to show notifications they are made available through the
`req.locals._session._notify` variable. Here is a template example:
```html
{{#_notify}}<div class="notify notify-{{level}">{{message}}</div>{{/_notify}}
```
* Add more core `FS` modules into the `FileSystem` library to add more
convenience.
* Various fixes to documentation.

### 4.2.0
*Released 4/15/20*
* Add new Model.js for creating and working with Database records.
* Add new Mustache.js for string templating.
* Add new MySQL database engine.
* Add new Query.js for building queries for databases.
* Add new QueryCache.js for caching queries from a database in a database.
* Add new Schema.js for building tables for databases.
* Validate.isType upgraded to be more consistent and predictable.
* Parser adds `requestBody` parser to assist with input decoding.
* Router adds `res.json()` for JSON output.
* Router adds `res.redirect()` for location changes.
* Router adds `res.sendFile()` for sending files.
* Session adds `SessionStoreSQL` for SQL backed sessions from databases.
* Cluster adds `dev` mode and `disableMaster` to help with running in single
process mode.
* Cluster now automatically establishes worker counts unless told otherwise.
* Commands can now return undefined as a valid exit value
* Fix to only setup cluster master when available.
* Fix to app startup when commands are present.
* HyperTextServer now accepts an array of hosts to listen on.
* Cluster no longer recycles workers from reaching a maxConnection ceiling by
default.
* Fix to properly close database connections on stop.
* Add `HyperText.Proxy` to HyperText.js which provides an HTTP reverse proxy.
* Make the testing of extended types more robust, to ensure extension of a
proper parent.
* Fix the promise chain when starting and stopping connect systems from
Application.

### 4.1.0
*Released 3/9/2020*
* Add new Mime.js library for looking up file types from extensions.
* Add new ETag.js library for generating ETag headers for cache protection.
* Implement the Mime.js in the included HyperText static server.
* Implement the ETag.js in the included HyperText server.
* Multiple fixes and changes to the documents.
* Add new methods to the Parser library.

### 4.0.1
*Released 2/20/2020*
* Fix the PathExp system to properly handle matching against multiple inputs.

### 4.0.0
*Released 2/20/2020*
* BREAKING CHANGES, not compatible with Kado 3.x out of the box, see
https://kado.org/content/upgrading-4.x for more.
* No interfaces a provided by default.
* No frameworks are provided by default.
* Interface startup is now handled in user space.
* Redesign startup API this means exposing more of the interface start process
 into user space so that the application itself can define routes etc from the
 ground up, drop the default modules and move them into a kado-ui pack that
 comes with an admin panel and simple content management and blog publishing.
 This should help drop the weight of the core down but more importantly give
 Kado the true building block feel it should have came with all along. This
 will also allow Kado to come with even less packages and continue to provide
 the same consistent working environment. So what does this mean?
 * Expose interface startup through a kado.js file in the application the same
 way modules are handled.
 * Remove the default modules other than the kado module. This will remove
 the addons that must be built and make installation more global along with
 giving the user more choices over how to build the application.
 * Continue to abstract from actually being a web engine and focus on being a
 programming organization engine. We didnt quite know or understand this at the
 beginning, however Kado is more about organizing code.
 * Write upgrade documentation on conversion from Kado 3.x to Kado 4.x which
 will mostly involve adding to a kado.js within the application to restore
 default routing functionality.
 * No longer start two interfaces by default, move to a single interface model.
 Using two interfaces just served to complicate all matters, using a single
 interface with enhanced routing makes the most sense. In instances where the
 panels need to be split in however many places this can be done by simply,
 starting multiple instances and using webserver rules to deny or allow urls.

### 3.10.6
*Released 2/12/2020*
* This is the more than likely the last release before Kado 4.0 is released.
* A warning is due now that Kado 4 will be complete incompatible with Kado 3 as
Kado 4.0 fully realizes ES6. For the future, Kado 3 will continue to be
maintained within the same repository as Kado 4 in a separate branch. However
due to limitations on NPM, Kado 3 versions will be released as the kado-legacy
package.
* A further warning that Kado 4 will be changing from an MIT license to Lesser
GPL Version 3+ please plan accordingly!
* Update and test against latest dependencies
   * bcrypt                      ^3.0.7  →   ^3.0.8
   * commander                   ^4.1.0  →   ^4.1.1
   * connect-session-sequelize   ^6.0.0  →   ^6.1.1
   * flag-icon-css               ^3.4.5  →   ^3.4.6
   * highlight.js               ^9.18.0  →  ^9.18.1
   * pdfmake                    ^0.1.63  →  ^0.1.64
   * request                    ^2.88.0  →  ^2.88.2
   * rimraf                      ^3.0.1  →   ^3.0.2
   * sequelize                  ^5.21.3  →  ^5.21.4
   * webpack                    ^4.41.5  →  ^4.41.6

### 3.10.5
*Released 1/30/2020*
* Update to latest dependencies
   * codemirror             ^5.50.2  →  ^5.51.0
   * cron                    ^1.7.2  →   ^1.8.2
   * highlight.js           ^9.17.1  →  ^9.18.0
   * mocha                   ^7.0.0  →   ^7.0.1
   * mustache                ^3.2.1  →   ^4.0.0
   * popper.js              ^1.16.0  →  ^1.16.1
   * rimraf                  ^3.0.0  →   ^3.0.1
   * terser-webpack-plugin   ^2.3.1  →   ^2.3.4
   * validator              ^12.1.0  →  ^12.2.0


### 3.10.4
*Released 1/5/2020*
* Update to solve security warnings
   * codemirror             ^5.49.2  →  ^5.50.2
   * commander               ^4.0.1  →   ^4.1.0
   * highlight.js           ^9.16.2  →  ^9.17.1
   * mocha                   ^6.2.2  →   ^7.0.0
   * mustache                ^3.1.0  →   ^3.2.1
   * mysql2                  ^2.0.2  →   ^2.1.0
   * nodemon                 ^2.0.1  →   ^2.0.2
   * pdfmake                ^0.1.62  →  ^0.1.63
   * sequelize              ^5.21.2  →  ^5.21.3
   * terser-webpack-plugin   ^2.2.2  →   ^2.3.1
   * tui-editor              ^1.4.9  →  ^1.4.10
   * webpack                ^4.41.2  →  ^4.41.5


### 3.10.3
*Released 12/8/2019*
* Update to solve security vulnerabilities
   * bluebird               ^3.7.1  →  ^3.7.2
   * bootstrap              ^4.3.1  →  ^4.4.1
   * mysql2                 ^2.0.1  →  ^2.0.2
   * terser-webpack-plugin  ^2.2.1  →  ^2.2.2
   * tui-editor             ^1.4.8  →  ^1.4.9

More information here: https://github.com/KadoOrg/kado/network/alert/package-lock.json/serialize-javascript/open

### 3.10.2
*Released 12/1/2019*
* Update to latest dependencies
  * bluebird   ^3.7.1  →  ^3.7.2
  * bootstrap  ^4.3.1  →  ^4.4.1

### 3.10.1
*Released 11/23/2019*
* Update to latest dependencies
  * bcrypt       ^3.0.6  →   ^3.0.7
  * commander    ^4.0.0  →   ^4.0.1
  * mysql2       ^2.0.0  →   ^2.0.1
  * nodemon     ^1.19.4  →   ^2.0.1
  * qs           ^6.9.0  →   ^6.9.1
  * tui-editor   ^1.4.7  →   ^1.4.8
  * validator   ^12.0.0  →  ^12.1.0

### 3.10.0
*Released 11/12/2019*
* Add new interface configuration option `homeRouteFile` when specified this
file will be loaded in a method like `exports.home = (req,res)=>{}` where.
This allows custom definition of homepage files, when this route does not
exist, the system will load the canned homepage routes and views.

### 3.9.6
*Released 11/10/2019*
* Update to the latest dependencies and change help handling on CLI scripts
for modules and generation template.

### 3.9.5
*Released 10/12/2019*
* The environment variable `BUNDLE` can now be set to `false` to disable
the auto bundling system when in development mode.

### 3.9.4
*Released 10/12/2019*
* Fix two small bugs in the Asset management system.

### 3.9.3
*Released 10/11/2019*
* Change the default content module to include the _pageTitle on static
definitions, to match the behavior of content from the database.
* Update to latest dependencies.

### 3.9.2
*Released 9/26/2019*
* `node app kado dbreload` no longer utilizes the system level mysqldump
and has internal tools to backup, dump and apply the dump to the database.
This ensures the tool works on all platforms.

### 3.9.1
*Released 9/25/2019*
* Adds new utility command `node app kado dbreload` this is a macro
command that will dump the data from your current database and then
back it up. Afterwards it will perform a forced sequelize sync and finally
re-apply the dumped data. This is useful for database changes when products
are pre-release and the data set is not a priority. For production instances
using sequelize migrations is highly recommended.

### 3.9.0
*Released 9/25/2019*
* Content system now reads configuration for static content object
which contains {'uri': {templateFile: 'foo.html'}}. This allows
applications to have static content, for terms of service, policy pages,
etc. It also allows these pages to exist outside of the database, if they
are intended to come with the project at the beginning this makes much
more sense.
* Update to latest dependencies.

### 3.8.6
*Released 8/17/2019*
* Add Select All and Deselect All buttons to table buttons
* Update to latest dependencies.

### 3.8.5
*Released 7/18/2019*
* Update to latest dependencies.

### 3.8.4
*Released 7/3/2019*
* Update to latest dependencies.
* Use `nullivex/sequelize-datatable` to use latest packages.
* Clear all known security advisories.

### 3.8.3
*Released 5/23/2019*
* Added dates to the Changelog.
* Merge PR #6 to update default icons in admin.
* Merge PR #5 Change generated modules to use addScriptOnce properly.
* Removed accidental dependency on bootbox and clear security alerts.
* Update to latest dependencies.

### 3.8.2
*Released 4/19/2019*
* Auto bundling moved to after the interfaces have been started.
* Dev activation now fully forces Kado dev mode on when using the CLI parameter.

### 3.8.1
*Released 4/18/2019*
* Fix path selection for bundling in app context.

### 3.8.0
*Released 4/18/2019*
* More refined local entry points.
* Refinement of Webpack integration to solve dependency restrictions and find
a balance of loading and splitting. The system now creates:
  * main.js - Global elements loaded in the head tag, keep this small.
  * bundle.js - Loaded at the end of the page containing additional deps.
  * deferred.js - Loaded deferred after the bundle, extraneous dep free code.

Routes that need one off scripts will load them deferred, conditional modules
need to be loaded sync and then the enumerating scripts shall be deferred. This
removes the idea of required, extra, module, moduleExtra, local, localExtra and
compresses the build chains. Webpack is compressed into a single config chain
per interface. The bundle system now handles configuring and running Webpack.
Finally, Kado now supports applications overriding the Webpack configuration
in order to make the build chain fully customizable.

### 3.7.15
*Released 4/18/2019*
* Adjust webpack to expose jquery globally. This is temporary as the build
chain is refined. There will be a major build system overhaul in 3.8 to address
the complexity of the build chains and webpack configuration files.

### 3.7.14
*Released 4/18/2019*
* Hot fix: build chain should not use production method unless asked.

### 3.7.13
*Released 4/18/2019*
* Automatically sets environment variables using `dotenv` package, and using
`node app dev` will set `DEV=kado` automatically.
* When in dev mode Kado will now automatically bundle the local and module
chains using `node app kado bundle -l -m`
* Moves init logging into the `debug` package under `kado*`

### 3.7.12
*Released 4/18/2019*
* Change bundle system to allow multiple chains at the same time such as
`node app kado bundle -l -s -m` which is equivalent of `node app kado bundle`
* Latest dependencies.

### 3.7.11
*Released 4/15/2019*
* Fix npm complaint about `acorn` module (for some reason 
`acorn-dynamic-import@4.0.0` did not properly pull it as a dep?)
* Fix npm trying to update `babel-loader` too far (v8.x.x does not work, but
apparently satisfies `babel-loader@^7.1.5`)

### 3.7.10
*Released 4/13/2019*
* Fix issue with `addScriptOnce` and `addCssOnce` where the resources display on
the next page load.
* Correct modules to use the `addScriptOnce` methods.

### 3.7.9
*Released 4/12/2019*
* Use development mode for building by default and require either
`NODE_ENV=production` or `node app kado bundle --production` to enable complete
builds.
* Disable view cache when in development mode.
* No longer restart on .html changes with nodemon.
* There is now `npm run build` for production and `npm run bundle` as well as
`npm run postinstall` to handle development building.

### 3.7.8
*Released 4/12/2019*
* Bug fix to windows paths generated during build process.

### 3.7.7
*Released 4/11/2019*
* Fix local build suites to output to the system entry folder.
* `local.js` and `localExtra.js` were not using the properly build module list.
* Break build into system, module local chains with sync and extra packs.
* Add ability to filter bundling by -s for system or -m for module.
* Enable source maps in bundles by default.
* Add `-q` to do quick builds of local only and then `-N` to skip building
source maps. See `node app kado bundle --help` for more information.

### 3.7.6
*Released 4/11/2019*
* Adding assets on page routes did not clear on render. The Asset system now has
`addCssOnce` and `addScriptOnce` these methods are cleared with each call to the
asset `allCss` and `allScript` methods.
* Adds Dynamic Connector support. The `connector` folder can now contain generic
connectors that are scanned and connected at init time.
* All connector support: dynamic, email, db are now scanned for in their
respective user space folders. Such as `projectroot/db/mongodb.js` etc.
* Includes the **StretchFS** connector as the first of the dynamic connectors.
* Changes the outlook on build chains. `Extra` chains are now meant to deferred
while maintaining the levels. Such as `local` and `module` now have
`localExtra` and `moduleExtra` these help facilitate loading extra needed
dependencies in each portion of the chain and helping to avoid duplicates.
* Moves `moment` into the required build chain to support various needs.
* Add `removeScript` and `removeCss` parameters to allow removal of system
level components in lieu of custom components or a lighter stack.

### 3.7.5
*Released 4/10/2019*
* Move bootstrap into required build chain.

### 3.7.4
*Released 4/10/2019*
* Disable performance hints by default when building, however allow them to be
enabled by passing `node app kado bundle --hints` which will complain about
large JS files and other performance issues.

### 3.7.3
*Released 4/9/2019*
* Bug fix to required bundle process now assigns jquery to
window.$, window.jQuery and window.jquery

### 3.7.2
*Released 4/9/2019*
* Add the parameters `addCss: [{}], addScript: [{}]` to each interface
declaration in order to add additional resources directly from the app config.
Each object requires the key `uri` such as `{uri: '/a.css'}` or
`addScript: [{uri: '/new.js', defer: false}]` which loads a new JS resource
synchronously (all default adds are deferred).

### 3.7.1
*Released 4/9/2019*
* Bug fixes to bundle root handling.
* Use proper app suite on post install generation.
* Start using Git tags and Github releases.
* Drop unused dependencies.
* Use parallel tersing for bundle speedups.

### 3.7.0
*Released 4/6/2019*
* Distribute Kado under the MIT license!
* Start using webpack as build system for front end.
* Split key asset groups into loading packs for accelerated and circumstantial
page loading.
* Add asset system to dynamically register and use assets from the route files.
This works with both CSS and Script tags.
* Add `KADO_USER_ROOT` process environment variable to assume user root when
available.
* Insert samples command is now `node app kado insert-samples`
* Added new utility commend `node app kado scan-modules` returns a line
delimited list of modules currently registered to the system.
* Scan modules for asset folders and include assets into build.
* Includes easy to use user space build setup. Add entry points into the app
declaration and run `node app kado bundle` or `node app kado bundle -i admin`
local building is done through the -l flag such as `node app kado bundle -l` or
combined `node app kado bundle -i admin -l` to build locally only for admin.

### 3.6.30
*Released 4/1/2019*
* Fix bug with loading static assets from modules.
* Add testing to static asset loading from modules.
* Remove Chart.js from front end bundle and from Kado, it should be added in
user space.
* Remove rmdir-promise package replace with upgraded rmdir2 package.

### 3.6.29
*Released 3/29/2019*
* Fix module static servers, the default path was incorrect and missing the
interface name.
* Fix module generation to use the proper deferred javascript upgrades.

### 3.6.28
*Released 3/28/2019*
* Fix bug in event casting in regards to level translation.
* Update dependencies.
* Fix displaying of TUI Editor in Admin interface.
* Add `K.cron` helper which is backed by `node-cron`, any modules utilizing
cron jobs should add them through `exports.cron = (K,cron)=>{}` in the module 
`kado.js`

### 3.6.27
*Released 3/26/2019*
* Small fixes to Event, Email and Messaging.

### 3.6.26
*Released 3/13/2019*
* Allow jQuery to be loaded directly.

### 3.6.25
*Released 3/13/2019*
* Serve jQuery initially and then the bundle as a deferred resource. This will
greatly reduce the time to load on mobile and desktop and allow the JS to fill
in as the user browses. This also applies to the admin panel.

### 3.6.24
*Released 3/13/2019*
* Fix deprecated references to the `.find()` method from sequelize in the doc
module.
* Fix Sequelize Operator changes in version 5.
* Add `loadTuiViewer.js` to allow deferred content loading.
* Print the actual page content inside of a `noscript` tag allowing
search engines to parse page content regardless of markup loading.

### 3.6.23
*Released 3/13/2019*
* Move front end Javascript to footer and defer all inline script entries. This
change greatly improves page load times especially on mobile.
* Update to sequelize 5.
* Move All JS loading to the footer, use defer on list and inline definitions

### 3.6.22
*Released 3/13/2019*
* Fix return values from mail and message system.
* Fix return values for event system.

### 3.6.21
*Released 3/12/2019*
* Fixes to the email system.
* Update dependencies

### 3.6.20
*Released 3/2/2019*
* Update dependencies to fix security vulnerabilities through dependencies.
* Patch to table.js that affects listing of multiple tables on one page.
* Replace incorrect usages for `.forEach` with `.map`.

### 3.6.19
*Released 2/23/2019*
* Add Message support that allows modules to register as message handlers.
* Add Event system that tracks system activity and notifies via email on
configured levels.
* Fix to table.js to properly handle multiple table instances.
* Introduce `Uri.p(name,uri)` pass through method to supersede `Uri.add|get` 
also `Uri.get` will now throw an error when trying to reach an undefined uri
instead of returning '/'
* Fix #269 allowing modules to add their own static roots now. The system now
looks for `module/public` folder or a `_kado.staticRoot` config inside the
module definition.
* Fix #273 Generator adds active save handler regardless of generation selection
* Fix #234 Admin Staff List Title is undefined
* Fix #264 Improve generator CLI to add redos and options, default value no
longer added when omitted.
* `K` now provides a `sendMail` function that looks at registered email
connectors and will attempt to use them.
* NOTE: The Contact, Event, Message management modules will be included at a
later date. This release only includes the primitives needed to build the
modules on.

### 3.6.18
*Released 2/22/2019*
* Add environment config loaded to be done at scanModules and init time to make
it more comprehensive.
* Fix bug in new test runners that were not checking proper variable type of the
test functions.

### 3.6.17
*Released 2/22/2019*
* Add test hooks that can be loaded through a config option `K.config.test` this
allows the application so specify global tests for each interface and then
finally global tests against the application. This completes the testing harness
to support modular and project level testing while continuing to support the
enormously dynamic structure of Kado.

### 3.6.16
*Released 2/20/2019*
* Document module requires a project to be created before allowing creation of a
document.
* Update dependencies.

### 3.6.15
*Released 2/17/2019*
* Fix issue where DB connectors would not be connected to even when enabled.

### 3.6.14
*Released 2/17/2019*
* Fix issue where `modelInit` needs to be passed as a path to the init file
which is then required to avoid dynamic scoping issues.

### 3.6.13
*Released 2/17/2019*
* Fix issue where `modelInit` is not called during `node app kado dbsetup` the
model init call has been moved into the connector for implementation.

### 3.6.12
*Released 2/15/2019*
* Add `modelInit` parameter to db connectors to allow custom initialization of
models after module scan. This makes it easier to work with more complex data
structures.

### 3.6.11
*Released 2/13/2019*
* Fix generator to properly name generated test file.
* The options object on each `db` connector now passes those additional options
into the connector and overrides the Kado defaults.

### 3.6.10
*Released 2/6/2019*
* Small fix to doImport handler to return instance on duplicate hit.

### 3.6.9
*Released 2/6/2019*
* Add `sequelize.doImport(modelName,modeFile)` helps track registered models and
prevent duplicates.
* Add `sequelize._relate` helper which will quickly yield settings for Model
relationships with the following methods: 
`cascade(), setNull(), noAction(),custom()`
* Sequelize is now enabled by default since all core modules and sessions use it.
* The DB call now comes with the sequelize instance as the third parameter.
* Add ability to use `node app kado dbsetup --force` which will alter schemas
and distort data automatically. Use for development ONLY.

### 3.6.8
*Released 2/6/2019*
* Fix to Breadcrumb, no longer tracks POST or SVG requests, fixes bug with
filtering.

### 3.6.7
*Released 2/6/2019*
* Remove debug log message from generator.
* Dont save POST requests to history
* Add Module Title to middleware at the top of the interface definition
* Fix unregistered doc module project create URI.

### 3.6.6
*Released 1/31/2019*
* Fix to language switching system to be ordered after session startup.
* Add `nocache` package to aid with not having session bound pages cached.
* When `worker.enableSession()` is called this now turns on `app.use(nocache())`
* Remove body display modifications from `search.css` to be more compatible.

### 3.6.5
*Released 1/30/2019*
* Allow lookups into kado by default in the admin and main interfaces.
* Search system now handles errors for modules individually and overall page
errors.

### 3.6.4
*Released 1/30/2019*
* Fix issue where an undefined return to the test entry would cause a crash.
* Add `--header <filePath>` flag to generator to provide custom file header when
 generating modules.
* Correct CLI naming issues and argument augmentation from generator.
* Correct naming of test file on generator.

### 3.6.3
*Released 1/29/2019*
* Move testing requirements into named dependencies so projects can utilize them.

### 3.6.2
*Released 1/29/2019*
* Fix mocha call from node app test to exit after completion.

### 3.6.1
*Released 1/29/2019*
* Fix path to test file in applications.

### 3.6.0
*Released 1/29/2019*
* Introduce modular testing!
* Kado will now provide the test suite capabilities through the 2 following
commands:
  * `node app test` Assuming you have `app.js` this will test your entire
  application.
  * `node app test somemodule` Again, `app.js` except this will only test 
    `somemodule` EG: `blog`
* The tests are now contained within the module and registered via the
  `exports.test` method of `kado.js` module file.
* The `bin` folder in modules has been renamed to the `cli` folder by default.
* Tests have been added to the module generator.

### 3.5.7
*Released 1/28/2019*
* Print date will now print the current time when no date is provided.

### 3.5.6
*Released 1/27/2019*
* Fix tests, and push latest package-lock.json

### 3.5.5
*Released 1/27/2019*
* Fix issue with template loading in Windows. Path detection failure.

### 3.5.4
*Released 1/26/2019*
* Use new version of Infant.
* Change nodemon profile to use `SIGINT` signal.

### 3.5.3
*Unreleased*
* Fix issue with login redirect being sent as a 301.

### 3.5.2
*Released 1/25/2019*
* Add morgan to log requests when in development mode.
* Accept `DEV=kado` to enable development mode.

### 3.5.1
*Released 1/25/2019*
* Improve filtering on Query profiling to negate skipTables.
* Move session setup below static content declarations to reduce query count.
* Move worker.setupContent below static declarations to reduce query load.
* Add missing indexes to core module models.
* Add profiling output to the main interface.
* Correct calls to render function in core modules to use new function.

### 3.5.0
*Released 1/24/2019*
* Implement Profiler sub system to track queries and timing on page loads.
* Add `config.dev = true` which will enable development and print page profiling
 in the default interfaces through the template variables provided by the
 profiler.
* BREAKING: The render function has now been overloaded with an improved Kado
 provided function `render`. Backwards compatibility will be provided by using
 the existing functions. However, `res.render('blog/list',{var1: 'something'})`
 will automatically resolve the view and will inject the profiler object which
 needs to be finalized. This adds timers before and after the rendering as well
 as query timers for enhanced profiling. `res._r` contains the original render
 function if it is needed. The usage definition is not changed.
* Template variables now available. `_pageProfile` this is a result of the
 `Profiler` system. It contains an array of steps with times and messages that
 can be print used to build statistic footers. EG: 
 `<span>Page Generated in {{_pageProfile.totalTime}}ms, using
 {{_pageProfile.queryCount}}</span>`.
 Finally, `{{{_pageProfile.HTML}}}` is a new variable that contains an HTML
 formatted printout of the profile for use below the footer of the page.
* To make the query profiler work properly per page, there has to be a setting
 added to the queries in use in the controllers. EG: 
 `SomeModel.findByPk(someId,{logging: req.locals._profiler.addQuery})`.
 To shorten this you can use: `SomeModel.findByPk(someId,res.Q)` where
 `Q` stands for Query Options. Using this is optional.
* System level query profiling is also now in effect. In `config.dev = true` all
 queries will be logged to console unless they are passed to the page profiler.
* The profiling system can be activated by using the environment variable
 `NODE_DEBUG=kado`, this will enable the profiler and DEBUG logging. However, if
  you want permanent control over dev mode and the profiler setting the
  `config.dev` setting to `true` or `false` will override the environment.

### 3.4.10
*Released 1/13/2019*
* Typo fix in staff variable name in default admin footer.
* Added `process.env.KADO_USER_HELPERS` environment variable to point
at the project helper locations.
* Added `K.helper()` method to find and return helper locations.
* Update to Infant 1.2.2: Added signal handler to properly handle graceful
shutdowns through nodemon. This should 8.0.5prevent stuck processes during
development.

### 3.4.9
*Released 12/19/2018*
* Fixes #261 CLI access on Module creation points to the wrong title/name
* Fixes #262 Parenthesis placed is wrong place on main route generation
* Fixes #263 Generator needs to handle null value correctly on default fields
* Fixes #236 Module generator should automatically fill name based on title
* Fixes #238 Use of deprecated sequelize method
* Fixes #278 Typo in multi enable on table.js

### 3.4.8
*Released 12/19/2018*
* Better defaults for module generation.
* Fixes #235 Update dependencies to avoid a security vulnerability in dependency.

### 3.4.7
*Released 10/18/2018*
* Adjust `robots.txt` on Main interface to allow robots.
* Allow override of `robots.txt` and other default assets by moving the
load order of staticOverrides above application assets.

### 3.4.6
*Released 10/11/2018*
* Adjust static caching to improve performance over the wire.

### 3.4.5
*Released 10/11/2018*
* Fix to remove headers that disable caching of resources.

### 3.4.4
*Released 10/11/2018*
* Remove unused environment variable `KADO_BIN` from `kado.js`
* Fix issue with `package.json` repository URL.

### 3.4.3
*Released 10/10/2018*
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
* Use `{{{_baseUrl}}}` when loading all assets.
* URI usages should always use `{{{_u.name}}}` to avoid escaping issues.
* Fix bug in `staff` module when deleting a staff member would fail to redirect.
* Use TUI Viewer on content display pages.
* Add missing indexes to date fields on models.

### 3.4.2
*Released 9/27/2018*
* URI population should happen during initial setupUri call and then overrides
happen during the `worker.beforeStart` hook.

### 3.4.1
*Released 9/27/2018*
* Add `worker.beforeStart()` hook which allows overrides to made after
modules have been scanned.

### 3.4.0
*Released 9/27/2018*
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
*Released 9/9/2018*
* Fix issues with module generation.
* Add more missing lang pack entries.

### 3.3.1
*Released 9/9/2018*
* Update license header.

### 3.3.0
*Released 9/8/2018*
* Prefer `kado_modules` folder to contain Kado modules.

### 3.2.0
*Released 9/6/2018*
* Move utility script to kado module so proper CLI look backs can happen.
* Improve module generation to be interactive, save and use config files
* Fix and test module generation to generate working code.
* Improve bootstrap script to have less options and generate with simplicity
* Expose utility cli through module globally for system usage

### 3.1.1
*Released 9/6/2018*
* Login referrer now filters possible static files as a setup.

### 3.1.0
*Released 9/6/2018*
* Minor fix to CLI suite, moves kado commands into setting module

### 3.0.0
*Released 9/5/2018*
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
*Released 8/4/2018*
* Add module generator
* Update dependencies

### 2.0.4
*Released 7/27/2018*
* Remove unused nav JSON structure from modules

### 2.0.3
*Released 7/27/2018*
* Fix user space module loading issue

### 2.0.2
*Released 7/27/2018*
* Fix staff handling in admin panel templates

### 2.0.1
*Released 7/27/2018*
* Small fix to template paths

### 2.0.0
*Released 4/13/2018*
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
*Released 4/4/2018*
* Remove database connectors from dependencies they should be installed at
app build time.

### 1.1.0
*Released 4/4/2018*
* Remove couchdb connector
* Remove couchbase connector
* Fix failure on blog main startup

### 1.0.0
*Released 3/9/2018*
* Initial release
