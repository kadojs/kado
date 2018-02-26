#!/use/bin/env node
'use strict';
var K = require('../index')
var program = require('commander')
var path = require('path')
var list = require(process.env.KADO_HELPERS + '/list')
//var sequelize = require(process.env.KADO_DB + '/sequelize')()
var sequelize = require('../db/sequelize')()

var User = sequelize.models.User


sequelize.doConnect()
  .then(function(){
    program.version(K.config.version)
    //create
    program
      .command('create')
      .option('-e, --email <s>','Email')
      .option('-p, --password <s>','Password')
      .option('-n, --name <s>','Name')
      .description('Create new User')
      .action(function(opts){
        P.try(function(){
          console.log('info','Creating User')
          if(!opts.email || !opts.password)
            throw new Error('Email and password are required')
          var doc = User.build({
            email: opts.email,
            password: opts.password,
            name: opts.name,
            active: true
          })
          return doc.save()
        })
          .then(function(){
            console.log('info','User created!')
            process.exit()
          })
          .catch(function(err){
            console.log('error', 'Failed to create User: ' + err.message,err)
            process.exit()
          })
      })
    //update
    program
      .command('update')
      .option('-e, --email <s>','Email used to look up User')
      .option('-E, --newEmail <s>','New email address if its being changed')
      .option('-p, --password <s>','Password')
      .option('-n, --name <s>','Name')
      .description('Update existing User')
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
            console.log('info', 'User updated successfully!')
            process.exit()
          })
          .catch(function(err){
            if(err) throw new Error('Could not save User: ' + err)
          })
      })
    //remove
    program
      .command('remove')
      .option('-e, --email <s>','Email of the User to remove')
      .description('Remove User')
      .action(function(opts){
        if(!opts.email) throw new Error('Email is required... exiting')
        User.find({where: {email: opts.email}})
          .then(function(doc){
            if(!doc) throw new Error('Could not find User')
            return doc.destroy()
          })
          .then(function(){
            console.log('info', 'User removed successfully!')
            process.exit()
          })
          .catch(function(err){
            console.log('error', 'Could not remove User: ' + err.message,err)
          })
      })
  })

program.parse(process.argv)