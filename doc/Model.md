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

### static Model.byIdQuery(table, id, fields, idField)
* `table`
* `id`
* `fields`
* `idField`

### static Model.deleteQuery(table)
* `table`

### static Model.filterFields(fields, options)
* `fields`
* `options`

### static Model.insertQuery(table, fields)
* `table`
* `fields`

### static Model.listQuery(table)
* `table`

### static async Model.save(db, Model, id, fields, data)
* `db`
* `Model`
* `id`
* `fields`
* `data`
* `idField`

### static Model.searchQuery(table, phrase, fields)
* `table`
* `phrase`
* `fields`

### static Model.updateQuery(table, fields)
* `table`
* `fields`
