'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('Database',()=> {
  const { expect } = require('chai')
  //const SequelizeDb = require('../lib/database/sequelize')
  const SequelizeDb = class {
    connect(){ return new Promise((resolve,reject)=>{
      reject(new Error('ECONNREFUSED'))
    })}
  }
  const Database = require('../lib/Database')
  let db = new Database()
  it('should construct',() => {
    let testDatabase = new Database()
    expect(testDatabase).to.be.an('object')
  })
  it('should accept a new database',() => {
    expect(db.addDatabase(
      'sequelize',
      new SequelizeDb()
    ))
      .to.be.instanceof(SequelizeDb)
  })
  it('should have the new database instance',()=>{
    expect(db.sequelize).to.be.instanceof(SequelizeDb)
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
      new SequelizeDb()
    ))
      .to.be.instanceof(SequelizeDb)
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
