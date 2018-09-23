'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
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
  .option('-c, --content <s>','Content Content')
  .description('Create new content entry')
  .action((opts) => {
    P.try(() => {
      log.log('info','Creating content entry')
      if(!opts.title || !opts.content)
        throw new Error('Title and content are required')
      let doc = {
        title: opts.title,
        content: opts.content,
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
  .option('-c, --content <s>','Content Content')
  .description('Update existing content entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Content id is required')
    Content.find({where: {id: opts.id}})
      .then((result) => {
        let doc = result
        if(opts.title) doc.title = opts.title
        if(opts.uri) doc.uri = opts.uri
        if(opts.content) doc.content = opts.content
        if(opts.html) doc.html = opts.html
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
