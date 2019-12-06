'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')
const email = require('emailjs')
const ObjectManage = require('object-manage')

class Email {
  constructor(config,emailConfig){
    this.emailConfig = new ObjectManage({
      to: 'root@localhost',
      cc: '',
      bcc: '',
      'reply-to': 'noreply@nohost',
      from: 'root@localhost',
      subject: 'no subject'
    })
    this.emailConfig.$load(emailConfig)
    this.config = new ObjectManage({
      user: 'root',
      password: '',
      host: 'localhost',
      port: 25,
      ssl: false,
      tls: false,
      timeout: 5000
    })
    this.config.$load(config)
    this.server = null
  }
  setupServer(){
    this.server = email.server.connect(this.config.$strip())
  }
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
   * @param {object} options
   */
  send(options){
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
    //setup email server if not already
    if(!exports.emailServer){
      this.setupServer()
    }
    //send the email
    let emailOptions = new ObjectManage()
    emailOptions.$load(this.emailConfig.$strip())
    if(options.text) emailOptions.text = options.text
    if(options.to) emailOptions.to = options.to
    if(options.cc) emailOptions.cc = options.cc
    if(options.bcc) emailOptions.bcc = options.bcc
    if(options['reply-to']) emailOptions['reply-to'] = options['reply-to']
    if(options.from) emailOptions.from = options.from
    if(options.subject) emailOptions.subject = options.subject
    if(options.attachment) emailOptions.attachment = options.attachment
    const that = this
    return new P((resolve,reject)=>{
      that.server.send(emailOptions.$strip(),(err,message) => {
        if(err) return reject(err)
        resolve(message)
      })
    })
  }
}

module.exports = Email
