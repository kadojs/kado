'use strict'
let c = 1
setInterval(() => {
  // send start message on first loop execution
  if (c === 1 && process.send) process.send('SIGSTART')
  c++
}, 1)
const stopWorker = (signal = 'SIGTERM', exitCode = 0) => {
  return Promise.resolve().then(() => {
    console.log(`got signal ${signal}`)
    console.log(`Uptime ${c} milliseconds`)
    process.exit(exitCode)
  })
}
process.on('message', (msg) => {
  // on request send request
  if (msg === 'request') process.send('request')
  // on ping return pong
  if (msg === 'ping') return process.send('pong')
  // on SIGHUP we die gracefully to allow new workers to start
  if (msg === 'SIGHUP') return stopWorker(msg, 1)
  // otherwise carry on with a stop procedure
  if (msg !== 'SIGSTOP') return false
  return stopWorker(msg)
})
