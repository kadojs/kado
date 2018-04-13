'use strict';
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'api'
let worker = K.iface.worker(K,interfaceName,interfaceRoot)
worker.enableSession()
worker.enableHtml(function(app){
  //setup view engine
  app.set('trust proxy',true)
  app.locals.basedir = interfaceRoot + '/view'
  app.set('views',interfaceRoot + '/view')
  app.set('view engine','pug')
})
worker.setup(function(app){
  //login
  app.post('/login',function(req,res){
    let promises = []
    let authTried = 0
    let invalidLoginError = new Error('Invalid login')
    Object.keys(K.modules).forEach(function(modName){
      if(K.modules.hasOwnProperty(modName)){
        let modConf = K.modules[modName]
        if(modConf.api && true === modConf.api.providesAuthentication){
          promises.push(new K.bluebird(function(resolve,reject){
            let mod = require(modConf.root)
            if('function' === typeof mod.authenticate){
              authTried++
              mod.authenticate(
                K,
                req.body.email,
                req.body.password,
                function(err,authValid,sessionValues){
                  if(err){
                    return reject(err)
                  }
                  if(true !== authValid){
                    return reject(invalidLoginError)
                  }
                  let session = new K.ObjectManage(req.session.staff || {})
                  session.$load(sessionValues)
                  req.session.staff = session.$strip()
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
      .then(function(){
        if(0 === authTried){
          K.log.warn('No authentication provider modules enabled')
          throw invalidLoginError
        }
        res.json({
          success: 'Login success'
        })
      })
      .catch(function(err){
        res.json({
          error: err.message || 'Invalid login'
        })
      })
  })
  app.get('/login',function(req,res){
    res.render('login')
  })
  app.get('/logout',function(req,res){
    req.session.destroy()
    delete res.locals.staff
    res.json({success: 'Logout success'})
  })
  //auth protection
  app.use(function(req,res,next){
    //private
    if(!req.session.staff && req.url.indexOf('/login') < 0){
      res.redirect('/login')
    } else if(req.session.staff){
      res.locals.staff = req.session.staff
      next()
    } else {
      next()
    }
  })
  //home page
  app.get('/',function(req,res){
    res.render('index')
  })
})

if(require.main === module){
  K.infant.worker(
    worker.server,
    K.config.name + ':' + interfaceName,
    function(done){
      worker.start(done)
    },
    function(done){
      worker.stop(done)
    }
  )
}
