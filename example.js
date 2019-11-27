'use strict';
const Kado = require('./lib/Kado')
const app = new Kado()
const port = 3000

app.get('/',(req,res)=>{
  res.send('Hello World')
})

app.start()
  .then((result)=>{
    if(result === 'CLI Mode') return
    app.listen(port,(err)=>{
      if(err) throw err
      app.log.info('Kado Started on port ' + port)
    })
  })
  .catch((e)=>{
    app.log.error('Startup failed: ' + e.message)
  })
