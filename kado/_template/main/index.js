'use strict';
const K = require('../../../index')
const sequelize = K.db.sequelize

const {{moduleModelName}} = sequelize.models.{{moduleModelName}}


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = function(req,res){
  {{moduleModelName}}.findAll({where: {active: true}, order: [['datePosted','DESC']]})
    .then(function(results){
      res.render(__dirname + '/view/list',{
        list: results
      })
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Entry
 * @param {object} req
 * @param {object} res
 */
exports.entry = function(req,res){
  {{moduleModelName}}.findOne({where: {uri: req.params.uri}})
    .then(function(result){
      res.render(__dirname + '/entry',{
        item: result
      })
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
