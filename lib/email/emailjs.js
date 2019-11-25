'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const email = require('lib/email/emailjs')


/**
 * Email Server
 * @type {object}
 */
exports.emailServer = null


/**
 * Send mail
 *
 *  {
 *    from: 'Foo <foo@example.com>',
 *    to: 'Foo <foo@example.com>',
 *    subject: 'Foo Foo',
 *    message: 'Foo bar baz',
 *    html: '<b>Foo</b>',
 *    attachment: '/foo.jpg' || streamFoo || 'foo attachment message'
 *  }
 * @param {object} K
 * @param {object} options
 */
exports.send = function(K,options){
  //coerce options to our liking
  if(options.html && !options.attachment){
    options.attachment = [{data: options.html, alternative: true}]
    delete options.html
  } else if(options.html && options.attachment){
    delete options.html
  }
  //shift attachment into an array if its not already
  if(options.attachment && !(options.attachment instanceof Array)){
    options.attachment = [options.attachment]
  }
  return new K.bluebird(function(resolve,reject){
    //setup email server if not already
    if(!exports.emailServer){
      exports.emailServer = email.server.connect({
        user: K.config.email.emailjs.user || 'root',
        password: K.config.email.emailjs.password || '',
        host: K.config.email.emailjs.host || 'localhost',
        port: K.config.email.emailjs.port || 25,
        ssl: K.config.email.emailjs.ssl || false,
        tls: K.config.email.emailjs.tls || false,
        timeout: K.config.email.emailjs.timeout || 5000
      })
    }
    //send the email
    let emailOptions = {
      text: options.text,
      to: options.to || K.config.email.notifyTo,
      cc: options.cc || K.config.email.defaultCc || '',
      bcc: options.bcc || K.config.email.defaultBcc || '',
      'reply-to': options.sender || options.replyTo || K.config.email.replyTo,
      from: options.sender || options.from || K.config.email.defaultFrom,
      subject: options.subject || K.config.email.defaultSubject,
      attachment: options.attachment || []
    }
    exports.emailServer.send(emailOptions,(err,message) => {
      if(err) return reject(err)
      resolve(message)
    })
  })
}
