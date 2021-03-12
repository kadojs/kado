# Kado
[![pipeline status](https://git.nullivex.com/kado/kado/badges/master/pipeline.svg)](https://git.nullivex.com/kado/kado/commits/4.x)
[![Build Status](https://travis-ci.org/KadoOrg/kado.svg?branch=master)](https://travis-ci.org/KadoOrg/kado)
```
npm install kado
```

Collection of JavaScript Framework Libraries for Node.js

## Quick Hello Server

Place the following code into an empty JavaScript file, example: `app.js`.
```js
'use strict'
// import kado
const kado = require('kado')
// create application
const app = kado.getInstance()
// create a webserver
const http = new kado.HyperText.HyperTextServer()
// register the webserver
app.http.addEngine('http', http.createServer(app.router))
// register a route
app.get('/', (req, res) => { res.end('Hello') })
// start the application and listen
app.start().then(() => app.listen())
```
After saving the file, execute the code by running the following command from
the same folder as the JavaScript file.
```
node app
```
Once the command has executed, a web server that says "Hello" will be available
on port `3000` of your local machine, example: `http://localhost:3000`.

See [kado.org](https://kado.org/guide/getting-started/) to go further.

## Features

* Single Node.js Module
* Compatible with Node.js 10 and above.
* Contains 47 libraries that cover a majority of coding tasks.
* Use libraries as needed and keep the code light.
* Consistent stable code that rarely changes.
* Complete reference documentation.
* Easy to learn, familiar, inspired by popular modules.
* Ready for continuous integration.

## Documentation

Visit [kado.org](https://kado.org)

## Kado Library List

See the [Kado Library List](https://kado.org/info/library-list/)

## Questions or Problems?

Please see our [bug tracker](https://git.nullivex.com/kado/kado/issues)

## Change Log

Please see the [CHANGELOG](https://kado.org/info/changelog/)

## Contributing

Please see the [Contribution Guidelines](https://kado.org/info/contributing/)

## License
Kado Copyright (C) 2013-2021 Bryan Tong, NULLIVEX LLC. All rights reserved. Kado
is licensed under the Lesser GNU Public License version 3.0 or newer see
[LICENSE](https://kado.org/info/license/) for a complete copy of applicable license
