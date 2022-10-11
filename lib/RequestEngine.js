'use strict'
const Connect = require('./Connect')
class RequestEngine extends Connect.ConnectEngine {
  static request (ctx, uri = '/', params = {}, options = {}, attempt = 0) {
    if (!ctx) throw new Error(ctx.title + ' request context must be defined')
    attempt++
    const isSSL = !!(options.ssl || ctx.ssl)
    const agent = isSSL ? require('https') : require('http')
    const defaultPort = isSSL ? 443 : 80
    const inputData = JSON.stringify(params)
    const headers = { Accept: 'application/json' }
    const token = options.token || ctx.token || ctx.name
    if (token) headers.Cookie = token
    const requestOptions = {
      host: options.host || ctx.host,
      port: options.port || ctx.port || defaultPort,
      headers: headers,
      rejectUnauthorized: options.rejectUnauthorized || ctx.rejectUnauthorized,
      method: options.method || ctx.method || 'GET',
      path: (options.prefix || ctx.prefix || '') +
        (uri || options.uri || ctx.uri || '/')
    }
    if (options.method !== 'GET') {
      requestOptions.headers['Content-Type'] =
        options.type || ctx.type || 'application/json'
      requestOptions.headers['Content-Length'] = inputData.length
    }
    return new Promise((resolve, reject) => {
      if (ctx.enabled === false) {
        console.error(`Request to ${ctx.title} ignored, ${ctx.title} disabled.`)
        return resolve({})
      }
      let buf = Buffer.alloc(0)
      const maxAttempts = (options.maxAttempts || ctx.maxAttempts || 5)
      if (attempt > maxAttempts) {
        return reject(new Error(`Max attempts exceeded ${maxAttempts}`))
      }
      const request = agent.request(requestOptions, async (response) => {
        const loginExp = /^\/login$/
        if (
          uri !== '/login' && response.headers.location &&
          response.headers.location.match(loginExp)
        ) {
          if (!options || typeof options.login !== 'function') {
            throw new Error(`${ctx.title} no login method defined`)
          }
          try {
            // set the token and repeat the original request
            ctx.token = await options.login(ctx, { method: 'POST' })
            const rv = await RequestEngine.request(
              ctx, uri, params, options, attempt
            )
            return resolve(rv)
          } catch (err) {
            reject(err)
          }
        }
        if (uri === '/login' && response.headers['set-cookie']) {
          let loginResponse = ''
          response.on('data', (chunk) => {
            loginResponse += chunk.toString()
          })
          response.on('end', () => {
            const token = response.headers['set-cookie'][0].split(';')[0]
            try {
              if (
                response.headers &&
                response.headers['content-type'] &&
                response.headers['content-type'].indexOf('json') >= 0
              ) {
                const loginData = JSON.parse(loginResponse)
                if (loginData.error) {
                  return reject(new Error(loginData.error))
                } else {
                  return resolve(token)
                }
              } else {
                return resolve(loginResponse)
              }
            } catch (e) {
              reject(e)
            }
          })
        }
        response.on('data', (chunk) => { buf = Buffer.concat([buf, chunk]) })
        response.on('end', () => {
          try {
            if (response.headers.location && response.statusCode > 300) {
              return resolve(response.headers.location)
            }
            let outputData = buf.toString('utf-8')
            if (
              response.headers &&
              response.headers['content-type'] &&
              response.headers['content-type'].indexOf('json') >= 0
            ) {
              outputData = JSON.parse(outputData)
            }
            const allowedCodes = [200, 301, 302]
            if (allowedCodes.indexOf(response.statusCode) < 0) {
              reject(new Error(
                `Invalid response code ${response.statusCode}: ${outputData}`
              ))
              return
            }
            if (outputData.error) {
              reject(outputData.error)
            } else {
              resolve(outputData)
            }
          } catch (e) { reject(e) }
        })
      })
      request.on('error', (e) => { reject(e) })
      if (options.method !== 'GET') request.write(inputData)
      request.end('')
    })
  }
}
module.exports = RequestEngine
