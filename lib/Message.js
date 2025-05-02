/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')
const Connect = require('./Connect')
const ConnectEngine = Connect.ConnectEngine
class MessageEngine extends ConnectEngine {
  send () {
    this.checkEngine()
    throw new Error('MessageEngine.send() must be extended')
  }
}
class Message extends Connect {
  static getInstance () { return new Message() }

  send (to, message, options) {
    Assert.isOk(!(!to && !message && !options),
      'No parameters sent to message send')
    if (options !== null && typeof options !== 'object' && message) {
      options = { text: message }
    } else if (options && !options.text && message) {
      options.text = message
    }
    // assign recipient
    if (options) options.to = to
    // send to engines
    return this.eachEngine((engine) => { return engine.send(options) })
  }
}
Message.MessageEngine = MessageEngine
module.exports = Message
