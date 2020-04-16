# Hello World

After reading the [Getting Starting](GettingStarted.md) guide you should have a
basic understanding of how to get Kado off the ground for serving web requests.
This guide will expand on that understanding and provide new example code to
add a view rending engine as well as a template to your project.

Now, it is assumed you have created a project, initiated your `package.json`
file and installed `kado` into your project. Next you need to create an `app.js`
file within your project root if it doesnt already exist, and then replace the
code within that file with the following:

```js
// require kado sources
const Application = require('kado')
const fs = require('kado/lib/FileSystem')
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
// add a view engine
const viewFolder = fs.path.join(__dirname, 'views')
app.view.addEngine('mustache', new Application.View.ViewMustache(viewFolder))
app.view.activateEngine('mustache')
// add a route
app.get('/', (req, res) => { res.render('index') })
app.start().then(() => { return app.listen() })
```

There are a few portions of this code that require explanation lets start with
what was added from the [Getting Started](GettingStarted.md) guide.

First, we added the `FileSystem` library to handle building paths and working
with files and folders. This is done with the following code:

```js
const fs = require('kado/lib/FileSystem')
```

Second, we added a view engine pointing to a view folder so that we can render
templates and send that result as HTML to the user. The following code sets
this process up.

```js
const viewFolder = fs.path.join(__dirname, 'views')
app.view.addEngine('mustache', new Application.View.ViewMustache(viewFolder))
app.view.activateEngine('mustache')
```

The first line creates a path to our view folder which is going to be project
root and then a sub folder named `views`. The next line adds a view engine to
the Kado Application library and names the engine `mustache` when the library
is instantiated we pass the view folder path so that the render engine knows
where to find our views. Finally, the third line we activate the view engine
by calling into the Kado Application instance and then into the View instance
where the `activateEngine` method is called. We pass `mustache` as a string to
this method to declare the label of the engine that should be activated, which
should match the string we provided int the `addEngine` call on the line above.

Now since we are using the mustache parsing system we are going to install an
external library to the parsing. Execute the following command to include
mustache into this project:

```
$ npm install mustache
```

Now that the view system has been activated we need to look at how the route has
been modified to call into the view. Consider the following code:

```js
app.get('/', (req, res) => { res.render('index') })
```

By calling `res.render('index')` we invoke the view system to look for a view
named `index.html`. Then render that view with no provided parameters other
than system globals which are stored in the `res.locals` object.

Next you need to create a view folder in your project root called `views` and
then within that folder create a file named `index.html`. In the new file
place the following HTML code:

```html
<!doctype HTML>
<html lang="en">
<head><title>Hello World</title></head>
<body><h1>Hello World</h1></body>
</html>
```

Once that code is placed to the file and the file is saved, change to the
terminal of your project root and run the following command.

```
$ node app
```

That command should execute without error. Now, your
web server is complete and serving "Hello World" HTML from
[localhost:3000](http://localhost:3000)

Congratulations! You are one stage further to creating amazing web applications
using Kado. To learn more see the [Make a Simple Website](MakeSimpleWebsite.md)
In this guide we explore using partials and routes to create a basic website.
