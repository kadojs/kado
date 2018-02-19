#!/use/bin/env node
'use strict';
var K = require('../index')
var program = require('commander')
var fs = require('fs')
var path = require('path')

program.version(K.config.version)
program.command('bootstrap')
  .action(function(){
    var folder = process.cwd()
    var appFile = path.resolve(folder + '/app.js')
    if(fs.existsSync(appFile)){
      console.log('ERROR app file already exits')
      process.exit(1)
    }
    var appData = '\'use strict\';\n' +
      'var K = require(\'kado\');\n' +
      'K.configure({\n' +
      '  root: __dirname,\n' +
      '  interface: {\n' +
      '    admin: {\n' +
      '      enabled: true\n' +
      '    }\n' +
      '  }\n' +
      '})\n' +
      '\n' +
      'K.start(function(err){\n' +
      '  if(err) throw err\n' +
      '  console.log(\'Kado started!\')\n' +
      '})\n'
    fs.writeFileSync(appFile,appData)
    console.log('Application is ready!')
    process.exit()
  })

program.parse(process.argv)
