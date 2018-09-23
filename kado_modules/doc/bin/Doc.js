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

let Doc = sequelize.models.Doc

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','Doc Title')
  .option('-c, --content <s>','Doc Content')
  .description('Create new doc entry')
  .action((opts) => {
    P.try(() => {
      log.info('Creating doc entry')
      let doc = {
        title: opts.title,
        uri: opts.uri,
        active: true
      }
      return Doc.create(doc)
    })
      .then((result) => {
        log.info('Doc entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Failed to create doc entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','Doc Id')
  .option('-t, --title <s>','Doc Title')
  .option('-c, --content <s>','Doc Content')
  .description('Update existing doc entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Doc id is required')
    Doc.find({where: {id: opts.id}})
      .then((result) => {
        let doc = result
        if(opts.title) doc.title = opts.title
        if(opts.uri) doc.uri = opts.uri
        return doc.save()
      })
      .then(() => {
        log.info('Doc entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save doc entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','Doc Id to remove')
  .description('Remove doc entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Doc Id is required... exiting')
    Doc.destroy({where: {id: opts.id}})
      .then(() => {
        log.info('Doc entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not remove doc entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List doc entries')
  .action(() => {
    let table = new Table({
      head: [
        'Id',
        'Title',
        'Uri',
      ]
    })
    let count = 0
    Doc.findAll()
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
        if(!count) table.push(['No doc entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not list doc entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
