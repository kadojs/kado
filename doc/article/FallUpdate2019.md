# Fall Update 2019

Hi Everyone,

First of all, I would like to thank all the users that have taken the time to
use Kado over the last few months or even earlier! I appreciate that a lot! That
being said, the Kado team and I are moving forward towards the end of 2019 and I
am making progress with planing as well.

Today I went ahead and released Kado 3.9.6 which contains updates to all the
latest dependencies.  There were 20 this time around. 

We are pleased that Kado is helping web developers make the internet easy to
develop against. For our programs written against Kado, wow what an improvement.
There is just a sense of calm even as we pile together large software projects.
That is what Kado does best:  Bring structure and order to a large and complex
program.

My thoughts when first writing Kado were to come up with a coding organization
system that could accomodate small and simple projects.  Then, scale out to
massive projects, without having to change the structure or organization of the
code. Depending on the kind of development done means Kado doesn't fit everyone.
However, being a programmer that participates in projects with a lot of
potential, its great to have a solution to the scaling problem that can be
employed early on.

Another great benefit of Kado is compartmentalizing the work and code involved
in the work.  This greatly reduces code conflicts, even with many developers
working on the same project. It is also much easier to take an excerpt of the
project and hand it to an external developer using Kado. This helps to cut down
on  confusion from the developer end and helps keep the project flow moving at
a much higher rate.

Why am I saying all of this? Well, it does have a point.  Kado version 4 is
coming and with it are some changes to the basic structure of what Kado is and
how it functions. Initially, I did not completely know what Kado was. I wrote
the thesis outlining the boundaries of how the system was supposed to work and
what we were supposed to accomplish. However, that did not directly translate
into what the system would look or feel like. So I broke ground and just started
molding a web system that was the compilation of over a decade of professional
web development work. So far I have been thrilled with the setup and result of
the API, however its becoming more clear to me what Kado is:
**A CODE ORGANIZATION AND INTROSPECTION PLATFORM**.
This was a huge revelation to me now that we have this working Kado application.
Now, I know the real purpose of Kado and how it will help shape the world of
web development.

Coming soon we are going to be breaking apart the core components of Kado and
making the base package a lot lighter. Kado will become a backbone engine that
doesnt actually serve an interface or any modules out of the box. After 3 years
of development it is clear what the core role Kado kernel is. That is to build
and introspect the registered code modules and provide a structure layout for
the rest of the application to use.

These include:
    * Database Access
    * Email Sending / Receiving
    * UI Asset Management (Static Files)
    * Breadcrumb Navigation
    * Cron Execution
    * Event Logging
    * Interface Library
    * Language Library providing language pack support
    * Application Logging
    * Messaging (Email, Tickets, Chat, etc)
    * Navigation Library providing navigation structures in any UI
    * Permission Library for fine grained permission control
    * Profiler Library which tracks and measures application performance
    * Search Library providing a search backbone for all modules
    * URI Library provides a consistent registry of available application paths
    * View Library provides registration and listing of all registered UI views.
    * Webpack building system

One of the main problems Kado has is doing too much, however I believe as long
as we stay focused on providing the right needs the user space can flourish. To
me, of course its going to be a slow start because Kado is too new of a way
doing things. However, as time passes we will continue to revise Kado and work
on the balance between application and web engine. Which brings me to the next
point of the Kado update.

Kado is a **WEB ENGINE** which is the same as a **GAME ENGINE** meaning that it
provides a lot of the base APIs to ease the development of new applications.
Games always run into this issue when it comes to adding menus to the game.
They almost all make their own and then end up with a coding nightmare. Similar
to how Unreal Engine serves this purpose for games, Kado aims to serve this
purpose for web development. Now unlike ever before, your website is developed
against a real time, high performance web engine. And the API's are easier than
ever. Let me talk a little bit about how Kado works. Below I will illustrate the
Kado stack in my mind.

C -> C++ -> libuv -> Node.JS -> ExpressJS -> Kado -> Application Code ->
 Web Page or Program

Let me elaborate:
    * The core of Node.JS is built in C
    * While most of the handlers and modules are built in C++
    * Next comes the event system also written in C++ libuv which is the core of
       how Node.JS moves along
    * Now for Node.JS itself which creates a consistent overlay between JS and
       the Operating System
    * Now for ExpressJS which provides a sinatra style web server and some
       powerful API's
    * Finally Kado which provides this stack wrapped together in a platform that
       helps organize your code.

**Important NOTE Kado also provides process management at the core eliminating
the need to add clustering later.


Kado should work on any program, from web development, to back ends, to Desktop
UI. The secret here is not restricting how the application is built or even the
code the application is built on. Kado provides organization to help navigate
applications and help control where business logic lives.

A quick break down of the Kado folder structure.

    - Project Root
    -- interface (interface definitions)
    --- public (static files for public serving)
    --- view (contains views for global use)
    ---- home.html (homepage mark up)
    --- kado.js (define interface such as expressjs)
    -- kado_modules
    --- blog (module folder)
    ---- kado.js (module definitions)
    -- app.js (application configuration)

The structure of the application will remain consistent with version 3 except
for one notable change where an additional 'kado.js' file has been added to the
interface folder which helps define routes and interface configuration globally.

Kado continues to struggle with the issue of doing one thing and doing it well.
Right now we are honing in on becoming the application structure system that
takes node to the next level. If you are interested in helping us in any way,
please let me know!
