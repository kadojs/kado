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
  return sequelize.define('UserPermission',{
      interface: {
        type: DataTypes.STRING(191),
        allowNull: false,
        validate: {is: /^[a-z0-9\-]+$/i}
      },
      uri: {
        type: DataTypes.STRING(191),
        allowNull: false,
        validate: {isUrl: true}
      },
      //These are the levels of permission
      // 0 - None
      // 1 - View
      // 2 - Edit
      // 3 - Edit + Delete
      // 4 - Super Admin
      level: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      indexes: [
        {
          name: 'interface_index',
          method: 'BTREE',
          fields: ['interface']
        },
        {
          name: 'level_index',
          method: 'BTREE',
          fields: [{attribute: 'level', order: 'DESC'}]
        }
      ],
      classMethods: {
        /**
         * Validate Permission of URI
         * @param {object} user - instance of the user module
         * @param {string} interface - name of the interface being requested
         * @param {string} uri
         * @return {integer} - The level that is available
         */
        verifyPermission: function(user,interface,uri){
          return 0
        }
      }
    })
}
