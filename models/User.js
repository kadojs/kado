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
  return sequelize.define('User',{
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        validate: {isEmail: true}
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function(v){
          //dont re-encrypt crypted passswords
          if(v.match(/^\$2a\$12\$/)) return this.setDataValue('password',v)
          return this.setDataValue(
            'password',
            bcrypt.hashSync(v,bcrypt.genSaltSync(12)))
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {is: /^[a-z0-9\s]+$/i},
        defaultValue: 'SaleLeap Staff'
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      dateSeen: {
        type: DataTypes.DATE,
        allowNull: true
      },
      dateFail: {
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
        }
      ],
      classMethods: {
        /**
         * Staff login
         * @param {string} email
         * @param {string} password
         * @return {P}
         */
        login: function(email,password){
          var sequelize = require('../helpers/sequelize')()
          var User = sequelize.models.User
          var now = (+new Date()) / 1000 //as a timestamp
          var user
          return User.find({where: {email: email}})
            .then(function(result){
              if(!result) throw new Error('No user found')
              if(!result.active) throw new Error('User inactive')
              //globalize seller
              user = result
              //verify password
              return bcrypt.compareAsync(password,user.password)
            })
            .then(function(match){
              if(!match) throw new Error('Invalid password')
              return user.updateAttributes({dateSeen: now})
            })
            .then(function(){
              //success return our seller
              return user
            })
            .catch(function(err){
              if(user) user.updateAttributes({dateFail: now})
              throw err
            })
        }
      }
    })
}
