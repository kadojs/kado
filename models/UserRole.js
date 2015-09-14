'use strict';
var bcrypt = require('bcrypt')
var P = require('bluebird')

//make some promises
P.promisifyAll(bcrypt)


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = function(sequelize,DataTypes) {
  return sequelize.define('UserRole',{
      name: {
        type: DataTypes.STRING(191),
        allowNull: false
      }
    },
    {
      indexes: [
        {
          name: 'name_index',
          method: 'BTREE',
          fields: ['name']
        }
      ]
    })
}
