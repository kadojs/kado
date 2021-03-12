# Building An Admin Panel


Now that you have completed the previous
[Hello World](HelloWorld.md),
[Make a Simple Website](MakeSimpleWebsite.md) and
[Database Work Flows](DatabaseWorkFlow.md) guides. It is
important to note that all the guides combine together into a single project
we will be moving on to building an admin panel. The first step we will be doing
is creating a route folder and within that route folder we will create a
`Admin.js` file and you will use the following code: `Admin.js`.
```js

'use strict'
const fs = require('kado/lib/FileSystem')
class Admin {
 static register (app) {
   const route = new Admin(fs.path.join(__dirname, '../view/admin'))
   app.get('/admin/', route.index())
   app.get('/admin/login/', route.login())
   app.post('/admin/login/', route.login())
   app.get('/admin/logout/', route.logout())
 }
```

The code above uses `fs(filesystem)` require in order to get the
`(‘kado/lib/FileSystem’)` then we use the class function to call the admin
object. Then we make a static method named register to be called when routes
should be placed into the application. The next line
`const route = new Admin(fs.path.join(__dirname, '../view/admin'))` makes an
instance of our route object, then placing `fs.path.join` method to create and
join the path in a string. Lastly, we use the `_dirname` variable to tell us the
absolute path of the directory containing the executing file. then using
`app.get` for matching and handling a specific route when requested.

Now we will place a homepage route by adding additional code to Admin.js:
`Admin.js`.
```js

index () {
 return (req, res) => {
   if (!req.session.get('staff')) {
     return res.render('admin/error', { error: 'Must be logged in' })
   }
   req.locals._pageTitle = 'Home'
   res.render('admin/home')
 }
}
```

The above code is for creating an index and in that we use return to get our
request and response. Then using `if(!req.session.get(‘staff’)) {` we can send
the user to an error page saying they are not logged in successfully get the
session we will return and render a response
`(‘admin/error’, { error: ‘Must be logged in’ })`. On the last two lines the
`pageTitle` is set and we render the page using `res.render(‘admin/home’)`.


Next, we will add a login method to handle displaying and authenticating staff
members. Adding on to Admin.js: `Admin.js`.
```js

login () {
 return (req, res) => {
   if (req.body.email) {
     req.session.set('staff', { email: req.body.email })
     res.statusCode = 302
     let referer = req.headers.referer || '/admin/'
     if (referer.match(/\/admin\/login\/$/)) referer = '/admin/'
     res.setHeader('Location', referer)
     return res.end()
   }
   req.locals._pageTitle = 'Login'
   res.render('admin/login')
 }
}
```

Above, we make the login method which will display a login page or test a staff
members authentication. Depending on whether or not `req.body.email` is present
we will check for the staff members login to be valid. When `req.body.email` is
present, we test authentication and if valid create a session, otherwise
display a login page for the staff member to input authentication details.
Upon a successful login we redirect the user to where they previously came
from in case they were hot linked into the application.


Finally place this section of code to handle staff logging out of the system:
`Admin.js`.
```js

 logout () {
   return (req, res) => {
     req.session.set('staff', undefined)
     res.statusCode = 302
     res.setHeader('Location', '/admin/login/')
     return res.end()
   }
 }
}
```

The above code will create the logout route to clear staff sessions. Setting the
staff session to undefined makes it appear as if it never existed. After doing
so, we set the status code to 302 and redirect the user back to the login page
by setting the Location header to `/admin/login/`.

Then you will use the following code to represent the current module and exports
as a module: `Admin.js`.
```js
module.exports = Admin
```

Now that we have completed the admin.js we will be creating a `Help.js` file
and with in the Help.js file we  will be using the following code: `Help.js`.
```js

'use strict'
const Assert = require('kado/lib/Assert')
const fs = require('kado/lib/FileSystem')
const HelpModel = require('../model/HelpModel')
const Module = require('kado/lib/Module')
const Route = require('../lib/Route')
class Help extends Module {
 constructor () {
   super()
   this.app = null
   this.name = 'help'
   this.title = 'Help'
   this.description = 'Manage help articles'
 }
```

