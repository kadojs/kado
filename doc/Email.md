# Email
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Email = require('kado/lib/Email')
```
This library provides a register for Email handlers to register and receive
email messages through the system.

## Class: Email
`Email` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static Email.getInstance()
* Return {Email} new instance of the Email system

### Email.constructor()
* Return {Email} new instance of the Email system

## Email.send(name, options)
* `name` {string} name of the handler to send with
* `options` {object} containing the email options
Return {Promise} that resolves when the message is sent.

Note: when no `name` is provided all handlers are executed.

## Class: EmailEngine
`EmailEngine` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.

### EmailEngine.send()
Must be extended and used to send to underlying email system.
