'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2021 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
// BigInteger interfaces not implemented in jsbn:
//   BigInteger(int signum, byte[] magnitude)
//   double doubleValue()
//   float floatValue()
//   int hashCode()
//   long longValue()
//   static BigInteger valueOf(long val)

// Digit conversions
const BI_RC = []
let rr, vv
rr = '0'.charCodeAt(0)
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv
rr = 'a'.charCodeAt(0)
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv
rr = 'A'.charCodeAt(0)
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv

const int2char = (n) => '0123456789abcdefghijklmnopqrstuvwxyz'.charAt(n)
const intAt = (s, i) => {
  const c = BI_RC[s.charCodeAt(i)]
  return (c == null) ? -1 : c
}

// (public) this & a
const opAnd = (x, y) => x & y

// (public) this | a
const opOr = (x, y) => x | y

// (public) this ^ a
const opXor = (x, y) => x ^ y

// (public) this & ~a
const opAndNot = (x, y) => x & ~y

// returns the bit length of the integer x
const nbits = (x) => {
  let r = 1; let t
  if ((t = x >>> 16) !== 0) { x = t; r += 16 }
  if ((t = x >> 8) !== 0) { x = t; r += 8 }
  if ((t = x >> 4) !== 0) { x = t; r += 4 }
  if ((t = x >> 2) !== 0) { x = t; r += 2 }
  if ((x >> 1) !== 0) { r += 1 }
  return r
}

// Random number generator - requires a PRNG backend, e.g. prng4.js

// For best results, put code like
// <body onClick='rngSeedTime();' onKeyPress='rngSeedTime();'>
// in your main HTML document.

let rngState = null
let rngPool = []
let rngPptr = 0

class Arcfour {
  constructor () {
    // prng4.js - uses Arcfour as a PRNG
    this.i = 0
    this.j = 0
    this.S = []
    this.init = (key) => {
      // Initialize arcfour context from key, an array of ints, each from [0..255]
      let i, j, t
      for (i = 0; i < 256; ++i) { this.S[i] = i }
      j = 0
      for (i = 0; i < 256; ++i) {
        j = (j + this.S[i] + key[i % key.length]) & 255
        t = this.S[i]
        this.S[i] = this.S[j]
        this.S[j] = t
      }
      this.i = 0
      this.j = 0
    }
    this.next = () => {
      this.i = (this.i + 1) & 255
      this.j = (this.j + this.S[this.i]) & 255
      const t = this.S[this.i]
      this.S[this.i] = this.S[this.j]
      this.S[this.j] = t
      return this.S[(t + this.S[this.i]) & 255]
    }
  }
}

// Plug in your RNG constructor here
const prngNewstate = () => new Arcfour()

// Pool size must be a multiple of 4 and greater than 32.
// An array of bytes the size of the pool will be passed to init()
const rngPsize = 256

// Mix in a 32-bit integer into the pool
const rngSeedInt = (x) => {
  rngPool[rngPptr++] ^= x & 255
  rngPool[rngPptr++] ^= (x >> 8) & 255
  rngPool[rngPptr++] ^= (x >> 16) & 255
  rngPool[rngPptr++] ^= (x >> 24) & 255
  if (rngPptr >= rngPsize) rngPptr -= rngPsize
}

// Mix in the current time (w/milliseconds) into the pool
const rngSeedTime = () => {
  rngSeedInt(new Date().getTime())
}

// Initialize the pool with junk if needed.
rngPool = []
rngPptr = 0
let t
while (rngPptr < rngPsize) { // extract some randomness from Math.random()
  t = Math.floor(65536 * Math.random())
  rngPool[rngPptr++] = t >>> 8
  rngPool[rngPptr++] = t & 255
}
rngPptr = 0
rngSeedTime()

const rngGetByte = () => {
  if (rngState == null) {
    rngSeedTime()
    rngState = prngNewstate()
    rngState.init(rngPool)
    for (rngPptr = 0; rngPptr < rngPool.length; ++rngPptr) { rngPool[rngPptr] = 0 }
    rngPptr = 0
    // rngPool = null;
  }
  // TODO: allow reseeding after first request
  return rngState.next()
}

const rngGetBytes = (ba) => {
  let i
  for (i = 0; i < ba.length; ++i) ba[i] = rngGetByte()
}

class SecureRandom {
  constructor () {
    this.nextBytes = rngGetBytes
  }
}

