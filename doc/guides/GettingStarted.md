# Getting Started

Kado JavaScript libraries will help propel your Node.JS or Web Application
forward and provide better performance, easier debugging, and simpler overall
code.

First, you should have created project somewhere, whether it be a Git repository
or a new project in your code editor. Also you have a `package.json` file to
contain information about your project. If not, you need to create one the
easiest way is to run `npm init` and follow the on screen instructions.

Second, it is time to install Kado which can be read in greater detail on
[Download](./Download.md) guide. For our purposes we are going to install from
NPM by running the following command from your projects root folder.

```
$ npm install kado
```

The installation will complete quickly since there are no external dependencies
to install, and Kado is less than 500KB uncompressed. Now that Kado is installed
to your project, lets make a simple web server to illustrate the power and
usefulness of Kado.

Create a new file and call it `app.js` which is a common name among applications
as the entry point, you could also use `index.js` if this program were meant to
be ran as a folder or package. Now, within `app.js` add the following code.

```js
// make an application instance
const app = require('kado').getInstance()
// set some project details
app.setName('myProject')
app.setVersion('1.0.0')
// add an http server
const http = new app.HyperText.HyperTextServer()
app.http.addEngine('http', http.createServer(app.router))
// add a route
app.get('/', (req, res) => { res.end('Hello') })
```

Now with that code placed lets run this code with the following command:

```
$ node app
```

Once the code is running open your favorite web browser and navigate to
[localhost:3000](http://localhost:3000) you can click this link to get there.

Upon loading the page you should see the word `Hello` this will signify your
new application is working! Great work! Now if you are ready to get more
familiar with Kado see the [Make a Simple Website](./MakeSimpleWebsite.md) guide
to go to the next step.
