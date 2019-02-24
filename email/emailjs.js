'use strict';
const email = require('emailjs')

//email server instance
let emailServer


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
module.exports = function(K,options){
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
    if(!emailServer){
      emailServer = email.server.connect({
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
    emailServer.send({
      text: options.text,
      to: options.to || K.config.email.notifyTo,
      'reply-to': options.replyTo || K.config.email.replyTo,
      from: options.from || K.config.email.defaultFrom,
      subject: options.subject || K.config.email.defaultSubject,
      attachment: options.attachment || []
    },(err,message) => {
      if(err) return reject(err)
      resolve(message)
    })
  })
}
