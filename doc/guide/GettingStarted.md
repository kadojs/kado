# Getting Started

Kado JavaScript libraries will help propel your Node.js or Web Application
forward and provide better performance, easier debugging, and simpler overall
code.

First, you should have created project somewhere, whether it be a Git repository
or a new project in your code editor. Also, you should have a `package.json` file
to contain information about your project. If not, you need to create one. The
easiest way is to run `npm init` and follow the on screen instructions.

Second, it is time to install Kado. Full details and instructions can be read in
[Download](../info/Download.md) guide. For our purposes, we are going to install from
NPM by running the following command from your projects root folder.

```
$ npm install kado
```

In order to install Kado directly from sources rather than the NPM repository,
which is also useful to test new builds, use:

```
$ npm install git+https://git.nullivex.com/kado/kado.git
```

The installation will complete quickly since there are no external dependencies
to install, and Kado is very small. Now that Kado is installed to your project,
lets make a simple web server to illustrate the power and usefulness of Kado.

Create a new file in your project root folder and call it `app.js` which is a
common application entry point file name. Now, within `app.js` add the following
code.

```js
//require kado sources
const Application = require('kado')
// make an application instance
const app = Application.getInstance()
// require package information
const pkg = require('./package')
// set some project details
app.setName(pkg.name)
app.setVersion(pkg.version)
// add an http server
const http = new Application.HyperText.HyperTextServer()
app.http.addEngine('http', http.createServer(app.router))
// add a route
app.get('/', (req, res) => { res.end('Hello') })
app.start().then(() => { return app.listen() })
```

Now with that code placed lets run this code with the following command:

```
$ node app
```

Once the code is running, open your favorite web browser and navigate to
[localhost:3000](http://localhost:3000) you can click this link to get there.

Upon loading the page, you should see the word `Hello`. This will signify your
new application is working! Great work! Now if you are ready to get more
familiar with Kado, see the [Hello World](HelloWorld.md) guide
to go to the next stage.
