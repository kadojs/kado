'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
K.iface.worker(K,interfaceName,interfaceRoot).then((worker) =>{
  worker.enableSession((app) =>{
    let flash = require('connect-flash')
    let compileFile = require('pug').compileFile
    app.use(flash())
    let viewFn = {}
    app.use((req,res,next) =>{
      res.locals.flash = req.flash.bind(req)
      req.flashPug = (type,view,vars) =>{
        if(type && view){
          if(-1 === Object.keys(viewFn).indexOf(view)){
            viewFn[view] =
              compileFile(app.get('views') + '/_alerts/' + view + '.pug',{})
          }
          return req.flash(
            type,viewFn[view](('object' === typeof vars) ? vars : {}))
        }
        else if(type){
          return req.flash(type)
        }
        else{
          return req.flash()
        }
      }
      next()
    })
  })
  worker.setupLang(() => {
    //activate lang pack
    K.log.debug(Object.keys(K.lang.pack).length +
      ' ' + interfaceName + ' language packs activated')
  })
  worker.setupUri(() => {
    //activate uri system
    K.log.debug(interfaceName + ' URI system activated')
  })
  worker.enableHtml((app) =>{
    const mustacheExpress = require('mustache-express')
    const serveStatic = require('serve-static')
    const path = require('path')
    //bootstrap
    worker.setupScriptServer('bootstrap')
    worker.setupScriptServer('bootstrap-select')
    //datatables
    worker.setupScriptServer('jszip')
    worker.setupScriptServer('pdfmake')
    worker.setupScriptServer('datatables.net')
    worker.setupScriptServer('datatables.net-bs4')
    worker.setupScriptServer('datatables.net-buttons')
    worker.setupScriptServer('datatables.net-buttons-bs4')
    worker.setupScriptServer('datatables.net-buttons-dt')
    worker.setupScriptServer('datatables.net-colreorder-bs4')
    worker.setupScriptServer('datatables.net-fixedcolumns-bs4')
    worker.setupScriptServer('datatables.net-fixedheader-bs4')
    worker.setupScriptServer('datatables.net-keytable-bs4')
    worker.setupScriptServer('datatables.net-responsive-bs4')
    worker.setupScriptServer('datatables.net-select')
    worker.setupScriptServer('datatables.net-select-bs4')
    //country flags
    worker.setupScriptServer('flag-icon-css')
    //user defined script server entries
    if(K.config.interface[interfaceName] &&
      K.config.interface[interfaceName].scriptServer
    ){
      K.config.interface[interfaceName].scriptServer.forEach((s) =>{
        worker.setupScriptServer(s)
      })
    }
    //setup view engine
    app.set('trust proxy',true)
    app.locals.basedir = path.resolve(interfaceRoot + '/view')
    app.set('views',(partial,extension) => {
      //see if we have a registered view
      let fp = app.view.get(partial)
      //otherwise use the system path
      if(!fp) fp = path.join(app.locals.basedir,partial + extension)
      return fp
    })
    app.set('view engine','html')
    if(K.config.interface[interfaceName].viewCache) app.enable('view cache')
    app.engine('html',mustacheExpress())
    //static files
    app.use(serveStatic(interfaceRoot + '/public'))
    //override static servers
    let staticRoot = K.config.interface[interfaceName].staticRoot
    if(staticRoot){
      staticRoot.forEach((r)=>{if(K.fs.existsSync(r)) app.use(serveStatic(r))})
    }
  })
  worker.setup((app) =>{
    //setup default views
    app.view.add('alert',__dirname + '/view/alert.html')
    app.view.add('error',__dirname + '/view/error.html')
    app.view.add('footer',__dirname + '/view/footer.html')
    app.view.add('header',__dirname + '/view/header.html')
    app.view.add('home',__dirname + '/view/home.html')
    app.view.add('navbar',__dirname + '/view/navbar.html')
    //view overrides
    let views = K.config.interface[interfaceName].override.view
    if(views){
      for(let v in views){
        if(views.hasOwnProperty(v)) app.view.update(v,views[v])
      }
    }
    //home page
    app.get('/',(req,res) =>{
      res.render(app.view.get('home'))
    })
    //add default navbar entries
    app.nav.addGroup('/','Dashboard','home')
  })

  if(require.main === module){
    K.infant.worker(
      worker.server,
      K.config.name + ':main',
      (done) =>{
        worker.start(done)
      },
      (done) =>{
        worker.stop(done)
      }
    )
  }
})
