'use strict';

var sequelize = require('../../helpers/sequelize')()

var User = sequelize.models.User


/**
 * Home Page
 * @param {object} req
 * @param {object} res
 */
exports.home = function(req,res){
  res.render('home')
}


/**
 * Login Page
 * @param {object} req
 * @param {object} res
 */
exports.login = function(req,res){
  res.render('login')
}


/**
 * Login Action
 * @param {object} req
 * @param {object} res
 */
exports.loginAction = function(req,res){
  User.login(req.body.email,req.body.password)
    .then(function(user){
      req.session.user = user.dataValues
      res.redirect(301,'/')
    })
    .catch(function(e){
      console.log(e)
      req.flash('error','Invalid login')
      res.redirect(301,'/login')
    })
}
