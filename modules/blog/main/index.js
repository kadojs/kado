'use strict';
const K = require('../../../index')
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  Blog.findAll({where: {active: true}, order: [['datePosted','DESC']]})
    .then((results) => {
      res.render(__dirname + '/view/list',{
        blogList: results
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}


/**
 * Entry
 * @param {object} req
 * @param {object} res
 */
exports.entry = (req,res) => {
  Blog.findOne({where: {uri: req.params.blogUri}})
    .then((result) => {
      res.render(__dirname + '/view/blog',{
        blog: result
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}
