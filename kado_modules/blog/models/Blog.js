'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
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
const markdown = require('markdown').markdown
const uriname = require('uriname')
const validator = require('validator')


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = (sequelize,DataTypes) => {
  return sequelize.define('Blog',{
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      set: function(v){
        this.setDataValue('uri',uriname(v))
        this.setDataValue('title',v)
      }
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      set: function(v){
        v = validator.trim(v)
        v = validator.escape(v)
        let html = markdown.toHTML(v)
        this.setDataValue('content',v)
        this.setDataValue('html',html)
      }
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datePosted: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })
}
