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
module.exports = class Format {

  //all static no constructor needed

  static toFixedFix(n,prec=0){
    if(-1 === (''+n).indexOf('e')){
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
    } else {
      let arr = ('' + n).split('e')
      return (+(Math.round(
          +arr[0] + 'e' + (+arr[1] + prec > 0) ? '+' : '' +
          (+arr[1] + prec)
        ) + 'e-' + prec
        )).toFixed(prec)
    }
  }

  static number(n,pos,pt='.',sep=','){
    n = (n + '').replace(/[^0-9+\-Ee.]/g, '')
    n = !isFinite(+n) ? 0 : +n
    let prec = !isFinite(+pos) ? 0 : Math.abs(pos)
    let s = (prec ? this.toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
    if(s[0].length > 3){
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if((s[1] || '').length < prec){
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(pt)
  }

  static bytes(val,opts={force:false,suffix:'B'}){
    if(!opts.hasOwnProperty('force')) opts.force=false
    if(!opts.hasOwnProperty('suffix')) opts.suffix='B'
    val = +val // coerce input to Number always
    let fmt = ''
    if('p' === opts.force || (!opts.force && val > 10000000000000000))
    { //pb
      fmt = 'P'
      val = Math.round(val / 1000000000000000)
    }
    else if('t' === opts.force || (!opts.force && val > 10000000000000))
    { //tb
      fmt = 'T'
      val = Math.round(val / 1000000000000)
    }
    else if('g' === opts.force || (!opts.force && val > 10000000000))
    { //gb
      fmt = 'G'
      val = Math.round(val / 1000000000)
    }
    else if('m' === opts.force || (!opts.force && val > 10000000))
    { //mb
      fmt = 'M'
      val = Math.round(val / 1000000)
    }
    else if('k' === opts.force || (!opts.force && val > 1000))
    { //kb
      fmt = 'K'
      val = Math.round(val / 1000)
    } else {
      val = Math.round(val)
    }
    if(opts.suffix) return this.number(val) + fmt + opts.suffix
    else return val + ''
  }

  static inetPtoN(a){
    let m,x,i,j
    let chr = String.fromCharCode

    // IPv4
    m = a.match(/^(?:\d{1,3}(?:\.|$)){4}/)
    if(m){
      m = m[0].split('.')
      m = chr(m[0]) + chr(m[1]) + chr(m[2]) + chr(m[3])
      return (4 === m.length) ? m : false
    }

    // IPv6
    m = a.match(/^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/)
    if(m){
      for(j = 1; j < 4; j++){
        if(j === 2 || m[j].length === 0) continue
        m[j] = m[j].split(':')
        for(i = 0; i < m[j].length; i++){
          m[j][i] = parseInt(m[j][i], 16)
          if(isNaN(m[j][i])) return false
          m[j][i] = chr(m[j][i] >> 8) + chr(m[j][i] & 0xFF)
        }
        m[j] = m[j].join('')
      }
      x = m[1].length + m[3].length
      if(16 === x){
        return m[1] + m[3]
      } else if(x < 16 && m[2].length > 0){
        return m[1] + (new Array(16 - x + 1)).join('\x00') + m[3]
      }
    }
    return false
  }

  static ip(ip = '0.0.0.0',padding = '0',web = false){
    let p = []
    let n = this.inetPtoN(ip)
    let rv = ''
    if(4 === n.length){
      for(let c=0; c<n.length; c++){
        let octet = '' + n.charCodeAt(c)
        p.push(('' !== padding) ? octet.padStart(3,padding) : octet)
      }
      rv = p.join('.')
    } else if(16 === n.length){
      for(let c=0; c<n.length; c+=2){
        let hextet = (n.charCodeAt(c)).toString(16).replace(/^0/g,'') + (n.charCodeAt(c+1)).toString(16).replace(/^0/g,'')
        if(0 === hextet.length) hextet = '0'
        p.push(('' !== padding) ? hextet.padStart(4,padding) : hextet)
      }
      rv = p.join(':')
    }
    if(web) rv = rv.replace(/ /g,'&nbsp;')
    return rv
  }
}
