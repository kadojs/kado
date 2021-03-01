# Thesis

Kado is a vision and thesis for a truly modular development approach to working
with web panels. One of the most common computer programs today involves a
web server and a client which controls the web server. This allows the
programmer to expose a multi-OS UI without having to hassle with any desktop
libraries.

This approach to development has been the primary drive behind programs from
2005 onwards. It sparked the whole Web 2.0 revolution as well as a huge push in
marketing. It also fueled the mobile phone age.

As a small development shop, we try to get involved with all the major
technologies without hiring lots of manpower. It's just our style. I also
believe that to make technology work into the future we must continue to focus
on the single developer workflow. The easier it is for a developer to implement
his or her idea, the quicker that idea will become a reality. I, for one, can
attest that most of my development ideas get lost during the RnD fruition cycle.
Or, if the idea is based mostly on an experiment, it usually seems like too much
work to bring an entire software stack together to test simple code sets.
Lastly, I write a lot of purpose based programs and we tend to stay away from
monolithic portals. This helps us stay away from bugs. Some of our portals go
years without needing maintenance (they do everything intended and need no
updates). The downside to this is that the tool stacks get stale with time.
Moreover, it becomes hard for a developer to jump into an aging project to add
a new feature without feeling a little alien to what tools have changed.

Kado is an aim to fix this problem. Through Kado we can abstract 99% of the code
needed to produce a working panel. More importantly we want to be able to use
multiple programs within a larger portal without necessarily knowing this up
front. The developer should be able to work on the program in a purpose driven
environment rather than dragging an entire stack down to address a simple
problem. Keeping the code that needs worked on simple, concise and consistent is
important to the coder and their being able to remember what to do and then
execute that plan without getting hung up on project prerequisites.

Kado has been idle in my git repo for about 2 years. My primary road block was
over thinking the ecosystem and trying to solve problems that didnt exist.

If Kado was working as intended, we could build CRMs out of the modules and then
add systems management modules as needed. In my experience most technology
companies are the same stack of tools with different modules for different
products. Our companies operate the same way. I have also been approached about
building several portals and they all comprise of the same basic concepts.

I keep looking for an end all to this madness of creating customer portal after
customer portal. We kept finding software that forced us to adapt our company to
the software rather than adapting the software to our process. These backwards
process limits companies on new features and time to bring new features to
market. This is where Kado prevails. It's not built like a traditional web
portal. It has been produced with the mentality of an operating system, think of
Windows or Linux. The great part is that Node.js allows us to implement this
structure in a way that allows the developer to use tools and dependencies of
their liking. This will allow the developer to install and go. Let's take a look
at how this would work.

First install Kado globally:
```
$ npm -g i kado
```

Creation of a new Kado Application:
```
$ mkdir ~/projects/myapp
$ cd ~/projects/myapp
$ kado bootstrap --app myapp
```
At this point a basic Kado panel is available and ready to start. To start the
panel do the following.

```
$ cd ~/projects/myapp
$ node app
```

Kado will report back something like the following
```
# kado .
[KADO] INFO: Starting admin
[KADO] INFO: Starting main
[KADO] INFO: Startup complete
[KADO] INFO: MYAPP started!
```

By default the admin interface is available on port 3000 while the main
interface is on port 3001.

Kado is divided up into interfaces. Interfaces are defined by modules. This
means that a Kado system could potentially expose many different web interfaces
/ cli / api / telnet and other interfaces while all still operating in the same
overall system. The beauty of the operating system mentality is to avoid cloning
and maintaining the entire interface base framework when most portions are the
same. Highly customized interfaces shall expose their own interface so they may
not be restricted by the group interfaces. Meanwhile, the group interfaces
provide many features for free and significantly cut down on the weight of the
modules being used with the system.

Thanks to depending on the MVC framework, we will be able to use Kado as a means
to absorb software that has already been developed against the MVC framework.
Furthermore, it is hopeful that the Kado mentality will be inter operable with
many programming languages. This shall allow at least our local team to compress
almost all of our web facing and interface software into Kado based systems.
This helps illustrate the point of Kado while we will still develop our systems
they will comprise of Kado modules instead of complete web interfaces.

## Scaling and Aging

The most important component of this system is being able to scale and not meet
design limitations that hinder modules and create the need to write software
outside of the Kado environment. If the environment cannot accommodate 99% of
software and interface needs then it will fail at its primary purpose and
ultimately as a software project.

In order to provide the scaling this comes for the first big technical choice.
Javascript is the language of the internet and its highly extensible nature
makes it a perfect choice for Kado.

Being a small team this framework must maintain its extensible nature without
growing a large code base underneath. The framework must be fully tested and
follow standards that prevent maintenance as the Javascript ecosystem ages.

## Installation and Management

Kado is meant to be a set of dependencies used off of NPM through Node.js. NPM
is a great package manager with a huge amount of community effort and support.
It allows our system to script and scale easily without needing a lot of code
to support the package modular nature of Kado. The Kado team will provide a high
quality set of basic modules to help speed up the off the ground time for making
new applications.

## Remain Embeddable

Kado has a huge range of software that runs in many environments. As such, it
is important that Kado remains small enough to be installed and ran on embedded
devices such as routers, Raspberry Pis, Mobile Phones, and other small embedded
devices. Currently Kado requires ~100MB of memory and ~150MB of disk space after
module installation.

In our current applications we have dependency counts with 100+ packages, Kado
will aim to reduce this and start to implement an enterprise release lifecycle
to help easy on environment changes.

## Final Thoughts

The need for Kado has continued to grow as our use of the Node.js ecosystem has
grown. One of our biggest slowdowns as we move forward in this ecosystem is
going back and upgrading / maintaining existing portals. We would like to speed
this process up and speed up our process of putting new systems live. Kado
shall accomplish this. Finally, Kado will consolidate and compress a huge amount
of duplicated code while adding flexibility of code to be separated or added to
projects whenever the decision makes sense. Software is not a straight line it
is a cycle and a circle, it is important to understand the cycle and how module
and system needs will change and come back around as their life cycle continues.
