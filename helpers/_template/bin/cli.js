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
  .action((opts) => {
    P.try(() => {
      log.info('Creating {{moduleName}} entry')
      let doc = {
        {{#moduleFields}}
        {{fieldName}}: opts.{{fieldName}},
        {{/moduleFields}}
        active: true
      }
      return {{moduleModelName}}.create(doc)
    })
      .then((result) => {
        log.info('{{moduleTitle}} entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Failed to create {{moduleName}} entry: ' + err)
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
  .action((opts) => {
    if(!opts.id) throw new Error('{{moduleTitle}} id is required')
    Blog.find({where: {id: opts.id}})
      .then((result) => {
        let doc = result
        {{#moduleFields}}
        if(opts.{{fieldName}}) doc.{{fieldName}} = opts.{{fieldName}}
        {{/moduleFields}}
        return doc.save()
      })
      .then(() => {
        log.info('{{moduleTitle}} entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save {{moduleName}} entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','{{moduleTitle}} Id to remove')
  .description('Remove {{moduleName}} entry')
  .action((opts) => {
    if(!opts.id) throw new Error('{{moduleTitle}} Id is required... exiting')
    {{moduleModelName}}.destroy({where: {id: opts.id}})
      .then(() => {
        log.info('{{moduleTitle}} entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not remove {{moduleName}} entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List {{moduleName}} entries')
  .action(() => {
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
      .each((row) => {
        count++
        table.push([
          row.id,
          row.title,
          row.content.replace(/<(?:.|\n)*?>/gm, '').substring(0,50),
          row.active ? 'Yes' : 'No'
        ])
      })
      .then(() => {
        if(!count) table.push(['No {{moduleName}} entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not list {{moduleName}} entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