class Barrett {
  // Barrett modular reduction
  constructor (m) {
    // setup Barrett
    this.r2 = nbi()
    this.q3 = nbi()
    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2)
    this.mu = this.r2.divide(m)
    this.m = m
    this.convert = (x) => {
      if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m)
      else if (x.compareTo(this.m) < 0) return x
      else { const r = nbi(); x.copyTo(r); this.reduce(r); return r }
    }
    this.revert = (x) => x
    this.reduce = (x) => {
      // x = x mod m (HAC 14.42)
      x.drShiftTo(this.m.t - 1, this.r2)
      if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp() }
      this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3)
      this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2)
      while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1)
      x.subTo(this.r2, x)
      while (x.compareTo(this.m) >= 0) x.subTo(this.m, x)
    }
    this.mulTo = (x, y, r) => {
      // r = x*y mod m; x,y != r
      x.multiplyTo(y, r); this.reduce(r)
    }
    this.sqrTo = (x, r) => {
      // r = x^2 mod m; x != r
      x.squareTo(r); this.reduce(r)
    }
  }
}

class Classic {
  // Modular reduction using "classic" algorithm
  constructor (m) {
    this.m = m
    this.convert = (x) => {
      if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m)
      else return x
    }
    this.revert = (x) => x
    this.reduce = (x) => { x.divRemTo(this.m, null, x) }
    this.mulTo = (x, y, r) => { x.multiplyTo(y, r); this.reduce(r) }
    this.sqrTo = (x, r) => { x.squareTo(r); this.reduce(r) }
  }
}

class Montgomery {
  // Montgomery reduction
  constructor (m) {
    this.m = m
    this.mp = m.invDigit()
    this.mpl = this.mp & 0x7fff
    this.mph = this.mp >> 15
    this.um = (1 << (m.DB - 15)) - 1
    this.mt2 = 2 * m.t
    this.convert = (x) => {
      // xR mod m
      const r = nbi()
      x.abs().dlShiftTo(this.m.t, r)
      r.divRemTo(this.m, null, r)
      if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r)
      return r
    }
    this.revert = (x) => {
      // x/R mod m
      const r = nbi()
      x.copyTo(r)
      this.reduce(r)
      return r
    }
    this.reduce = (x) => {
      // x = x/R mod m (HAC 14.32)
      while (x.t <= this.mt2) {
        // pad x so am has enough room later
        x[x.t++] = 0
      }
      for (let i = 0; i < this.m.t; ++i) {
        // faster way of calculating u0 = x[i]*mp mod DV
        let j = x[i] & 0x7fff
        const u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM
        // use am to combine the multiply-shift-add into one call
        j = i + this.m.t
        x[j] += this.m.am(0, u0, x, i, 0, this.m.t)
        // propagate carry
        while (x[j] >= x.DV) { x[j] -= x.DV; x[++j]++ }
      }
      x.clamp()
      x.drShiftTo(this.m.t, x)
      if (x.compareTo(this.m) >= 0) x.subTo(this.m, x)
    }
    this.mulTo = (x, y, r) => {
      // r = "xy/R mod m"; x,y != r
      x.multiplyTo(y, r); this.reduce(r)
    }
    this.sqrTo = (x, r) => {
      // r = "x^2/R mod m"; x != r
      x.squareTo(r); this.reduce(r)
    }
  }
}

const BI_FP = 52
const bitsPerDigit = 28
class BigInteger {
  constructor (a, b, c) {
    // (public) Constructor
    if (a != null) {
      if (typeof a === 'number') this.fromNumber(a, b, c)
      else if (b == null && typeof a !== 'string') this.fromString(a, 256)
      else this.fromString(a, b)
    }
  }

  // "constants"
  static get ZERO () { return ZERO }
  static get ONE () { return ONE }
  get ZERO () { return BigInteger.ZERO }
  get ONE () { return BigInteger.ONE }

  static get DB () { return bitsPerDigit }
  static get DM () { return ((1 << bitsPerDigit) - 1) }
  static get DV () { return (1 << bitsPerDigit) }
  static get FV () { return Math.pow(2, BI_FP) }
  static get F1 () { return BI_FP - bitsPerDigit }
  static get F2 () { return 2 * bitsPerDigit - BI_FP }
  get DB () { return BigInteger.DB }
  get DM () { return BigInteger.DM }
  get DV () { return BigInteger.DV }
  get FV () { return BigInteger.FV }
  get F1 () { return BigInteger.F1 }
  get F2 () { return BigInteger.F2 }

  static get Barrett () { return Barrett }
  static get SecureRandom () { return SecureRandom }

