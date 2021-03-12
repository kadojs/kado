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

const { Assert } = require('../lib/Assert')
const ASSERT = Assert.isOk

const goError = (msg) => {
  return (new Assert.Error('GetOpt: ' + msg))
}

module.exports = class GetOpt {
  static getInstance (argv, optstring, optind) {
    return new GetOpt(argv, optstring, optind)
  }

  constructor (argv, optstring, optind) {
    ASSERT(argv, 'argv is required')
    ASSERT(argv.constructor === Array, 'argv must be an array')
    this.optmap = {}
    if (!optstring || optstring === '') {
      optstring = this.buildOptionString(argv)
    }
    ASSERT(optstring || optstring === '', 'optstring is required')
    ASSERT(optstring.constructor === String, 'optstring must be a string')

    this.gop_argv = new Array(argv.length)
    this.gop_options = {}
    this.gop_aliases = {}
    this.gop_optind = optind !== undefined ? optind : 2
    this.gop_subind = 0

    let ii
    for (ii = 0; ii < argv.length; ii++) {
      ASSERT(argv[ii].constructor === String,
        'argv must be string array')
      this.gop_argv[ii] = argv[ii]
    }

    this.parseOptionString(optstring)
  }

  static mapArguments (argList, opts) {
    const args = {}
    argList.map((argName) => {
      const full = argName.shift()
      const short = argName.shift()
      if (short) args[full] = opts[short] || opts[full]
      else args[full] = opts[full]
      return argName
    })
    return args
  }

  parseOptionString (optstring) {
    let chr, cp, alias, arg, ii

    ii = 0
    if (optstring.length > 0 && optstring[0] === ':') {
      this.gop_silent = true
      ii++
    } else {
      this.gop_silent = false
    }

    while (ii < optstring.length) {
      chr = optstring[ii]
      arg = false

      if (!/^[\w\d\u1000-\u1100]$/.test(chr)) {
        throw (goError('invalid optstring: only alphanumeric ' +
            'characters and unicode characters between ' +
            '\\u1000-\\u1100 may be used as options: ' + chr))
      }

      if (ii + 1 < optstring.length && optstring[ii + 1] === ':') {
        arg = true
        ii++
      }

      this.gop_options[chr] = arg

      while (ii + 1 < optstring.length && optstring[ii + 1] === '(') {
        ii++
        cp = optstring.indexOf(')', ii + 1)
        if (cp === -1) {
          throw (goError('invalid optstring: missing ' +
              '")" to match "(" at char ' + ii))
        }

        alias = optstring.substring(ii + 1, cp)
        this.gop_aliases[alias] = chr
        ii = cp
      }
      ii++
    }
  }

  buildOptionString (argv) {
    let rv = ''
    let marker = 0x1000
    let _consume = false
    for (const a of argv) {
      let m
      if ((m = a.match(/^--([^=]*)=.*$/)) !== null) {
        rv = rv + String.fromCharCode(marker) + ':(' + m[1] + ')'
        this.optmap[marker] = m[1]
        marker++
      } else if ((m = a.match(/^--([^=]*)$/)) !== null) {
        rv = rv + String.fromCharCode(marker) + '(' + m[1] + ')'
        this.optmap[marker] = m[1]
        marker++
      } else if ((m = a.match(/^-([^-][^=]*)$/)) !== null) {
        _consume = true
        rv = rv + m[1]
      } else if (_consume) {
        _consume = false
        rv = rv + ':'
      }
    }
    return rv
  }

  optind () {
    return (this.gop_optind)
  }

  getopt () {
    /* end of input */
    if (this.gop_optind >= this.gop_argv.length) { return undefined }

    const arg = this.gop_argv[this.gop_optind]

    if (this.gop_subind === 0) {
      if (arg === '-' || arg === '' || arg[0] !== '-') {
        this.gop_optind++
        this.gop_subind = 0
        return ({ option: false, optarg: arg })
      }

      if (arg === '--') {
        this.gop_optind++
        this.gop_subind = 0
        return undefined
      }

      if (arg[1] === '-') { return (this.getoptLong()) }

      this.gop_subind++
      ASSERT(this.gop_subind < arg.length)
    }

    return (this.getoptShort())
  }

  getoptShort () {
    ASSERT(this.gop_optind < this.gop_argv.length)
    const arg = this.gop_argv[this.gop_optind]
    ASSERT(this.gop_subind < arg.length)
    const chr = arg[this.gop_subind]

    if (++this.gop_subind >= arg.length) {
      this.gop_optind++
      this.gop_subind = 0
    }
    if (!(chr in this.gop_options)) { return (this.errInvalidOption(chr)) }
    if (!this.gop_options[chr]) { return ({ option: chr }) }

    return (this.getoptArgument(chr))
  }

  getoptLong () {
    ASSERT(this.gop_subind === 0)
    ASSERT(this.gop_optind < this.gop_argv.length)
    const arg = this.gop_argv[this.gop_optind]
    ASSERT(arg.length > 2 && arg[0] === '-' && arg[1] === '-')

    const eq = arg.indexOf('=')
    const alias = arg.substring(2, eq === -1 ? arg.length : eq)
    if (!(alias in this.gop_aliases)) { return (this.errInvalidOption(alias)) }

    const chr = this.gop_aliases[alias]
    ASSERT(chr in this.gop_options)

    if (!this.gop_options[chr]) {
      if (eq !== -1) { return (this.errExtraArg(alias)) }
      this.gop_optind++
      return ({ option: chr })
    }
    if (eq === -1) { this.gop_optind++ } else { this.gop_subind = eq + 1 }

    return (this.getoptArgument(chr))
  }

  getoptArgument (chr) {
    if (this.gop_optind >= this.gop_argv.length) {
      return (this.errMissingArg(chr))
    }

    const arg = this.gop_argv[this.gop_optind].substring(this.gop_subind)
    this.gop_optind++
    this.gop_subind = 0
    return ({ option: chr, optarg: arg })
  }

  errMissingArg (chr) {
    if (this.gop_silent) { return ({ option: ':', optopt: chr }) }

    process.stderr.write('option requires an argument -- ' + chr + '\n')
    return ({ option: '?', optopt: chr, error: true })
  }

  errInvalidOption (chr) {
    if (!this.gop_silent) {
      process.stderr.write('illegal option -- ' + chr + '\n')
    }

    return ({ option: '?', optopt: chr, error: true })
  }

  errExtraArg (chr) {
    if (!this.gop_silent) {
      process.stderr.write('option expects no argument -- ' +
          chr + '\n')
    }

    return ({ option: '?', optopt: chr, error: true })
  }

  opts () {
    const rv = {}
    const un = []
    let arg
    while (this.gop_optind < this.gop_argv.length) {
      if (undefined === (arg = this.getopt())) continue
      if (Object.prototype.hasOwnProperty.call(arg, 'option')) {
        if (arg.option === false) {
          un.push(arg.optarg)
          continue
        }
        const val = (Object.prototype.hasOwnProperty.call(arg, 'optarg'))
          ? arg.optarg
          : true
        let ref
        if ((ref = arg.option.charCodeAt(0)) > 255 &&
          Object.prototype.hasOwnProperty.call(this.optmap, ref)
        ) arg.option = this.optmap[ref]

        if (Object.prototype.hasOwnProperty.call(rv, arg.option)) {
          if (Array.isArray(rv[arg.option])) {
            if (rv[arg.option].indexOf(val) === -1) rv[arg.option].push(val)
          } else rv[arg.option] = [rv[arg.option], val]
        } else rv[arg.option] = val

        for (const k of Object.keys(this.gop_aliases)) {
          if (this.gop_aliases[k] === arg.option) { rv[k] = rv[arg.option] }
        }
      }
    }
    if (un.length !== 0) rv.__ = un
    return rv
  }
}
