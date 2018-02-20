'use strict';
var K = require('../../helpers/kado')
var interfaceRoot = __dirname
var interfaceName = 'skeleton'
var master = K.iface.master(interfaceName,interfaceRoot)
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
