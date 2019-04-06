'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
K.iface.master(K,interfaceName,interfaceRoot).then((master) => {
  if(require.main === module){
    K.infant.child(
      K.config.name + ':' + interfaceName + ':master',
      (done) =>{
        master.start(done)
      },
      (done) =>{
        master.stop(done)
      }
    )
  }
})
