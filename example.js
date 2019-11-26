'use strict';
const Kado = require('./lib/Kado')
const app = new Kado(require('./config.js'))
const port = 3000

app.get('/',
  (req,res,next)=>{console.log('some middleware'); next()},
  (req,res)=>{res.send('Hello World')}
)

app.listen(port)
  .then((result)=>{
    if(result !== 'CLI Mode') app.log.info('Kado Started on port ' + port)
  })
  .catch((e)=>{
    app.log.error('Startup failed: ' + e.message)
  })
