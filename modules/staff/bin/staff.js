'use strict';
const K = require('../../../index')

const bcrypt = require('bcrypt')
const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

let log = K.log
let sequelize = K.db.sequelize

let Staff = sequelize.models.Staff

//make some promises
P.promisifyAll(bcrypt)

let config = K.config

//create
program
  .command('create')
  .option('-e, --email <s>','Email')
  .option('-p, --password <s>','Password')
  .option('-n, --name <s>','Name')
  .description('Create new staff member')
  .action((opts) => {
    P.try(() => {
      log.log('info','Creating staff member')
      if(!opts.email || !opts.password)
        throw new Error('Email and password are required')
      let doc = {
        email: opts.email,
        password: bcrypt.hashSync(
          opts.password,bcrypt.genSaltSync(12)),
        name: opts.name,
        active: true
      }
      return Staff.create(doc)
    })
      .then(() => {
        log.log('info','Staff member created!')
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Failed to create staff member: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-e, --email <s>','Email used to look up staff member')
  .option('-E, --newEmail <s>','New email address if its being changed')
  .option('-p, --password <s>','Password')
  .option('-n, --name <s>','Name')
  .description('Update existing staff member')
  .action((opts) => {
    if(!opts.email) throw new Error('Email is required')
    Staff.find({where: {email: opts.email}})
      .then((result) => {
        let doc = result
        if(opts.newEmail) doc.email = opts.newEmail
        if(opts.password){
          doc.passwordLastChanged = new Date().toJSON()
          doc.password = bcrypt.hashSync(
            opts.password,bcrypt.genSaltSync(12))
        }
        if(opts.name) doc.name = opts.name
        return doc.save()
      })
      .then(() => {
        log.log('info','Staff member updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save staff member: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-e, --email <s>','Email of staff member to remove')
  .description('Remove staff member')
  .action((opts) => {
    if(!opts.email) throw new Error('Email is required... exiting')
    Staff.destroy({where: {email: opts.email}})
      .then(() => {
        log.log('info','Staff member removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Could not remove staff member: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List staff members')
  .action(() => {
    let table = new Table({
      head: ['Id','Email','Name','Active']
    })
    let staffCount = 0
    Staff.findAll()
      .each((row) => {
        staffCount++
        table.push([row.id,row.email,row.name,row.active ? 'Yes' : 'No'])
      })
      .then(() => {
        if(!staffCount) table.push(['No staff members'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.log('error', 'Error: Could not list staff members ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
