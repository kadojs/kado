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
* `table`
* `selection`
* `construct`
* `tableConstruct`
* Return {string}

### static Query.addComparison(context, construct, item, operator, value, joiner)
* `context`
* `construct`
* `item`
* `operator`
* `value`
* `joiner`

### static Query.addLimit(construct, start, limit)
* `construct`
* `start`
* `limit`

### static Query.addOrder(context, construct, by, direction, joiner)

### static Query.addJoin(query, direction)

### static Query.printJoin(table, condition, construct)

### static Query.print(base, join, where, order, limit)

### Query.constructor(tableName)

### Query.toString()

## Class: QuerySQL

### QuerySQL.constructor()

### QuerySQL.on()

### QuerySQL.select()

### QuerySQL.leftJoin()

### QuerySQL.where()

### QuerySQL.limit()

### QuerySQL.order()

### QuerySQL.toLeftJoin()

### QuerySQL.toString()
