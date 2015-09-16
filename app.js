'use strict';
var child = require('infant').child
var parent = require('infant').parent
var path = require('path')

var lifecycle = new (require('infant').Lifecycle)()

var config = require('./config')

//setup lifecycle logging
lifecycle.on('start',function(item){
  console.log('Starting ' + item.title)
})
lifecycle.on('stop',function(item){
  console.log('Stopping ' + item.title)
})
lifecycle.on('online',function(){
  console.log('Startup complete')
})
lifecycle.on('offline',function(){
  console.log('Shutdown complete')
})

//register interfaces for startup
Object.keys(config.interfaces).forEach(function(ifaceName){
  //admin panel
  if(
    true === config.$get([ifaceName,'enabled']) &&
    true === config.interfaces[ifaceName].http
  ){
    var ifacePath = path.resolve(config.interfaces[ifaceName].path)
    //process.exit()
    var iface = parent(config.interfaces[ifaceName].path)
    lifecycle.add(
      ifaceName,
      function(next){
        iface.start(next)
      },
      function(next){
        iface.stop(next)
      }
    )
  }
})


/**
 * Start master
 * @param {function} done
 */
exports.start = function(done){
  console.log('Beginning startup')
  lifecycle.start(function(err){
    if(err) throw err
    done()
  })
}


/**
 * Stop master
 * @param {function} done
 */
exports.stop = function(done){
  //start the shutdown process
  console.log('Beginning shutdown')
  lifecycle.stop(function(err){
    if(err) throw err
    done()
  })
}

//check if we are called directly or chained
if(require.main === module){
  child(
    config.name,
    function(done){
      exports.start(done)
    },
    function(done){
      exports.stop(done)
    }
  )
}
