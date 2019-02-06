#!/use/bin/env node
'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const K = require('../../../index')
const program = require('commander')
const fs = require('fs')
const mkdirp = require('mkdirp-then')
const Mustache = require('mustache')
const path = require('path')
const readlineSync = require('readline-sync').question
const readdir = require('recursive-readdir')
const rmdir = require('rmdir-promise')

const log = K.log

//make some promises
K.bluebird.promisifyAll(fs)

program.version(K.config.version)


program.command('dbsetup')
  .action(() => {
    K.log.info('Connecting to sequelize')
    K.db.sequelize.doConnect({sync: true})
      .then(() => {
        log.info('Database connected, initializing...')
      })
      .catch((err) => {
        log.error(err)
        process.exit(1)
      })
      .finally(() => {
        log.info('Database setup complete, run this again any time')
        K.db.sequelize.close()
        process.exit()
      })
  })


program.command('insertsamples')
  .action(() => {
    K.log.info('Connecting to sequelize')
    let sql
    let statements = []
    K.db.sequelize.doConnect({sync: true})
      .then(() => {
        log.info('Database connected, initializing...')
      })
      .then(() => {
        log.info('Database setup complete, inserting samples')
        sql = K.fs.readFileSync(
          __dirname + '/../sql/sample.sql',{encoding: 'utf-8'})
        statements = sql.split(/\n/)
        statements = statements.filter((s) => {return !!s})
        return statements
      })
      .each((s) => {
        let table = s.substring(0,s.indexOf('('))
          .replace('INSERT INTO `','').replace('` ','')
        return K.db.sequelize.query(s,{raw: true,
          type: K.db.sequelize.QueryTypes.INSERT
        })
          .then(() => {log.info(table + ' record inserted!')})
      })
      .catch((err) => {
        log.error(err)
        process.exit(1)
      })
      .finally(() => {
        log.info('Sample insertion complete')
        K.db.sequelize.close()
        process.exit()
      })
  })


