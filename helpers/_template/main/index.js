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
  {{moduleModelName}}.findAll({order: [['createdAt','DESC']]})
    .then((results) => {
      res.render(res.locals._view.get('{{moduleName}}/list',{
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
  {{moduleModelName}}.findOne({where: {id: req.query.id}})
    .then((result) => {
      res.render(res.locals._view.get('{{moduleName}}/entry',{
        item: result
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}
