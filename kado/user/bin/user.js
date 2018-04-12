'use strict';
const K = require('../../../index')
const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

const sequelize = K.db.sequelize

const User = sequelize.models.User

let config = K.config

//create
program
  .command('create')
  .option('-e, --email <s>','Email')
  .option('-p, --password <s>','Password')
  .option('-n, --name <s>','Name')
  .description('Create new user')
  .action(function(opts){
    P.try(function(){
      console.log('Creating user')
      if(!opts.email || !opts.password)
        throw new Error('Email and password are required')
      let doc = User.build({
        email: opts.email,
        password: opts.password,
        name: opts.name,
        active: true
      })
      return doc.save()
    })
      .then(function(){
        console.log('User created!')
        process.exit()
      })
      .catch(function(err){
        console.trace(err)
        console.error('Failed to create user: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-e, --email <s>','Email used to look up user')
  .option('-E, --newEmail <s>','New email address if its being changed')
  .option('-p, --password <s>','Password')
  .option('-n, --name <s>','Name')
  .description('Update existing user')
  .action(function(opts){
    if(!opts.email) throw new Error('Email is required')
    User.find({where: {email: opts.email}})
      .then(function(doc){
        if(opts.newEmail) doc.email = opts.newEmail
        if(opts.password) doc.password = opts.password
        if(opts.name) doc.name = opts.name
        return doc.save()
      })
      .then(function(){
        console.log('user updated successfully!')
        process.exit()
      })
      .catch(function(err){
        if(err) throw new Error('Could not save user: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-e, --email <s>','Email of user to remove')
  .description('Remove user')
  .action(function(opts){
    if(!opts.email) throw new Error('Email is required... exiting')
    User.find({where: {email: opts.email}})
      .then(function(doc){
        if(!doc) throw new Error('Could not find user')
        return doc.destroy()
      })
      .then(function(){
        console.log('user removed successfully!')
        process.exit()
      })
      .catch(function(err){
        console.error('Could not remove user: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List users')
  .action(function(){
    User.findAll()
      .then(function(results){
        let table = new Table({
          head: ['Email','Name','Active']
        })
        results.forEach(function(row){
          table.push([row.email,row.name,row.active ? 'Yes' : 'No'])
        })
        console.log(table.toString())
        process.exit()
      })
      .catch(function(err){
        console.trace(err)
        console.error('Could not list users ' + err)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