  am (i, x, w, j, c, n) {
    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    const xl = x & 0x3fff
    const xh = x >> 14
    while (--n >= 0) {
      let l = this[i] & 0x3fff
      const h = this[i++] >> 14
      const m = xh * l + h * xl
      l = xl * l + ((m & 0x3fff) << 14) + w[j] + c
      c = (l >> 28) + (m >> 14) + xh * h
      w[j++] = l & 0xfffffff
    }
    return c
  }

  // protected
  copyTo (r) {
    // (protected) copy this to r
    for (let i = this.t - 1; i >= 0; --i) r[i] = this[i]
    r.t = this.t
    r.s = this.s
  }

  fromInt (x) {
    // (protected) set from integer value x, -DV <= x < DV
    this.t = 1
    this.s = (x < 0) ? -1 : 0
    if (x > 0) this[0] = x
    else if (x < -1) this[0] = x + this.DV
    else this.t = 0
  }

  fromString (s, b) {
    // (protected) set from string and radix
    let k
    if (b === 16) k = 4
    else if (b === 8) k = 3
    else if (b === 256) k = 8 // byte array
    else if (b === 2) k = 1
    else if (b === 32) k = 5
    else if (b === 4) k = 2
    else { this.fromRadix(s, b); return }
    this.t = 0
    this.s = 0
    let i = s.length; let mi = false; let sh = 0
    while (--i >= 0) {
      const x = (k === 8) ? s[i] & 0xff : intAt(s, i)
      if (x < 0) {
        if (s.charAt(i) === '-') mi = true
        continue
      }
      mi = false
      if (sh === 0) { this[this.t++] = x } else if (sh + k > this.DB) {
        this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh
        this[this.t++] = (x >> (this.DB - sh))
      } else { this[this.t - 1] |= x << sh }
      sh += k
      if (sh >= this.DB) sh -= this.DB
    }
    if (k === 8 && (s[0] & 0x80) !== 0) {
      this.s = -1
      if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh
    }
    this.clamp()
    if (mi) BigInteger.ZERO.subTo(this, this)
  }

  clamp () {
    // (protected) clamp off excess high words
    const c = this.s & this.DM
    while (this.t > 0 && this[this.t - 1] === c) --this.t
  }

