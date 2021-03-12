# Kado 4.2 Released
*By Bryan Tong 4/15/20*

Our new release of Kado has been in development for a little over one month.
However, it feels like we have done years of work! This release is jam packed
with essentials for creating Websites, API Servers, CLI applications and
whatever else you might imagine. Chances are you can probably build it with
Kado 4.2.

Here is an overview of the primary additions:
* Add new Model.js for creating and working with Database records.
* Add new Mustache.js for string templating.
* Add new MySQL database engine.
* Add new Query.js for building queries for databases.
* Add new QueryCache.js for caching queries from a database in a database.
* Add new Schema.js for building tables for databases.
* Validate.isType upgraded to be more consistent and predictable.
* Parser adds `requestBody` parser to assist with input decoding.
* Router adds `res.json()` for JSON output.
* Router adds `res.redirect()` for location changes.
* Router adds `res.sendFile()` for sending files.
* Session adds `SessionStoreSQL` for SQL backed sessions from databases.
Add `HyperText.Proxy` to HyperText.js which provides an HTTP reverse proxy.

There are more! See our [CHANGELOG](../../CHANGELOG.md)

As our team continues to build new applications on Kado 4 we are continuously
evaluating and engineering the development of Kado. This means we use Kado every
day on our own projects and work diligently to improve developer efficiency. We
also believe all these factors combined make Kado "fun" to develop against.

That is all for the hype, now get out there and see what Kado 4.2 can do for
you!

Sincerely,

The Kado Team
