'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const fs = require('fs')
const path = require('path')

class Library {
  constructor(){
    this.paths = {}
    this.libraries = {}
  }
  nextKey(obj){
    let keys = Object.keys(obj)
    if(keys.length > 0) return +keys.pop() + 1
    return 0
  }
  addPath(path){
    if(this.existsPath(path)) return path
    this.paths[this.nextKey(this.paths)] = path
    return path
  }
  existsPath(path){
    let exists = false
    for(let key in this.paths){
      if(this.paths.hasOwnProperty(key) && this.paths[key] === path){
        exists = key
      }
    }
    return exists ? this.paths[exists] : false
  }
  removePath(path){
    let removed = false
    for(let key in this.paths){
      if(this.paths.hasOwnProperty(key) && this.paths[key] === path){
        removed = this.paths[key]
        delete this.paths[key]
      }
    }
    return removed
  }
  add(name,file){
    this.libraries[name] = file
    return file
  }
  exists(name){
    return this.libraries[name] ? this.libraries[name] : false
  }
  remove(name){
    delete this.libraries[name]
    return name
  }
  search(name){
    if(this.libraries[name]) return this.libraries[name]
    let library = false
    for(let key in this.paths){
      if(this.paths.hasOwnProperty(key)){
        let file = path.resolve(path.join(this.paths[key],name + '.js'))
        if(fs.existsSync(file)) library = file
      }
    }
    if(!library) throw new Error('Failed to find library: ' + name)
    return library
  }
}

module.exports = Library
