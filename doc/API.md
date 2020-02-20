# API
> NOTICE: Kado 3 is **DEPRECATED**, see https://kado.org for the latest version.

It is important to encourage interoperability with other software that is in use
in your ecosystem.

With Kado we want to encourage modules and the frame work itself to be built to
support API interaction right from the start.

Our goal is to be flexible in how we interact with existing and new systems.

## API for Modules

While modules are not required to expose an API it is encouraged that they do.

Kado makes this simple by implementing an API within admin routes method to cut
down on duplicate route methods.

## API Users

Another great thing about Kado providing the users is that the same Users can be
granted API permissions through the use of tokens which can roam or be assigned
to a single IP.

## API Permissions

Along with the inherent use of Users. The permissions system through its use of
URI filtering is again able to mask the same level of permissions to the API.
Providing fine grained control on all interfaces.
