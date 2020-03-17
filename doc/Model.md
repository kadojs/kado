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

### Class: Model
This is the `Model` class which extends `Mapper`.
