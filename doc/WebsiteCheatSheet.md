# Website Cheat Sheet

This document will help get a website up and running with the least amount of explanation possible. Therefore this is a great reference to start new projects.

## Create the Project

Github will be the code repository.
* Create the repository.
* Check out the repository into a project.

To check a project out, you can use an editor or clone the repository.

## Initialize NPM

First we need a package.json then we can create a new project.

You may either use `npm init` and answer the questions or copy and paste the file below and change the proper values.

```json
{
  "name": "[PROJECT NAME]",
  "version": "1.0.0",
  "description": "[PROJECT DESCRIPTION]",
  "main": "app.js",
  "scripts": {
    "test": "node app test"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/[GITHUB USERNAME]/[PROJECT NAME].git"
  },
  "keywords": [
    "[PROJECT NAME]"
  ],
  "author": "[YOUR NAME] <[YOUR EMAIL]>",
  "license": "UNLICENSED",
  "bugs": {
    "url": "https://github.com/[GITHUB USERNAME]/[PROJECT NAME]/issues"
  },
  "homepage": "https://github.com/[GITHUB USERNAME]/[PROJECT NAME]#readme"
}
```

The variables needed are
* [PROJECT NAME] - This is the name of your project and usually matches the repostiory name.
* [PROJECT DESCRIPTION] - Description of the project
* [PROJECT FOLDER] - We will use this later to configure the project.
* [GITHUB USERNAME] - Your username on github or the owner of the repostiory.
* [YOUR NAME] - For author purposes Your Name.
* [YOUR EMAIL] - Again for author purposes, Your Email Address.

You can also change UNLICENSED for the "license" variable.  This is perfect for private projects that are not published.

## Install Kado

Great!  So that painful step is over with and honestly its the hardest part. Now it is time to install Kado.

```
npm install kado --save
```

Once this completes you will have a working Kado installation.

Next, configure the Kado Web application.

## Create app.js

Configuring Kado is done through `app.js`, which can technically be any name but this name works well for our purposes. To create this file without much hassle, use the following command:

For Unix/Linux
```
cd [PROJECT FOLDER]
node ./node_modules/kado/kado_modules/kado/bin/util.js bootstrap
```

For Windows
```
cd [PROJECT FOLDER]
node .\node_modules\kado\kado_modules\kado\bin\util.js bootstrap
```

Once this command is complete, the output will read:
```
[TIMESTAMP KADO] INFO: Application is ready!
```

## Create a Database

In order for Kado to save information, it will need a MySQL compatible database to utilize. Here are some short notes on how to create a database.

Make sure to create and write down the following variables:
* [PROJECT NAME] - Your project name filtered of MySQL-confounding special characters such as "`-`" which do not work well in Database names
* [MYSQL PASSWORD] - The mysql password used to create the database user.

```
$ mysql
> create database [PROJECT NAME]
> grant all on [PROJECT NAME].* to '[PROJECT NAME]'@'localhost' identified by '[MYSQL PASSWORD]';
> exit;
```

Now, to make sure the application can connect to the database the `app.js` file will need to be updated.

Open the `app.js` file and locate the section titled `sequelize`. Add the following items to it:

* user - Database User Name, which matches our project name
* password - [MYSQL PASSWORD] we recorded from earlier
* name - [PROJECT NAME] which matches the user.

### Initialize Database

Once the app.js has been adjusted, it will know how to connect to the database. Next, write the basic structure so that queries will work on the database. Thanks to Kado, this is a one part command!

```
node app kado dbsetup
```

This should be run from your [PROJECT FOLDER] 

The output should look like this:

```
[TIMESTAMP PID-KADO] INFO: Connecting to sequelize
[TIMESTAMP PID-KADO] INFO: Database connected, initializing...
[TIMESTAMP PID-KADO] INFO: Database setup complete, run this again any time
```

## Create a Staff Account

Now you need access to start using the Web interface within Kado. In order to do so, you need to create an admin account. Again this is a simple one line command.

```
node app staff create -e [YOUR EMAIL] -n "[YOUR NAME]" -p changeme
```

This will create an account with your e-mail address and name, the password will be **changeme** which means that you should change this password as soon as you login to the admin panel.

**NOTE** do not input real passwords through the CLI, this can be dangerous!!!

Now you should see output like this:

```
[TIMESTAMP PID-KADO] INFO: Creating staff member
[TIMESTAMP PID-KADO] INFO: Staff member created!
```

## Start Kado

Before we start Kado there is one last change to make to `app.js`. Open the file.  At the bottom of the file, change **myapp** to [PROJECT NAME].

Wow, thats a lot.  It is finally time to get the application started! Lets get it going.

```
node app
```

This will start Kado and the output should look like this

```
[TIMESTAMP PID-KADO] INFO: Starting admin
[TIMESTAMP PID-KADO] INFO: Starting main
[TIMESTAMP PID-KADO] INFO: Startup complete
[TIMESTAMP PID-KADO] INFO: [PROJECT NAME] started!
```

To access the application, use the following URLs:

* Admin Panel - [http://localhost:3000](http://localhost:3000)
* Main Panel - [http://localhost:3001](http://localhost:3001)

There is always more to do but this is a minimum configuration just to get started. Here are some other instructional pages to check out:

* Configuration - [https://kado.org/doc/kado/3.x/configuration](https://kado.org/doc/kado/3.x/configuration)
* Template Variables - [https://kado.org/doc/kado/3.x/templates](https://kado.org/doc/kado/3.x/templates)
* Module Guide - [https://kado.org/doc/kado/3.x/module-guide](https://kado.org/doc/kado/3.x/module-guide)
