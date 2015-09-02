# Kado Config
by Bryan Tong, September 1st 2015

One of the big challenges with a modular system is basically tackling the same
challenges an operating system faces. Mostly with regards to how we share
and use global resources.

Node.JS actually makes this possible. But it doesnt necessarily make it easy as
there are still some broad scoping concerns and race conditions that need to 
be thought of.

Also important is how we load and execute modules.

So, the first and biggest challenge is the configuration. First thing is that
we want to be able to obtain a copy of the configuration from any module.

Second, modules need to be able to add to the config.

Third, users need to be able to override the config through the admin interface.

The basic idea is to treat the config like an interface however it is integrated
with the system slightly different than the rest of the interfaces.

Access of the configuration is provided through the `config.js` file located
at the root of the Kado installation.

## Loading Order

Best to go over this early, the configuration is loaded and merged in the order
below. It should be noted that any time you call the config.js file through
`require` it will be fully overridden so keep that in mind when working with
user overrides done from the panel.

* config.js - Defaults and system wide config
* Module config - loaded from each module for defaults
* config.local.js - User overrides in the Kado root folder
* KADO_CONFIG - path to a config file using the KADO_CONFIG environment variable
* User overrides - obtained from the `settings.json` table

I understand that with node and many other apps configuration is half the
battle to being able to work in multiple environments. This config loading
order has been established over years of production work in a multitude of
environments.

## Locating the Config

Something I have been debating with in the Kado modules being the problem of
locating resources in the root Kado installation folder. The question to me is
whether these resources should be exposed through an SDK installable by the
modules as it is important for the modules to be able to install their own
addons and not depend on the core package for module capabilities.

The best way with node to do this is through the use of environment variables.

Please use the following environment variable to locate the config.

```
KADO_CONFIG_FILE
```
