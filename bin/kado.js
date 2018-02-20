#!/use/bin/env node
'use strict';
var K = require('../index')
var program = require('commander')
var fs = require('fs')
var path = require('path')

program.version(K.config.version)
program.command('bootstrap')
  .option('--name <string>')
  .option('--enable-admin')
  .option('--enable-all')
  .option('--enable-api')
  .option('--enable-client')
  .option('--enable-main')
  .option('--enable-blog')
  .option('--enable-setting')
  .option('--enable-user')
  .action(function(cmd){
    var folder = process.cwd()
    var appFile = path.resolve(folder + '/app.js')
    if(fs.existsSync(appFile)){
      console.log('ERROR app file already exits')
      process.exit(1)
    }
    if(!cmd.name) cmd.name = 'kado'
    if(cmd.enableAll){
      cmd.enableAdmin = true
      cmd.enableApi = true
      cmd.enableClient = true
      cmd.enableMain = true
      cmd.enableBlog = true
      cmd.enableSetting = true
      cmd.enableUser = true
    }
    if(cmd.enableBlog || cmd.enableSetting || cmd.enableUser){
      cmd.enableAdmin = true
    }
    if(cmd.enableBlog) cmd.enableMain = true
    var interfaceConfig = ''
    var enableInterface = function(name,flag){
      if(flag){
        var isFirst = false
        if(!interfaceConfig){
          interfaceConfig = ',\n  interface: {\n'
          isFirst = true
        }
        interfaceConfig = interfaceConfig +
          (isFirst ? '' : ',\n') + '    ' + name + ': { enabled: true }'
      }
    }
    enableInterface('admin',cmd.enableAdmin)
    enableInterface('api',cmd.enableApi)
    enableInterface('client',cmd.enableClient)
    enableInterface('main',cmd.enableMain)
    if(interfaceConfig) interfaceConfig = interfaceConfig + '\n  }'
    var moduleConfig = ''
    var enableModule = function(name,flag){
      if(flag){
        var isFirst = false
        if(!moduleConfig){
          moduleConfig = ',\n  module: {\n'
          isFirst = true
        }
        moduleConfig = moduleConfig +
          (isFirst ? '' : ',\n') + '    ' + name + ': { enabled: true }'
      }
    }
    enableModule('blog',cmd.enableBlog)
    enableModule('setting',cmd.enableSetting)
    enableModule('user',cmd.enableUser)
    if(moduleConfig) moduleConfig = moduleConfig + '\n  }\n'
    var appData = '\'use strict\';\n' +
      'var K = require(\'kado\');\n' +
      'K.configure({\n' +
      '  root: __dirname' + interfaceConfig + moduleConfig +
      '})\n' +
      '\n' +
      'if(require.main === module){\n' +
      '  K.infant.child(\n' +
      '    \'' + cmd.name + '\',\n' +
      '    function(done){\n' +
      '      K.start(function(err){\n' +
      '        if(err) return done(err)\n' +
      '        K.log.info(\'Kado started!\')\n' +
      '        done()\n' +
      '      })\n' +
      '    },\n' +
      '    function(done){\n' +
      '      K.stop(function(err){\n' +
      '        if(err) return done(err)\n' +
      '        K.log.info(\'Kado stopped!\')\n' +
      '        done()\n' +
      '      })\n' +
      '    }\n' +
      '  )\n' +
      '}\n'
    fs.writeFileSync(appFile,appData)
    console.log('Application is ready!')
    process.exit()
  })

program.parse(process.argv)
