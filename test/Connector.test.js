'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const stretchfs = require('stretchfs-sdk')
const Prism = stretchfs.Prism
const Connector = require('../lib/Connector')
let connector = new Connector()

describe('Connector',()=> {
  it('should construct',() => {
    let testConnector = new Connector()
    expect(testConnector).to.be.an('object')
  })
  it('should accept a new connector',() => {
    expect(connector.addConnector(
      'stretchfs',
      new Prism('test','test','localhost')
    ))
      .to.be.instanceof(Prism)
  })
  it('should have the new connector instance',()=>{
    expect(connector.stretchfs).to.be.instanceof(Prism)
  })
  it('should remove connector instance',()=>{
    expect(connector.removeConnector('stretchfs')).to.equal('stretchfs')
  })
  it('should no longer have the connector handle',()=>{
    expect(connector.stretchfs).to.equal(undefined)
  })
  it('should accept a new connector instance',()=>{
    expect(connector.addConnector(
      'stretchfs',
      new Prism('test','test','localhost')
    ))
      .to.be.instanceof(Prism)
  })
  it('should attempt connect and fail',()=>{
    return connector.connect('stretchfs')
      .then((result)=>{
        expect(result).to.equal('cdn.stretchfs.com')
      })
  })
})
