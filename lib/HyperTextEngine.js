'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class HyperTextEngine {
  constructor(){
    this.http = null //engine instance
  }
  checkPort(port){
    if(port === typeof 'string') port = parseInt(port)
    if(!('' + port).match(/^\d+$/)) throw new Error(`Invalid port ${port}`)
    if(port > 65536 || port < 0) throw new Error(`Port ${port} out of range`)
  }
  checkHost(host){
    if(typeof host !== 'string' && host !== null){
      throw new Error(`Invalid host type ${typeof host}`)
    }
  }
  checkHttp(){
    if(!this.http) throw new Error('No HTTP instance available')
  }
  start(){
    this.checkHttp()
  }
  stop(){
    this.checkHttp()
  }
}
