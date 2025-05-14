An Architectural Walk-Through of Kado  
=====================================  

Kado is a batteries-included, server-side JavaScript framework whose design centres on a single orchestrator class – `Application` – and a suite of self-contained "engines" that plug into it.  At first glance the codebase looks large, but it is built from a handful of repeating ideas; once you see the patterns, the rest feels familiar.  Think of Kado as a friendly operating system for a web-application: each subsystem (HTTP, database, view rendering, cron, CLI, etc.) is a module that implements the same life-cycle hooks (`start`, `stop`, etc.) and the `Application` object wires them together.

--------------------------------------------------------------------
1.  The Application object – Kado's kernel
--------------------------------------------------------------------

`Application` is a light singleton wrapper that owns every other service you will use.  A fresh instance is requested via `Application.getInstance(name)`, which defaults to the name `"main"`; behind the scenes it simply memoises the build, so multiple calls hand back the same object.

```18:38:lib/Application.js
    // instances
    this.asset     = new Application.Asset()
    this.cli       = new Application.Command.CommandServer(this)
    this.connect   = new Application.Connect()
    this.cron      = new Application.Cron()
    this.database  = new Application.Database()
    this.email     = new Application.Email()
    this.event     = new Application.Event()
    this.history   = new Application.History()
    this.http      = new Application.HyperText()
    this.lang      = new Application.Language()
    this.library   = new Application.Library()
    this.log       = new Application.Log()
    this.message   = new Application.Message()
    this.nav       = new Application.Navigation()
    this.permission= new Application.Permission()
    this.router    = new Application.Router()
    this.search    = new Application.Search()
    this.util      = new Application.Util()
    this.view      = new Application.View()
```

Everything your program does is delegated to one of these child objects.  
The constructor keeps no secrets: if you want to discover Kado's surface area, just scan that list.

Key helpers inside `Application`:

• `setup()` – lazy initialisation.  It calls `setupMode`, `setupPaths`, `setupLibrary`, and `setupRouter` exactly once, controlled by `isSetup`.

• `start()` / `listen()` – bootstraps connectors (DB, sockets, etc.) then, if CLI arguments look like a command, passes them to the command server; otherwise it goes on to start HTTP servers.

• `stop()` – symmetrically tears everything down.

• Sugar for the router – methods like `app.get('/uri', fn)` just pass through to `this.router.add()`.

In day-to-day code you therefore:

```js
const app = Application.getInstance()
app.setConfig({...})
app.get('/', (req, res) => res.end('hello'))
await app.start()   // sets up DB, etc.
await app.listen()  // actually binds sockets
```

--------------------------------------------------------------------
2.  The Connect pattern – unifying start/stop semantics
--------------------------------------------------------------------

Most subsystems are built atop `Connect`, a tiny manager for "engines".  
An engine is any object that understands `start()` and `stop()`; `Connect` keeps a map of engines and provides a static helper `Connect.each()` which walks that collection and invokes a chosen method on each one.

```7:18:lib/Connect.js
static each (that, name, options, method) {
  Assert.isOk(method, `Missing method ${method}`)
  if (!name || name instanceof Object) {
    if (name instanceof Object) options = name
    return that.eachEngine(engine => engine[method](options))
  }
  const engine = that.getEngine(name)
  return engine[method](options)
}
```

By forcing every service to adopt the same minimal interface, higher-level orchestration remains trivial: `Application.startConnect()` simply calls `Connect.each(this.connect, null, {}, 'start')`.

--------------------------------------------------------------------
3.  HyperText & Router – HTTP the Kado way
--------------------------------------------------------------------

`HyperText` extends `Connect`; its `HyperTextServer` engine wraps Node's `http` or `https` server, exposes `.setHost/.setPort/.setSSL`, and – most importantly – delegates every incoming request to the central `Router`.

`Router` is expressive yet dependency-free:  
•  URI patterns may contain parameters (`/post/:id`).  
•  It supports a middleware stack (`router.use(fn)`) and a final fallback.  
•  Helpers are injected into each request/response object: `req.query`, `res.json()`, `res.redirect()`, `res.sendFile()`, etc.  
•  Preparers – a pre-router function and a standard one already exists (`Router.standardPreparation(app)`).

