# Command Line Interface
> NOTICE: Kado 3 is **DEPRECATED**, see [kado.org](https://kado.org) for the latest version.

## Introduction

Kado provides an extensive command line interface, this comprises of a system
that hands off commands into modules themselves. Also, Kado ships with a core
`kado` module which offers additional commands. Finally, when installed globally
Kado exposes the command `kado` which can look into the core `kado` module
directly for generation of new applications.

## CLI Structure

It is important to understand how the CLI loads modules to remember how to call
into the system intuitively. Let's look at a command.

```
$ node app kado generate
```

Breaking this down into 4 parts
* node - Call Node.JS to handle our request
* app - Use our app.js entry point to load Kado
* kado - This is the module name in this commands case it is calling to the core
`kado` module.
* generate - This is the actual action parameter that gets passed to the cli
module.

Now it is easy to see how this routing works. Let's see another command.

```
$ node app staff create --email sample@kado.org --password kado --name Kado
```

This command is slightly more complex in the sense that it also provides
arguments to carry out an action. However, notice the initial structure routing
to the `staff` module and calling the `create` action matches the breakdown
from above.

Using this method it is also easy to get help against our CLI modules as most
use [Commander.js](https://www.npmjs.com/package/commander).

```
$ node app staff -h
```

The above help request will list the available actions the staff module
provides.

## CLI Reference

Last, a non-exhaustive reference of core commands.

```
$ kado bootstrap --app Sample --dbhost localhost --dbuser sample --dbpassword sample
```

When Kado is installed globally using `npm -g i kado`, this command will
generate an `app.js` already configured to connect to your database. Once
complete, issue `node app kado dbsetup` to install the Models into the database.

```
$ node app kado dbsetup
```
This command will insert models and indexes that do no exist into the database
defined in `app.js`

```
$ node app kado insertsamples
```

Using this command will not only execute `dbsetup` it will also insert the Kado
sample content into your database. We RECOMMEND this option as it makes it a
lot easier to see Kado up and running.

```
$ node app kado generate
```

Create a new module within your Kado application see
[Module Guide](./Module.md) for more information. |

```
$ node app staff create --email sample@kado.org --password sample --name Kado
```

Create a new staff member with the email `sample@kado.org` password `sample` and
name `Kado`. |

```
$ node app staff update --email sample@kado.org --password jerry
```

Change the password of the staff member `sample@kado.org` to `jerry`. This is a
password reset.

```
$ node app staff remove --email sample@kado.org
```

Remove the staff member with the email address of `sample@kado.org`

```
$ node app blog create -t Sample -u sample -c "Sample Blog"
```

Create a blog using the CLI interface.

```
$ node app blog remove -i 1
```

Remove blog ID 1 from the system.

There are more commands however they can be documented by using `--help` after
routing the command for example
`$ node app blog --help` or `$ node app blog create --help` etc.
