'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
    return require('pretty-bytes').apply(null,arguments)
  }
}
