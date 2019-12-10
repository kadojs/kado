'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const mustacheExpress = require('mustache-express')
const path = require('path')

class ViewHandler {
  constructor(){
    this.engine = mustacheExpress()
  }
  register(app){
    app.express.set('views',app.express.locals.basedir)
    app.express.set('viewHelper',(partial,extension) => {
      //see if we have a registered view
      let fp = app.view.get(partial)
      //otherwise use the system path
      if(!fp) fp = path.join(app.express.locals.basedir,partial + extension)
      return fp
    })
    app.express.set('view engine','html')
    app.express.engine('html',this.engine)
  }
}

module.exports = ViewHandler
