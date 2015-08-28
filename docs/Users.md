# Kado Users
by Bryan Tong, August 27th 2015

This document is intended to outline and express why Kado will provide and
manage users.

## Why should Kado do it?

I have determined that one of the only ways to make Kado work the way I
envision it without a catch 22 is for Kado to provide the User support.

Furthermore, as a computer user that deals with countless accounts on
countless websites. One thing that has always driven me nuts is not being
able to use the same account for admin / client / seller / main / scripting.

## The User

On Kado, I want to implement the idea of a User. A User is merely that a person.
A person can only be one person. They cannot be an admin, client, seller, as
those would be 3 different people. Instead I treat the interfaces as roles. 
They will still be accessed by the same person and such the account should
remain the same.

This will help tighten security as we only deal with one security medium.

## Business Grade Users

Okay, so at most IT related business there is a need for the staff to access
to countless portals. Well maybe not as many once Kado consolidates your
business needs. But there will still be software we cant acommodate.

Thus, the idea is to provide integration with various protocols to help sync
your business.

Kado will be clients of the following.

* LDAP
* RADIUS

However on another note, wouldnt it be nice to just control your staff through
Kado and have the rest of your portals sync to Kado?

Kado will be providers of the following.

* LDAP
* RADIUS
* Kado API

## The username?

Okay, I find that these days the best way to handle users is to identify them
by email address.

Thus, Kado will only provide a username as an alias not as a login option.

## Ongoing considerations

Kado will continue to envelope what the user is and how we will store
meta data about the user. Most modules will need to either read information
about the user or populate information about the user and we must accommodate
this in a dynamic fashion.
