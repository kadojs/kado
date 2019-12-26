'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

//module properties
exports._kado ={
  enabled: true,
  name: 'kado',
  title: 'Kado',
  description: 'Reflect into Kado for generators and utilities'
}


/**
 * CLI Access
 * @param {Kado} app Main application
 */
exports.cli = (app) => {
  const fs = require('fs')
  const P = require('bluebird')
  const path = require('path')
  const readlineSync = require('readline-sync').question
  app.cli.command('kado','dbsetup',{
    description: 'Execute ORM Sync against configured database',
    options: [
      {definition: '--force', description: 'Dangerously upgrade table schemas'}
    ],
    action: (app,opts) => {
      app.log.info('Connecting to sequelize')
      opts.force = !!opts.force
      if(opts.force){
        let forceConfirm = readlineSync(
          'Are you sure you want to continue, may DESTROY DATA!? (y/n)'
        )
        if('y' !== forceConfirm){
          app.log.info('Force mode aborted, sissy!')
          opts.force = false
        } else {
          app.log.info('Force mode engaged, welcome Rambo')
        }
      }
      app.database.sequelize.connect({sync: true, syncForce: opts.force})
        .then(() => {
          app.log.info('Database connected, initializing...')
        })
        .catch((err) => {
          app.log.error(err)
          process.exit(1)
        })
        .finally(() => {
          app.log.info('Database setup complete, run this again any time')
          app.db.sequelize.close()
          process.exit(0)
        })
    }
  })
  app.cli.command('kado','dbreload',{
    description: 'Restructure the configured database overlay existing data.',
    options: [
      {definition: '--force', description: 'Skip confirmation'}
    ],
    action: (app,opts) => {
      app.log.info('Connecting to sequelize')
      opts.force = !!opts.force
      if(!opts.force){
        let forceConfirm = readlineSync(
          'Are you sure you want to continue, while this is NORMALLY SAFE, ' +
          'it may DESTROY ALL DATA!? (y/n)'
        )
        if('y' !== forceConfirm){
          app.log.info('Force mode aborted, sissy!')
          process.exit()
        } else {
          app.log.info('Force mode engaged, welcome Rambo')
        }
      }
      app.log.info('Beginning to dump current database.')
      let cfg = app.config.db.sequelize
      let kadoRoot = process.env.KADO_USER_ROOT
      if(kadoRoot === '0') kadoRoot = process.env.KADO_ROOT
      let backupFile = path.resolve(kadoRoot + '/.dbreloadBackup.sql')
      let backupFileCopy = backupFile + '2'
      try{
        require.resolve('mysqldump')
        require.resolve('mysql-import')
      } catch(e){
        app.log.error('Missing MySQL helper packages try: ' +
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
      if(fs.existsSync(backupFileCopy)) fs.unlinkSync(backupFileCopy)
      if(fs.existsSync(backupFile)) fs.renameSync(backupFile,backupFileCopy)
      let dumpFile = path.resolve(kadoRoot + '/.dbreloadDump.sql')
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
          app.log.info('Database backup complete')
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
          app.log.info('Database dump complete')
          app.log.info('Starting to sync to newest models...')
          return app.database.sequelize.connect({sync: true, syncForce: true})
        })
        .then(() => {
          app.log.info('Database restructure complete, applying database dump.')
          return mImport.import(dumpFile)
        })
        .catch((err) => {
          app.log.error('DB Reload failed: ' + err)
          app.db.sequelize.close()
          process.exit(1)
        })
        .finally(() => {
          app.log.info('Database reload complete!')
          app.db.sequelize.close()
          process.exit()
        })
    }
  })
  app.cli.command('kado','insert-samples',{
    description: 'Insert sample database records into database',
    action: (app) => {
      app.log.info('Connecting to sequelize')
      let sql
      let statements = []
      app.database.sequelize.connect({sync: true})
        .then(() => {
          app.log.info('Database connected, initializing...')
        })
        .then(() => {
          app.log.info('Database setup complete, inserting samples')
          sql = fs.readFileSync(
            __dirname + '/../sql/sample.sql',{encoding: 'utf-8'})
          statements = sql.split(/\n/)
          statements = statements.filter((s) => {return !!s})
          return statements
        })
        .each((s) => {
          let table = s.substring(0,s.indexOf('('))
            .replace('INSERT INTO `','').replace('` ','')
          return app.db.sequelize.query(s,{raw: true,
            type: app.db.sequelize.QueryTypes.INSERT
          })
            .then(() => {app.log.info(table + ' record inserted!')})
        })
        .catch((err) => {
          app.log.error(err)
          process.exit(1)
        })
        .finally(() => {
          app.log.info('Sample insertion complete')
          app.db.sequelize.close()
          process.exit()
        })
    }
  })
  app.cli.command('kado','generate',{
    description: 'Generate a new module using the module template',
    options: [
      {
        definition: '--header <s>',
        description: 'File to read for file header text'
      },
      {
        definition: '--modconf <s>',
        description: 'Provide a JSON file containing a module ' +
          'definition, otherwise an interactive process will be used.'
      },
      {
        definition: '--saveconf',
        description: 'Save module configuration to a JSON file'
      },
      {
        definition: '--stomp',
        description: 'Remove the destination directory if it exists, DANGEROUS!'
      }
    ],
    action: (app,opts) => {
      const mkdirp = require('mkdirp-then')
      const Mustache = require('mustache')
      const readdir = require('recursive-readdir')
      const rmdir = P.promisify(require('rimraf'))
      let fileHeaderPath = __dirname + '/header.txt'
      let fileHeader = 'KADO GENERATOR\n'
      //get our file header
      if(opts.header && opts.header[0] !== '/' && opts.header[2] !== '\\'){
        opts.header = path.resolve(
          path.join(path.dirname(process.argv[1]),opts.header))
      }
      if(opts.header && fs.existsSync(opts.header)){
        fileHeader = fs.readFileSync(opts.header)
      } else if(fs.existsSync(fileHeaderPath)){
        fileHeader = fs.readFileSync(fileHeaderPath)
      }
      //set our mustache tag usage here
      Mustache.tags = ['<%','%>']
      let folder = process.cwd()
      let modconf = {moduleFields: []}
      modconf.fileHeader = fileHeader
      if(opts.modconf){
        let modconfFile = folder + '/' + opts.modconf
        if(!modconfFile || !fs.existsSync(modconfFile)){
          app.log.error('Must have module configuration JSON file, exiting')
          process.exit(1)
        }
        modconf = require(modconfFile)
      } else {
        //build the module conf using readline
        app.log.info('Acquiring module info: Title, Name')
        modconf.moduleTitle = readlineSync('Title of new module? ')
        let modname = modconf.moduleTitle.toLowerCase()
        modconf.moduleName = readlineSync('Name of new module? ',{
          defaultInput: modname})
        modconf.moduleModelName = readlineSync('Name of new module Model? ',{
          defaultInput: modconf.moduleTitle
        })
        app.log.info('Collecting data definitions: ' +
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
        if(opts.saveconf){
          app.log.info('Saving module config')
          fs.writeFileSync(
            folder + '/' + modconf.moduleName + '.json',
            JSON.stringify(modconf)
          )
        }
      }
      let moduleFolderName = 'kado_modules'
      if(app.config.userModuleFolderName){
        moduleFolderName = app.config.userModuleFolderName
      }
      let moduleFolder = path.resolve(
        folder + '/' + moduleFolderName + '/' + modconf.moduleName)
      let templateFolder = path.resolve(
        __dirname + '/../../../lib/_moduleTemplate')
      let fileCount = 0
      if(!opts.app) opts.app = 'myapp'
      P.try(() => {
        let folderExists = fs.existsSync(moduleFolder)
        if(folderExists && !opts.stomp){
          app.log.error('Module folder already exits')
          process.exit(1)
        } else if(folderExists && opts.stomp){
          app.log.info('Removing existing module folder')
          return rmdir(moduleFolder)
        } else {
          app.log.info('Creating module folder')
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
          app.log.info('Rendering ' + modconf.moduleName + relativePath)
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
          app.log.info('Created ' + fileCount + ' new files!')
          app.log.info('Module generation complete! Please check: ' + moduleFolder)
          process.exit()
        })
    }
  })
}
