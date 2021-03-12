# Message
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Message = require('kado/lib/Message')
```
This library provides a register for Message handlers that may register to both
send and receive messages through the system.

## Class: Message
`Message` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static Message.getInstance()
* Return {Message} new instance of the Message system

### Message.constructor()
* Return {Message} new instance of the Message system

## Message.send(name, options)
* `name` {string} name of the handler to send with
* `options` {object} containing the message options
Return {Promise} that resolves when the message is sent.

Note: when no `name` is provided all handlers are executed.

## Class: MessageEngine
`MessageEngine` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.

### MessageEngine.send()
Must be extended and used to send to underlying message system.
