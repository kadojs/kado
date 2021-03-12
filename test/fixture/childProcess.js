'use strict'
console.log('hello')
let c = 1
setInterval(() => { c++ }, 1)
process.on('message', (msg) => {
  if (msg !== 'SIGSTOP') return
  Promise.resolve().then(() => {
    console.log('got SIGSTOP')
    console.log(`Uptime ${c} milliseconds`)
    process.exit(0)
  })
})
