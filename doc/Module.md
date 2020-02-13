# Module

## Introduction

Creating modules is where Kado gets fun and powerful. At first, it can seem a little daunting to build a module. Dont worry, Kado makes module building easy. It all starts with a module generator that will ask questions and then create a working module for you to edit into perfection.

## Module Creation

To create a module first create an app by either [installing the demo](/content/install-the-demo) or by following the [getting-started](/doc/kado/3.x/getting-started) guide. Once complete, issue the following command to start the module generation process.

```
$ node app kado generate
```

This command will read from your defined `app.js` and after doing so will start prompting you for details about your module.

Consider the following output from module generation.

```
nullivex@nullivex-desktop:~/WebstormProjects/kado-web$ node app kado generate
[2018-10-17T04:34:05.962Z 25979-KADO] INFO: Acquiring module info: Title, Name
Title of new module? Tasks
Name of new module? tasks
Name of new module Model? Task
[2018-10-17T04:34:23.482Z 25979-KADO] INFO: Collecting data definitions: Title, Name, Type, AllowNull, Default
Do you want to add module data fields? (y/n): y
Field title? Name
Field name? name
Field type? STRING
Allow NULL? (y/n): n
Default value? 
Add another field? (y/n): y
Field title? Description
Field name? description
Field type? STRING
Allow NULL? (y/n): y
Default value? 
Add another field? (y/n): n
[2018-10-17T04:35:02.320Z 25979-KADO] INFO: Creating module folder
[2018-10-17T04:35:02.351Z 25979-KADO] INFO: Rendering tasks/kado.js
[2018-10-17T04:35:02.369Z 25979-KADO] INFO: Rendering tasks/bin/Task.js
[2018-10-17T04:35:02.382Z 25979-KADO] INFO: Rendering tasks/models/Task.js
[2018-10-17T04:35:02.389Z 25979-KADO] INFO: Rendering tasks/lang/eng.js
[2018-10-17T04:35:02.392Z 25979-KADO] INFO: Rendering tasks/lang/spa.js
[2018-10-17T04:35:02.394Z 25979-KADO] INFO: Rendering tasks/admin/index.js
[2018-10-17T04:35:02.400Z 25979-KADO] INFO: Rendering tasks/admin/view/create.html
[2018-10-17T04:35:02.412Z 25979-KADO] INFO: Rendering tasks/admin/view/list.html
[2018-10-17T04:35:02.414Z 25979-KADO] INFO: Rendering tasks/admin/view/edit.html
[2018-10-17T04:35:02.416Z 25979-KADO] INFO: Rendering tasks/main/index.js
[2018-10-17T04:35:02.419Z 25979-KADO] INFO: Rendering tasks/main/view/entry.html
[2018-10-17T04:35:02.420Z 25979-KADO] INFO: Rendering tasks/main/view/list.html
[2018-10-17T04:35:02.422Z 25979-KADO] INFO: Created 12 new files!
[2018-10-17T04:35:02.422Z 25979-KADO] INFO: Module generation complete! Please check: /home/nullivex/WebstormProjects/kado-web/kado_modules/tasks
```

In the above example, we created a module named tasks and titled Tasks. Titles are important because they are used in hyper links and page headings where names are used for files, variables and other development related references.

Next, we named the model Task. Notice there is no pluralization here as Sequelize will automatically pluralize the model name for us.

After defining the Title, Name, and Model Name the generator asks if we would like to add data fields to the model. This portion of the generator is limited to simple field definitions. So, if, for example, your model had a complex data set or you already had a model, it would be safe to skip this step. In our instance we go ahead and define the simple data fields.

* Field Title - Similar to the title of the module for link, form and page headings.
* Field Name - Typically lower case version of the title with spaces hyphenated (-).
* Field Type - Sequelize data type see [Data Types](http://docs.sequelizejs.com/variable/index.html#static-variable-DataTypes)
* Allow NULL - Answer to whether or not SQL to allow the field to save as NULL, commonly answered yes unless the data is required
* Default Value - When the field is blank provide a default value, (no answer will place NULL)

After the field definition the generator will ask to repeat the process for as many fields as required. When no more fields are required, simply answer no and the generator will complete and generate the module code.

## Module Development

Notice a list of files that are created is then printed. It is a good idea to go and review each one of these files to make sure they were generated as intended. If you have no idea what a module should look like we prefer the [blog module](https://github.com/KadoOrg/kado/tree/master/kado_modules/blog) be used as a reference. Pay special attention to the model as for the very least indexes are typically needed to make a model functional.

Once the model is finished being prepared the structures must be installed into the database. This is done by performing the following command.

```
$ node app kado dbsetup
```

The `dbsetup` command can be used multiple times and will NOT harm a database. It will add tables that do not exist, add indexes that do not exist. Furthermore, deltas must be performed which can be automated using [Sequelize Migrations](http://docs.sequelizejs.com/manual/tutorial/migrations.html) or manually by generating `SQL` files. During the initial development process it is generally easier to drop the existing table(s) related to the module and then run the above `dbsetup` command again. See [DROP TABLE](https://www.w3schools.com/sql/sql_drop_table.asp) to remove your table from the database for recreation.

## Module Structure

Using the file list from above we will now annotate the structure of a module.

| File | Purpose |
| ---- | ------- |
| tasks/kado.js | Module entry point, Kado actually scans for this file name as a token indicating existing of a Kado Module. |
| tasks/bin/task.js | The generator produces a small administrative CLI tool to manage the Model defined in the module. |
| tasks/models/Task.js | This is the module Model see [Model Definition](http://docs.sequelizejs.com/manual/tutorial/models-definition.html) for more information. |
| tasks/lang/eng.js | English language pack for generated module. |
| tasks/lang/spa.js | Spanish language pack for generated module. |
| tasks/admin/index.js | Actual routes used to answer Admin Interface requests. |
| tasks/admin/view/create.html | View to create a new item. |
| tasks/admin/view/list.html | View to list the items stored in the module. |
| tasks/admin/view/edit.html | View to edit an item (primary form). |
| tasks/main/index.js | Actual routes used to answer Main Interface requests. |
| tasks/main/view/entry.html | View an item on the Main Interface. |
| tasks/main/view/list.html | View to list items on the Main Interface. |

## Publishing Modules

We here at Kado encourage anyone create modules and we make it easy to share those modules with the Kado community. As far as guidelines go, it is best to name the module completely based on purpose and NOT use the word `kado` within the module name. We reserve `kado-<name>` for official modules.

Modules should consist of a package.json defining the module including the license. Inlcude the license within the module and then a `kado_modules` folder containing the module itself. Tests should be inlcuded and can be setup by creating a `test.js` similar to the [kado test.js](https://github.com/KadoOrg/kado/blob/master/test.js). To perfom test we use Mocha and Chai to run and assert. Again [see the Kado test suite](https://github.com/KadoOrg/kado/tree/master/test) for an example on how to test modules.

If you would like, you can publish your module on [NPM](https://npmjs.com) which will allow the community to use your module for free, please make sure your license is compatible with LGPLv3 prior to doing so. Otheriwse, you can have Kado list your module directly on our website, simply [contact us](/content/contact) and we will review your module for listing.
