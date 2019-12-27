'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Event {
  static getInstance(){ return new Event() }
  constructor(){
    this.handlers = {}
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      verbose: 3,
      debug: 4,
      silly: 5
    }
    this.levelInfo = {
      0: {name: 'error', title: 'Error'},
      1: {name: 'warn', title: 'Warning'},
      2: {name: 'info', title: 'Info'},
      3: {name: 'verbose', title: 'Verbose'},
      4: {name: 'debug', title: 'Debug'},
      5: {name: 'silly', title: 'Silly'}
    }
  }
  /**
   * All Event Levels
   * @returns {Object}
   */
  allLevels(){
    return this.levels
  }
  /**
   * Get Level Info
   * @param level
   * @returns {*}
   */
  getLevelInfo(level){
    return this.levelInfo[level]
  }
  /**
   * Add a Handler
   * @param {string} name
   * @param {function} onEvent
   * @param {object} opts
   * @return {string}
   */
  addHandler(name,onEvent,opts){
    if(!opts) opts = {}
    opts.event = true
    this.handlers[name] = opts
    this.handlers[name].name = name
    this.handlers[name].onEvent = onEvent
    return name
  }
  /**
   * Get a handler object
   * @param {string} name
   * @return {object}
   */
  getHandler(name){
    return this.handlers[name]
  }
  /**
   * Return all handlers
    * @returns {{}|*}
   */
  allHandlers(){
    return this.handlers
  }
  /**
   * Remove a handler
   * @param {string} name
   * @return {string}
   */
  removeHandler(name){
    delete this.handlers[name]
    return name
  }
  /**
   * Create an event
   * @param {object} options
   */
  create(options){
    if('object' !== typeof options){
      throw new Error('Invalid options passed to event creation: ' + options)
    }
    let handlers = this.handlers
    let mods = []
    //select messaging modules
    Object.keys(handlers).map((key) => {
      let mod = handlers[key]
      if(true !== mod.event) return
      mods.push(mod)
    })
    //sort messaging modules
    mods.sort((a,b)=>{return (a.event.priority||0) - (b.event.priority||0)})
    //ship message to accepting modules and await their promises
    const promises = []
    //send message to module for processing
    for(let mod of mods){ promises.push(mod.onEvent(options)) }
    return Promise.all(promises)
  }
  /**
   * Digest event creation parameters into usable options
   * @param {number} level
   * @param {string} to
   * @param {string} text
   * @param {object} options
   */
  digest(level,to,text,options){
    if(level === undefined){
      throw new Error('Tried to digest event params with level')
    }
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
    } else {
      options.to = to
      options.text = text
    }
    //now setup all the proper options
    if(!options.to) throw new Error('Cant digest event no recipient')
    if(!options.text) throw new Error('Cant digest event no text')
    if(!options.module) options.module = 'global'
    options.level = level
    options.levelInfo = this.levelInfo[level]
    return options
  }
  error(to,text,options){
    return this.create(this.digest(this.levels.error,to,text,options))
  }
  warn(to,text,options){
    return this.create(this.digest(this.levels.warn,to,text,options))
  }
  info(to,text,options){
    return this.create(this.digest(this.levels.info,to,text,options))
  }
  verbose(to,text,options){
    return this.create(this.digest(this.levels.verbose,to,text,options))
  }
  debug(to,text,options){
    return this.create(this.digest(this.levels.debug,to,text,options))
  }
  silly(to,text,options){
    return this.create(this.digest(this.levels.silly,to,text,options))
  }
}
