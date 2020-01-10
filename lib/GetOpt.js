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

const ASSERT = require('assert').ok
const goError = (msg) => {
  return (new Error('GetOpt: ' + msg))
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
      optstring = this.buildOptstr(argv)
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

    this.parseOptstr(optstring)
  }

  /*
   * Parse the option string and update the following fields:
   *
   *  gop_silent  Whether to log errors to stderr.  Silent mode is
   *      indicated by a leading ':' in the option string.
   *
   *  gop_options  Maps valid single-letter-options to booleans indicating
   *      whether each option is required.
   *
   *  gop_aliases  Maps valid long options to the corresponding
   *      single-letter short option.
   */
  parseOptstr (optstr) {
    var chr, cp, alias, arg, ii

    ii = 0
    if (optstr.length > 0 && optstr[0] === ':') {
      this.gop_silent = true
      ii++
    } else {
      this.gop_silent = false
    }

    while (ii < optstr.length) {
      chr = optstr[ii]
      arg = false

      if (!/^[\w\d\u1000-\u1100]$/.test(chr)) {
        throw (goError('invalid optstring: only alphanumeric ' +
            'characters and unicode characters between ' +
            '\\u1000-\\u1100 may be used as options: ' + chr))
      }

      if (ii + 1 < optstr.length && optstr[ii + 1] === ':') {
        arg = true
        ii++
      }

      this.gop_options[chr] = arg

      while (ii + 1 < optstr.length && optstr[ii + 1] === '(') {
        ii++
        cp = optstr.indexOf(')', ii + 1)
        if (cp === -1) {
          throw (goError('invalid optstring: missing ' +
              '")" to match "(" at char ' + ii))
        }

        alias = optstr.substring(ii + 1, cp)
        this.gop_aliases[alias] = chr
        ii = cp
      }
      ii++
    }
  }

  buildOptstr (argv) {
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

  /*
   * For documentation on what getopt() does, see README.md.  The following
   * implementation invariants are maintained by getopt() and its
   * helper methods:
   *
   *  this.gop_optind    Refers to the element of gop_argv that contains
   *        the next argument to be processed.  This may
   *        exceed gop_argv, in which case the end of input
   *        has been reached.
   *
   *  this.gop_subind    Refers to the character inside
   *        this.gop_options[this.gop_optind] which begins
   *        the next option to be processed.  This may never
   *        exceed the length of gop_argv[gop_optind], so
   *        when incrementing this value we must always
   *        check if we should instead increment optind and
   *        reset subind to 0.
   *
   * That is, when any of these functions is entered, the above indices' values
   * are as described above.  getopt() itself and getoptArgument() may both be
   * called at the end of the input, so they check whether optind exceeds
   * argv.length.  getoptShort() and getoptLong() are called only when the
   * indices already point to a valid short or long option, respectively.
   *
   * getopt() processes the next option as follows:
   *
   *  o If gop_optind > gop_argv.length, then we already parsed all arguments.
   *
   *  o If gop_subind == 0, then we're looking at the start of an argument:
   *
   *      o Check for special cases like '-', '--', and non-option arguments.
   *        If present, update the indices and return the appropriate value.
   *
   *      o Check for a long-form option (beginning with '--').  If present,
   *        delegate to getoptLong() and return the result.
   *
   *      o Otherwise, advance subind past the argument's leading '-' and
   *        continue as though gop_subind != 0 (since that's now the case).
   *
   *  o Delegate to getoptShort() and return the result.
   */
  getopt () {
    /* end of input */
    if (this.gop_optind >= this.gop_argv.length) { return undefined }

    var arg = this.gop_argv[this.gop_optind]

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

  /*
   * Implements getopt() for the case where optind/subind point to a
   *  short option.
   */
  getoptShort () {
    var arg, chr

    ASSERT(this.gop_optind < this.gop_argv.length)
    arg = this.gop_argv[this.gop_optind]
    ASSERT(this.gop_subind < arg.length)
    chr = arg[this.gop_subind]

    if (++this.gop_subind >= arg.length) {
      this.gop_optind++
      this.gop_subind = 0
    }

    if (!(chr in this.gop_options)) { return (this.errInvalidOption(chr)) }

    if (!this.gop_options[chr]) { return ({ option: chr }) }

    return (this.getoptArgument(chr))
  }

  /*
   * Implements getopt() for the case where optind/subind point to a long option
   */
  getoptLong () {
    var arg, alias, chr, eq

    ASSERT(this.gop_subind === 0)
    ASSERT(this.gop_optind < this.gop_argv.length)
    arg = this.gop_argv[this.gop_optind]
    ASSERT(arg.length > 2 && arg[0] === '-' && arg[1] === '-')

    eq = arg.indexOf('=')
    alias = arg.substring(2, eq === -1 ? arg.length : eq)
    if (!(alias in this.gop_aliases)) { return (this.errInvalidOption(alias)) }

    chr = this.gop_aliases[alias]
    ASSERT(chr in this.gop_options)

    if (!this.gop_options[chr]) {
      if (eq !== -1) { return (this.errExtraArg(alias)) }

      this.gop_optind++ /* eat this argument */
      return ({ option: chr })
    }

    /*
     * Advance optind/subind for the argument value and retrieve it.
     */
    if (eq === -1) { this.gop_optind++ } else { this.gop_subind = eq + 1 }

    return (this.getoptArgument(chr))
  }

  /*
   * For the given option letter 'chr' that takes an argument, assumes that
   * optind/subind point to the argument (or denote the end of input) and return
   * the appropriate getopt() return value for this option and argument (or
   * return the appropriate error).
   */
  getoptArgument (chr) {
    var arg

    if (this.gop_optind >= this.gop_argv.length) {
      return (this.errMissingArg(chr))
    }

    arg = this.gop_argv[this.gop_optind].substring(this.gop_subind)
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

  /*
   * This error is not specified by POSIX, but neither is the notion of
   * specifying long option arguments using "=" in the same argv-argument, but
   * it's common practice and pretty convenient.
   */
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
          ? arg.optarg : true
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
