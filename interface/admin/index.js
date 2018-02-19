'use strict';
var K = require('../../index')

var child = require('infant').child
var clusterSetup = require('infant').cluster

var cluster
var config = K.config

if(require.main === module){
  child(
    config.name + ':admin:master',
    function(done){
      cluster = clusterSetup(
        './worker',
        {
          enhanced: true,
          count: config.interface.admin.workers.count,
          maxConnections: config.interface.admin.workers.maxConnections
        }
      )
      cluster.start(function(err){
        done(err)
      })
    },
    function(done){
      if(!cluster) return done()
      cluster.stop(function(err){
        done(err)
      })
    }
  )
}
