# EmailConnector
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const EmailConnector = require('kado/lib/EmailConnector')
```
This library is used to setup a connection to an email handler of some kind
such as IMAP, GMail etc. The methods here are used by the `Email` system to
receive messages from the Kado system for mapping to the Email provider of
choice.

## Class: EmailConnector

### EmailConnector.constructor(options)
* `options` {object} options that setup the email handler
* Return {EmailConnector} new email connector instance

The handler must be saved to the `server` property of the `EmailConnector` class

### EmailConnector.checkServer()
* Return {boolean} `true` when the `server` property exists

### EmailConnector.connect()
This method must be defined in user space and will throw an error if not.

### EmailConnector.send(options)
* `options` {object} options used to send the email
* Return {Promise} that resolves after the server sends the email.

### EmailConnector.close()
* Return {boolean} `true` after removing the server assignment
