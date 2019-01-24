'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const bcrypt = require('bcrypt')
const P = require('bluebird')

//make some promises
P.promisifyAll(bcrypt)


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = (sequelize,DataTypes) => {
  return sequelize.define('Staff',{
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        validate: {isEmail: true}
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function(v){
          //dont re-encrypt crypted passwords
          if(v.match(/^\$2[abxy]\$12\$/)) return this.setDataValue('password',v)
          return this.setDataValue(
            'password',
            bcrypt.hashSync(v,bcrypt.genSaltSync(12)))
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {is: /^[a-z0-9\s]+$/i},
        defaultValue: 'StretchFS Admin'
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      loginCount: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      loginFailCount: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      dateSeen: {
        type: DataTypes.DATE,
        allowNull: true
      },
      dateFail: {
        type: DataTypes.DATE,
        allowNull: true
      },
      datePassword: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      indexes: [
        {
          name: 'email_unique',
          unique: true,
          method: 'BTREE',
          fields: ['email']
        },
        {
          name: 'active_index',
          method: 'BTREE',
          fields: [{attribute: 'active', order: 'DESC'}]
        },
        {
          name: 'dateSeen_index',
          method: 'BTREE',
          fields: [{attribute: 'dateSeen', order: 'DESC'}]
        },
        {
          name: 'dateFail_index',
          method: 'BTREE',
          fields: [{attribute: 'dateFail', order: 'DESC'}]
        },
        {
          name: 'datePassword_index',
          method: 'BTREE',
          fields: [{attribute: 'datePassword', order: 'DESC'}]
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
