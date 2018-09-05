'use strict';


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = function(sequelize,DataTypes) {
  return sequelize.define('StaffPermission',{
      name: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      isAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
