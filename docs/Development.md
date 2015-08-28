# Kado Development
by Bryan Tong, August 27th 2015

This document is intended to overview the development process involving Kado
core and Kado modules.

Furthermore, it is imperative to install the core when working on modules to
make testing a more enjoyable and cut down on commits.

## Initial Checkout

Kado makes the use of submodules when working on the core system. The official
modules are included in the core repo. Custom modules will need to be added
using a fork of the core. That fork will then still be able to see module
changes from the master as long as the remote is watched.

Okay, that being said lets go through an initial checkout procedure. In our
case we use Webstorm, which I would highly recommend.

There are two options, first lets go with the generic.

```
$ cd /home/kado
$ git clone --recursive https://github.com/nullivex/kado
```

In Webstorm, we use *VCS -> Checkout From Version Control -> GitHub*
once the repository is checked out. Open the new project. Once the project
has opened we can import the submodules.

*Note for Windows* if you want to avoid the typing of credentials on the
following commands use the following.

```
$ git config --global credential.helper wincred
```

Now to import the submodules

```
$ git submodule update --init --recursive
```

You will most likely have to enter your credentials once but it will be cached
into the future. Since submodules are only loosely supported in Webstorm it
is neccessary to do most of the git work on command line. However, it seems
the typical development cycle works nicely through Webstorm.

## Pulling

When starting the day its best to pull first and get synced up. I always
recommend to developers to commit at the end of the day. If you cant wrap it up
in a day you have bitten off too much.

```
$ git pull --recurse-submodules
```

This will update the core and all of the submodules.

## Pushing

Although, I highly recommend pushing submodules individually to avoid having
unexpected changes pushed. If you are making largescale changes such as code
standards changes. Run the following.

```
$ git push --recurse submodules
```

## Merging

At the time of writing, it is unclear how much of the Kado core will be open
source. However, in the event that it is. We will be accepting pull requests
against the core and all of its modules respectively.

There is nothing special that I know of working with submodules and merging.
If, though, something happens to come up I will add it here.
