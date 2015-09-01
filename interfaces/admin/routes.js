'use strict';


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
