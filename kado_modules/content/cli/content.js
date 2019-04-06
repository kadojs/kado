'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../../../index')

const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

let log = K.log
let sequelize = K.db.sequelize

let Content = sequelize.models.Content

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','Content Title')
  .option('-u, --uri <s>','Content URI')
  .option('-c, --content <s>','Content Content')
  .description('Create new content entry')
  .action((opts) => {
    P.try(() => {
      log.log('info','Creating content entry')
      if(!opts.title || !opts.content)
        throw new Error('Title and content are required')
      let doc = {
        title: opts.title,
        uri: opts.uri || opts.title.replace(/[\s]+/g,'-').toLowerCase(),
        content: opts.content,
        html: opts.content,
        active: true
      }
      return Content.create(doc)
    })
      .then((result) => {
        log.log('info','Content entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Failed to create content entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','Content Id')
  .option('-t, --title <s>','Content Title')
  .option('-u, --uri <s>','Content URI')
  .option('-c, --content <s>','Content Content')
  .description('Update existing content entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Content id is required')
    Content.findByPk(opts.id)
      .then((result) => {
        let doc = result
        if(opts.title) doc.title = opts.title
        if(opts.uri) doc.uri = opts.uri
        if(opts.content){
          doc.content = opts.content
          doc.html = opts.content
        }
        return doc.save()
      })
      .then(() => {
        log.log('info','Content entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save content entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','Content Id to remove')
  .description('Remove content entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Content Id is required... exiting')
    Content.destroy({where: {id: opts.id}})
      .then(() => {
        log.log('info','Content entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Could not remove content entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List content entries')
  .action(() => {
    let table = new Table({
      head: ['Id','Title','Content','Active']
    })
    let contentCount = 0
    Content.findAll()
      .each((row) => {
        contentCount++
        table.push([
          row.id,
          row.title,
          row.uri,
          row.content.replace(/<(?:.|\n)*?>/gm, '').substring(0,50),
          row.active ? 'Yes' : 'No'
        ])
      })
      .then(() => {
        if(!contentCount) table.push(['No content entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Could not list content entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
