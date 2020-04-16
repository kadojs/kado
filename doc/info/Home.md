# Welcome to Kado
[![pipeline status](https://git.nullivex.com/kado/kado/badges/master/pipeline.svg)](https://git.nullivex.com/kado/kado/commits/4.x)
[![Build Status](https://travis-ci.org/KadoOrg/kado.svg?branch=master)](https://travis-ci.org/KadoOrg/kado)
[![npm version](https://badge.fury.io/js/kado.svg)](https://badge.fury.io/js/kado)

Install Kado using [NPM](https://npmjs.org) or see
[Download](../info/Download.md) for more details.
```
npm install kado
```
High Quality JavaScript Framework Libraries for Node.JS

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

See more guides and examples below.

## Features

* Create servers that produce websites, APIs, or anything really.
* Create back ends for existing applications and save resources.
* Build command line applications quickly.
* Trusted by applications serving billions of page views.
* 0 external dependencies. The buck stops here!
* Libraries for most common application needs.
* Thoroughly tested, continuously integrated, actively developed.
* Make your own framework in just a few minutes!
* Code is peer reviewed, openly developed, openly licensed.
* Assertion, validation, and test running built in.
* LGPL 3.0 License. Use Kado where you need it.
* Easily setup web servers to replace Apache, NGINX, and others.

## Get Started with our Guides

Our guides provide a step by step experience to learn how to use Kado to go from
saying "Hello" on a web port to writing a working administration panel. Once
these guides are completed, building websites and applications using Kado should
feel second nature. Each guide below is accompanied by a link to the full guide
as well as a short description of what each guide provides.

* [Getting Started](../guide/GettingStarted.md) - Get started using Kado
and create a simple project that says "Hello" via HTTP on localhost port 3000.
* [HelloWorld](../guide/HelloWorld.md) - Building upon the
[GettingStarted](../guide/GettingStarted.md) guide, this guide will
introduce rendering and templates that say "Hello World" with HTML.
* [Make a Simple Website](../guide/MakeSimpleWebsite.md) - Continuing
from the [HelloWorld](../guide/HelloWorld.md) guide we add partials,
static file serving, CSS, and navigation to create a simple working website.
* [Build an Admin Panel](../guide/BuildAdminPanel.md) - Now with
[Make a Simple Website](../guide/MakeSimpleWebsite.md) complete, we
continue to explore how to build an administration panel on top of our simple
website.
* [Database Work Flows](../guide/DatabaseWorkFlow.md) - With a working
[Admin Panel](../guide/BuildAdminPanel.md) the next step is to setup a
connection to a database so we can store the data created by the application.
* [Working With Email](../guide/WorkingWithEmail.md) - Explore sending
emails using the Kado provided libraries and connecting to an email server.
* [Views and Rendering](../guide/ViewsRendering.md) - Everything you need
to know about the Kado view system and how to render views.
* [Writing Tests](../guide/WritingTests.md) - Write tests against your
application easily using the provided Kado library.

## Kado Library List

This is an exhaustive list of all the JavaScript libraries provided with Kado.
Each library has a link to its documentation as well as a short description of
what is provided by the library.

* [Application](../Application.md) - Create a new application containing
most Kado features.
* [Assert](../Assert.md) - Make assertions on input or tests.
* [Asset](../Asset.md) - Store, filter, and query static application
files.
* [ChildProcess](../ChildProcess.md) - Child process library adding
convenience and functionality to the core child_process functions.
* [Cluster](../Cluster.md) - Cluster library for constructing and
operating process clusters.
* [Command](../Command.md) - Build CLI applications with ease.
* [CommandServer](../CommandServer.md) - Execute CLI applications like a
web server.
* [Connect](../Connect.md) - Framework for housing external resource
connections.
* [ConnectEngine](../ConnectEngine.md) - Interface for creating an engine
to be used with a Connect system.
* [Cron](../Cron.md) - Execute functions on a schedule similar to UNIX
cron jobs.
* [Database](../Database.md) - Connect system made for Databases.
* [Email](../Email.md) - Connect system made for Email.
* [ETag](../ETag.md) - Class for determining ETag header.
* [Event](../Event.md) - Create, track and handle application events with
log levels.
* [FileSystem](../FileSystem.md) - Consistent API for use with File
System methods.
* [Format](../Format.md) - Commonly used String, Number, and Date format
methods.
* [GetOpt](../GetOpt.md) - Parse command line string input into an
object.
* [History](../History.md) - Track user navigation history throughout
a session.
* [HyperText](../HyperText.md) - Connect system made for HTTP servers.
* [Language](../Language.md) - Internationalization helpers including
loading, parsing, and displaying languages.
* [Library](../Library.md) - Dynamic library loader.
* [Lifecycle](../Lifecycle.md) - Start and stop systems with events.
* [Log](../Log.md) - Connect system made for Logs.
* [Mapper](../Mapper.md) - ECMA Map functionality on Objects.
* [Message](../Message.md) - Create, track and handle messages from
various inputs and outputs.
* [Mime](../Mime.md) - Class for determining file types.
* [Model](../Model.md) - Super class for building new data models used
for interacting with data sets produced by data queries.
* [Module](../Module.md) - Super class for creating Kado modules.
* [Mustache](../Mustache.md) - Provides a logic-less templating system
for use in providing any kind of text rendering.
* [Navigation](../Navigation.md) - Create and manage application menus.
* [Parser](../Parser.md) - Parse input strings to variables such as
objects.
* [PathExp](../PathExp.md) - Use path notation to validate routes on
URIs.
* [Permission](../Permission.md) - Create and test permission sets to
allow fine grained user control.
* [Profiler](../Profiler.md) - Track application resource usage and
timing.
* [Query](../Query.md) - Super class for constructing query builders that
are customized for a specific query language.
* [QueryCache](../QueryCache.md) - Query cache system for databases.
* [Router](../Router.md) - Store and process application route points.
* [Schema](../Schema.md) - Super class for constructing schema builders
that are customized for a specific schema language.
* [Search](../Search.md) - Connect system for made for search.
* [Session](../Session.md) - Session system for storing data against
users.
* [TestRunner](../TestRunner.md) - Define and run Test Suites and Tests.
* [Util](../Util.md) - Misfit useful functions.
* [Validate](../Validate.md) - Validate input.
* [View](../View.md) - Connect system made for rendering.

## Questions or Problems?

Please see our [bug tracker](https://git.nullivex.com/kado/kado/issues)

## Change Log

Please see the [CHANGELOG](../../CHANGELOG.md)

## Contributing

Please see the [Contribution Guidelines](../../CONTRIBUTING.md)
