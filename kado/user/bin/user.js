'use strict';
var K = require('../../../index')
var bcrypt = require('bcrypt')
var P = require('bluebird')
var Table = require('cli-table')
var program = require('commander')

var logger = K.log

var db = K.db.sqlite

//make some promises
P.promisifyAll(bcrypt)

var config = K.config

//create
program
  .command('create')
  .option('-e, --email <s>','Email')
  .option('-p, --password <s>','Password')
  .option('-n, --name <s>','Name')
  .description('Create new staff member')
  .action(function(opts){
    logger.log('info','Creating staff member')
    if(!opts.email || !opts.password)
      throw new Error('Email and password are required')
    var doc = {
      email: opts.email,
      password: bcrypt.hashSync(
        opts.password,bcrypt.genSaltSync(12)),
      name: opts.name,
      active: true,
      createdAt: new Date().toJSON()
    }
    db.prepare('INSERT INTO `staff` (`email`,`password`,`name`,`active`) ' +
      'VALUES (?, ?, ?,?)').run([doc.email,doc.password,doc.name,1])
    logger.log('info','Staff member created!')
    process.exit()
  })
//update
program
  .command('update')
  .option('-e, --email <s>','Email used to look up staff member')
  .option('-E, --newEmail <s>','New email address if its being changed')
  .option('-p, --password <s>','Password')
  .option('-n, --name <s>','Name')
  .description('Update existing staff member')
  .action(function(opts){
    if(!opts.email) throw new Error('Email is required')
    var doc = db.prepare(
      'SELECT * FROM `staff` WHERE `email` = ?').get([opts.email])
    if(opts.newEmail) doc.email = opts.newEmail
    if(opts.password){
      doc.passwordLastChanged = new Date().toJSON()
      doc.password = bcrypt.hashSync(
        opts.password,bcrypt.genSaltSync(12))
    }
    if(opts.name) doc.name = opts.name
    doc.updatedAt = new Date().toJSON()
    db.prepare('UPDATE `staff` SET `email` = ?, `password` = ?, ' +
      '`passwordLastChanged` = ?, `name` = ?, `updatedAt` = ?'
    ).run([
      doc.email,doc.password,doc.passwordLastChanged,
      doc.name,doc.updatedAt
    ])
    logger.log('info','Staff member updated successfully!')
    process.exit()
  })
//remove
program
  .command('remove')
  .option('-e, --email <s>','Email of staff member to remove')
  .description('Remove staff member')
  .action(function(opts){
    if(!opts.email) throw new Error('Email is required... exiting')
    db.prepare('DELETE FROM `staff` WHERE `email` = ?').run([opts.email])
    logger.log('info','Staff member removed successfully!')
    process.exit()
  })
//list
program
  .command('list')
  .description('List staff members')
  .action(function(){
    var table = new Table({
      head: ['Email','Name','Active']
    })
    var rows = db.prepare('SELECT * FROM `staff` ORDER BY `email`').all()
    var staffCount = 0
    rows.forEach(function(row){
      staffCount++
      table.push([row.email,row.name,row.active ? 'Yes' : 'No'])
    })
    if(!staffCount) table.push(['No staff members'])
    console.log(table.toString())
    process.exit()
  })
program.version(config.version)
var cli = program.parse(process.argv)
if(!cli.args.length) program.help()