  dlShiftTo (n, r) {
    // (protected) r = this << n*DB
    let i
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i]
    for (i = n - 1; i >= 0; --i) r[i] = 0
    r.t = this.t + n
    r.s = this.s
  }

  drShiftTo (n, r) {
    // (protected) r = this >> n*DB
    for (let i = n; i < this.t; ++i) r[i - n] = this[i]
    r.t = Math.max(this.t - n, 0)
    r.s = this.s
  }

  lShiftTo (n, r) {
    // (protected) r = this << n
    const bs = n % this.DB
    const cbs = this.DB - bs
    const bm = (1 << cbs) - 1
    const ds = Math.floor(n / this.DB); let c = (this.s << bs) & this.DM; let i
    for (i = this.t - 1; i >= 0; --i) {
      r[i + ds + 1] = (this[i] >> cbs) | c
      c = (this[i] & bm) << bs
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0
    r[ds] = c
    r.t = this.t + ds + 1
    r.s = this.s
    r.clamp()
  }

  rShiftTo (n, r) {
    // (protected) r = this >> n
    r.s = this.s
    const ds = Math.floor(n / this.DB)
    if (ds >= this.t) { r.t = 0; return }
    const bs = n % this.DB
    const cbs = this.DB - bs
    const bm = (1 << bs) - 1
    r[0] = this[ds] >> bs
    for (let i = ds + 1; i < this.t; ++i) {
      r[i - ds - 1] |= (this[i] & bm) << cbs
      r[i - ds] = this[i] >> bs
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs
    r.t = this.t - ds
    r.clamp()
  }

  subTo (a, r) {
    // (protected) r = this - a
    let i = 0; let c = 0; const m = Math.min(a.t, this.t)
    while (i < m) {
      c += this[i] - a[i]
      r[i++] = c & this.DM
      c >>= this.DB
    }
    if (a.t < this.t) {
      c -= a.s
      while (i < this.t) {
        c += this[i]
        r[i++] = c & this.DM
        c >>= this.DB
      }
      c += this.s
    } else {
      c += this.s
      while (i < a.t) {
        c -= a[i]
        r[i++] = c & this.DM
        c >>= this.DB
      }
      c -= a.s
    }
    r.s = (c < 0) ? -1 : 0
    if (c < -1) r[i++] = this.DV + c
    else if (c > 0) r[i++] = c
    r.t = i
    r.clamp()
  }

  multiplyTo (a, r) {
    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    const x = this.abs(); const y = a.abs()
    let i = x.t
    r.t = i + y.t
    while (--i >= 0) r[i] = 0
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t)
    r.s = 0
    r.clamp()
    if (this.s !== a.s) BigInteger.ZERO.subTo(r, r)
  }

  squareTo (r) {
    // (protected) r = this^2, r != this (HAC 14.16)
    const x = this.abs()
    let i = r.t = 2 * x.t
    while (--i >= 0) r[i] = 0
    for (i = 0; i < x.t - 1; ++i) {
      const c = x.am(i, x[i], r, 2 * i, 0, 1)
      if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
        r[i + x.t] -= x.DV
        r[i + x.t + 1] = 1
      }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1)
    r.s = 0
    r.clamp()
  }

  divRemTo (m, q, r) {
    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    const pm = m.abs()
    if (pm.t <= 0) return
    const pt = this.abs()
    if (pt.t < pm.t) {
      if (q != null) q.fromInt(0)
      if (r != null) this.copyTo(r)
      return
    }
    if (r == null) r = nbi()
    const y = nbi(); const ts = this.s; const ms = m.s
    const nsh = this.DB - nbits(pm[pm.t - 1]) // normalize modulus
    if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r) } else { pm.copyTo(y); pt.copyTo(r) }
    const ys = y.t
    const y0 = y[ys - 1]
    if (y0 === 0) return
    const yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0)
    const d1 = this.FV / yt; const d2 = (1 << this.F1) / yt; const e = 1 << this.F2
    let i = r.t; let j = i - ys; const t = (q == null) ? nbi() : q
    y.dlShiftTo(j, t)
    if (r.compareTo(t) >= 0) {
      r[r.t++] = 1
      r.subTo(t, r)
    }
    BigInteger.ONE.dlShiftTo(ys, t)
    t.subTo(y, y) // "negative" y, so we can replace sub with am later
    while (y.t < ys) y[y.t++] = 0
    while (--j >= 0) {
      // Estimate quotient digit
      let qd = (r[--i] === y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2)
      if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
        y.dlShiftTo(j, t)
        r.subTo(t, r)
        while (r[i] < --qd) r.subTo(t, r)
      }
    }
    if (q != null) {
      r.drShiftTo(ys, q)
      if (ts !== ms) BigInteger.ZERO.subTo(q, q)
    }
    r.t = ys
    r.clamp()
    if (nsh > 0) r.rShiftTo(nsh, r) // Denormalize remainder
    if (ts < 0) BigInteger.ZERO.subTo(r, r)
  }

  invDigit () {
    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    if (this.t < 1) return 0
    const x = this[0]
    if ((x & 1) === 0) return 0
    let y = x & 3 // y == 1/x mod 2^2
    y = (y * (2 - (x & 0xf) * y)) & 0xf // y == 1/x mod 2^4
    y = (y * (2 - (x & 0xff) * y)) & 0xff // y == 1/x mod 2^8
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff // y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y * (2 - x * y % this.DV)) % this.DV // y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y > 0) ? this.DV - y : -y
  }

  isEven () {
    // (protected) true if this is even
    return ((this.t > 0) ? (this[0] & 1) : this.s) === 0
  }

  exp (e, z) {
    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    if (e > 0xffffffff || e < 1) return BigInteger.ONE
    let r = nbi(); let r2 = nbi(); const g = z.convert(this); let i = nbits(e) - 1
    g.copyTo(r)
    while (--i >= 0) {
      z.sqrTo(r, r2)
      if ((e & (1 << i)) > 0) z.mulTo(r2, g, r)
      else { const t = r; r = r2; r2 = t }
    }
    return z.revert(r)
  }

  // public
  toString (b) {
    // (public) return string representation in given radix
    if (this.s < 0) return '-' + this.negate().toString(b)
    let k
    if (b === 16) k = 4
    else if (b === 8) k = 3
    else if (b === 2) k = 1
    else if (b === 32) k = 5
    else if (b === 4) k = 2
    else return this.toRadix(b)
    const km = (1 << k) - 1; let d; let m = false; let r = ''; let i = this.t
    let p = this.DB - (i * this.DB) % k
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d) }
      while (i >= 0) {
        if (p < k) {
          d = (this[i] & ((1 << p) - 1)) << (k - p)
          d |= this[--i] >> (p += this.DB - k)
        } else {
          d = (this[i] >> (p -= k)) & km
          if (p <= 0) { p += this.DB; --i }
        }
        if (d > 0) m = true
        if (m) r += int2char(d)
      }
    }
    return m ? r : '0'
  }

  negate () {
    // (public) -this
    const r = nbi(); BigInteger.ZERO.subTo(this, r); return r
  }

  abs () {
    // (public) |this|
    return (this.s < 0) ? this.negate() : this
  }

  compareTo (a) {
    // (public) return + if this > a, - if this < a, 0 if equal
    let r = this.s - a.s
    if (r !== 0) return r
    let i = this.t
    r = i - a.t
    if (r !== 0) return (this.s < 0) ? -r : r
    while (--i >= 0) if ((r = this[i] - a[i]) !== 0) return r
    return 0
  }

  bitLength () {
    // (public) return the number of bits in "this"
    if (this.t <= 0) return 0
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM))
  }

  mod (a) {
    // (public) this mod a
    const r = nbi()
    this.abs().divRemTo(a, null, r)
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r)
    return r
  }

  modPowInt (e, m) {
    // (public) this^e % m, 0 <= e < 2^32
    let z
    if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m)
    return this.exp(e, z)
  }

  // protected
  chunkSize (r) {
    // (protected) return x s.t. r^x < DV
    return Math.floor(Math.LN2 * this.DB / Math.log(r))
  }

  toRadix (b) {
    // (protected) convert to radix string
    if (b == null) b = 10
    if (this.signum() === 0 || b < 2 || b > 36) return '0'
    const cs = this.chunkSize(b)
    const a = Math.pow(b, cs)
    const d = nbv(a); const y = nbi(); const z = nbi(); let r = ''
    this.divRemTo(d, y, z)
    while (y.signum() > 0) {
      r = (a + z.intValue()).toString(b).substr(1) + r
      y.divRemTo(d, y, z)
    }
    return z.intValue().toString(b) + r
  }

  fromRadix (s, b) {
    // (protected) convert from radix string
    this.fromInt(0)
    if (b == null) b = 10
    const cs = this.chunkSize(b)
    const d = Math.pow(b, cs); let mi = false; let j = 0; let w = 0
    for (let i = 0; i < s.length; ++i) {
      const x = intAt(s, i)
      if (x < 0) {
        if (s.charAt(i) === '-' && this.signum() === 0) mi = true
        continue
      }
      w = b * w + x
      if (++j >= cs) {
        this.dMultiply(d)
        this.dAddOffset(w, 0)
        j = 0
        w = 0
      }
    }
    if (j > 0) {
      this.dMultiply(Math.pow(b, j))
      this.dAddOffset(w, 0)
    }
    if (mi) BigInteger.ZERO.subTo(this, this)
  }

  fromNumber (a, b, c) {
    // (protected) alternate constructor
    if (typeof b === 'number') {
      // new BigInteger(int,int,RNG)
      if (a < 2) this.fromInt(1)
      else {
        this.fromNumber(a, c)
        if (!this.testBit(a - 1)) {
          // force MSB set
          this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), opOr, this)
        }
        if (this.isEven()) this.dAddOffset(1, 0) // force odd
        while (!this.isProbablePrime(b)) {
          this.dAddOffset(2, 0)
          if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this)
        }
      }
    } else {
      // new BigInteger(int,RNG)
      const x = []; const t = a & 7
      x.length = (a >> 3) + 1
      b.nextBytes(x)
      if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0
      this.fromString(x, 256)
    }
  }

  bitwiseTo (a, op, r) {
    // (protected) r = this op a (bitwise)
    let i; let f; const m = Math.min(a.t, this.t)
    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i])
    if (a.t < this.t) {
      f = a.s & this.DM
      for (i = m; i < this.t; ++i) r[i] = op(this[i], f)
      r.t = this.t
    } else {
      f = this.s & this.DM
      for (i = m; i < a.t; ++i) r[i] = op(f, a[i])
      r.t = a.t
    }
    r.s = op(this.s, a.s)
    r.clamp()
  }

  changeBit (n, op) {
    // (protected) this op (1<<n)
    const r = BigInteger.ONE.shiftLeft(n)
    this.bitwiseTo(r, op, r)
    return r
  }

  addTo (a, r) {
    // (protected) r = this + a
    let i = 0; let c = 0; const m = Math.min(a.t, this.t)
    while (i < m) {
      c += this[i] + a[i]
      r[i++] = c & this.DM
      c >>= this.DB
    }
    if (a.t < this.t) {
      c += a.s
      while (i < this.t) {
        c += this[i]
        r[i++] = c & this.DM
        c >>= this.DB
      }
      c += this.s
    } else {
      c += this.s
      while (i < a.t) {
        c += a[i]
        r[i++] = c & this.DM
        c >>= this.DB
      }
      c += a.s
    }
    r.s = (c < 0) ? -1 : 0
    if (c > 0) r[i++] = c
    else if (c < -1) r[i++] = this.DV + c
    r.t = i
    r.clamp()
  }

  dMultiply (n) {
    // (protected) this *= n, this >= 0, 1 < n < DV
    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t)
    ++this.t
    this.clamp()
  }

  dAddOffset (n, w) {
    // (protected) this += n << w words, this >= 0
    if (n === 0) return
    while (this.t <= w) this[this.t++] = 0
    this[w] += n
    while (this[w] >= this.DV) {
      this[w] -= this.DV
      if (++w >= this.t) this[this.t++] = 0
      ++this[w]
    }
  }

  multiplyLowerTo (a, n, r) {
    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    let i = Math.min(this.t + a.t, n)
    r.s = 0 // assumes a,this >= 0
    r.t = i
    while (i > 0) r[--i] = 0
    let j
    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t)
    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i)
    r.clamp()
  }

  multiplyUpperTo (a, n, r) {
    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    --n
    let i = r.t = this.t + a.t - n
    r.s = 0 // assumes a,this >= 0
    while (--i >= 0) r[i] = 0
    for (i = Math.max(n - this.t, 0); i < a.t; ++i) { r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n) }
    r.clamp()
    r.drShiftTo(1, r)
  }

  modInt (n) {
    // (protected) this % n, n < 2^26
    if (n <= 0) return 0
    const d = this.DV % n; let r = (this.s < 0) ? n - 1 : 0
    if (this.t > 0) {
      if (d === 0) r = this[0] % n
      else for (let i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n
    }
    return r
  }

  millerRabin (t) {
    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    const n1 = this.subtract(BigInteger.ONE)
    const k = n1.getLowestSetBit()
    if (k <= 0) return false
    const r = n1.shiftRight(k)
    t = (t + 1) >> 1
    if (t > lowprimes.length) t = lowprimes.length
    const a = nbi()
    for (let i = 0; i < t; ++i) {
      // Pick bases at random, instead of starting at 2
      a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)])
      let y = a.modPow(r, this)
      if (y.compareTo(BigInteger.ONE) !== 0 && y.compareTo(n1) !== 0) {
        let j = 1
        while (j++ < k && y.compareTo(n1) !== 0) {
          y = y.modPowInt(2, this)
          if (y.compareTo(BigInteger.ONE) === 0) return false
        }
        if (y.compareTo(n1) !== 0) return false
      }
    }
    return true
  }

  // public
  clone () {
    const r = nbi(); this.copyTo(r); return r
  }

  intValue () {
    // (public) return value as integer
    if (this.s < 0) {
      if (this.t === 1) return this[0] - this.DV
      else if (this.t === 0) return -1
    } else if (this.t === 1) return this[0]
    else if (this.t === 0) return 0
    // assumes 16 < DB < 32
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0]
  }

  byteValue () {
    // (public) return value as byte
    return (this.t === 0) ? this.s : (this[0] << 24) >> 24
  }

  shortValue () {
    // (public) return value as short (assumes DB>=16)
    return (this.t === 0) ? this.s : (this[0] << 16) >> 16
  }

  signum () {
    // (public) 0 if this == 0, 1 if this > 0
    if (this.s < 0) return -1
    else if (this.t <= 0 || (this.t === 1 && this[0] <= 0)) return 0
    else return 1
  }

  toByteArray () {
    // (public) convert to bigendian byte array
    let i = this.t; const r = []
    r[0] = this.s
    let p = this.DB - (i * this.DB) % 8; let d; let k = 0
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) !== (this.s & this.DM) >> p) { r[k++] = d | (this.s << (this.DB - p)) }
      while (i >= 0) {
        if (p < 8) {
          d = (this[i] & ((1 << p) - 1)) << (8 - p)
          d |= this[--i] >> (p += this.DB - 8)
        } else {
          d = (this[i] >> (p -= 8)) & 0xff
          if (p <= 0) { p += this.DB; --i }
        }
        if ((d & 0x80) !== 0) d |= -256
        if (k === 0 && (this.s & 0x80) !== (d & 0x80)) ++k
        if (k > 0 || d !== this.s) r[k++] = d
      }
    }
    return r
  }

  equals (a) { return (this.compareTo(a) === 0) }

  min (a) { return (this.compareTo(a) < 0) ? this : a }

  max (a) { return (this.compareTo(a) > 0) ? this : a }

  and (a) { const r = nbi(); this.bitwiseTo(a, opAnd, r); return r }

  or (a) { const r = nbi(); this.bitwiseTo(a, opOr, r); return r }

  xor (a) { const r = nbi(); this.bitwiseTo(a, opXor, r); return r }

  andNot (a) { const r = nbi(); this.bitwiseTo(a, opAndNot, r); return r }

  not () {
    // (public) ~this
    const r = nbi()
    for (let i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i]
    r.t = this.t
    r.s = ~this.s
    return r
  }

  shiftLeft (n) {
    // (public) this << n
    const r = nbi()
    if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r)
    return r
  }

  shiftRight (n) {
    // (public) this >> n
    const r = nbi()
    if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r)
    return r
  }

  getLowestSetBit () {
    // (public) returns index of the lowest 1-bit (or -1 if none)
    for (let i = 0; i < this.t; ++i) { if (this[i] !== 0) return i * this.DB + lbit(this[i]) }
    if (this.s < 0) return this.t * this.DB
    return -1
  }

  bitCount () {
    // (public) return number of set bits
    let r = 0; const x = this.s & this.DM
    for (let i = 0; i < this.t; ++i) r += cbit(this[i] ^ x)
    return r
  }

  testBit (n) {
    // (public) true if nth bit is set
    const j = Math.floor(n / this.DB)
    if (j >= this.t) return (this.s !== 0)
    return ((this[j] & (1 << (n % this.DB))) !== 0)
  }

  setBit (n) {
    // (public) this | (1<<n)
    return this.changeBit(n, opOr)
  }

  clearBit (n) {
    // (public) this & ~(1<<n)
    return this.changeBit(n, opAndNot)
  }

  flipBit (n) {
    // (public) this ^ (1<<n)
    return this.changeBit(n, opXor)
  }

  add (a) {
    // (public) this + a
    const r = nbi(); this.addTo(a, r); return r
  }

  subtract (a) {
    // (public) this - a
    const r = nbi(); this.subTo(a, r); return r
  }

  multiply (a) {
    // (public) this * a
    const r = nbi(); this.multiplyTo(a, r); return r
  }

  divide (a) {
    // (public) this / a
    const r = nbi(); this.divRemTo(a, r, null); return r
  }

  remainder (a) {
    // (public) this % a
    const r = nbi(); this.divRemTo(a, null, r); return r
  }

  divideAndRemainder (a) {
    // (public) [this/a,this%a]
    const q = nbi(); const r = nbi()
    this.divRemTo(a, q, r)
    return [q, r]
  }

  modPow (e, m) {
    // (public) this^e % m (HAC 14.85)
    let i = e.bitLength(); let k; let r = nbv(1); let z
    if (i <= 0) return r
    else if (i < 18) k = 1
    else if (i < 48) k = 3
    else if (i < 144) k = 4
    else if (i < 768) k = 5
    else k = 6
    if (i < 8) { z = new Classic(m) } else if (m.isEven()) { z = new Barrett(m) } else { z = new Montgomery(m) }

    // pre-computation
    const g = []; let n = 3; const k1 = k - 1; const km = (1 << k) - 1
    g[1] = z.convert(this)
    if (k > 1) {
      const g2 = nbi()
      z.sqrTo(g[1], g2)
      while (n <= km) {
        g[n] = nbi()
        z.mulTo(g2, g[n - 2], g[n])
        n += 2
      }
    }

    let j = e.t - 1; let w; let is1 = true; let r2 = nbi(); let t
    i = nbits(e[j]) - 1
    while (j >= 0) {
      if (i >= k1) w = (e[j] >> (i - k1)) & km
      else {
        w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i)
        if (j > 0) w |= e[j - 1] >> (this.DB + i - k1)
      }

      n = k
      while ((w & 1) === 0) { w >>= 1; --n }
      if ((i -= n) < 0) { i += this.DB; --j }
      if (is1) {
        // ret == 1, don't bother squaring or multiplying it
        g[w].copyTo(r)
        is1 = false
      } else {
        while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2 }
        if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t }
        z.mulTo(r2, g[w], r)
      }

      while (j >= 0 && (e[j] & (1 << i)) === 0) {
        z.sqrTo(r, r2); t = r; r = r2; r2 = t
        if (--i < 0) { i = this.DB - 1; --j }
      }
    }
    return z.revert(r)
  }

  modInverse (m) {
    // (public) 1/this % m (HAC 14.61)
    const ac = m.isEven()
    if ((this.isEven() && ac) || m.signum() === 0) return BigInteger.ZERO
    const u = m.clone(); const v = this.clone()
    const a = nbv(1); const b = nbv(0); const c = nbv(0); const d = nbv(1)
    while (u.signum() !== 0) {
      while (u.isEven()) {
        u.rShiftTo(1, u)
        if (ac) {
          if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b) }
          a.rShiftTo(1, a)
        } else if (!b.isEven()) b.subTo(m, b)
        b.rShiftTo(1, b)
      }
      while (v.isEven()) {
        v.rShiftTo(1, v)
        if (ac) {
          if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d) }
          c.rShiftTo(1, c)
        } else if (!d.isEven()) d.subTo(m, d)
        d.rShiftTo(1, d)
      }
      if (u.compareTo(v) >= 0) {
        u.subTo(v, u)
        if (ac) a.subTo(c, a)
        b.subTo(d, b)
      } else {
        v.subTo(u, v)
        if (ac) c.subTo(a, c)
        d.subTo(b, d)
      }
    }
    if (v.compareTo(BigInteger.ONE) !== 0) return BigInteger.ZERO
    if (d.compareTo(m) >= 0) return d.subtract(m)
    if (d.signum() < 0) d.addTo(m, d); else return d
    if (d.signum() < 0) return d.add(m); else return d
  }

  pow (e) {
    // (public) this^e
    return this.exp(e, new NullExp())
  }

  gcd (a) {
    // (public) gcd(this,a) (HAC 14.54)
    let x = (this.s < 0) ? this.negate() : this.clone()
    let y = (a.s < 0) ? a.negate() : a.clone()
    if (x.compareTo(y) < 0) { const t = x; x = y; y = t }
    let i = x.getLowestSetBit(); let g = y.getLowestSetBit()
    if (g < 0) return x
    if (i < g) g = i
    if (g > 0) {
      x.rShiftTo(g, x)
      y.rShiftTo(g, y)
    }
    while (x.signum() > 0) {
      if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x)
      if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y)
      if (x.compareTo(y) >= 0) {
        x.subTo(y, x)
        x.rShiftTo(1, x)
      } else {
        y.subTo(x, y)
        y.rShiftTo(1, y)
      }
    }
    if (g > 0) y.lShiftTo(g, y)
    return y
  }

  isProbablePrime (t) {
    // (public) test primality with certainty >= 1-.5^t
    let i; const x = this.abs()
    if (x.t === 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
      for (i = 0; i < lowprimes.length; ++i) { if (x[0] === lowprimes[i]) return true }
      return false
    }
    if (x.isEven()) return false
    i = 1
    while (i < lowprimes.length) {
      let m = lowprimes[i]; let j = i + 1
      while (j < lowprimes.length && m < lplim) m *= lowprimes[j++]
      m = x.modInt(m)
      while (i < j) if (m % lowprimes[i++] === 0) return false
    }
    return x.millerRabin(t)
  }

  // JSBN-specific extension
  square () {
    // (public) this^2
    const r = nbi(); this.squareTo(r); return r
  }
}

