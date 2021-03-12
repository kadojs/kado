# Database Work Flows

How to use Databases with Kado.

Welcome to the Database Work Flow guide in guide. I am going to walk you through
the process of connecting to and executing queries against a MySQL database.
This guide will also show you how to work with Kado Data Models and make
querying a breeze.

The first step you will need to do is go to your terminal and install MySQL2.
In order to communicate with the database server directly we must install a
driver to do so. Our guide and basic Database tool set is made for SQL based
systems and we provide a driver engine for MySQL which utilizes the MySQL2
driver that is available from NPM. Before proceeding, we must install the
driver directly into the project with the following command:
`npm install mysql2`

Now that you have completed the
[Hello World](HelloWorld.md) and
[Make a Simple Website](MakeSimpleWebsite.md) guides,
the first thing you will be doing is creating a model folder and in that folder
you will be creating a JavaScript file. For this guide we are going to name the
model file PetModel.js, The following code connects the model and builds the
schema. Then we save the table name using the `const tableName = 'Pet'`. Then we
will create a `fieldList` method and return an object containing all the fields
in our table.

NOTE: In order to keep track of records in a database it is critical to
have an updated and created timestamp that help keep track of records and their
age. Not all Models will need these fields but those Models are rare. For our
purposes we use the `createdAt` and `updatedAt` which are datetime fields
and track record timing. In there you will be using the following code:
`PetModel.js`.
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

Next, you will be creating a new method called `createTable` which will be
static and will return a build Schema object for use creating a table from the
model. Place the following code below the `fieldList` method in your.
`PetModel.js`.
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
updating within your table. `PetModel.js`
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
# config.js

Once you have completed adding the query helper methods. You will want to create
a config folder in your project root and use the following code. I will be
filling out parts of the code to specify what you will need in your code as an
example. You can change the following lines of code to what is needed for your
project names: appTitle, host, user, password, database. Now see the contents of
config.js. `config.js`
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
be local to your machine. The user, the password and database
are set to something simple for our development purposes. For production use a
much stronger password! but for now to get it set up use something small and
what your comfortable with.


Next, you should already have an `app.js` ready and can now add the
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
Add to `app.js`. This code is making a new Kado Database connect system made for
the MYSQL2 driver and then adding to Kado as a database engine named MYSQL.

The next part you will use the following code in your `app.js` under your MYSQL
connection to create a database schema:

`app.cli.command`
```js
app.cli.command('db', 'test', {
  action: () => {
    console.log('Database OK')
    return 1
  }
})
```
You will be creating a database schema with the cli command
(Command line interface application) this also gets you through the application
start up and prints the log message.

The next part of code you will be putting in your `app.js` right under the
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
database and give it a name similar to your project I used (dwf) and go to your
SQL command line and use the following query: `sql QUERY`
```sql
CREATE USER 'dwf'@'localhost' IDENTIFIED BY 'dwf';
```

The code above creates a user in the MYSQL server.

Now proceed to grant the new user permissions on the database with the
following query: `sql QUERY`
```sql
GRANT ALL ON dwf.* to 'dwf'@'localhost';
```

this command will grant the new dwf user ALL(*)
rights on the dwf table. After doing this you should have a fully
privileged MYSQL user for your database.

To see the full code see the:
[project repository](https://git.nullivex.com/Tru4hunnid/databaseworkflowguide.git)

## Query Cache

When working in a display driven environment where the readers massively
outweigh the change frequency in the database, it is prudent to employ
QueryCache on complex queries that make use of JOINS and take extra
database resources.

This works by taking the result of an expensive query, assigning it a
TTL (time to live in seconds) and then storing the result in a
different table or database by key. The advantage here is that we can
quickly look the query up by key and output the parsed data without
exhausting CPU resources recalculating a known result.

It is important not to use Query Cache as a blanket because it can
cause very unpredictable behavior. However, when properly employed
to the high rate queries the Query Cache can significantly improve
site throughput.

Let us take a quick look at how to use Query Cache and interchange
it with existing connections.

Consider the following code which could be a new file called
`cacheTest.js` in your example project:

```js
// include all the external resources
const Application = require('kado')
const cfg = require('./config')
const Database = require('kado/lib/Database')
const PetModel = require('./PetModel')
const QueryCache = require('kado/lib/QueryCache')
// make a new application
const app = Application.getInstance()
// setup a database connection and add it to the app
const mysql = new Database.DatabaseMySQL(cfg.mysql)
app.database.addEngine('mysql', mysql)
// setup a query cache using the database connection and bundled model
const qc = new QueryCache({
  db: mysql,
  model: QueryCache.QueryCacheModel
})
// connect to the database
await app.start()
// make a query
const query = PetModel.byId(1)
// execute normal
const normal = await query.execute(mysql)
// execute against cache
const cached = query.execute(qc)
// output the results
console.log(normal, cached)
```

The most important part of the above code to look at is
where we execute the query. Query Cache works really easily
by reflecting back into your original database driver so it
can be used in place of the driver to easily activate cached
queries or turn the caching off.

Our approach states that caching of queries should be explicit
and placed by developers after thinking of the application flow
and impact of using cache. This helps alleviate a lot of the
common problems due to blanket caching. Best wishes getting
your server load reduced!
