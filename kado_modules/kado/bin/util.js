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
      K.db.sequelize.connect({sync: true, syncForce: cmd.force})
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
          return K.db.sequelize.doConnect({sync: true, syncForce: true})
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
      let moduleFolder = path.resolve(
        folder + '/kado_modules/' + modconf.moduleName)
      let templateFolder = path.resolve(
        __dirname + '/../../../helpers/_template')
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
  program.command('bootstrap')
    .option('--app <string>','Name of this application')
    .option('--dbhost <string>','Set the sequelize database host')
    .option('--dbport <string>','Set the sequelize database port')
    .option('--dbuser <string>','Set the sequelize database user')
    .option('--dbpassword <string>','Set the sequelize database password')
    .option('--dev','For generating an app.js to develop kado against ' +
      'NOT NORMAL')
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
  program.command('bundle')
    .option('-H --hints','Show performance hints when bundling')
    .option('-i --interface <name>','Only bundle for this interface')
    .option('-l --local','Bundle and deferred entry points only')
    .option('-N --nomap','Skip source mapping')
    .option('-q --quick','Local only no source maps')
    .option('-p --production','Production mode')
    .action((cmd) => {
      let sourceMap = true
      if(cmd.nomap || cmd.quick) sourceMap = false
      if(cmd.quick) cmd.local = true
      if(!cmd.production){
        log.info(
          'Development mode active, use --production to build for launch!')
      }
      if(cmd.local){
        log.info('Building bundle and deferred entry points only')
      }

      /**
       * Bundle an interface for distribution
       * @param {string} ifaceName
       * @param {string} configFile path to config file
       */
      const bundleInterface = function bundleInterface(ifaceName,configFile){
        const childProcess = require('child_process')
        const TerserPlugin = require('terser-webpack-plugin')
        const webpack = require('webpack')
        let entryFolder = path.resolve(process.env.KADO_ROOT +
          '/interface/' + ifaceName + '/asset')
        let helperFolder = path.resolve(
          process.env.KADO_ROOT + '/helpers/asset')
        let systemEntryFolder = entryFolder
        let outputFolder = path.resolve(process.env.KADO_ROOT +
          '/interface/' + ifaceName + '/public/dist')
        //package local resources
        let bundle = ''
        let deferredJs = ''
        let localList = [
          process.env.KADO_ROOT + '/interface/' + ifaceName + '/asset',
          process.env.KADO_USER_ROOT + '/interface/' + ifaceName + '/asset'
        ]
        localList.map((root)=>{
          let assetFile = path.resolve(root + '/bundle.js')
          let assetFileDeferred = path.resolve(root + '/deferred.js')
          if(fs.existsSync(assetFile)){
            assetFile = assetFile.replace(/\\/g,'/')
            bundle = bundle + 'require(\'' + assetFile + '\')\n'
          }
          if(fs.existsSync(assetFileDeferred)){
            assetFileDeferred = assetFileDeferred.replace(/\\/g,'/')
            deferredJs = deferredJs + 'require(\'' + assetFileDeferred + '\')\n'
          }
        })
        //write the module list for reading in the extra.js helper
        fs.writeFileSync(systemEntryFolder + '/bundlePkg.js',bundle)
        fs.writeFileSync(systemEntryFolder + '/deferredPkg.js',deferredJs)
        //package module resources
        let moduleJs = ''
        let moduleDeferred = ''
        let moduleList = childProcess.execSync(
          'node ' + process.env.KADO_ROOT +
          '/kado_modules/kado/bin/util.js scan-modules'
        ).toString('utf-8').split('\n')
        moduleList.map((modRoot)=>{
          let assetFile = path.resolve(modRoot + '/' + ifaceName +
            '/asset/bundle.js')
          let assetFileDeferred = path.resolve(
            modRoot + '/' + ifaceName + '/asset/deferred.js')
          if(fs.existsSync(assetFile)){
            assetFile = assetFile.replace(/\\/g,'/')
            moduleJs = moduleJs + 'require(\'' + assetFile + '\')\n'
          }
          if(fs.existsSync(assetFileDeferred)){
            assetFileDeferred = assetFileDeferred.replace(/\\/g,'/')
            moduleDeferred = moduleDeferred + 'require(\'' + assetFileDeferred +
              '\')\n'
          }
        })
        //write the module list for reading in the extra.js helper
        fs.appendFileSync(systemEntryFolder + '/bundlePkg.js',moduleJs)
        fs.appendFileSync(systemEntryFolder + '/deferredPkg.js',moduleDeferred)
        if(!K.interfaces || !K.interfaces[ifaceName]){
          throw new Error('Interface does not exist, cannot be bundled')
        }
        let entryPoints = {
          main: helperFolder + '/main.js',
          bundle: entryFolder + '/bundlePkg.js'
        }
        if(!cmd.local){
          entryPoints.deferred =  systemEntryFolder + '/deferredPkg.js'
          entryPoints.dataTables =  helperFolder + '/dataTables.js'
          entryPoints.tuiEditor = helperFolder + '/tuiEditor.js'
          entryPoints.tuiViewer = helperFolder + '/tuiViewer.js'
        }
        let packOptions = {
          entry: entryPoints,
          output: {
            path: outputFolder,
            filename: '[name].js'
          },
          module: {
            rules: [
              {test: /datatables\.net.*/,
                loader: 'imports-loader?define=>false'},
              {test: /\.js$/, exclude: /node_modules/, use: {
                  loader: 'babel-loader', options: {presets: ['env']}}},
              // any other rules
              {
                // Exposes jQuery for use outside Webpack build
                test: require.resolve('jquery'),
                use: [{
                  loader: 'expose-loader',
                  options: 'jQuery'
                },{
                  loader: 'expose-loader',
                  options: '$'
                }]
              }
            ]
          },
          optimization: {
            minimizer: [new TerserPlugin({
              parallel: true,
              sourceMap: true,
              terserOptions: {
                warnings: false,
                ie8: false
              }
            })]
          },
          performance: {hints: false},
          plugins: [
            new webpack.ProvidePlugin({
              $: 'jquery',
              jQuery: 'jquery'
            })
          ]
        }
        if(!configFile) configFile = 'webpack.config.js'
        let packOptionFile = path.resolve(
          K.interfaces[ifaceName].root + '/asset/' + configFile)
        let packOptionFileUser = path.resolve(process.env.KADO_USER_ROOT +
          '/interface/' + ifaceName + '/asset/' + configFile
        )
        let quickObjectMerge = (obj,ref)=>{
          if('object' !== typeof obj && 'object' !== typeof ref) return
          for(let key in obj){
            if(obj.hasOwnProperty(key)){
              if('object' === typeof obj[key]){
                if(!ref[key]) ref[key] = {}
                quickObjectMerge(obj[key],ref[key])
              } else {
                ref[key] = obj[key]
              }
            }
          }
        }
        if(K.fs.existsSync(packOptionFile)){
          quickObjectMerge(require(packOptionFile),packOptions)
        }
        if(K.fs.existsSync(packOptionFileUser)){
          quickObjectMerge(require(packOptionFileUser),packOptions)
        }
        if(!packOptions || !packOptions.entry){
          log.warn('Skipped packing ' + ifaceName + ' with config file: ' +
            configFile + ', KADO_USER_ROOT missing.')
          return
        }
        //turn on performance hints if needed
        if(cmd.hints && packOptions){
          if(!packOptions.performance) packOptions.performance = {}
          packOptions.performance.hints = 'warning'
        }
        //turn off source maps when not needed
        if(!sourceMap){
          packOptions.devtool = false
          packOptions.optimization.minimizer[0].sourceMap = false
        }
        //turn on dev mode any time we can
        if(!cmd.production){
          process.env.DEV = 'kado'
          process.env.NODE_ENV = 'development'
          packOptions.mode = 'development'
          packOptions.devtool = 'cheap-module-source-map'
        } else {
          packOptions.mode = 'production'
          packOptions.devtool = 'source-map'
        }
        log.info('Starting webpack for ' + ifaceName)
        log.debug(ifaceName + ' options: ' + JSON.stringify(packOptions))
        let pack = webpack(packOptions)
        pack.run = P.promisify(pack.run)
        return pack.run()
          .then((result)=>{
            return {stat: result, statJson: result.toJson(), ifaceName: ifaceName}
          })
          .catch((e)=> {
            console.log(e)
            log.warn('Failed to bundle ' + ifaceName + ': ' + e.message)
          })
      }
      let systemConfigFile = 'webpack.config.js'
      //interfaces so hmm
      P.try(()=> {
        return Object.keys(K.interfaces)
      })
        .filter((ifaceName)=>{
          if(!cmd.interface) return true
          return (cmd.interface && ifaceName === cmd.interface)
        })
        .map((ifaceName)=>{
          let promises = []
          promises.push(bundleInterface(ifaceName,systemConfigFile))
          return P.all(promises)
        })
        .each((results)=>{
          results.map((result) => {
            if(!result || !result.stat) return
            let duration = result.stat.endTime - result.stat.startTime
            log.info('Bundle result complete for ' + result.ifaceName +
              ' with hash: ' + result.stat.hash +
              ' and took ' + duration + 'ms')
            if(result.stat.hasWarnings()){
              log.warn(result.ifaceName + ' bundle finished with warnings: ' +
                result.statJson.warnings)
            }
            if(result.stat.hasErrors()){
              log.error(result.ifaceName + ' bundle finished with errors: ' +
                result.statJson.errors)
            }
          })
        })
        .then(()=>{
          log.info('Bundle process complete')
          process.exit(0)
        })
        .catch((e)=>{
          console.log(e)
          log.error('Failed to bundle: ' + e.message)
          process.exit(1)
        })
    })
  program.command('scan-modules')
    .option('-j --json','JSON output of module object instead')
    .action((cmd) => {
      K.scanModules()
        .then(()=>{
          if(cmd.json){
            console.log(JSON.stringify(K.modules))
          } else {
            Object.keys(K.modules).map((modKey)=>{
              let modInfo = K.modules[modKey]
              console.log(modInfo.root)
            })
          }
          process.exit(0)
        })
        .catch((e)=> {
          if(cmd.json){
            console.log(JSON.stringify({error: e.message}))
          } else {
            console.log(e)
          }
          process.exit(1)
        })
    })
  program.parse(process.argv)
}
