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
module.exports = (sequelize,DataTypes) => {
  return sequelize.define('Doc',{
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    sortNum: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    indexes: [
      {
        name: 'title_index',
        method: 'BTREE',
        fields: ['title']
      },
      {
        name: 'uri_index',
        method: 'BTREE',
        fields: ['uri']
      },
      {
        name: 'sortNum_index',
        method: 'BTREE',
        fields: ['sortNum']
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
