'use strict';



/**
 * UserPermissionError Error Object
 * @param {string} message
 * @constructor
 */
function UserPermissionError(message) {
  this.message = message;
  this.name = 'UserPermissionError'
  Error.captureStackTrace(this,UserPermissionError)
}
UserPermissionError.prototype = Object.create(Error.prototype)


/**
 * Set constructor for prototype
 * @type {UserPermissionError}
 */
UserPermissionError.prototype.constructor = UserPermissionError


/**
 * Export the Error
 * @type {Function}
 */
module.exports = UserPermissionError
