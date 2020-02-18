# Welcome To Kado
[![pipeline status](https://git.nullivex.com/kado/kado/badges/4.x/pipeline.svg)](https://git.nullivex.com/kado/kado/commits/4.x)
[![Build Status](https://travis-ci.org/KadoOrg/kado.svg?branch=master)](https://travis-ci.org/KadoOrg/kado)
[![npm version](https://badge.fury.io/js/kado.svg)](https://badge.fury.io/js/kado)
[![Join the chat at https://gitter.im/KadoOrg/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/KadoOrg/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

High Quality JavaScript Libraries based on ES6+

Install Kado quickly or see [Download](../guides/Download.md) for more details.

```
$ npm install kado
```

## Motivations

Kado provides solutions by combining all the common gaps in JavaScript into a
consistent, well documented, thoroughly tested collection of libraries that have
zero external dependencies.

## What is Kado?

  Kado provides High Quality JavaScript libraries written in ES6 or better
standards. Our collection of libraries will provide most common needs for
web servers or command line applications. To try Kado in your project simply
install using the command below and see some of the documentation below
about how Kado might help simplify your projects workflow.

## Why use Kado?

* Libraries for most common application needs.
* 0 external dependencies. The buck stops here!
* LGPL 3.0 License. Use Kado where you need it.
* Thoroughly tested, continuously integrated, actively developed.
* Make your own framework in just a few minutes!
* Code is peer reviewed, openly developed, openly licensed.
* Used by applications serving billions of page views.
* Assertion, validation, and test running built in.
* More! Check the library list below!

## Get Started with our Guides

Our guides provide a step by step experience to learn how to use Kado to go from
saying "Hello" on a web port to writing a working administration panel. Once
these guides are completed, building websites and applications using Kado should
feel second nature. Each guide below is accompanied by a link to the full guide
as well as a short description of what each guide provides.

* [Introduction](../guides/Introduction.md) - Gain some background on the
history of Kado and why it was created.
* [Getting Started](../guides/GettingStarted.md) - Get started using Kado and
create a simple project that says "Hello" via HTTP on localhost port 3000.
* [HelloWorld](../guides/HelloWorld.md) - Building upon the
[GettingStarted](../guides/GettingStarted) guide, this guide will introduce
rendering and templates that say "Hello World" with HTML.
* [Make a Simple Website](../guides/MakeSimpleWebsite.md) - Continuing from
the [HelloWorld](../guides/HelloWorld.md) guide we add partials, static file
serving, CSS, and navigation to create a simple working website.
* [Build an Admin Panel](../guides/BuildAdminPanel.md) - Now with
[Make a Simple Website](../guides/MakeSimpleWebsite.md) complete, we continue
to explore how to build an administration panel on top of our simple website.
* [Database Work Flows](../guides/DatabaseWorkFlow.md) - With a working
[Admin Panel](../guides/BuildAdminPanel.md) the next step is to setup a
connection to a database so we can store the data created by the application.
* [Working With Email](../guides/WorkingWithEmail.md) - Explore sending
emails using the Kado provided libraries and connecting to an email server.
* [Views and Rendering](../guides/ViewsRendering.md) - Everything you need to
know about the Kado view system and how to render views.
* [Writing Tests](../guides/WritingTests.md) - Write tests against your
application easily using the provided Kado library.
* [Advanced Techniques](../guides/AdvancedTechniques.md) - Prepare your
application for production with the introduction of clustered processes and
command line applications.

## Kado Library List

This is an exhaustive lise of all the JavaScript libraries provided with Kado.
Each library has a link to its documentation as well as a short description of
what the library provides.

* [Application](./doc/Application.md) - Create a new application containing most
Kado features.
* [Assert](./doc/Assert.md) - Make assertions on input or tests.
* [Asset](./doc/Asset.md) - Store, filter, and query static application
files.
* [ChildProcess](./doc/ChildProcess.md) - Child process library adding convenience and
functionality to the core child_process functions.
* [Cluster](./doc/Cluster.md) - Cluster library for constructing and
operating process clusters.
* [Command](./doc/Command.md) - Build CLI applications with ease.
* [CommandServer](./doc/CommandServer.md) - Execute CLI applications like a
web server.
* [Connect](./doc/Connect.md) - Framework for housing external resource
connections.
* [ConnectEngine](./doc/ConnectEngine.md) - Interface for creating an engine
to be used with a Connect system.
* [Cron](./doc/Cron.md) - Execute functions on a schedule similar to UNIX
cron jobs.
* [Database](./doc/Database.md) - Connect system made for Databases.
* [Email](./doc/Email.md) - Connect system made for Email.
* [Event](./doc/Event.md) - Create, track and handle application events with
log levels.
* [FileSystem](./doc/FileSystem.md) - Consistent API for use with File System methods.
* [Format](./doc/Format.md) - Commonly used String, Number, and Date format
methods.
* [GetOpt](./doc/GetOpt.md) - Parse command line string input into an
object.
* [History](./doc/History.md) - Track user navigation history throughout
a session.
* [HyperText](./doc/HyperText.md) - Connect system made for HTTP servers.
* [Language](./doc/Language.md) - Internationalization helpers including
loading, parsing, and displaying languages.
* [Library](./doc/Library.md) - Dynamic library loader.
* [Lifecycle](./doc/Lifecycle.md) - Start and stop systems with events.
* [Log](./doc/Log.md) - Connect system made for Logs.
* [Mapper](./doc/Mapper.md) - ECMA Map functionality on Objects.
* [Message](./doc/Message.md) - Create, track and handle messages from
various inputs and outputs.
* [Module](./doc/Module.md) - Super class for creating Kado modules.
* [Navigation](./doc/Navigation.md) - Create and manage application menus.
* [Parser](./doc/Parser.md) - Parse input strings to variables such as objects.
* [PathExp](./doc/PathExp.md) - Use path notation to validate routes on URIs.
* [Permission](./doc/Permission.md) - Create and test permission sets to
allow fine grained user control.
* [Profiler](./doc/Profiler.md) - Track application resource usage and
timing.
* [Router](./doc/Router.md) - Store and process application route points.
* [Search](./doc/Search.md) - Connect system for made for search.
* [Session](./doc/Session.md) - Session system for storing data against users.
* [TestRunner](./doc/TestRunner.md) - Define and run Test Suites and Tests.
* [Util](./doc/Util.md) - Misfit useful functions.
* [Validate](./doc/Validate.md) - Validate input.
* [View](./doc/View.md) - Connect system made for rendering.