The code above we use `Assert`, `fs`, `HelpModel`, Module and Route to require
and connect the listed folder and files. Next we use the class Help extends
module to create the child class of another class, then we use the
`constructor()` function that initializes our object, then using the super
class to call the constructor to access the parent properties and methods which
will be the `this.app`, `.name`, `.title`, and `.description`.

The next section of code we will use the following: `Help.js`.
```js
list () {
 return async (req, res) => {
   const db = this.db.getEngine()
   const query = HelpModel.list()
   const rv = await Route.listRoute(db, query)
   req.locals._pagetitle = 'List Help Articles'
   res.render('admin/help/list', { rows: rv[0], fields: rv[1] })
 }
}
```

The above code creates a list method to show all our Help articles in a list.
To do so it makes a query to the database using the modules list method and our
included listRoute helper method from Route. Next, we set the page title and
finally render the page passing our database return values to the template.


Use the following for the the next section of code: `Help.js`.
```js
listAction () {
 return async (req, res) => {
   const db = this.db.getEngine()
   const query = HelpModel.delete()
   const rv = await Route.listActionRoute(db, query, req.body)
   if (rv.deleted) res.setHeader('X-Deleted', rv.deleted)
   res.redirect('/admin/help/')
 }
}
```

The above code adds the edit method which retrieves our Help article from the
database and then displays a form where the staff member can edit the content.
Assert.isType ensures that the database returned an appropriate response.
Finally, we render the `admin/help/edit` template by passing the instance of the
`HelpModel`.


Moving on to the next section of code you will be using is the following:
`Help.js`.
```js

create () {
 return (req, res) => {
   req.locals._pagetitle = 'Create Help Article'
   res.render('admin/help/create')
 }
}
```
The next line we use `create()` so that we use the object to set the page title
and use the create Help article and then render the `(‘admin/help/create’)`.


Under the above code you will now be using the following: `Help.js`.
```js

edit () {
 return async (req, res) => {
   const db = this.db.getEngine()
   const query = HelpModel.byId(req.query.get('id'))
   const rv = await db.execute(query.toString(), query.toArray())
   Assert.isType('Array', rv[0])
   const help = new HelpModel(rv[0].shift())
   res.render('admin/help/edit', { help: help })
 }
}
```

Now we will be using the `edit()`  in order to edit the db, query and rv. First
we get the database engine. Then we call the query to the `HelpModel.byid` to
get the id query, next we execute the database query to a string and an array.
The next line we have `Assert.isType` which will get us the array and get the
new `HelpModel` value. Lase we rent the `(‘admin/help/edit’, { help: help })`.


Use the following to create the `save()`: `Help.js`.
```js

save () {
 return async (req, res) => {
   const db = this.db.getEngine()
   const id = req.body.id || 0
   await Route.saveRoute(db, HelpModel, id, req.body)
   res.redirect('/admin/help/')
 }
}
```

The save method will allow you to save the changes made on the create or edit
form into the database. This is done by passing the contents of `req.body` to
the `Route.saveRoute` method which handles inserting or updating the database
record. The next section of code you will use the following: `Help.js`.
```js

admin (app) {
 this.app = app
 this.db = this.app.database.getEngine('mysql')
 app.get('/admin/help/', this.list())
 app.get('/admin/help/create/', this.create())
 app.get('/admin/help/edit/', this.edit())
 app.post('/admin/help/', this.listAction())
 app.post('/admin/help/save/', this.save())
}
```
Here we register the admin panel routes that are available.


Now we will be using the following code for the next section: `Help.js`.
```js

 main (app) {
   app.get('/help/', (req, res) => {
     res.render(fs.path.join(__dirname, '/view/help.html'))
   })
 }
}
```
This portion of the module registers the Help routes that into the main
interface.

The final portion of code exports our module objects so they can be used to
register into the application. `Help.js`.
```js

Help.HelpModel = HelpModel
Help.Model = Help.HelpModel
module.exports = Help
```
