# Kado Database
by Bryan Tong, August 27th 2015

When desiging a high level framework such as Kado. It comes time to make
some tough descisions about certain technologies that must be used in order
to make the modules interoperable.

The biggest concern for module interoperability is the database, its 
structure, and most importantly its integrity.

## What did we choose

For Kado to operate business grade interfaces and follow proper human management
techniques. It is important to implement a structured and keyed database
structure.

When we choose a solution we think of many factors. The first of which is 
how widely used and understand the solution that meets our parameters. Second,
we evaluate how long the solution choose will last.

Finally, it brings me to the choice Kado makes for database storage.

Kado chooses MySQL to be the primary database backend for modules and internal
systems. Now, that being said. There are several other database that may be
used in a module and between a subset of modules.

## Database Overview

So lets overview the main database technology followed by supplemental choices.

* MySQL - Main and perferred module database format. Will include the most frame
work support.
* Redis - Used in the Kado User system for storing sessions. Also used for
action counters, which allow Kado to support profiling in every module without
module interaction.
* MongoDB - MongoDB is great for small non-related database structures. It is
easy to maintain as it is NoSQL and requires no structure. We prefer using
Mongoose to interact with MongoDB.

## Additional Software

Obviously, we encourage module developers to use any database system they
find to be the right tool for the job and then implement an API layer for
interoperability with other modules.

Please see the API documentation for mor specifics on why modules should
expose and API and how Kado makes it easy and secure.