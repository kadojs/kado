'use strict';
const K = require('../../../index')
const sequelize = K.db.sequelize

const {{moduleModelName}} = sequelize.models.{{moduleModelName}}


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  {{moduleModelName}}.findAll({where: {active: true}, order: [['datePosted','DESC']]})
    .then((results) => {
      res.render(__dirname + '/view/list',{
        list: results
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
  {{moduleModelName}}.findOne({where: {uri: req.params.uri}})
    .then((result) => {
      res.render(__dirname + '/entry',{
        item: result
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}
