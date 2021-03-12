# Make A Simple Website

After reading the [Hello World](HelloWorld.md) guide you should have an
understanding of how to have Kado serve templates to web requests.
This guide will expand on that knowledge and provide example code to
add rending partial views and static files to your project.

Now, it is assumed you have created a project, initiated your `package.json`
file and installed `kado` into your project. Also, it is assumed you have an
`app.js` created by completing the [Hello World](HelloWorld.md) guide. Below,
is an updated code example containing our static server and view rendering.

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
// add a static server
const staticRoot = fs.path.join(__dirname, 'public')
app.use(Application.HyperText.StaticServer.getMiddleware(staticRoot))
// add a route
app.get('/', (req, res) => { res.render('index') })
app.start().then(() => { return app.listen() })
```

There are a few portions of this code that require explanation let us start with
what was added from the [Hello World](HelloWorld.md) guide.

We added the `StaticServer` instance to handle requests for static files.
This is done with the following code:

```js
const staticRoot = fs.path.join(__dirname, 'public')
app.use(Application.HyperText.StaticServer.getMiddleware(staticRoot))
```

The `staticRoot` path determines where the CSS, image files etc are to be served
from. In our example, this will be your project root and then create the folder
`public` within the project root.

Next, we call `app.use(HyperText.StaticServer.getMiddleware(staticRoot))` to
place the static server as middleware to handle our incoming requests for files.
When no file matches the the path, the request is passed on to other route
handlers.

Now, it is time to add some CSS to make things a little more eye pleasing. To do
this create a file within the `public` folder that you should have created and
calling this new file `style.css`. In the new `style.css` file place the
following code:

```css
body { background: #f1f1f1; color: #333; }
a { color: red; }
h1 { color: purple; }
```

This should make a noticeable difference to the page.

Next, lets break our header and footer into partials that we can call them more
than once. So, within the `views` folder create a file named `header.html` and
place the following code inside:

```html
<!doctype HTML>
<html lang="eng">
<head>
  <title>Hello World</title>
  <link type="text/css" rel="stylesheet" href="/style.css">
</head>
<body>
```

Of course, now we need a footer, so create `footer.html` in the same `views`
folder and place the following code:

```html
</body>
</html>
```

Great, now we have our header and footer to wrap our documents. Lets go ahead
and upgrade that `index.html` file to reflect the new changes. The contents
of the `index.html` file should now look like this:

```html
{{>header}}
<h1>Hello World</h1>
{{>footer}}
```

Place the code, and the file saved, change to the
terminal of your project root and run the following command.

```
$ node app
```

This command should execute without error. Now, your web server is complete
and serving "Hello World" HTML from [localhost:3000](http://localhost:3000) now
with your partials rendered, and serving the new CSS.

Congratulations! Another stage complete on learning Kado. Now advance to the
[Build an Admin Panel](BuildAdminPanel.md) guide where we explain how to turn
your basic website into a fully working administration panel.
