const argv = process.argv.filter((v, i, a) => {
    return !(
      v.indexOf(process.argv0) === v.length - process.argv0.length ||
      v.indexOf(__filename.replace(/\.js$/, '')) === 0
    )
  })
;(async () => await require('./lib/GeoIPUpdate')
  .getInstance()
  .updateData(argv[0] || 'free'))()
