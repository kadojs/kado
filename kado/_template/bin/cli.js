'use strict';
const K = require('../../../index')

const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

let log = K.log
let sequelize = K.db.sequelize

let {{moduleModelName}} = sequelize.models.{{moduleModelName}}

//make some promises
P.promisifyAll(bcrypt)

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','{{moduleTitle}} Title')
  .option('-c, --content <s>','{{moduleTitle}} Content')
  .description('Create new {{moduleName}} entry')
  .action(function(opts){
    P.try(function(){
      log.log('info','Creating {{moduleName}} entry')
      let doc = {
        {{#moduleFields}}
          {{fieldName}}: opts.{{fieldName}},
        {{/moduleFields}}
        active: true
      }
      return {{moduleModelName}}.create(doc)
    })
      .then(function(result){
        log.log('info','{{moduleTitle}} entry created: ' + result.id)
        process.exit()
      })
      .catch(function(err){
        log.log('error', 'Error: Failed to create {{moduleName}} entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','{{moduleTitle}} Id')
  .option('-t, --title <s>','{{moduleTitle}} Title')
  .option('-c, --content <s>','{{moduleTitle}} Content')
  .description('Update existing {{moduleName}} entry')
  .action(function(opts){
    if(!opts.id) throw new Error('{{moduleTitle}} id is required')
    Blog.find({where: {id: opts.id}})
      .then(function(result){
        let doc = result
        {{#moduleFields}}
          if(opts.{{fieldName}}) doc.{{fieldName}} = opts.{{fieldName}}
        {{/moduleFields}}
        return doc.save()
      })
      .then(function(){
        log.log('info','{{moduleTitle}} entry updated successfully!')
        process.exit()
      })
      .catch(function(err){
        if(err) throw new Error('Could not save {{moduleName}} entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','{{moduleTitle}} Id to remove')
  .description('Remove {{moduleName}} entry')
  .action(function(opts){
    if(!opts.id) throw new Error('{{moduleTitle}} Id is required... exiting')
    {{moduleModelName}}.destroy({where: {id: opts.id}})
      .then(function(){
        log.log('info','{{moduleTitle}} entry removed successfully!')
        process.exit()
      })
      .catch(function(err){
        log.log('error', 'Error: Could not remove {{moduleName}} entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List {{moduleName}} entries')
  .action(function(){
    let table = new Table({
      head: [
        'Id',
        {{#moduleFields}}
          '{{fieldTitle}}',
        {{/moduleFields}}
      ]
    })
    let count = 0
    {{moduleModelName}}.findAll()
      .each(function(row){
        count++
        table.push([
          row.id,
          row.title,
          row.content.replace(/<(?:.|\n)*?>/gm, '').substring(0,50),
          row.active ? 'Yes' : 'No'
        ])
      })
      .then(function(){
        if(!count) table.push(['No {{moduleName}} entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch(function(err){
        log.log('error', 'Error: Could not list blog entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
