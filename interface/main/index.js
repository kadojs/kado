'use strict';
var K = require('../../helpers/kado')
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'main'
var master = iface.master(interfaceName,interfaceRoot)
if(require.main === module){
  K.infant.child(
    K.config.name + ':' + interfaceName + ':master',
    function(done){
      master.start(done)
    },
    function(done){
      master.stop(done)
    }
  )
}
