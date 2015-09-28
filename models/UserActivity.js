'use strict';


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = function(sequelize,DataTypes) {
  return sequelize.define('UserActivity',{
    interface: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })
}
