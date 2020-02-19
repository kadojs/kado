Hello Kado Users!

I do not know how many of you are out there, I have a hard time getting in touch
sometimes, but I am grateful for those of you who have found Kado useful in some
way or another. Personally, I don't think I take enough time to communicate
with everyone while I am busy working away on the code for Kado, and the
projects using Kado, however, I think Sundays are always a great time to catch
up!

## A Review of the Spring Development

Kado hit the ground running with the first real project taking on the full
functionality of the system and pressing the system into new limits. I am going
to review a couple of the systems that were added to Kado over the Spring time.

### Testing

In the original release of Kado 2 I was just happy to see the system off the
ground and running. It quickly started harnessing modules and as such power
within those modules. Quickly I saw the need for testing becoming more and
more relevant. Now Kado itself had already done testing locally to ensure it
worked properly prior to shipping. In the spirit of how Kado has been coded I
wanted the testing system to be first class and utilize the same system for
testing and shipping Kado as well as building and testing applications.

Overall, the testing system has been a huge success and we are already avoiding
gotchas by having extensive system testing. This is just the beginning though
we are working towards continual runtime testing in the field to ensure the
environment is predictable. The goal is to use Kado alone without the need of
all the 3rd party providers out there today or at least link them all together
into a common portal.

Modules enjoy the same test suite and harness that is provided to the main
testing system. To me that was a huge plus it kept everything consistent and
it allowed me to stick to a consistent format working from Kado into modules
themselves.

### The Feedback Loop

A big part of bringing Kado together with the later versions was being driven
from feedback provided by our CRM project code named Magic. All the facets of
Kado have been pushed by the Magic needs. As Magic has continued to grown so
has its needs. Most important Kado has adjusted and grown with the modules and
intricacies of the system without hitting any major road blocks. I am very
thankful for that. Especially given that most of the process in building
Kado 2 was speculation driven. That makes it much more powerful to see
it come into fruition.

Magic has continued to provide feedback and testing into developing an
application with 30+ modules as well as working with 5 developers on the same
project. One big advantage we have seen so far is that the developers are able
to not step on each others code without having to do much coordination. To me
this is a huge plus to the design and in a standard express like environment it
would not be possible since a lot of the routing and partitioning are done in
common files where many developers would be tracing.

### Intricate Model Relations

Working with data relations is a huge effort in working through a program and
the Kado architecture in general. Kado has a philosophy which is about the only
real solution to the issue. That philosophy is to keep data relations as few and
slim as possible and keep modules portable at all costs. When portability has to
be given up modules should be developed in a group and shipped together. We have
made practice of this mentality while working through Magic. The database
structure within Magic is extensive and interrelated which makes it a great use
case to demonstration the flexibility of Kado. A main mission objective of Kado
is to be able to start as a small blog and grow into a major functional web
property without the typical reliance on third parties. We know this because we
operate web properties and try to gain from experience.

### Distribute Kado under the MIT License

This was a big decision on our part. Originally we had slated Kado to be
released under the LGPL-3.0 license however we decided that our core mission is
to get Kado into all the right places more so than choose who can use it and
where. That being said we have chosen the most permissive license while still
protecting ourselves from unforeseen liability. Now that Kado is under the MIT
license any company or individual can try and make use of Kado without worrying
about whether or not they are endangering exposing their source code or company
liability.

What we lose, well its simple, your input. While I am not certain how many of
you are out there. I can tell you that the MIT license gives both you the user
and myself the developer less incentive to contribute to the project. I believe
this trade can be managed if we work together and use some common sense about
what is done with Kado.

### Application Profiling

Now here is a feature that I have not seen in many other Node.JS frameworks
(though truth be told I spend more time designing and writing frameworks like
Kado here) than I do using them. Nevertheless, this is a cool feature that is
worth noting. Kado has a very feature rich Development mode which is activated
in various ways. When the development is active it will time your page loads,
execution times and render times, database connectors will print and count
queries, debug messages and more.

I find this feature useful when reviewing other developers work and preparing
applications for deployment. I can spend less time doing speculative code reads
and more time testing the application and verifying performance capabilities. I
think this is a bonus and developer or project manager will love.

### Fluid Development using Nodemon

I hate restarting node each time I make a change to the app, and I know a lot
of other developers do too! I would imagine that is why `nodemon` has really
become a staple package in the Node.JS ecosystem. Throughout the development of
Kado 3 I have continued to make efforts to improve the state of our fluid
development system.

After properly configuring the `nodemon.json` file which I will post here for
reference. The application is then started with `npm start` and afterwards
the program reacts to all the changes made within the Node.JS base also mustache
and the front end build system (which I will review in a moment) react to being
in Development and react to changes in real time. The result of these components
working together is an experience where you sometimes forget the application is
even running.

### Asset Delivery or "Bundling" using Webpack

