# Building A Admin Panel

Building an admin panel 

Now that you have completed the previous 
[Hello World](https://kado.org/guide/hello-world/), 
[Make a Simple Website](https://kado.org/guide/make-simple-website/) and 
[Database Work Flows](https://kado.org/guide/database-work-flow/) guides, 
we will be moving on to building an admin panel.The first step we will be doing
is creating a route folder and within that route folder we will create a 
admin.js folder and you will use the following code: `Admin.js`.
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

The code above uses fs(filesystem) require in order to get the 
(‘kado/lib/FileSystem’) then we use the class function to call the admin object.
Then we use static register to acquire the app. Next we will do const route to 
create a new route for the admin , then using fs.path.join method to create and 
join the path in a string. Lastly we use the _dirname variable to tell us the 
absolute path of the directory containing the executing file, then using 
app.get() for matching and handling a specific route when requested.



Under the code above you’ll be using the following code: `Admin.js`.
```js

index () {
 return (req, res) => {
   console.log(req.session.get('staff'))
   if (!req.session.get('staff')) {
     return res.render('admin/error', { error: 'Must be logged in' })
   }
   req.locals._pageTitle = 'Home'
   res.render('admin/home')
 }
}
```

The above code is for creating an index and in that we use return to get our 
request and response then using console.log to print the log message. Then 
using if(!req.session.get(‘staff’)) { when we successfully get the session we 
will return and render a response 
(‘admin/error’, { error: ‘Must be logged in’ }). On the last two lines the 
pageTitle is set and we render the (‘admin/home’).


You will use the next section of code for the login(): `Admin.js`.
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

We will use login() and by doing so we are creating the login. Under that we 
will return the req and res, then using if(req.body.email) we will get the email
body and next we will set the session so that it's for staff and get back the 
email body and respond the StatusCode 302. The next line we use referer the 
headers is the ‘/admin/’ and then match the referer with the admin and login 
and then get the setHeader(‘location’, referer).



The last part of code we will be using is the logout(): `Admin.js`.
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

This will create the logout feature. The next line of code we route the function
and set the session for staff and its undefined because it has been declared but 
not assigned a value. Then we get the statusCode and that will be 302 and the 
set the header and end it.

Then you will use the following code to represent the current module and exports
as a module: `Admin.js`.
```js

module.exports = Admin
```

Now that we have completed the admin.js we will be creating a Help.js file and 
with in the Help.js file we  will be using the following code: `Help.js`.
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

The code above we use Assert, fs, HelpModel, Module and Route to require and 
connect the listed folder and files. Next we use the class Help extends module 
to create the child class of another class, then we use the constructor() 
function that initializes an object, then using the super class to call the 
constructor to access the parent properties and methods which will be the 
this.app, .name, .title, and .description.

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

The above code we will create a list() and we are doing that because we can use 
this to store multiple pieces of information at once, such as a list of records 
in the database or a list of contents. On the next line we use the return async 
function to create a promise that will be resolved with the returned value. 
Then we use const db to get the database engine and HelpModel is used to obtain 
a list query from the model to pass that query to the database engine, then we 
set the page title with req.locals_pageTitle, then we pass the return values 
from the database to the template for rendering. 


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

Now we will be using the list action method which will be similar to the 
previous code we used. We are now using the list action method and the 
difference is that we are using the delete method and that will use the 
delete query. The next line we are getting the route to the listAction to go to 
the db, query and req.body. The next line we are saying if the variable is 
deleted we get the setHeader response and redirect to (‘/admin/help’).



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
The next line we use create() so that we use the object to set the page title 
and use the create Help article and then render the (‘admin/help/create’).


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

Now we will be using the edit()  in order to edit the db, query and rv. First we
get the database engine. Then we call the query to the HelpModel.byid to get 
the id query, next we execute the database query to a string and an array. The 
next line we have Assert.isType which will get us the array and get the new 
HelpModel value. Lase we rent the (‘admin/help/edit’, { help: help }).


Use the following to create the save(): `Help.js`.
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

The next part of code is the save which pretty much has a lot of the similar 
code except this one will save the route for our db, HelpModel, id, and 
req.body.

The next section of code you will use the following: `Help.js`.
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

With this part of code we have the admin() and that will initiate the app and 
get the database engine and connect the following using the app.get.



Now we will be using the following code for the next section: `Help.js`.
```js
 main (app) {
   // need routes
   app.get('/help/', (req, res) => {
     res.render(fs.path.join(__dirname, '/view/help.html'))
   })
 }
}
```

The code above will have the main(app) and you will use app.get for
(‘/help/’, (req, res)  and render the filesystem and join the path to the 
(_dirname, ‘/view/help/html’)).

Finally the last part of code we have is the last part you will need for the 
same reason as we talked about above: `Help.js`.
```js

Help.HelpModel = HelpModel
Help.Model = Help.HelpModel
module.exports = Help
```



