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

let Blog = sequelize.models.Blog

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','Blog Title')
  .option('-u, --uri <s>','Blog URI')
  .option('-c, --content <s>','Blog Content')
  .description('Create new blog entry')
  .action((opts) => {
    P.try(() => {
      log.log('info','Creating blog entry')
      if(!opts.title || !opts.content)
        throw new Error('Title and content are required')
      let doc = {
        title: opts.title,
        uri: opts.title.replace(/[\s]+/g,'-').toLowerCase(),
        content: opts.content,
        html: opts.content,
        active: true
      }
      return Blog.create(doc)
    })
      .then((result) => {
        log.log('info','Blog entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Failed to create blog entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','Blog Id')
  .option('-t, --title <s>','Blog Title')
  .option('-u, --uri <s>','Blog URI')
  .option('-c, --content <s>','Blog Content')
  .description('Update existing blog entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Blog id is required')
    Blog.findByPk(opts.id)
      .then((result) => {
        let doc = result
        if(opts.title) doc.title = opts.title
        if(opts.uri) doc.uri = opts.uri
        if(opts.content){
          doc.content = opts.content
          doc.html = opts.html
        }
        return doc.save()
      })
      .then(() => {
        log.log('info','Blog entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save blog entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','Blog Id to remove')
  .description('Remove blog entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Blog Id is required... exiting')
    Blog.destroy({where: {id: opts.id}})
      .then(() => {
        log.log('info','Blog entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Could not remove blog entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List blog entries')
  .action(() => {
    let table = new Table({
      head: ['Id','Title','Content','Active']
    })
    let blogCount = 0
    Blog.findAll()
      .each((row) => {
        blogCount++
        table.push([
          row.id,
          row.title,
          row.uri,
          row.content.replace(/<(?:.|\n)*?>/gm, '').substring(0,50),
          row.active ? 'Yes' : 'No'
        ])
      })
      .then(() => {
        if(!blogCount) table.push(['No blog entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Could not list blog entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
if(process.argv.length - 3 < 0) program.help()
else program.parse(process.argv)
