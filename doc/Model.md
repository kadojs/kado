# Model
*Introduced in 4.2.0*
> Stability: 1 - Experimental
```js
const Model = require('kado/lib/Model')
```
The `Model` is a super class made for building new data models used for
interacting with data sets produced by data queries.

By default the `Model` class is a dry extension of the `Mapper` library provides
the data access and writing methods needed for a data model. Specific methods
should be then added to the model. Queries shall be `static` while operations on
a record should be `methods` of the model.

Example Model
```js
const Model = require('kado/lib/Model')
class MyModel extends Model {
  static getData () { return [{ test: 'test' }] }
  print () { console.log(`${this.test} is working`)}
}
```

## Class: Model
This is the `Model` class which extends `Mapper`.

### static Model.assertDate(date, msg = 'Invalid date')
* `date` {Date|string) the date to test against
* `msg` {string} message to print on failure
* Return {void}
Throws an error on assertion failure otherwise.

### static Model.assertEmail(email, msg = 'Invalid email')
* `email` {string) the email to test against
* `msg` {string} message to print on failure
* Return {void}
Throws an error on assertion failure otherwise.

### static Model.assertId(id, msg = 'Invalid id')
* `id` {Hex|Number|string) the id to test against
* `msg` {string} message to print on failure
* Return {void}
Throws an error on assertion failure otherwise.

### static Model.byIdQuery(table, id, fields, idField)
* `table` {string} literal name of the table to select from
* `id` {string|number} the id of the record to be selected
* `fields` {array|null} a list of fields to select default is null or `*`
* `idField` {string|undefined} if the field is called something other than `id`
it should be passed here.
* Return {QuerySQL} query ready for use with database driver.

### static Model.deleteQuery(table)
* `table` {string} literal name of the table to delete from
* Return {QuerySQL} query ready for predicates and execution.

### static Model.fieldBoolean (defaultValue = false)
* `defaultValue` {boolean} the default setting of the boolean field
* Return {Object} field settings

### static Model.fieldDate (nullable = false, writable = true, defaultValue)
* `nullable` {boolean} set the field ability to be saved as NULL
* `writable` {boolean} when false removes the field from automatic field lists
* `defaultValue` {String|null} default value for the field
  for write queries,
* Return {Object} field settings

### static Model.fieldNumber (defaultValue = '0', signed = true, nullable=false, length)
* `defaultValue` {String|null} the default value of the field
* `signed` {boolean} Set the fields signed status (`true` to allow negative numbers)
* `nullable` {boolean} Set to `true` to allow NULL values
* `length` {Number} Set this to change the length of the field
* Return {Object} field settings

### static Model.fieldPositiveNumber (defaultValue = '0', nullable = false, length)
* `defaultValue` {String|null} the default value of the field
* `nullable` {boolean} Set to `true` to allow NULL values
* `length` {Number} Set this to change the length of the field
* Return {Object} field settings

This always returns an unsigned field.

### static Model.fieldPrimary (autoIncrement = true, nullable = true)
* `autoIncrement` {boolean} when set false the primary key must be set manually.
* `nullable` {boolean} allow the field to be set null (useful with foreign keys)
* Return {Object} field settings

### static Model.fieldString (defaultValue = null, nullable = true, length)
* `defaultValue` {String|null} the default value of the string
* `nullable` {boolean} set `true` to allow NULL values
* `length` {Number} set to change the value of the field length
* Return {Object} field settings

### static Model.fieldText (defaultValue = '', nullable = false)
* Return {Object} field settings


### static Model.filterFields(fields, options)
* `fields` {object} fieldList defined in model
* `options` {object} what fields to filter from the list

Available Options
* `insert` {boolean} when false fields with insert set to `false` are skipped
* `writable` {boolean} when false fields with writable set to `false` are skipped

### static Model.insertQuery(table, fields)
* `table` {string} literal name of the table to delete from
* `fields`{array} list of fields to insert

### static Model.listQuery(table)
* `table` {string} literal name of the table to delete from

### static async Model.save(Model, db, id, fields, data)
* `Model` {Model} instance of a model to use for saving
* `db` {MySQL2} database connection
* `id` {number|string} id of the record, can be null for new
* `fields` {array} list of fields to insert
* `data` {object} containing fieldNames and values
* `idField` {string} if the primary key is not `id` pass the name here
* Return {Promise} that is resolved with id of the record inserted or updated

This method is used to save records to the database, it will handle updating
records that already exist or creating records that dont exist. This is useful
when creating administration functions that need to create / edit records.

### static Model.searchQuery(table, phrase, fields)
* `table` {string} literal name of the table to delete from
* `phrase` {string} the search phrase
* `fields` {array} list of fields to select
* Return {QuerySQL} search query ready for predicates and execution

### static Model.updateQuery(table, fields)
* `table` {string} literal name of the table to delete from
* `fields` {array} list of fields to update
* Return {QuerySQL} query needing values set and predicates added, then
execution.