program.command('generate')
  .option('--header <s>','File to read for file header text')
  .option('--modconf <s>','Provide a JSON file containing a module definition' +
    ', otherwise an interactive process will be used.')
  .option('--saveconf','Save module configuration to a JSON file')
  .option('--stomp','Remove the destination directory if it exists, DANGEROUS!')
  .action((cmd) => {
    let fileHeaderPath = __dirname + '/header.txt'
    let fileHeader = 'KADO GENERATOR\n'
    //get our file header
    if(cmd.header && cmd.header[0] !== '/' && cmd.header[2] !== '\\'){
      cmd.header = path.resolve(
        path.join(path.dirname(process.argv[1]),cmd.header))
    }
    if(cmd.header && fs.existsSync(cmd.header)){
      fileHeader = fs.readFileSync(cmd.header)
    } else if(fs.existsSync(fileHeaderPath)){
      fileHeader = fs.readFileSync(fileHeaderPath)
    }
    //set our mustache tag usage here
    Mustache.tags = ['<%','%>']
    let folder = process.cwd()
    let modconf = {moduleFields: []}
    modconf.fileHeader = fileHeader
    if(cmd.modconf){
      let modconfFile = folder + '/' + cmd.modconf
      if(!modconfFile || !fs.existsSync(modconfFile)){
        log.error('Must have module configuration JSON file, exiting')
        process.exit(1)
      }
      modconf = require(modconfFile)
    } else {
      //build the module conf using readline
      log.info('Acquiring module info: Title, Name')
      modconf.moduleTitle = readlineSync('Title of new module? ')
      let modname = modconf.moduleTitle.toLowerCase()
      modconf.moduleName = readlineSync('Name of new module? ',{
        defaultInput: modname})
      modconf.moduleModelName = readlineSync('Name of new module Model? ',{
        defaultInput: modconf.moduleTitle
      })
      log.info('Collecting data definitions: ' +
        'Title, Name, Type, AllowNull, Default')
      if(readlineSync(
        'Do you want to add module data fields? (y/n): ',
        {defaultInput: 'y'}
      ).match(/y/i)){
        do {
          let field = {}
          field.fieldTitle = readlineSync('Field title? ')
          let fieldName = modconf.moduleTitle.toLowerCase()
          field.fieldName = field.moduleField = readlineSync('Field name? ',{
            defaultInput: fieldName
          })
          field.fieldType = readlineSync('Field type? ',{
            defaultInput: 'STRING'
          })
          field.fieldAllowNull = !!readlineSync(
            'Allow NULL? (y/n): ',{defaultInput: 'n'}).match(/y/i)
          field.fieldDefaultValue = readlineSync('Default value? ') || 'null'
          if(field.fieldAllowNull &&
            (!field.fieldDefaultValue || 'NULL' === field.fieldDefaultValue)
          ){
            field.fieldDefaultValue = null
          }
          modconf.moduleFields.push(field)
        } while(readlineSync('Add another field? (y/n): ',{
          defaultInput: 'y'
        }).match(/y/i))
      }
      //now write the module conf to a json file
      if(cmd.saveconf){
        log.info('Saving module config')
        fs.writeFileSync(
          folder + '/' + modconf.moduleName + '.json',
          JSON.stringify(modconf)
        )
      }
    }
    let moduleFolder = path.resolve(folder + '/kado_modules/' + modconf.moduleName)
    let templateFolder = path.resolve(__dirname + '/../../../helpers/_template')
    let fileCount = 0
    if(!cmd.app) cmd.app = 'myapp'
    K.bluebird.try(() => {
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
      .then(() => {
        return readdir(templateFolder)
      })
      .each((file) => {
        let template = fs.readFileSync(file,{encoding: 'utf-8'})
        let relativePath = file.replace(templateFolder,'')
        //execute path renames here as we write files
        if(relativePath.match('Model.js')){
          relativePath = relativePath.replace(
            'Model.js',modconf.moduleModelName + '.js'
          )
        }
        if(relativePath.match('cli.js')){
          relativePath = relativePath.replace(
            'cli.js',modconf.moduleName + '.js'
          )
        }
        if(relativePath.match('test.test.js')){
          relativePath = relativePath.replace(
            'test.test.js',modconf.moduleName + '.js'
          )
        }
        //upgrade data type fields
        modconf.moduleFields.forEach((f) => {
          f.allowNull = f.allowNull ? 'true' : 'false'
          f.defaultValue = f.defaultValue ? f.defaultValue : 'null'
        })
        log.info('Rendering ' + modconf.moduleName + relativePath)
        let result = Mustache.render(template,modconf)
        let modulePath = path.resolve(moduleFolder + '/' + relativePath)
        return mkdirp(path.dirname(modulePath))
          .then(() => {
            return fs.writeFileAsync(modulePath,result)
          })
          .then(() => {
            fileCount++
          })
      })
      .then(() => {
        log.info('Created ' + fileCount + ' new files!')
        log.info('Module generation complete! Please check: ' + moduleFolder)
        process.exit()
      })
  })


program.command('bootstrap')
  .option('--app <string>','Name of this application')
  .option('--dbhost <string>','Set the sequelize database host')
  .option('--dbport <string>','Set the sequelize database port')
  .option('--dbuser <string>','Set the sequelize database user')
  .option('--dbpassword <string>','Set the sequelize database password')
  .option('--dev','For generating an app.js to develop kado against NOT NORMAL')
  .action((cmd) => {
    let folder = process.cwd()
    let appFile = path.resolve(folder + '/app.js')
    if(fs.existsSync(appFile)){
      console.log('ERROR app file already exits')
      process.exit(1)
    }
    if(!cmd.app) cmd.app = 'myapp'
    cmd.enableAll = true
    if(cmd.enableAll){
      cmd.enableAdmin = true
      cmd.enableApi = true
      cmd.enableMain = true
      cmd.enableBlog = true
      cmd.enableContent = true
      cmd.enableDoc = true
      cmd.enableSetting = true
      cmd.enableStaff = true
    }
    if(cmd.enableBlog || cmd.enableSetting ||
      cmd.enableStaff || cmd.enableContent || cmd.enableDoc
    ){
      cmd.enableAdmin = true
    }
    if(cmd.enableBlog || cmd.enableDoc || cmd.enableContent){
      cmd.enableMain = true
    }
    let dbConfig = ''
    let enableDB = (name,flag) => {
      if(flag){
        let isFirst = false
        if(!dbConfig){
          dbConfig = ',\n  db: {\n'
          isFirst = true
        }
        let dbExtra = ''
        if(cmd.dbhost){
          dbExtra += '      host: \'' + cmd.dbhost + '\',\n'
        }
        if(cmd.dbport){
          dbExtra += '      port: ' + cmd.dbport + ',\n'
        }
        if(cmd.dbuser){
          dbExtra += '      user: \'' + cmd.dbuser + '\',\n'
        }
        if(cmd.dbpassword){
          dbExtra += '      password: \'' + cmd.dbpassword + '\',\n'
        }
        dbConfig = dbConfig +
          (isFirst ? '' : ',\n') + '    ' + name +
          ': {\n      enabled: true,\n' + (dbExtra || '') + '    }\n  }'
      }
    }
    enableDB('sequelize',cmd.enableAll)
    let interfaceConfig = ''
    let enableInterface = (name,flag) => {
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
    enableInterface('main',cmd.enableMain)
    if(interfaceConfig) interfaceConfig = interfaceConfig + '\n  }'
    let moduleConfig = ''
    let enableModule = (name,flag) => {
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
    enableModule('content',cmd.enableContent)
    enableModule('doc',cmd.enableDoc)
    enableModule('setting',cmd.enableSetting)
    enableModule('staff',cmd.enableStaff)
    if(moduleConfig) moduleConfig = moduleConfig + '\n  }\n'
    let appRequire = '\'kado\''
    if(cmd.dev) appRequire = '\'./index\''
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
