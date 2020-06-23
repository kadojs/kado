# Schema
*Introduced in 4.2.0*
> Stability: 1 - Experimental
```js
const Schema = require('kado/lib/Schema')
```
The `Schema` class implements a super class for constructing schema builders that
are customized for a specific schema language.

## Class: Schema extends Query

For usage of the `Query` library, see the [Query](Query.md) documentation.

## Class: SchemaSQL

### static SchemaSQL.create(tableName)
* `tableName` {string} name of the table to work with a schema on.
* Return {SchemaSQL} a new instance of the SchemaSQL builder.

### static SchemaSQL.alter(tableName)
* `tableName` {string} name of the table to work with a schema on.
* Return {SchemaSQL} a new instance of the SchemaSQL builder.

### SchemaSQL.constructor(tableName)
* `tableName` {string} name of the table to work with a schema on.
* Return {SchemaSQL} a new instance of the SchemaSQL builder.

### SchemaSQL.alterTable(options)
* `options` {object} options to control table alterations
* Return {SchemaSQL} this instance

### SchemaSQL.createTable(options)
* `options` {object} options to control table creation
* Return {SchemaSQL} this instance

### SchemaSQL.field(name, options)
* `name` {string} name of the new field.
* `options` {Object|string} an object with field options, or a string containing
only the field type.
* Return {SchemaSQL} this instance

Available Options:
* `type` {string} type of the field
* `length` {string|number} length of the field
* `signed` {boolean} set to `false` for `UNSIGNED` integers
* `nullable` {boolean} set to `false` for `NOT NULL` fields
* `default` {string|null} define the default value of the field
* `autoIncrement` {boolean} set to `true` to add the `AUTO_INCREMENT` flag

### SchemaSQL.index(name, fields, options)
* `name` {string} name of the new index
* `fields` {Array} an array of fields to contain in the index
* `options` {Object} containing index options
* Return {SchemaSQL} this instance

Available Options:
* `unique` {boolean} set to `TRUE` to have a `UNIQUE KEY`

### SchemaSQL.foreignKey(name, table, columns, reference, options)
* `name` {string} name of the new foreign key relation
* `table` {string} table name to reference columns in
* `columns` {Array} an array of columns to be referenced
* `reference` {Array} an array of columns that are referenced by `columns`
* `options` {Object} containing foreign key options
* Return {SchemaSQL} this instance

Available Options:
* `onUpdate` {string} set to `cascade` to have a cascading update key
* `onDelete` {string} set to `cascade` to have a cascading deletion key

Other values may include: `SET NULL`, `RESTRICT`

### SchemaSQL.primary(fieldName)
* `fieldName` {string} the field to define as the primary key.
* Return {SchemaSQL} this instance

### SchemaSQL.toArray()
* Return {Array} containing three entries, the first being an Array of fields,
 the second being an array of indexes and finally the primary key.

### SchemaSQL.toString()
* Return {string} the complete query ready for execution.
