const argv0 = require('os').platform().match('win') ? 'node.exe' : process.argv0
const argv = process.argv.filter((v) => {
  return !(
    v.indexOf(argv0) === v.length - argv0.length ||
    v.indexOf(__filename.replace(/\.js$/, '')) === 0
  )
})
require('./lib/GeoIPUpdate').getInstance().updateData(argv[0] || 'free')