To me this was one of the most complex portions of Kado 3 and really took me a
lot of time to get right. With modern applications it seems so imperative to me
for an application to depend on some heuristic 3rd party libraries and then use
those libraries to help evolve an application. We also enjoy this workflow.
However, to do it properly and keep the website clean and functional its a whole
different story. A lot of the tools for bundling and delivering assets as well
as ES6 and that transition have all been in play while I worked through the
ideas and systems that make Kado real. I had a rudimentary build system that
had been put together working on some our earlier portals. That shipped with
Kado 2 and served the basic purpose of getting the bundled assets to the client.

We hit some immediate road blocks though. First the payload size, it was one
bundle file, that is nice, but it was 2.7MB (not so nice) which meant that on
slow connections it would take up to 5 minutes to get a functional web page.
Just plain not acceptable on a mobile driven internet. This is where the new
Kado build system started to work. I looked into Webpack and I really like the
efforts being done there to ease the confusion with packing and building. I
also enjoy the fact that they looked beyond the Javascript resource and support
delivering assets of all types through Webpack. This is where I should note
that Kado is a really early implementation of Webpack and I want to do more with
it in the future. That said, Kado has methods of handling and delivering the
other assets providing within the system. Since that was possible I focused on
Javascript bundling while working through the system.

#### The Balance

Balancing bundle time, organization of files, frequency of bundling were all
huge to making the asset system work in what I believe is a "right" or
"predictable" way. First, there is no silver bullet, bundling adds hassle,
complexity, and time to the application development process. However, bundling
helps establish a program for the long haul and helps the application stay up
to date and keep up to date through package changes. 3rd party libraries and
time are a huge detriment to any project and if the project intends to grow
than all those liabilities must be met in order to leave the developer room
to breathe. Think of it like a higher horsepower tractor at the tractor pull
and with Kado you get more power.

Kado breaks the bundling up into two sections. `bundle.js` and then
`deferred.js` which the `deferred.js` can be loaded async and any resources
that are not interdependent can be loaded later without impacting time to
functionality. Great care should be given in to what resources are packaged
into `bundle.js` this file is loaded synchronously and will impact time to
have a functional page. There is also `main.js` which contains resources such
as jQuery and should be kept under 100Kb, this allows for page global tools
and should be carefully inspected and maintained (which we do here at Kado).

Bundling is then done in two stages to make the process quicker. Development
mode which is the default will concat add closures and minimize source while
leaving variable names and using concatenation built source maps. This is nice
for development keeps bundling under 10 seconds on most machines, mine are like
3 seconds on an i7 and AMD 9770. Now the `main.js` and `bundle.js` dont need to
be rebuilt unless the Kado version changes these files are meant to be
maintained by us and modules that extend them. When building an application
there are a couple of options for working with resources.

Bundles are then broken into programs. Such as *DataTables*, *TuiEditor*,
*StretchFS File Manager*, etc. These are then loaded on the subsequent
necessity pages. What this does is allow for the initial impact to truly
only bring required resources and the rest of the resources are quietly added
in as the user browses the application. This yields a really smooth experience
from the ground up and follows a Human acceptable logic pattern of building up
instead of hanging and waiting.

There is too much to the bundle system to break down everything. In short, in
production the bundle system must be ran with the production flag to compress
down a final hard press for users. This is accomplished using
`node app kado bundle --production`. The bundle CLI comes with a lot of fun
options for controlling when and where things are built so take a look at
`node app kado bundle --help` and try it out.

### Cron System

This is a small sub feature but worth of mentioning. Magic has a lot of
periodical events that need to happen on a clock not just in async random gray
matter time. In fact every application I have ever built that is not based
solely off inputs uses events to keep the lifecycle in check. Kado helps
facilitate this by allowing the registration and management of cron jobs
via `K.cron` this is a first class functionality that helps keep Kado modules
self contained.

### Message, Events and Email

I felt like these systems took the most time to think about but dont really
take that much time to explain now that they operate. Kado brings three systems
into play when it comes to communications. The first is the core Message system
this comprises of any form of communication between users or devices. Other
methods of communication are built on top of this system. First is events,
these are filed by modules throughout the system and are handled according to
the modules installed and the rules configured within the system. Events will
create a message and attach that message to the event, the event itself will
track information directly related to the creation and categorization of the
event. Finally, there is Email, this system is operated through connectors much
like the Database sub system. Email connectors register and when properly
configured send email out of the system. There can be multiple Email connectors
and they can send repeat a message through each connector (though this is
uncommon vs using known email operators to repeat the email message).

The message system is meant to be integrated with any communication medium
available to the program. We anticipate a great number of needs for existing
and future communication systems.

## The Summer Ahead

The later half of Winter and Spring brought a lot of changes to Kado and while
that was great getting through these new systems we are planning to take a break
over the summer and focus on the completion of Magic and working on expanding
the Kado documentation and promoting this great product!

## What can you do?

Drop us a line! Let us know how you are doing. If you are making a project with
Kado tell us about it and if you need help we are here!

Have a great Summer!
