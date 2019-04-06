'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


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
        },
        {
          name: 'isAllowed_index',
          method: 'BTREE',
          fields: ['isAllowed']
        },
        {
          name: 'createdAt_index',
          method: 'BTREE',
          fields: ['createdAt']
        },
        {
          name: 'updatedAt_index',
          method: 'BTREE',
          fields: ['updatedAt']
        }
      ]
    })
}
