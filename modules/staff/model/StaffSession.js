'use strict';


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = function(sequelize,DataTypes) {
  return sequelize.define('StaffSession',{
      sid: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      expires: {
        type: DataTypes.DATE
      },
      data: {
        type: DataTypes.TEXT
      }
    },
    {
      indexes: [
        {
          name: 'expires_index',
          method: 'BTREE',
          fields: ['expires']
        }
      ]
    })
}
