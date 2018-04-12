#!/use/bin/env node
'use strict';
const K = require('../index')
const program = require('commander')
const fs = require('fs')
const path = require('path')

program.version(K.config.version)
program.command('bootstrap')
  .option('--appname <string>')
  .option('--enable-admin')
  .option('--enable-all')
  .option('--enable-api')
  .option('--enable-client')
  .option('--enable-main')
  .option('--enable-blog')
  .option('--enable-setting')
  .option('--enable-user')
  .action(function(cmd){
    let folder = process.cwd()
    let appFile = path.resolve(folder + '/app.js')
    if(fs.existsSync(appFile)){
      console.log('ERROR app file already exits')
      process.exit(1)
    }
    if(!cmd.appname) cmd.appname = 'myapp'
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
    let interfaceConfig = ''
    let enableInterface = function(name,flag){
      if(flag){
        let isFirst = false
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
    let moduleConfig = ''
    let enableModule = function(name,flag){
      if(flag){
        let isFirst = false
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
    let appRequire = '\'kado\''
    if(!process.argv[1].match(/node_modules/i)) appRequire = '\'./index\''
    let appData = '\'use strict\';\n' +
      'let K = require(' + appRequire + ')\n' +
      'K.configure({\n' +
      '  root: __dirname' + interfaceConfig + moduleConfig +
      '})\n' +
      'K.go(\'' + cmd.appname + '\')\n'
    fs.writeFileSync(appFile,appData)
    console.log('Application is ready!')
    process.exit()
  })

program.parse(process.argv)
