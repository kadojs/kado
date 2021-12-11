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
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const BigInteger = require('../lib/BigInteger')

runner.suite('BigInteger', (it, bigint) => {
  const strNumber = '91823918239182398123'
  const binNumber = '1001111101001010000000101110010001001110010111110101010001010101011'
  const hexNumber = '4fa50172272faa2ab'
  const octNumber = '11751200562116276521253'
  const bi = new BigInteger(strNumber)
  const randomInt = (min, max, used = []) => {
    let rv = -1
    do {
      rv = Math.trunc(Math.random() * (max - min) + min)
    } while (used.indexOf(rv) !== -1)
    return rv
  }
  const zeroPad = (num, len) => {
    const n = len - num.toString().length
    return '0'.repeat(n > 0 ? n : 0) + num
  }
  const numeric = (a, b) => {
    const nVal = (v) => parseInt(v.toString().replace(/\D/g, ''), 10)
    return (nVal(a) - nVal(b))
  }
  const reverse = (a, b) => ((a < b) ? 1 : (a > b) ? -1 : 0)
  it(`should construct with ('${strNumber}')`, () => {
    Assert.isType('BigInteger', bi)
  })
  it('.clone() should return a clone', () => {
    const bi2 = bi.clone()
    Assert.eqDeep(bi, bi2)
  })
  bigint.suite('Coercion', (it) => {
    {
      const desired = 1929028267
      it(`.intValue() === ${desired}`, () => {
        const int = bi.intValue()
        Assert.eq(int, desired)
      })
    }
    {
      const desired = -85
      it(`.byteValue() === ${desired}`, () => {
        const byte = bi.byteValue()
        Assert.eq(byte, desired)
      })
    }
    {
      const desired = -23893
      it(`.shortValue() === ${desired}`, () => {
        const short = bi.shortValue()
        Assert.eq(short, desired)
      })
    }
    {
      const desired = [4, -6, 80, 23, 34, 114, -6, -94, -85]
      it(`.toByteArray() === [${desired}]`, () => {
        const byteArray = bi.toByteArray()
        Assert.eqDeep(byteArray, desired)
      })
    }
    it(`.toString()   === '${strNumber}'`, () => {
      Assert.eq(bi.toString(), strNumber)
    })
    it('.toString(10) === .toString()', () => {
      Assert.eq(bi.toString(10), bi.toString())
    })
    it(`.toString(16) === '${hexNumber}'`, () => {
      Assert.eq(bi.toString(16), hexNumber)
    })
    it(`.toString(2)  === '${binNumber}'`, () => {
      Assert.eq(bi.toString(2), binNumber)
    })
    it(`.toString(8)  === '${octNumber}'`, () => {
      Assert.eq(bi.toString(8), octNumber)
    })
  })
  bigint.suite('Comparison', (it) => {
    const strHead = strNumber.slice(0, strNumber.length - 3)
    const foot = parseInt(strNumber.slice(strNumber.length - 3), 10)
    const lessDesired = randomInt(1, foot)
    const lessNum = foot - lessDesired
    const lessStr = strHead + zeroPad(lessNum, 3)
    const moreDesired = randomInt(1, 999 - foot) * -1
    const moreNum = foot - moreDesired
    const moreStr = strHead + zeroPad(moreNum, 3)
    const less = new BigInteger(lessStr)
    const same = new BigInteger(strNumber)
    const more = new BigInteger(moreStr)
    it(`.compareTo('${lessStr}') === ${lessDesired}`, () => {
      Assert.eq(bi.compareTo(less), lessDesired)
    })
    it(`.compareTo('${strNumber}') === 0`, () => {
      Assert.eq(bi.compareTo(same), 0)
    })
    it(`.compareTo('${moreStr}') === ${moreDesired}`, () => {
      Assert.eq(bi.compareTo(more), moreDesired)
    })
    it(`.equals('${lessStr}') === false`, () => {
      Assert.eq(bi.equals(less), false)
    })
    it(`.equals('${strNumber}') === true`, () => {
      Assert.eq(bi.equals(same), true)
    })
    it(`.equals('${moreStr}') === false`, () => {
      Assert.eq(bi.equals(more), false)
    })
    it(`.min('${lessStr}') === '${lessStr}'`, () => {
      Assert.eqDeep(bi.min(less), less)
    })
    it(`.min('${strNumber}') === '${strNumber}'`, () => {
      Assert.eqDeep(bi.min(same), same)
    })
    it(`.min('${moreStr}') === '${strNumber}'`, () => {
      Assert.eqDeep(bi.min(more), bi)
    })
    it(`.max('${lessStr}') === '${strNumber}'`, () => {
      Assert.eqDeep(bi.max(less), bi)
    })
    it(`.max('${strNumber}') === '${strNumber}'`, () => {
      Assert.eqDeep(bi.max(same), same)
    })
    it(`.max('${moreStr}') === '${moreStr}'`, () => {
      Assert.eqDeep(bi.max(more), more)
    })
  })
  bigint.suite('Bitwise', (it) => {
    const opStr = '60292384759283745209'
    const op = new BigInteger(opStr)
    {
      const desired = '-91823918239182398124'
      it(`.not() === '${desired}'`, () => {
        Assert.eq(bi.not().toString(), desired)
      })
    }
    {
      const desired = '4616211755965120681'
      it(`.and('${opStr}') === '${desired}'`, () => {
        Assert.eq(bi.and(op).toString(), desired)
      })
    }
    {
      const desired = '87207706483217277442'
      it(`.andNot('${opStr}') === '${desired}'`, () => {
        Assert.eq(bi.andNot(op).toString(), desired)
      })
    }
    {
      const desired = '147500091242501022651'
      it(`.or('${opStr}') === '${desired}'`, () => {
        Assert.eq(bi.or(op).toString(), desired)
      })
    }
    {
      const desired = '142883879486535901970'
      it(`.xor('${opStr}') === '${desired}'`, () => {
        Assert.eq(bi.xor(op).toString(), desired)
      })
    }
    {
      const leftDesired = {
        0: strNumber,
        1: '183647836478364796246',
        2: '367295672956729592492',
        3: '734591345913459184984',
        4: '1469182691826918369968',
        8: '23506923069230693919488',
        16: '6017772305723057643388928',
        24: '1540549710265102756707565568',
        32: '394380725827866305717136785408',
        64: '1693852319603428308515440320085930016768'
      }
      for (const distance of Object.keys(leftDesired).sort(numeric)) {
        const desired = leftDesired[distance]
        it(`.shiftLeft(${distance}) === '${desired}'`, () => {
          Assert.eq(bi.shiftLeft(distance).toString(), desired)
        })
      }
    }
    {
      const rightDesired = {
        0: strNumber,
        1: '45911959119591199061',
        2: '22955979559795599530',
        3: '11477989779897799765',
        4: '5738994889948899882',
        8: '358687180621806242',
        16: '1401121799303930',
        24: '5473132028530',
        32: '21379421986',
        64: '4'
      }
      for (const distance of Object.keys(rightDesired).sort(numeric)) {
        const desired = rightDesired[distance]
        it(`.shiftRight(${distance}) === '${desired}'`, () => {
          Assert.eq(bi.shiftRight(distance).toString(), desired)
        })
      }
    }
    {
      const lsbDesired = {
        ffff: 0,
        fffe: 1,
        fff0: 4,
        ff00: 8
      }
      for (const hexVal of Object.keys(lsbDesired).sort(reverse)) {
        const desired = lsbDesired[hexVal]
        it(`(0x${hexVal}).getLowestSetBit() === ${desired}`, () => {
          Assert.eq((new BigInteger(hexVal, 16)).getLowestSetBit(), desired)
        })
      }
    }
    {
      const desired = 33
      it(`.bitCount() === ${desired}`, () => {
        const bc = bi.bitCount()
        Assert.eq(bc, desired)
      })
    }
    {
      const desired = 67
      it(`.bitLength() === ${desired}`, () => {
        const bl = bi.bitLength()
        Assert.eq(bl, desired)
      })
    }
    {
      const binReversed = binNumber.split('').reverse().join('')
      let used = []
      let prev = '1'
      do {
        const pos = randomInt(0, binReversed.length, used)
        if (binReversed.charAt(pos) !== prev) {
          prev = binReversed.charAt(pos)
          used.push(pos)
        }
      } while (used.length < 4)
      used = used.sort(numeric)
      for (const pos of used) {
        const desired = (binReversed.charAt(pos) === '1')
        it(`.testBit(${pos}) === ${desired}`, () => {
          const btb = bi.testBit(pos)
          Assert.eq(btb, desired)
        })
      }
      for (const pos of used) {
        const desired = true
        it(`.setBit(${pos}) === ${desired}`, () => {
          const bsbtb = bi.setBit(pos).testBit(pos)
          Assert.eq(bsbtb, desired)
        })
      }
      for (const pos of used) {
        const desired = false
        it(`.clearBit(${pos}) === ${desired}`, () => {
          const bcbtb = bi.clearBit(pos).testBit(pos)
          Assert.eq(bcbtb, desired)
        })
      }
      for (const pos of used) {
        const desired = !(binReversed.charAt(pos) === '1')
        it(`.flipBit(${pos}) === ${desired}`, () => {
          const bfbtb = bi.flipBit(pos).testBit(pos)
          Assert.eq(bfbtb, desired)
        })
      }
    }
  })
  bigint.suite('Arithmetic', (it) => {
    const two = new BigInteger('2')
    const pow = new BigInteger('3')
    {
      const desired = '91823918239182398125'
      it(`.add(2) === ${desired}`, () => {
        const ba = bi.add(two)
        Assert.eq(ba.toString(), desired)
      })
    }
    {
      const desired = '91823918239182398121'
      it(`.subtract(2) === ${desired}`, () => {
        const bs = bi.subtract(two)
        Assert.eq(bs.toString(), desired)
      })
    }
    {
      const desired = '183647836478364796246'
      it(`.multiply(2) === ${desired}`, () => {
        const bm = bi.multiply(two)
        Assert.eq(bm.toString(), desired)
      })
    }
    {
      const desired = '45911959119591199061'
      it(`.divide(2) === ${desired}`, () => {
        const bd = bi.divide(two)
        Assert.eq(bd.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.remainder(2) === ${desired}`, () => {
        const br = bi.remainder(two)
        Assert.eq(br.toString(), desired)
      })
    }
    {
      const desired = '45911959119591199061,1'
      it(`.divideAndRemainder(2) === ${desired}`, () => {
        const bdar = bi.divideAndRemainder(two)
        Assert.eq(bdar.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.mod(2) === ${desired}`, () => {
        const bm = bi.mod(two)
        Assert.eq(bm.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.modPow(3, 2) === ${desired}`, () => {
        const bmp = bi.modPow(pow, two)
        Assert.eq(bmp.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.modPowInt(3, 2) === ${desired}`, () => {
        const bmpi = bi.modPowInt(pow, two)
        Assert.eq(bmpi.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.modInverse(2) === ${desired}`, () => {
        const bmi = bi.modInverse(two)
        Assert.eq(bmi.toString(), desired)
      })
    }
    {
      const desired = '774225483791014018838582046636910251857644085058782575886867'
      it(`.pow(3) === ${desired}`, () => {
        const bp = bi.pow(pow)
        Assert.eq(bp.toString(), desired)
      })
    }
    {
      const desired = '8431631960796053881787631399869273923129'
      it(`.square() === ${desired}`, () => {
        const bs = bi.square()
        Assert.eq(bs.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.gcd(2) === ${desired}`, () => {
        const bg = bi.gcd(two)
        Assert.eq(bg.toString(), desired)
      })
    }
    {
      const desired = '-91823918239182398123'
      it(`.negate() === ${desired}`, () => {
        const bn = bi.negate()
        Assert.eq(bn.toString(), desired)
      })
    }
    {
      const desired = strNumber
      it(`.abs() === ${desired}`, () => {
        const ba = bi.abs()
        Assert.eq(ba.toString(), desired)
      })
      it(`.negate().abs() === ${desired}`, () => {
        const bna = bi.negate().abs()
        Assert.eq(bna.toString(), desired)
      })
    }
    {
      const desired = '1'
      it(`.signum() === ${desired}`, () => {
        const bs = bi.signum()
        Assert.eq(bs.toString(), desired)
      })
    }
    {
      const desired = '-1'
      it(`.negate().signum() === ${desired}`, () => {
        const bns = bi.negate().signum()
        Assert.eq(bns.toString(), desired)
      })
    }
    {
      const ippDesired = {
        997: true,
        996: false,
        353: true,
        352: false
      }
      for (const ippVal of Object.keys(ippDesired).sort(numeric)) {
        const desired = ippDesired[ippVal]
        it(`('${ippVal}').isProbablePrime() === ${desired}`, () => {
          const ipp = (new BigInteger(ippVal.toString())).isProbablePrime()
          Assert.eq(ipp, desired)
        })
      }
    }
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
