# Database Work Flows

How to use Databases with Kado.

Assuming that you have followed the previous guides, you will now be learning 
how to setup a database.

The first step you will need to do is go to your terminal and install MySQL2.
In order to communicate with the database server directly we must install a 
driver to do so. Our guide and basic Database tool set is made for SQL based 
systems and we provide a driver engine for MySQL which utilizes the MySQL2 
driver that is available from NPM. Before proceeding, we must install the 
driver directly into the project with the following command:
`npm install mysql2` 

Now that you have completed the 
[Hello World](https://kado.org/guide/hello-world/) and 
[Make a Simple Website](https://kado.org/guide/make-simple-website/) guides, 
the first thing you will be doing is creating a model folder and in that folder 
you will be creating a file .js. For this guide we are going to name the model 
file PetModel.js, The following code connects the model and schema then we give 
the table its name using the const tableName then we will use id: to fill 
out the rest of the model giving the table details. In order to keep track of 
records in a database it is critical to have an updated and created timestamp 
that help keep track of records and their age. Not all Models will need these 
fields but those Models are rare. For our purposes we use the standard createdAt
and updatedAt which are datetime fields and track record timing. In there you 
will be using the following code: `PetModel.js`.
```js
'use strict'
const Model = require('kado/lib/Model')
const Schema = require('kado/lib/Schema')
const tableName = 'Pet'
class PetModel extends Model {
  static fieldList () {
    return {
      id: {
        type: 'INT',
        length: '11',
        nullable: false,
        signed: false,
        autoIncrement: true
      },
      name: { nullable: false },
      type: {},
      breed: {},
      color: {},
      weight: {},
      height: {},
      length: {},
      createdAt: { type: 'datetime', nullable: false, writable: false },
      updatedAt: { type: 'datetime', nullable: false }
    }
  }
```

## Create Table

The next part you will be using is the static createTable which will call 
your table name, also using the fields as a part to call on your fields list. 
The rest of the code is filled out so that you can call the rest of your 
code and return the table. `PetModel.js`
```js
  static createTable () {
    const table = Schema.SQL.create(tableName)
    const fields = PetModel.fieldList()
    for (const name in fields) {
      if (!Object.prototype.hasOwnProperty.call(fields, name)) continue
      table.field(name, fields[name])
    }
    table.primary('id')
    table.index('name_unique', ['name'], { unique: true })
    table.index('createdAt_index', ['createdAt'])
    table.index('updatedAt_index', ['updatedAt'])
    return table
  }
```
In this section of the code you will be using it for inserting, searching and 
updating within your database. `PetModel.js`
```js
static insert (fields) { 
 if (fields === null) { 
    fields = Model.filterFields(PetModel.fieldList(), { insert: false })
 } 
 return Model.insertQuery(tableName, fields) 
 }

  static insert (fields) {
    if (fields === null) {
      fields = Model.filterFields(PetModel.fieldList(), { insert: false })
    }
    return Model.insertQuery(tableName, fields)
  }

  static search (phrase, fields) {
    return Model.searchQuery(tableName, phrase, fields)
  }

  static update (fields) {
    if (fields === null) {
      fields = Model.filterFields(PetModel.fieldList(), { writable: false })
    }
    return Model.updateQuery(tableName, fields)
  }

  static list () { return Model.listQuery(tableName) }
  static byId (id) { return Model.byIdQuery(tableName, 'id', id) }
  static delete () { return Model.deleteQuery(tableName) }
}
module.exports = PetModel
```
config.js Now that you have done that you will want to create a config folder in
your project root and use the following code. I will be filling out parts of 
the code to specify what you will need in your code as an example. 
You can change the following lines of code to what is needed for your 
project names: appTitle, host, user, password, database. `config.js`
```js
'use strict'
const cfg = {
  appTitle: 'DatabaseWorkFlow',
  main: {
    host: null,
    cookieSecret: null,
    trustProxy: true
  },
  mysql: {
    host: 'localhost',
    user: 'dwf',
    password: 'dwf',
    database: 'dwf'
  }
}
module.exports = cfg
```

By adding these lines of code you are telling your database that the host will
be local to the local host on your website. The user, the password and database 
are set to something simple depending on if this is public or not but for now 
to get it set up use something small and what your comfortable with.


Next, you should already have an app.js ready and can now add the 
following code: `app.js`.
```js 
const Database = require('kado/lib/Database')
```

This will require your kado database source.

This will be the code you use for your MySQL connection: `app.js`.
```js
const mysql = new Database.MySQL(cfg.mysql) 
app.database.addEngine('mysql', mysql)
```
This code is making a new Kado Database connect system made for the mysql2 
driver and then adding to Kado as a database engine named mysql.

The next part you will use the following code in your app.js under your mysql 
connection to create a database schema: 

`app.cli.command`
```js
app.cli.command('db', 'test', {
  action: () => {
    console.log('hi!')
    return 1
  }
})
```
You will be creating a database schema with the cli command
(Command line interface application) this also gets you through the application 
start up and prints the log message.

The next part of code you will be putting in your app.js right under the 
database schema will be this section. This part of the code will be the code 
that draws a connection to your mysql connection. 

`app.cli.command`
```js
app.cli.command('db', 'init', {
  action: (opts) => {
    const db = app.database.getEngine('mysql').getEngine()
```
The last section of your code you will put in your app.js is the following, 
this line of code will load your models.

`app.cli.command`
```js
    const models = [
      require('./model/PetModel')
    ]
    const promises = []
    models.forEach((model) => {
      if (opts.name && model.name !== opts.name) return
      const query = model.createTable()
      promises.push(db.execute(query.toString(), query.toArray()))
    })
    return Promise.all(promises)
      .then((result) => {
        console.log('Table creation complete! ' +
          `Created ${result.length} model(s).`)
        return result.length
      })
  }
})
```

Now that you have finished the following steps above you will open your 
preferred web browser and go to your MySQL connection interface and create a 
database and give it a name similar to your project i used (dwf) and go to your
SQL and use the following code: 

CREATE USER 'dwf'@'localhost' IDENTIFIED BY 'dwf'; 

This code creates a user in the mysql database.

The next code that you will put under that code will be the following: 
GRANT ALL ON dwf.* to 'dwf'@'localhost'; 

this command will grant the new dwf user ALL(*) 
rights on the dwf table. After doing this you should have a fully 
functioning new database.

To see the project repository click link:
[https://git.nullivex.com/Tru4hunnid/databaseworkflowguide.git]
