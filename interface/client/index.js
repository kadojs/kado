'use strict';
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'client'
var master = iface.master(interfaceName,interfaceRoot)
if(require.main === module){
  worker(
    server,
    config.name + ':' + interfaceName + ':master',
    function(done){
      master.start(done)
    },
    function(done){
      master.stop(done)
    }
  )
}
