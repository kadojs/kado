'use strict';
var infant = require('infant')
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'skeleton'
var master = iface.master(interfaceName,interfaceRoot)
if(require.main === module){
  infant.child(
    config.name + ':' + interfaceName + ':master',
    function(done){
      master.start(done)
    },
    function(done){
      master.stop(done)
    }
  )
}
