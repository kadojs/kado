'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../index')
const Prism = require('stretchfs-sdk').Prism

let logger = K.log
let config = K.config

//setup to talk to prism
let prism = new Prism({
  username: config.connector.stretchfs.username,
  password: config.connector.stretchfs.password,
  domain: config.connector.stretchfs.domain
})


/**
 * Startup
 * @param {string} host
 * @param {number} port
 * @return {P}
 */
prism.doConnect = function(host,port){
  if(config.connector.stretchfs.token){
    prism.setSession(config.connector.stretchfs.token)
    prism.helperConnected = true
    return prism.connect(host,port)
  } else {
    prism.helperConnected = false
    logger.log('warn','No Prism token present,' +
      ' cannot establish admin connection to cluster,' +
      ' file management will be disabled. Login style auth' +
      ' is not enabled on this instance, tokens only.'
    )
  }
}


/**
 * Export the instance
 * @type {Prism}
 */
module.exports = prism
