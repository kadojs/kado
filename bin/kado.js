#!/use/bin/env node
'use strict';
var K = require('../index')
var program = require('commander')
var fs = require('fs')
var path = require('path')

program.version(K.config.version)
program.command('bootstrap')
  .option('--enable-blog')
  .option('--enable-setting')
  .option('--enable-user')
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
      'if(require.main === module){' +
      '  infant.child(' +
      '    \'myapp\',' +
      '    function(done){' +
      '      K.start(function(err){' +
      '        if(err) return done(err)' +
      '        K.log.info(\'Kado started!\')' +
      '        done()' +
      '      })' +
      '    },' +
      '    function(done){' +
      '      K.stop(function(err){' +
      '        if(err) return done(err)' +
      '        K.log.info(\'Kado stopped!\')' +
      '        done()' +
      '      })' +
      '    }' +
      '  )' +
      '}'
    fs.writeFileSync(appFile,appData)
    console.log('Application is ready!')
    process.exit()
  })

program.parse(process.argv)
