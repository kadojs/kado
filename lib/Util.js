'use strict';
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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

module.exports = class Util {
  static getInstance(){ return new Util() }
  constructor(){
    this.moment = require('moment')
    //moment no longer supports any method of getting the short timezone
    this.timezoneShort = ['(',')'].join(
      (new Date()).toLocaleTimeString(
        'en-US',{timeZoneName:'short'}
      ).split(' ').pop()
    )
  }
  capitalize(string){
    return string.replace(/\b\w/g, l => l.toUpperCase())
  }
  /**
   * Print date with a nice format
   * @param {Date} d
   * @param {string} emptyString
   * @return {string}
   */
  printDate(d,emptyString){
    if(d === undefined || d === null) d = new Date()
    emptyString = ('string' === typeof emptyString) ? emptyString : 'Never'
    if(!(d instanceof Date)) d = new Date(d)
    return d ? this.moment(d).format('YYYY-MM-DD hh:mm:ssA') : emptyString
  }
  escapeAndTruncate(){
    return (text,render) => {
      let parts = text.split(',')
      if(!parts || 2 !== parts.length){
        throw new Error('Cannot parse escapeAndTruncate')
      }
      let len = +parts[0]
      let tpl = render(parts[1])
      tpl = tpl.replace(/<(?:.|\n)*?>/gm,'') //remove html
      return tpl.substring(0,len) //shorten
    }
  }
  is(){
    return (text,render) => {
      let parts = render(text).split(',')
      if(parts.length !== 3) throw new Error('Failed parsing _is')
      let cond = true
      if('' === parts[0] || 'false' === parts[0] || false === parts[0]){
        cond = false
      }
      return cond ? parts[1] : parts[2]
    }
  }
  compare(){
    return (text,render) => {
      let parts = render(text).split(',')
      if(parts.length !== 4) throw new Error('Failed parsing _compare')
      let cond = true
      if(parts[0] !== parts[1]){
        cond = false
      }
      return cond ? parts[2] : parts[3]
    }
  }
  prettyBytes(){
    return require('./Format').prettyBytes.apply(null,arguments)
  }
}
