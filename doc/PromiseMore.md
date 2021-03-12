# PromiseMore

*Introduced in 4.3.0*
> Stability: 1 - Experimental
```js
const PromiseMore = require('kado/lib/PromiseMore')
const promise = PromiseMore.hoist()
promise.resolve()
```

PromiseMore provides additional promise control patterns that expand the core
JavaScript functionality.

## Class: PromiseMore

### static PromiseMore.hoist()

* Return {Promise} with additional properties.

What makes `PromiseMore.hoist()` different from calling `Promise.resolve()` is
hoist returns an unresolved promise that can be resolved or rejected through
the promise object itself. This flattens promise creation.

Example: 
```js
'use strict'
const PromiseMore = require('./lib/PromiseMore')
const https = require('https')
const getKado = () => {
  const promise = PromiseMore.hoist()
  const request = https.request({ hostname: 'kado.org', path: '/' })
  let buf = ''
  request.on('error', promise.reject)
  request.on('response', (resp) => {
    if (resp.statusCode !== 200) promise.reject(new Error('Invalid response'))
    resp.on('data', (chunk) => { buf += chunk.toString('utf-8') })
    resp.on('error', promise.reject)
    resp.on('close', () => { promise.resolve(buf) })
  })
  request.end()
  return promise
}
const main = async () => {
  const kadoPage = await getKado()
  console.log('Got Kado Page', kadoPage)
}
main()
```

### static PromiseMore.make (context, method, arguments...)

* `context` {Object} `thisArg` to use when calling `method`
* `method` {Function} method to be called that uses a callback as the last
argument, and triggers the callback with (err, arguments...)
* `arguments...` {Mixed} any arguments that should be passed to the `method`
* Return {Promise} resolved or rejected depending on the outcome, where all
returned arguments applied to the resolution.

#### Example using EmailJS

```js
const Assert = require('kado/lib/Assert')
const SMTPClient = require('emailjs').SMTPClient
const client = new SMTPClient({
  // config
})
const message = {
  text: 'Some message',
  to: 'hello@kado.org'
  // more message options
}
const resp = await PromiseMore.make(client, client.send, message)
Assert.isOk(resp, 'Invalid message')
```

### static PromiseMore.series (input, callback, output, idx)

* `input` {Array} items to be processed in a series
* `callback` {Function} to be called with each item and can resolve a promise
when needed.
* `output` {Array} (internal) used to track processes results as they are
shifted from the input array.
* `idx` {Number} (internal) index used to keep track of number of processed
items.
* Return {Promise} resolved with the `output` array when all members have been
processed.

NOTICE: The context of this method will be bound to the callback which allows
for state keeping while in the loop. Pass an Object in order to have latent
lookups.

#### Example using series with bound Context

```js
const PromiseMore = require('./lib/PromiseMore')
async function payPartial (item, idx, ctx) { ctx.amount -= item.amount }
const ctx = { amount: 3 }
const items = [{ amount: 1 }, { amount: 2 }]
const main = async () => {
  await PromiseMore.series(items, payPartial, ctx)
  console.log(ctx.amount) // 0
}
main()
```

This is useful when it is important members of an array are
processes one after another or in a "series" to produce the proper result.

#### Series Full Example

```js
'use strict'
const PromiseMore = require('./lib/PromiseMore')
const makeItem = () => { return { name: 'Apple' } }
const makePromise = () => { return new Promise((resolve) => { resolve(1) }) }
const processItem = async (item, index) => {
  const result = await makePromise() // resolve some promise
  item.index = index + result // use the result
  return item
}
const main = async () => {
  const itemList = []
  for (let i = 0; i < 5; i++) itemList.push(makeItem())
  const result = await PromiseMore.series(itemList, processItem)
  console.log('Sum of Indexes', result.reduce((i, c) => {
    i.index = i.index + c.index
    return i
  }).index)
}
main()
```

### static PromiseMore.while (condition, promise)

* `condition` {Function} called before each try to run the promise, the loop
stops when this condition evaluates to `false`
* `promise` {Function} function to be called that returns a promise.

Example
```js
const PromiseMore = require('kado/lib/PromiseMore')
let i = 15
const k = 10
const condition = () => { return i > k }
const makePromise = () => { i--; return Promise.resolve() }
const main = async () => {
  await PromiseMore.while(condition, makePromise)
  console.log(`Finished i is ${i}`)
}
main()
```
