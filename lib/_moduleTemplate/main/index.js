'use strict';
<%&fileHeader%>
const K = require('kado').getInstance()
const sequelize = K.db.sequelize

const <%moduleModelName%> = sequelize.models.<%moduleModelName%>


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  let q = res.Q
  q.order = [['createdAt','DESC']]
  <%moduleModelName%>.findAll(q)
    .then((results) => {
      res.render('<%moduleName%>/list',{
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
  <%moduleModelName%>.findByPk(req.query.id,res.Q)
    .then((result) => {
      res.render('<%moduleName%>/entry',{
        item: result
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}
