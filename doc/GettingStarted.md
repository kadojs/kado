# Getting Started

Once [Installation](/doc/kado/3.x/installation) has been completed, there are two ways to get started. First, go to [install the demo](/content/install-the-demo) and follow the instructions. Otherwise, create a file named `app.js` and paste the following code:

```js
const K = require('kado');
K.configure({
  db: {
    sequelize: {
      name: 'mysqldb',
      user: 'mysqluser',
      password: 'mysqlpass'
    }
  }
});
K.go('newapp');
```

Replace `mysqldb` with the MySQL database name, `mysqluser` with the MySQL username and `mysqlpass` with the MySQL password.

Next install the sample content.

```
$ node app kado insertsamples
```

Great! You are now ready to run. Simply start the application using `node app.js` and you can access the admin panel on http://localhost:3000 the sample admin user is `sample@kado.org` and the password is `kado`. The main website will then be located at http://localhost:3001

Now that you have a first class web platform all to yourself it is time to explore what Kado has to offer.

* [Guides](/content/guides)
* [Modules](/content/modules)
* [Themes](/content/themes)
* [Templates](/doc/kado/3.x/templates)
* [Database](/doc/kado/3.x/database)
* [Configuration](/doc/kado/3.x/configuration)
* [Kado Reference](/doc/kado/3.x/kado-reference)

Happy Coding!