HTTP verbs are pre-declared on `Application`, so an express-like style emerges:

```js
app.use((req, res) => console.log(req.method, req.url))
app.get('/user/:id', (req, res) => res.json({ id: req.params.id }))
```

--------------------------------------------------------------------
4.  View – server-side rendering with Mustache
--------------------------------------------------------------------

`View` is, again, a `Connect` derivative.  Its default engine `ViewMustache` supports:

•  Multiple view folders,  
•  Optional template/partial caching,  
•  Render middleware (so you can post-process HTML),  
•  Automatic `ETag` handling and 304 replies.

From a route handler you simply call `res.render('template', params)` once a Mustache engine is registered.

--------------------------------------------------------------------
5.  Library – hot-loading internal modules
--------------------------------------------------------------------

`Library` maintains a search path list (`addPath`) and lazy-maps a library name to an absolute `.js` file.  `app.lib('Foo')` is therefore shorthand for a dynamic `require` that respects user and core library trees.  Use `app.library.search(name)` first if you only want to test existence.

--------------------------------------------------------------------
6.  The CLI subsystem
--------------------------------------------------------------------

`CommandServer` lets every module register its own CLI commands.  It uses a lightweight getopt parser, auto-generates `--help` text, and routes `app.start(argv)` invocations to the right command if extra arguments are supplied.

Example registration:

```js
app.cli.command('core', 'greet', opts => {
  console.log('hello', opts.name)
}, { definition: '--name=<str>', description: 'whom to greet' })
```

Running `node app.js core greet --name Bob` triggers that handler.

--------------------------------------------------------------------
7.  Cron, Database, Assets and the rest
--------------------------------------------------------------------

• `Cron` provides a tiny in-process scheduler.  Jobs are plain objects with a six-field cron string (`sec min hour day month weekday`) and one or more handlers.  

• `Database` wraps one or more database connections as engines (`DatabaseMySQL` for MariaDB/MySQL, etc.) giving them the same start/stop lifecycle.  The static helper `Database.queryOptions()` builds Sequelize-compatible logging options so the profiler can time your queries in dev mode.

• `Asset` keeps per-request CSS/JS manifests (`addCssOnce`, `addScript`, etc.) tailored for server-side rendered pages.

• `Search`, `Permission`, `Message`, `Navigation`, `History`, `Email`, `Event`, `Profiler`, and a handful of utility files (`Assert`, `FileSystem`, `Format`, etc.) fill in the supporting roles you would expect in a full-stack framework.

--------------------------------------------------------------------
8.  Flow of control at runtime
--------------------------------------------------------------------

1. Your code calls `Application.getInstance()` and optionally mutates configuration.  
2. `app.start(argv)`  
   – executes `setup*` methods (path discovery, library paths, router hooks).  
   – connects databases and any other `Connect` engines.  
   – if `argv` looks like a CLI command, runs it and exits.  
3. `app.listen()`  
   – walks HTTP engines (often just one) and calls `.start()`, binding sockets.  
4. Requests enter `HyperTextServer`, pass through `Router.standardPreparation`, then your route/middleware chain.  
5. `app.stop()` (triggered manually or on graceful shutdown) unwinds the same path in reverse.

--------------------------------------------------------------------
9.  Extending Kado
--------------------------------------------------------------------

• New engines: inherit `Connect.ConnectEngine`, implement `start/stop`, and register it on an appropriate manager (`app.http.addEngine('name', new MyServer())`).  
• Modules: create a subclass of `lib/Module.js`, implement the hooks you need (`main`, `cli`, etc.), then `app.addModule(instance)`.  
• View engines: subclass `ViewEngine` and supply a `render()` method.  
• CLI: add commands via `app.cli.command(moduleName, cmdName, handler, options)`.

--------------------------------------------------------------------
10.  Philosophy in a sentence
--------------------------------------------------------------------

Kado's entire codebase boils down to "compose small, lifecycle-aware engines under one unmistakable umbrella."  
Because the pieces share a common contract (`start/stop`, `addEngine`, etc.) you can swap, extend, or completely ignore subsystems without touching the rest.

Keep this mental model in mind and the framework will feel predictable whenever you revisit it in the future.  Happy hacking! 