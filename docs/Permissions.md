# Kado Permissions
by Bryan Tong, August 27th 2015

One of the more difficult portions of creating a modular system are implementing
scalable permissions that offer fine grained control.

## Types of Permission

To start out I need to come up with what should be restricted. I am going to
make some basic assumptions here and expand as we develop.

* Interface Access
* Module Access
* Module View
* Module Create
* Module Edit
* Module Delete

## How to Implement Permissions

This is where I want to keep the modules out of it so they dont have to worry.

I think the absolute best way to handle permission control is through the URI.

This way the permission system can talk about modules they may not even be
installed yet. Furthermore, without the modules being invovled in the setting
up or control of the permissions.

Finally, I think this system can mostly be implemented in middleware.

## Permissions that Transcend Interfaces

Another difficulty of permissions is interfacing with the user and the stored
permission sets of that user. I will address this more in the users
documentation.

Essentially though, in order for Kado to provide future proof permissions it
will also need to provide the users at the core. This will involve users and
the data being tracked with them to be modified by the modules. However, that
is an easier task to cope with in the modules than permissions.

## More to Come

I know this wont be the last time we have to work with permissions or make
adjustments to this system. I have never seen one of these systems work very
well. However I believe using the URI technique which is a language common
between all modules and developers. We can implement a permission system that
scales without modification.
