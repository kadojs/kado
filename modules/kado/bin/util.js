#!/use/bin/env node
'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')
const program = require('commander')
const fs = require('fs')
const mkdirp = require('mkdirp-then')
const Mustache = require('mustache')
const path = require('path')
const readlineSync = require('readline-sync').question
const readdir = require('recursive-readdir')
const rmdir = P.promisify(require('rimraf'))
module.exports = (K)=>{
  const log = K.log
  //make some promises
  P.promisifyAll(fs)
  program.version(K.config.version)
  program.command('dbsetup')
    .option('--force','Dangerously upgrade table schemas')
    .action((cmd) => {
      log.info('Connecting to sequelize')
      cmd.force = !!cmd.force
      if(cmd.force){
        let forceConfirm = readlineSync(
          'Are you sure you want to continue, may DESTROY DATA!? (y/n)'
        )
        if('y' !== forceConfirm){
          log.info('Force mode aborted, sissy!')
          cmd.force = false
        } else {
          log.info('Force mode engaged, welcome Rambo')
        }
      }
      K.database.sequelize.connect({sync: true, syncForce: cmd.force})
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
  program.command('dbreload')
    .action((cmd) => {
      log.info('Connecting to sequelize')
      cmd.force = !!cmd.force
      let forceConfirm = readlineSync(
        'Are you sure you want to continue, while this is NORMALLY SAFE, ' +
        'it may DESTROY ALL DATA!? (y/n)'
      )
      if('y' !== forceConfirm){
        log.info('Force mode aborted, sissy!')
        process.exit()
      } else {
        log.info('Force mode engaged, welcome Rambo')
      }
      log.info('Beginning to dump current database.')
      let cfg = K.config.db.sequelize
      let kadoRoot = process.env.KADO_USER_ROOT
      if(kadoRoot === '0') kadoRoot = process.env.KADO_ROOT
      let backupFile = K.path.resolve(kadoRoot + '/.dbreloadBackup.sql')
      let backupFileCopy = backupFile + '2'
      try{
        require.resolve('mysqldump')
        require.resolve('mysql-import')
      } catch(e){
        log.error('Missing MySQL helper packages try: ' +
          'npm install mysqldump mysql-import --save-dev')
        process.exit(1)
      }
      let mysqldump = require('mysqldump')
      let mysqlImport = require('mysql-import')
      let mImport = mysqlImport.config({
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.name,
        onerror: err=>console.log(err.message)
      })
      if(K.fs.existsSync(backupFileCopy)) K.fs.unlinkSync(backupFileCopy)
      if(K.fs.existsSync(backupFile)) K.fs.renameSync(backupFile,backupFileCopy)
      let dumpFile = K.path.resolve(kadoRoot + '/.dbreloadDump.sql')
      P.try(()=>{
        return mysqldump({
          connection: {
            host: cfg.host,
            user: cfg.user,
            password: cfg.password,
            database: cfg.name
          },
          dumpToFile: backupFile
        })
      })
        .then(()=> {
          log.info('Database backup complete')
          return mysqldump({
            connection: {
              host: cfg.host,
              user: cfg.user,
              password: cfg.password,
              database: cfg.name
            },
            dumpToFile: dumpFile,
            dump: {
              schema: false
            }
          })
        })
        .then(()=>{
          log.info('Database dump complete')
          log.info('Starting to sync to newest models...')
          return K.database.sequelize.connect({sync: true, syncForce: true})
        })
        .then(() => {
          log.info('Database restructure complete, applying database dump.')
          return mImport.import(dumpFile)
        })
        .catch((err) => {
          log.error('DB Reload failed: ' + err)
          K.db.sequelize.close()
          process.exit(1)
        })
        .finally(() => {
          log.info('Database reload complete!')
          K.db.sequelize.close()
          process.exit()
        })
    })
  program.command('insert-samples')
    .action(() => {
      log.info('Connecting to sequelize')
      let sql
      let statements = []
      K.database.sequelize.connect({sync: true})
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
    .option('--modconf <s>','Provide a JSON file containing a module ' +
      'definition, otherwise an interactive process will be used.')
    .option('--saveconf','Save module configuration to a JSON file')
    .option('--stomp','Remove the destination directory if it ' +
      'exists, DANGEROUS!')
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
      let moduleFolderName = 'kado_modules'
      if(K.config.userModuleFolderName){
        moduleFolderName = K.config.userModuleFolderName
      }
      let moduleFolder = path.resolve(
        folder + '/' + moduleFolderName + '/' + modconf.moduleName)
      let templateFolder = path.resolve(
        __dirname + '/../../../lib/_moduleTemplate')
      let fileCount = 0
      if(!cmd.app) cmd.app = 'myapp'
      P.try(() => {
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
              'test.test.js',modconf.moduleName + '.test.js'
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
  program.parse(process.argv)
}
