#!/usr/bin/env node
'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


/**
 * Cascade kado helper into main object
 * @type {object}
 */
let args = process.argv.splice(2,process.argv.length)
process.argv.push('kado')
process.argv = process.argv.concat(args)
module.exports = exports = require('./helpers/kado')
module.exports.go('cli')
