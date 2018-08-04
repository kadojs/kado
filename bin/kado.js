#!/use/bin/env node
'use strict';
const K = require('../index')
const program = require('commander')
const fs = require('fs')
const mkdirp = require('mkdirp-then')
const Mustache = require('mustache')
const path = require('path')
const readdir = require('recursive-readdir')
const rmdir = require('rmdir-promise')

const log = K.log

//make some promises
K.bluebird.promisifyAll(fs)

program.version(K.config.version)


program.command('dbsetup')
  .option('--dbsequelize','Enable sequelize connector')
  .option('--dbshost <string>','Set the sequelize database host')
  .option('--dbsport <string>','Set the sequelize database port')
  .option('--dbsuser <string>','Set the sequelize database user')
  .option('--dbspassword <string>','Set the sequelize database password')
  .action(function(cmd){
    if(cmd.dbsequelize){
      K.configure({
        db: {
          sequelize: {
            load: true,
            enabled: true,
            host: cmd.dbshost || 'localhost',
            port: cmd.dbsport || 3306,
            user: cmd.dbsuser || 'kado',
            password: cmd.dbspassword || 'kado'
          }
        }
      })
    }
    log.info('Beginning database setup')
    log.info('Connecting to database')
    K.init()
      .then(function(){
        if(cmd.dbsequelize){
          log.info('Connecting to sequelize')
          return K.db.sequelize.doConnect()
        }
      })
      .then(function(){
        log.info('Database connected, initializing...')
      })
      .catch(function(err){
        log.error(err)
        process.exit(1)
      })
      .finally(function(){
        log.info('Database setup complete, run this again any time')
        K.db.sequelize.close()
        process.exit()
      })
  })


program.command('generate')
  .option('--app <string>','Name of this application')
  .option('--modconf <string>','Module config JSON file')
  .option('--stomp','Remove the destination directory if it exists, DANGEROUS!')
  .action(function(cmd){
    let folder = process.cwd()
    let modconfFile = folder + '/' + cmd.modconf
    if(!modconfFile || !fs.existsSync(modconfFile)){
      log.error('Must have module configuration JSON file, exiting')
      process.exit(1)
    }
    let modconf = require(modconfFile)
    let moduleFolder = path.resolve(folder + '/kado/' + modconf.moduleName)
    let templateFolder = path.resolve(__dirname + '/../kado/_template')
    let fileCount = 0
    if(!cmd.app) cmd.app = 'myapp'
    K.bluebird.try(function(){
      let folderExists = fs.existsSync(moduleFolder)
      if(folderExists && !cmd.stomp){
        log.error('Module folder already exits')
        process.exit(1)
      } else if(folderExists && cmd.stomp){
        log.info('Removing existing module folder')
        return rmdir(moduleFolder)
      } else {
        log.info('Creating module folder')
      }
    })
      .then(function(){
        return readdir(templateFolder)
      })
      .each(function(file){
        let relativePath = file.replace(templateFolder,'')
        let template = fs.readFileSync(file,{encoding: 'utf-8'})
        log.info('Rendering ' + modconf.moduleName + relativePath)
        let result = Mustache.render(template,modconf)
        let modulePath = path.resolve(moduleFolder + '/' + relativePath)
        return mkdirp(path.dirname(modulePath))
          .then(function(){
            return fs.writeFileAsync(modulePath,result)
          })
          .then(function(){
            fileCount++
          })
      })
      .then(function(){
        log.info('Created ' + fileCount + ' new files!')
        log.info('Module generation complete! Please check: ' + moduleFolder)
        process.exit()
      })
  })


program.command('bootstrap')
  .option('--app <string>','Name of this application')
  .option('--enable-admin','Enable the admin interface')
  .option('--enable-all','Enable all modules and interfaces')
  .option('--enable-api','Enable api interface')
  .option('--enable-main','Enable main interface')
  .option('--enable-blog','Enable blog module')
  .option('--enable-setting','Enable setting module')
  .option('--enable-staff','Enable staff module')
  .option('--dbsequelize','Enable sequelize connector')
  .option('--dbshost <string>','Set the sequelize database host')
  .option('--dbsport <string>','Set the sequelize database port')
  .option('--dbsuser <string>','Set the sequelize database user')
  .option('--dbspassword <string>','Set the sequelize database password')
  .action(function(cmd){
    let folder = process.cwd()
    let appFile = path.resolve(folder + '/app.js')
    if(fs.existsSync(appFile)){
      console.log('ERROR app file already exits')
      process.exit(1)
    }
    if(!cmd.app) cmd.app = 'myapp'
    if(cmd.enableAll){
      cmd.enableAdmin = true
      cmd.enableApi = true
      cmd.enableMain = true
      cmd.enableBlog = true
      cmd.enableSetting = true
      cmd.enableStaff = true
    }
    if(cmd.enableBlog || cmd.enableSetting || cmd.enableStaff){
      cmd.enableAdmin = true
    }
    if(cmd.enableBlog) cmd.enableMain = true
    let dbConfig = ''
    let enableDB = function(name,flag){
      if(flag){
        let isFirst = false
        if(!dbConfig){
          dbConfig = ',\n  db: {\n'
          isFirst = true
        }
        let dbExtra = ''
        if(cmd.dbshost){
          dbExtra += '      host: \'' + cmd.dbshost + '\',\n'
        }
        if(cmd.dbsport){
          dbExtra += '      port: ' + cmd.dbsport + ',\n'
        }
        if(cmd.dbsuser){
          dbExtra += '      user: \'' + cmd.dbsuser + '\',\n'
        }
        if(cmd.dbspassword){
          dbExtra += '      password: \'' + cmd.dbspassword + '\',\n'
        }
        dbConfig = dbConfig +
          (isFirst ? '' : ',\n') + '    ' + name +
          ': {\n      enabled: true,\n' + (dbExtra || '') + '    }\n  }'
      }
    }
    enableDB('sequelize',cmd.dbsequelize)
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
    enableModule('staff',cmd.enableStaff)
    if(moduleConfig) moduleConfig = moduleConfig + '\n  }\n'
    let appRequire = '\'kado\''
    if(!process.argv[1].match(/node_modules/i)) appRequire = '\'./index\''
    let appData = '\'use strict\';\n' +
      'let K = require(' + appRequire + ')\n' +
      'K.configure({\n' +
      '  root: __dirname' + dbConfig + interfaceConfig + moduleConfig +
      '})\n' +
      'K.go(\'' + cmd.app + '\')\n'
    fs.writeFileSync(appFile,appData)
    log.info('Application is ready!')
    process.exit()
  })

program.parse(process.argv)
