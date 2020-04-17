# Query
*Introduced in 4.2.0*
> Stability: 1 - Experimental
```js
const Query = require('kado/lib/Query')
```
The `Query` class implements a super class for constructing query builders that
are customized for a specific query language.

## Class: Query

### static Query.addBase(table, selection, construct, tableConstruct)
* `table` {string} name of the table to query against
* `selection` {string} the fields to select from the table
* `construct` {string} the wording used to construct the query such as `SELECT`
* `tableConstruct` {string} the wording used to identify a table such as `FROM`
* Return {string} containing a suitable base query. Such as `SELECT * FROM x`

### static Query.addComparison(context, construct, item, operator, value, joiner)
* `context` {string|null} the existing comparison operators for this condition
* `construct` {string} the wording used to start the condition such as `WHERE`
* `item` {string} the name of the field to compare against
* `operator` {string} the operator to be used to compare the values
* `value` {string} a `?` or `:label` to use to identify the value, this method
only works on prepared statements.
* `joiner` {string} that denotes how to join multiple comparison operators
together.
* Return {string} a complete comparison string including the construct and all
available parameters based on the context.

### static Query.addLimit(construct, start, limit)
* `construct` {string} the wording used to start the limit such as `LIMIT`
* `start` {number} the starting index
* `limit` {number} the limit on rows to return (when omitted, `start`
becomes `limit`)
* Return {string} a new limit statement to be appended to the query.

### static Query.addOrder(context, construct, by, direction, joiner)
* `context` {string} the existing order conditions already saved
* `construct` {string} the wording used to start the order clause such
as `ORDER BY`
* `by` {string|Array} an array of sort conditions or a field name to sort by,
multiples such as: `[['fieldOne', 'DESC'], 'fieldTwo', ['fieldThree', 'ASC']]`.
Where each entry can either be an Array containing a field name and direction or
it can be a {string} that contains only a field name, in which case, the
direction is assumed to be Ascending or ASC.
* `direction` {string} the direction of the sort `ASC` for Ascending or `DESC`
for Descending.
* `joiner` {string} the separator that denotes multiple order conditions the
default is a comma `,`.
* Return {string} a complete order clause with included conditions that were
saved to the `context` parameter.

### static Query.addJoin(query, direction)
* `query` {Query} A complete Query object that implements a `to<Direction>Join`
method eg: `Query.toLeftJoin()`
* `direction` {string} The direction of the join such as
`LEFT, RIGHT, INNER, OUTER, UNION`
* Return {string} a complete join clause that can be appended to a base Query.

### static Query.printJoin(table, condition, construct)
* `table` {string} the name of the table to join
* `condition` {string} the complete conditional statement for the join
* `construct` {string} the wording used to prefix the join such as `LEFT`
* Return {string} a ready to save join statement save for passing from
`to<Direction>Join`

### static Query.print(base, join, where, order, limit)
* `base` {string} the base query usually made from a select, or delete method.
* `join` {string} an optional join statement or collection of join statements
which have already been joined together
* `where` {string} the conditional statement to identify rows
* `order` {string} an optional order statement to sort results
* `limit` {string} an optional limit to reduce the number of results
* Return {string} a complete ready to execute query.

### Query.constructor(tableName)
* `tableName` {string} the table name to work against.
* Return {Query} a new Query instance.

### Query.toString()
* Return {string} of the fully constructed query ready for execution.

## Class: QuerySQL

### QuerySQL.constructor()
* Return {QuerySQL} a new instance of the QuerySQL builder.

### QuerySQL.on(item, operator, value, joiner)
* `item` {string} the field name to compare against.
* `operator` {string} the operator to use to compare the values.
* `value` {string} the value to compare against which must be a `?` or `:label`
the Query builder only supports prepared statements.
* `joiner` {string} the wording used to join multiple comparison operators
together by default `AND`
* Return {QuerySQL} this instance

### QuerySQL.select(selection)
* `selection` {string} the selection statement for the query which can contain
field names, functions, sub queries etc.
* Return {QuerySQL} this instance

### QuerySQL.log()
Prints the query to process.stdout via console.log, equivalent of
`console.log(query.toString(), query.toArray())`

### QuerySQL.leftJoin(query)
* `query` {Query} a fully prepared Query object to obtain a leftJoin from.
* Return {QuerySQL} this instance

### QuerySQL.where(item, operator, value, joiner)
* `item` {string} the field name of the data to compare against
* `operator` {string} the operator used to compare the values
* `value` {string} the value do compare against the database
* `joiner` {string} the string used to join multiple comparisons together
by default `AND`
* Return {QuerySQL} this instance


### QuerySQL.limit(start, limit)
* `start` {number} the starting index to return results from when limit is
omitted start is assumed to be the limit and start is the assumed to be 0.
* `limit` {number} the limit of the results to be returned
* Return {QuerySQL} this instance

### QuerySQL.order(by, direction, joiner)
* `by` {string|Array} a string with a field name or an array or sort fields
* `direction` {string} the direction to sort by either `ASC` for Ascending or
`DESC` for Descending.
* `joiner` {string} the wording used to join multiple order statements together
by default a comma `,`
* Return {QuerySQL} this instance

### QuerySQL.toLeftJoin()
* Return {string} the complete left join statement.

### QuerySQL.toString()
* Return {string} the complete query ready for execution.

### QuerySQL.execute(db, options)
* `db` {MySQL2} Current connection to MySQL
* `options` {object} options passed to the `db.execute()` call.
* Return {Promise} resolved when the database query is complete

This is a convenience method to make executing queries involve less typing.

Original Method
```js
db.execute(query.toString(), query.toArray(), options)
```

Better Method
```js
query.execute(db)
```

### QuerySQL.run(db, options)
* `db` {mariadb} Current connection to MySQL
* `options` {object} options passed to the driver during the query
* Return {Promise} resolved when the query is complete

This method calls the mariadb driver `db.query()` method which returns a
different return format from the `db.execute()` method.
