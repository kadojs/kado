'use strict';
var fs = require('fs')
var Sequelize = require('sequelize')

var config = require('../config')

var inst
var modelPath = __dirname + '/../models'


/**
 * Setup the database relationships
 * @param {Sequelize} s
 */
var keyMapping = function(s){
  //load models with keys
  var Seller = s.models.Seller
  var Buyer = s.models.Buyer
  var SellerLedger = s.models.SellerLedger
  var Order = s.models.Order
  var Category = s.models.Category
  var Item = s.models.Item
  var Dispute = s.models.Dispute
  var Cart = s.models.Cart
  var BuyerAddress = s.models.BuyerAddress
  //parents
  Category.belongsToMany(Item, {indexes: {}, through: 'ItemCategories'})
  Item.belongsToMany(Category, {indexes: {}, through: 'ItemCategories'})
  Seller.hasMany(Item)
  Seller.hasMany(SellerLedger)
  Seller.hasMany(Order)
  Seller.hasMany(Dispute)
  Buyer.hasMany(Order)
  Buyer.hasMany(Cart)
  Buyer.hasMany(BuyerAddress)
  Dispute.hasMany(Order)
  Order.hasMany(Item)
  Order.belongsToMany(Seller,{through: 'OrderSeller'})
  Order.belongsTo(Buyer)
  //children
  Item.belongsTo(Seller)
  SellerLedger.belongsTo(Seller)
  BuyerAddress.belongsTo(Buyer)
  Cart.belongsTo(Buyer)
}


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
var createInst = function(){
  //configure the instance for connection
  var inst = new Sequelize(
    config.mysql.name,
    config.mysql.user,
    config.mysql.password,
    {
      host: config.mysql.host,
      port: config.mysql.port,
      logging: config.mysql.logging || false
    }
  )
  //load models automatically from the fs
  fs.readdirSync(modelPath).forEach(function(file){
    if('.' === file || '.' === file) return
    inst.import(modelPath + '/' + file)
  })
  //setup relationship mapping
  keyMapping(inst)
  inst.doConnect = function(){
    var that = this
    return that.authenticate().then(function(){return that.sync()})
  }
  return inst
}


/**
 * Export the singleton
 * @return {Sequelize}
 */
module.exports = function(){
  if(inst) return inst
  inst = createInst()
  return inst
}
