# Kado
[![pipeline status](https://git.nullivex.com/kado/kado/badges/master/pipeline.svg)](https://git.nullivex.com/kado/kado/commits/4.x)
[![Build Status](https://travis-ci.org/KadoOrg/kado.svg?branch=master)](https://travis-ci.org/KadoOrg/kado)
[![npm version](https://badge.fury.io/js/kado.svg)](https://badge.fury.io/js/kado)
[![Join the chat at https://gitter.im/KadoOrg/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/KadoOrg/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
```
npm install kado
```
JavaScript Framework Libraries for Node.JS

## Features

* Easily setup web servers to replace Apache, NGINX, etc.
* Build command line applications quickly.
* Create back ends for existing applications and save resources.
* Trusted by applications serving billions of page views.
* 0 external dependencies. The buck stops here!
* Libraries for most common application needs.
* Thoroughly tested, continuously integrated, actively developed.
* Make your own framework in just a few minutes!
* Code is peer reviewed, openly developed, openly licensed.
* Assertion, validation, and test running built in.
* LGPL 3.0 License. Use Kado where you need it.

## Quick Hello Server

Place the following code into an empty JavaScript file, example: `app.js`.
```js
const HyperText = require('kado/lib/HyperText')
const app = require('kado').getInstance()
const http = new HyperText.HyperTextServer()
app.http.addEngine('http', http.createServer(app.router))
app.get('/', (req, res) => { res.end('Hello') })
app.start().then(() => app.listen())
```
After saving the file, execute the code by running the following command from
the same folder as the JavaScript file.
```
node app
```
Once the command has executed, a web server that says "Hello" will be available
on port `3000` of your local machine, example: `http://localhost:3000`.

See [kado.org](https://kado.org) for more guides and examples.

## Kado Library List

This is an exhaustive lise of all the JavaScript libraries provided with Kado.
Each library has a link to its documentation as well as a short description of
what is provided by the library.

* [Application](https://kado.org/doc/application/) - Create a new application containing most
Kado features.
* [Assert](https://kado.org/doc/assert/) - Make assertions on input or tests.
* [Asset](https://kado.org/doc/asset/) - Store, filter, and query static application
files.
* [ChildProcess](https://kado.org/doc/child-process/) - Child process library adding convenience and
functionality to the core child_process functions.
* [Cluster](https://kado.org/doc/cluster/) - Cluster library for constructing and
operating process clusters.
* [Command](https://kado.org/doc/command/) - Build CLI applications with ease.
* [CommandServer](https://kado.org/doc/command-server/) - Execute CLI applications like a
web server.
* [Connect](https://kado.org/doc/connect/) - Framework for housing external resource
connections.
* [ConnectEngine](https://kado.org/doc/connect-engine/) - Interface for creating an engine
to be used with a Connect system.
* [Cron](https://kado.org/doc/cron/) - Execute functions on a schedule similar to UNIX
cron jobs.
* [Database](https://kado.org/doc/database/) - Connect system made for Databases.
* [Email](https://kado.org/doc/email/) - Connect system made for Email.
* [ETag](https://kado.org/doc/etag/) - Class for determining ETag header.
* [Event](https://kado.org/doc/event/) - Create, track and handle application events with
log levels.
* [FileSystem](https://kado.org/doc/file-system/) - Consistent API for use with File System methods.
* [Format](https://kado.org/doc/format/) - Commonly used String, Number, and Date format
methods.
* [GetOpt](https://kado.org/doc/get-opt/) - Parse command line string input into an
object.
* [History](https://kado.org/doc/history/) - Track user navigation history throughout
a session.
* [HyperText](https://kado.org/doc/hyper-text/) - Connect system made for HTTP servers.
* [Language](https://kado.org/doc/language/) - Internationalization helpers including
loading, parsing, and displaying languages.
* [Library](https://kado.org/doc/library/) - Dynamic library loader.
* [Lifecycle](https://kado.org/doc/lifecycle/) - Start and stop systems with events.
* [Log](https://kado.org/doc/log/) - Connect system made for Logs.
* [Mapper](https://kado.org/doc/mapper/) - ECMA Map functionality on Objects.
* [Message](https://kado.org/doc/message/) - Create, track and handle messages from
various inputs and outputs.
* [Module](https://kado.org/doc/module/) - Super class for creating Kado modules.
* [Mime](https://kado.org/doc/mime/) - Class for determining file types.
* [Navigation](https://kado.org/doc/navigation/) - Create and manage application menus.
* [Parser](https://kado.org/doc/parser/) - Parse input strings to variables such as objects.
* [PathExp](https://kado.org/doc/path-exp/) - Use path notation to validate routes on URIs.
* [Permission](https://kado.org/doc/permission/) - Create and test permission sets to
allow fine grained user control.
* [Profiler](https://kado.org/doc/profiler/) - Track application resource usage and
timing.
* [Router](https://kado.org/doc/router/) - Store and process application route points.
* [Search](https://kado.org/doc/search/) - Connect system for made for search.
* [Session](https://kado.org/doc/session/) - Session system for storing data against users.
* [TestRunner](https://kado.org/doc/test-runner/) - Define and run Test Suites and Tests.
* [Util](https://kado.org/doc/util/) - Misfit useful functions.
* [Validate](https://kado.org/doc/validate/) - Validate input.
* [View](https://kado.org/doc/view/) - Connect system made for rendering.

## Questions or Problems?

Please see our [bug tracker](https://git.nullivex.com/kado/kado/issues)

## Change Log

Please see the [CHANGELOG](https://kado.org/info/changelog/)

## Contributing

Please see the [Contribution Guidelines](https://kado.org/info/contributing/)

## License
Kado Copyright (C) 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved. Kado
is licensed under the Lesser GNU Public License version 3.0 or newer see
[LICENSE](https://kado.org/info/license/) for a complete copy of applicable license