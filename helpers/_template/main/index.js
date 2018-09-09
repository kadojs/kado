'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const K = require('../../../index')
const sequelize = K.db.sequelize

const <%moduleModelName%> = sequelize.models.<%moduleModelName%>


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  <%moduleModelName%>.findAll({order: [['createdAt','DESC']]})
    .then((results) => {
      res.render(res.locals._view.get('<%moduleName%>/list',{
        list: results
      }))
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
  <%moduleModelName%>.findOne({where: {id: req.query.id}})
    .then((result) => {
      res.render(res.locals._view.get('<%moduleName%>/entry',{
        item: result
      }))
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}
