'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../index')
const P = K.bluebird
const exec = P.promisify(require('child_process').exec)
const { expect } = require('chai')
const fs = require('fs')

//test interfaces
describe('generator',() => {
  it('should create app.js',() => {
    if(fs.existsSync('app.js.bak')) fs.unlinkSync('app.js.bak')
    if(fs.existsSync('app.js')) fs.renameSync('app.js','app.js.bak')
    return exec(
      'node kado_modules/kado/bin/util bootstrap --app Test ' +
      '--dev --dbuser kado --dbpassword kado'
    )
      .then(() => {
        expect(fs.existsSync('app.js')).to.equal(true)
      })
  })
})
