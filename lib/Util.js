'use strict'
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
const Assert = require('./Assert')

module.exports = class Util {
  static is () {
    return (text, render) => {
      const parts = render(text).split(',')
      Assert.isOk(parts.length === 3, 'Failed parsing _is')
      let cond = true
      if (parts[0] === '' || parts[0] === 'false' || parts[0] === false) {
        cond = false
      }
      return cond ? parts[1] : parts[2]
    }
  }

  static compare () {
    return (text, render) => {
      const parts = render(text).split(',')
      Assert.isOk(parts.length === 4, 'Failed parsing _compare')
      let cond = true
      if (parts[0] !== parts[1]) {
        cond = false
      }
      return cond ? parts[2] : parts[3]
    }
  }
}
