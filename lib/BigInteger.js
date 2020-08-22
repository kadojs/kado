'use strict'
/* global BigInt */
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
class BigInteger {
  constructor (n) {
    this.value = BigInt(n)
  }

  static getInstance (n) {
    const that = new BigInteger(n)
    that.value = BigInt(n)
    that.toJSON = () => `@BigInteger(${that.value.toString()})`
    return that
  }

  pow (b) {
    let a = this.value
    if (b instanceof BigInteger) { b = b.value }
    if (typeof b !== 'bigint') { b = BigInt(b) }
    for (let i = 1n; i < b; i++) { a = a * this.value }
    return a
  }
}

module.exports = BigInteger.getInstance
