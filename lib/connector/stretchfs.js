'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const ObjectManage = require('object-manage')
const Prism = require('stretchfs-sdk').Prism

class Connector {
  constructor(config){
    this.config = new ObjectManage()
    this.config.$load(config)
    //setup to talk to prism
    this.prism = new Prism({
      username: this.config.username,
      password: this.config.password,
      domain: this.config.domain
    })
  }
  connect(host,port){
    if(this.config.token){
      this.prism.setSession(this.config.token)
      this.prism.helperConnected = true
      return this.prism.connect(host,port)
    } else {
      this.prism.helperConnected = false
      console.warn('warn','No Prism token present,' +
        ' cannot establish admin connection to cluster,' +
        ' file management will be disabled. Login style auth' +
        ' is not enabled on this instance, tokens only.'
      )
    }
  }
}


/**
 * Export the instance
 * @type {Prism}
 */
module.exports = Connector
