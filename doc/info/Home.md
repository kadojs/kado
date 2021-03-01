# Welcome to Kado
[![pipeline status](https://git.nullivex.com/kado/kado/badges/master/pipeline.svg)](https://git.nullivex.com/kado/kado/commits/4.x)
[![Build Status](https://travis-ci.org/KadoOrg/kado.svg?branch=master)](https://travis-ci.org/KadoOrg/kado)
[![npm version](https://badge.fury.io/js/kado.svg)](https://badge.fury.io/js/kado)

Install Kado using [NPM](https://npmjs.org) or see
[Download](../info/Download.md) for more details.
```
npm install kado
```
Collection of JavaScript Framework Libraries for Node.js

## Quick Hello Server

Place the following code into an empty JavaScript file, example: `app.js`.
```js
'use strict'
// import kado
const kado = require('kado')
// create application
const app = kado.getInstance()
// create a webserver
const http = new kado.HyperText.HyperTextServer()
// register the webserver
app.http.addEngine('http', http.createServer(app.router))
// register a route
app.get('/', (req, res) => { res.end('Hello') })
// start the application and listen
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

* Single Node.js Module
* Compatible with Node.js 10 and above.
* Contains 47 libraries that cover a majority of coding tasks.
* Use libraries as needed and keep the code light.
* Consistent stable code that rarely changes.
* Complete reference documentation.
* Easy to learn, familiar, inspired by popular modules.
* Ready for continuous integration.

## More Features

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

## Library List

See our [Kado Library List](./LibraryList.md)

## Questions or Problems?

Please see our [bug tracker](https://git.nullivex.com/kado/kado/issues)

## Change Log

Please see the [CHANGELOG](../../CHANGELOG.md)

## Contributing

Please see the [Contribution Guidelines](../../CONTRIBUTING.md)
