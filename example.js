'use strict';
const Kado = require('./lib/Kado')
const app = new Kado()
const port = 3000

app.get('/',
  (req,res,next)=>{console.log('some middleware'); next()},
  (req,res)=>{res.send('Hello World')}
)

app.listen(port).then(()=>{
  app.log.info('Kado Started on port ' + port)
})
