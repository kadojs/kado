# Views and Rendering

When developing websites it is critical to be able to template HTML so that it
can be loaded with data and sent to the browser. To make this process as easy
as possible on the developer Kado has a View system similar to that used by
the Database system. Also, Kado comes with the Mustache templating system
built-in and easy to activate.

Let's go over some examples for activating the view system first.

We will first assume you have an `app.js` and have at least looked out our
[Hello World](HelloWorld.md) guide, if not take a peek. Next, we take
a look a few lines of code that will activate our view engine.

```js
// add a view engine
const View = require('kado/lib/View')
const viewFolder = fs.path.join(__dirname, 'view')
app.view.addEngine('mustache', new View.ViewMustache(viewFolder))
app.view.activateEngine('mustache')
```

Now, notice we include the `View` Kado library which comes with our
`View.ViewMustache` engine. The engine ties directly into the built in
`Mustache` library. After that, it is a matter of establishing a view
folder, ours is `<project root>/view` and then passing the view system to
the application. Finally, activate the view system, so we can render with it.

Next, let us make a simple template at `view/index.html` and with the following:
```html
<!doctype HTML>
<html lang="en">
<body>
<h1>{{test}}</h1>
</body>
</html>
```

Now, make a route to get to this file from your `app.js` or a Route object.

```js
app.get('/', (req, res) => { res.render('index', { test: 'Hi!' })})
```

This route will send the URI `/` to our method, and then we render the template
`index` with the parameter `{ test: 'Hi!' }`. Provided this works correctly
you will see a large print of `Hi!` on the screen after running your app using.

```
$ node app
```

Make sure and run this command from your project root folder.

To see more details on working with mustache see [Mustache](../Mustache.md).
