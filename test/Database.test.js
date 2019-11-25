'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Sequelize = require('sequelize')
const Database = require('../lib/Database')
let db = new Database()
let instanceOptions = {
  dialect: 'mysql'
}

describe('Database',()=> {
  it('should construct',() => {
    let testDatabase = new Database()
    expect(testDatabase).to.be.an('object')
  })
  it('should accept a new database',() => {
    expect(db.addDatabase(
      'sequelize',
      new Sequelize('test','test','test',instanceOptions)
    ))
      .to.be.instanceof(Sequelize)
  })
  it('should have the new database instance',()=>{
    expect(db.sequelize).to.be.instanceof(Sequelize)
  })
  it('should remove database instance',()=>{
    expect(db.removeDatabase('sequelize')).to.equal('sequelize')
  })
  it('should no longer have the database handle',()=>{
    expect(db.sequelize).to.equal(undefined)
  })
  it('should accept a new database instance',()=>{
    expect(db.addDatabase(
      'sequelize',
      new Sequelize('test','test','test',instanceOptions)
    ))
      .to.be.instanceof(Sequelize)
  })
  it('should attempt db connect and fail',()=>{
    return db.connect('sequelize')
      .then(()=>{
        throw new Error('should not have connected')
      })
      .catch((e)=>{
        if(e.message.match(/access/i)){
          expect(e.message).to.match(/Access denied for user/)
        } else {
          expect(e.message).to.match(/ECONNREFUSED/)
        }
      })
  })
})
