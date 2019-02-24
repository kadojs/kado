'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
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


/**
 * Log levels (npm style)
 * @type {object}
 * @private
 */
const _levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
}


/**
 * Log level info
 * @type {object}
 * @private
 */
const _levelInfo = {
  0: {name: 'error', title: 'Error'},
  1: {name: 'warn', title: 'Warning'},
  2: {name: 'info', title: 'Info'},
  3: {name: 'verbose', title: 'Verbose'},
  4: {name: 'debug', title: 'Debug'},
  5: {name: 'silly', title: 'Silly'}
}


/**
 * Event constructor
 * @constructor
 */
class Event {
  constructor(K){
    this.K = K
    this.levels = _levels
    this.levelInfo = _levelInfo
  }


  /**
   * Create an event
   * @param {object} options
   */
  create(options){
    if('object' !== typeof options){
      throw new Error('Invalid options passed to event creation: ' + options)
    }
    let K = this.K
    let mods = []
    //select messaging modules
    Object.keys(K.modules).forEach((key) => {
      let mod = K.modules[key]
      if(true !== mod.event) return
      mods.push(mod)
    })
    //sort messaging modules
    mods.sort((a,b)=>{return (a.event.priority||0) - (b.event.priority||0)})
    //ship message to accepting modules and await their promises
    return K.bluebird.try(()=>{return mods}).each((mod)=>{
      let modObj = require(mod.root + '/kado')
      if('function' !== typeof modObj.event) return
      //send message to module for processing
      return modObj.event(K,options)
    })
  }


  /**
   * Digest event creation parameters into usable options
   * @param {number} level
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  digest(level,to,text,options){
    if(!level) throw new Error('Tried to digest event params with level')
    let levelName = this.levelInfo[level].name
    if(!to && !text && !options){
      throw new Error('Call to event with no parameters, level: ' + levelName)
    }
    //assume options when left out
    if(!options || 'object' !== typeof options) options = {}
    //when no message assume global message
    if(!text){
      options.to = 'all'
      options.text = to
    }
    //now setup all the proper options
    if(!options.to) throw new Error('Cant digest event no recipient')
    if(!options.text) throw new Error('Cant digest event no text')
    if(!options.module) options.module = 'global'
    options.level = level
    options.levelInfo = this._levelInfo[level]
    return options
  }


  /**
   * Error event
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  error(to,text,options){
    this.create(this.digest(this.levels.error,to,text,options))
  }


  /**
   * Warning event
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  warn(to,text,options){
    this.create(this.digest(this.levels.warn,to,text,options))
  }


  /**
   * Info event
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  info(to,text,options){
    this.create(this.digest(this.levels.info,to,text,options))
  }


  /**
   * Verbose event
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  verbose(to,text,options){
    this.create(this.digest(this.levels.verbose,to,text,options))
  }


  /**
   * Debug event
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  debug(to,text,options){
    this.create(this.digest(this.levels.debug,to,text,options))
  }


  /**
   * Silly event
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  silly(to,text,options){
    this.create(this.digest(this.levels.silly,to,text,options))
  }
}


/**
 * Export class
 * @type {Event}
 */
module.exports = Event
