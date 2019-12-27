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

module.exports = class Database {
  static getInstance(){ return new Database() }
  constructor(){
    this.databases = []
  }
  addDatabase(name,instance){
    this[name] = instance
    this.databases.push(name)
    return instance
  }
  removeDatabase(name){
    delete this[name]
    this.databases = this.databases.splice(this.databases.indexOf(name),1)
    return name
  }
  queryOptions(config,profiler){
    let options
    if(config.dev === true){
      options = {
        benchmark: true,
        logging: (sql,time) => {
          if(profiler) profiler.addQuery(sql,time)
        }
      }
    } else {
      options = {
        benchmark: false,
        logging: false
      }
    }
    return options
  }
  connect(name){
    if(!name){
      let promises = []
      this.databases.forEach((name)=>{
        promises.push(this[name].connect())
      })
      return Promise.all(promises)
    } else {
      return this[name].connect()
    }
  }
  close(name){
    if(!name){
      this.databases.forEach((name)=>{this[name].close()})
    } else {
      this[name].close()
    }
    return true
  }
}
