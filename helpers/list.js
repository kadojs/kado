'use strict';
const P = require('bluebird')
const validator = require('validator')


/**
 * Remove members from a list
 * @param {sequelize.Model} Model
 * @param {array} items
 * @return {P}
 */
exports.remove = function(Model,items){
  return P.try(function(){
    if(!(items instanceof Array))
      throw new Error('Invalid data passed for record removal')
    let promises = []
    let i = items.length - 1
    for(; i >= 0; i--){
      if(validator.isNumeric(items[i])){
        promises.push(Model.destroy({where: {id: items[i]}}))
      }
    }
    return P.all(promises)
  })
}


/**
 * Pagination helper
 * @param {number} start
 * @param {number} count
 * @param {number} limit
 * @return {{start: *, end: *, previous: number, next: *}}
 */
exports.pagination = function(start,count,limit){
  if(start > count) start = count - limit
  let page = {
    start: start,
    end: start + limit,
    previous: start - limit,
    next: start + limit,
    first: 0,
    last: (Math.ceil(count / limit) * limit) - limit,
    count: count,
    limit: limit
  }
  if(page.previous < 0) page.previous = 0
  if(page.next > count) page.next = start
  if(page.end > count) page.end = count
  return page
}
