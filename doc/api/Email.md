# Email
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Email = require('kado/lib/Email')
```
This library provides a register for Email handlers to register and receive
email messages through the system.

## Class: Email

### static Email.getInstance()
* Return {Email} new instance of the Email system

### Email.constructor()
* Return {Email} new instance of the Email system

### Email.addHandler(name, instance)
* `name` {string} name of the email system
* `instance` {object} instance of the email handler
Return {object} instance of the email handler

### Email.removeHandler(name)
* `name` {string} name of the email system to remove
Return {string} name of the email system removed.

## Email.send(name, options)
* `name` {string} name of the handler to send with
* `options` {object} containing the email options
Return {Promise} that resolves when the message is sent.

Note: when no `name` is provided all handlers are executed.

### Email.reset(name)
* `name` {string} name of the handler to reset.
* Return {boolean} `true` when the handler has been reset.

Note: when no `name` is passed all handlers will be reset.
