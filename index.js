'use strict';
var child = require('infant').child
var parent = require('infant').parent

var lifecycle = new (require('infant').Lifecycle)()
var interfaces = []

var config = {}
exports.config = config = require('./config')


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



/**
 * Start master
 * @param {function} done
 */
exports.start = function(done){
  if(!done) done = function(){}
  console.log('Beginning startup')
  console.log('Scanning for interfaces')
  //register interfaces for startup
  Object.keys(config.interface).forEach(function(name){
    //web panel
    if(
      true === config.$get(['interface',name,'enabled']) &&
      -1 < config.$get(['interface',name,'transport']).indexOf('http')
    ){
      interfaces.push(parent(config.interface[name].path))
      lifecycle.add(
        name,
        function(done){iface.start(done)},
        function(done){iface.stop(done)}
      )
    }
  })
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
  if(!done) done = function(){}
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
