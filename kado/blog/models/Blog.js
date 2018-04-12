'use strict';
const markdown = require('markdown').markdown
const validator = require('validator')


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = function(sequelize,DataTypes) {
  return sequelize.define('Blog',{
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      set: function(value){
        value = validator.trim(value)
        value = validator.escape(value)
        let html = markdown.toHTML(value)
        this.setDataValue('content',value)
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
