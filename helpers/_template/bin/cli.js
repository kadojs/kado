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
const K = require('kado')

const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

let log = K.log
let sequelize = K.db.sequelize

let <%moduleModelName%> = sequelize.models.<%moduleModelName%>

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','<%moduleTitle%> Title')
  .option('-c, --content <s>','<%moduleTitle%> Content')
  .description('Create new <%moduleName%> entry')
  .action((opts) => {
    P.try(() => {
      log.info('Creating <%moduleName%> entry')
      let doc = {
        <%#moduleFields%>
        <%fieldName%>: opts.<%fieldName%>,
        <%/moduleFields%>
        active: true
      }
      return <%moduleModelName%>.create(doc)
    })
      .then((result) => {
        log.info('<%moduleTitle%> entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Failed to create <%moduleName%> entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','<%moduleTitle%> Id')
  .option('-t, --title <s>','<%moduleTitle%> Title')
  .option('-c, --content <s>','<%moduleTitle%> Content')
  .description('Update existing <%moduleName%> entry')
  .action((opts) => {
    if(!opts.id) throw new Error('<%moduleTitle%> id is required')
    <%moduleModelName%>.find({where: {id: opts.id}})
      .then((result) => {
        let doc = result
        <%#moduleFields%>
        if(opts.<%fieldName%>) doc.<%fieldName%> = opts.<%fieldName%>
        <%/moduleFields%>
        return doc.save()
      })
      .then(() => {
        log.info('<%moduleTitle%> entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save <%moduleName%> entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','<%moduleTitle%> Id to remove')
  .description('Remove <%moduleName%> entry')
  .action((opts) => {
    if(!opts.id) throw new Error('<%moduleTitle%> Id is required... exiting')
    <%moduleModelName%>.destroy({where: {id: opts.id}})
      .then(() => {
        log.info('<%moduleTitle%> entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not remove <%moduleName%> entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List <%moduleName%> entries')
  .action(() => {
    let table = new Table({
      head: [
        'Id',
        <%#moduleFields%>
        '<%fieldTitle%>',
        <%/moduleFields%>
      ]
    })
    let count = 0
    <%moduleModelName%>.findAll()
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
        if(!count) table.push(['No <%moduleName%> entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not list <%moduleName%> entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
