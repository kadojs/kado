'use strict';
const K = require('../../../index')
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = function(req,res){
  Blog.findAll({where: {active: true}, order: [['datePosted','DESC']]})
    .then(function(results){
      res.render(__dirname + '/view/list',{
        blogList: results
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
  Blog.findOne({where: {uri: req.params.blogUri}})
    .then(function(result){
      res.render(__dirname + '/view/blog',{
        blog: result
      })
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