// return new, unset BigInteger
const nbi = () => new BigInteger(null)

// return bigint initialized to value
const nbv = (i) => { const r = nbi(); r.fromInt(i); return r }

const ZERO = nbv(0)
const ONE = nbv(1)

// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Extended JavaScript BN functions, required for RSA private ops.

// Version 1.1: new BigInteger("0", 10) returns "proper" zero
// Version 1.2: square() API, isProbablePrime fix

// return index of the lowest 1-bit in x, x < 2^31
const lbit = (x) => {
  if (x === 0) return -1
  let r = 0
  if ((x & 0xffff) === 0) { x >>= 16; r += 16 }
  if ((x & 0xff) === 0) { x >>= 8; r += 8 }
  if ((x & 0xf) === 0) { x >>= 4; r += 4 }
  if ((x & 3) === 0) { x >>= 2; r += 2 }
  if ((x & 1) === 0) ++r
  return r
}

// return number of 1 bits in x
const cbit = (x) => {
  let r = 0
  while (x !== 0) { x &= x - 1; ++r }
  return r
}

// A "null" reducer
class NullExp {
  constructor () {
    this.convert = (x) => x
    this.revert = (x) => x
    this.mulTo = (x, y, r) => { x.multiplyTo(y, r) }
    this.sqrTo = (x, r) => { x.squareTo(r) }
  }
}

const lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997]
const lplim = (1 << 26) / lowprimes[lowprimes.length - 1]

module.exports = BigInteger
