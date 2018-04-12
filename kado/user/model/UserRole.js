'use strict';
const K = require('../../../index')
const bcrypt = require('bcrypt')
const P = K.bluebird

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
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
