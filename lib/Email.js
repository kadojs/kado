/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Connect = require('./Connect')
const ConnectEngine = Connect.ConnectEngine
class EmailEngine extends ConnectEngine {
  send () {
    this.checkEngine()
    throw new Error('EmailEngine.send() must be extended')
  }
}
class Email extends Connect {
  static getInstance () { return new Email() }

  send (name, options) {
    return Connect.each(this, name, options, 'send')
  }
}
Email.EmailEngine = EmailEngine
module.exports = Email
