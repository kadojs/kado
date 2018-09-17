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
const K = require('../../index')
const interfaceRoot = __dirname
const interfaceName = 'admin'
K.iface.worker(K,interfaceName,interfaceRoot).then((worker) => {
  worker.enableSession((app) => {
    let flash = require('connect-flash')
    app.use(flash())
    app.use((req,res,next) => {
      res.locals.flash = worker.flashHandler(req)
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
  worker.setupPermission(() => {
    //activate lang pack
    K.log.debug(interfaceName + ' permissions system activated')
  })
  worker.enableHtml((app) => {
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
    //enable proxy senders
    app.set('trust proxy',true)
    //setup view engine
    app.locals.basedir = path.resolve(interfaceRoot + '/view')
    app.set('view engine','html')
    app.set('views',app.locals.basedir)
    app.set('partials',path.resolve(app.locals.basedir + '/partials'))
    //app.enable('view cache')
    app.engine('html',mustacheExpress())
    //static files
    app.use(serveStatic(interfaceRoot + '/public'))
    //override static servers
    let staticRoot = K.config.interface[interfaceName].staticRoot
    if(staticRoot){
      staticRoot.forEach((r)=>{if(K.fs.existsSync(r)) app.use(serveStatic(r))})
    }
  })
  worker.setup((app) => {
    //setup default views
    app.view.add('alert',__dirname + '/view/alert.html')
    app.view.add('breadcrumb',__dirname + '/view/breadcrumb.html')
    app.view.add('error',__dirname + '/view/error.html')
    app.view.add('footer',__dirname + '/view/footer.html')
    app.view.add('header',__dirname + '/view/header.html')
    app.view.add('home',__dirname + '/view/home.html')
    app.view.add('login',__dirname + '/view/login.html')
    app.view.add('navbar',__dirname + '/view/navbar.html')
    app.view.add('search',__dirname + '/view/search.html')
    app.view.add('sidebar',__dirname + '/view/sidebar.html')
    //view overrides
    let views = K.config.interface[interfaceName].override.view
    if(views){
      for(let v in views){
        if(views.hasOwnProperty(v)) app.view.update(v,views[v])
      }
    }
    //login
    app.post('/login',(req,res) => {
      let json = K.isClientJSON(req)
      let promises = []
      let authTried = 0
      let invalidLoginError = new Error('Invalid login')
      Object.keys(K.modules).forEach((modName) => {
        if(K.modules.hasOwnProperty(modName)){
          let modConf = K.modules[modName]
          if(modConf.admin && true === modConf.admin.providesAuthentication){
            promises.push(new K.bluebird((resolve,reject) => {
              let mod = require(modConf.root + '/kado.js')
              if('function' === typeof mod.authenticate){
                authTried++
                mod.authenticate(
                  K,
                  req.body.email,
                  req.body.password,
                  (err,authValid,sessionValues) => {
                    if(err){
                      return reject(err)
                    }
                    if(true !== authValid){
                      return reject(invalidLoginError)
                    }
                    let session = new K.ObjectManage(req.session._staff || {})
                    session.$load(sessionValues)
                    req.session._staff = session.$strip()
                    resolve()
                  }
                )
              } else {
                reject(invalidLoginError)
              }
            }))
          }
        }
      })
      K.bluebird.all(promises)
        .then(() => {
          if(0 === authTried){
            K.log.warn('No authentication provider modules enabled')
            throw invalidLoginError
          }
          if(json){
            res.json({success: 'Login success'})
          } else {
            req.flash('success','Login success')
            let referrer = req.session._loginReferrer || '/'
            if(referrer.match(/\.(js|jpg|ico|png|html|css)/i)) referrer = '/'
            res.redirect(301,referrer)
          }
        })
        .catch((err) => {
          if(json){
            res.json({error: err.message})
          } else {
            req.flash('error',err.message || 'Invalid login')
            res.redirect(301,'/login')
          }
        })
    })
    app.get('/login',(req,res) => {
      res.render(res.locals._view.get('login'))
    })
    app.get('/logout',(req,res) => {
      req.session.destroy()
      delete res.locals._staff
      res.redirect(301,'/login')
    })
    //auth protection
    app.use((req,res,next) => {
      //private
      if(
        (!req.session || !req.session._staff) &&
        req.url.indexOf('/login') < 0
      ){
        req.session._loginReferrer = req.url
        res.redirect(301,'/login')
      } else if(req.session._staff){
        res.locals._staff = req.session._staff
        if(res.locals && res.locals._staff) delete res.locals._staff.password
        if(app.locals && app.locals._staff) delete app.locals._staff.password
        next()
      } else {
        next()
      }
    })
    //home page
    app.get('/',(req,res) => {
      res.render('home')
    })
    //add default navbar entries
    app.nav.addGroup('/','Dashboard','home')
    app.get('/search',worker.enableSearch(app))
    //add default permissions
    app.permission.add('/search')
  })

  if(require.main === module){
    K.infant.worker(
      worker.server,
      K.config.name + ':' + interfaceName + ':worker',
      (done) => {
        worker.start(done)
      },
      (done) => {
        worker.stop(done)
      }
    )
  }
})
