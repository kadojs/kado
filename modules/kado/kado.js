'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

//module properties
exports._kado ={
  enabled: true,
  name: 'kado',
  title: 'Kado',
  description: 'Reflect into Kado for generators and utilities'
}


/**
 * CLI Access
 */
exports.cli = (K) => {
  require('./bin/util')(K)
}
