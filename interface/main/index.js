'use strict';
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
K.iface.master(K,interfaceName,interfaceRoot).then((master) => {
  if(require.main === module){
    K.infant.child(
      K.config.name + ':' + interfaceName + ':master',
      (done) =>{
        master.start(done)
      },
      (done) =>{
        master.stop(done)
      }
    )
  }
})
