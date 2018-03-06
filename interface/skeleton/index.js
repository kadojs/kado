'use strict';
var K = require('../../helpers/kado')
var interfaceRoot = __dirname
var interfaceName = 'skeleton'


/**
 * Master process
 * @type {Object}
 */
var master = module.exports = K.iface.master(K,interfaceName,interfaceRoot)
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
