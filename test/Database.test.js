'use strict';
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
