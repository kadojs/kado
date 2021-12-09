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
const Network = require('../lib/Network')

const network = runner.suite('Network')
const jss = (i) => {
  const str = JSON.stringify(i)
  const max = str.length - 1
  if (str.charAt(0) === '"' && str.charAt(max) === '"') {
    return `'${str.slice(1, max)}'`
  } else if (str.charAt(0) === '[' && str.charAt(max) === ']') {
    return str.replace(/,/g, ', ')
  }
  return str
}
const chr = (n, count = 1) => String.fromCharCode(n).repeat(count)
const bl = (bool) => bool ? ' true' : 'false'

const ipv4Goods = [
  '0.0.0.0',
  '8.8.8.8',
  '127.0.0.1',
  '239.255.255.250',
  '255.255.255.255'
]
const packedIPv4Goods = [
  0,
  134744072,
  2130706433,
  4026531834,
  4294967295
]
const stringIPv4Goods = [
  chr(0, 4),
  chr(8, 4),
  chr(127) + chr(0, 2) + chr(1),
  chr(239) + chr(255, 2) + chr(250),
  chr(255, 4)
]
const paddedIPv4Goods = [
  '000.000.000.000',
  '008.008.008.008',
  '127.000.000.001',
  '239.255.255.250',
  '255.255.255.255'
]
const spcwebIPv4Goods = [
  '&nbsp;&nbsp;0.&nbsp;&nbsp;0.&nbsp;&nbsp;0.&nbsp;&nbsp;0',
  '&nbsp;&nbsp;8.&nbsp;&nbsp;8.&nbsp;&nbsp;8.&nbsp;&nbsp;8',
  '127.&nbsp;&nbsp;0.&nbsp;&nbsp;0.&nbsp;&nbsp;1',
  '239.255.255.250',
  '255.255.255.255'
]
const ipv4Bads = [
  '0.0.0.-1',
  '8.8.8',
  '127.0.0.256',
  '266.299.266.299'
]
const packedIPv4Bads = [
  -1,
  4294967296
]
const ipv4Privs = [
  '10.0.0.0',
  '10.255.255.255',
  '192.168.0.0',
  '192.168.255.255',
  '172.16.0.0',
  '172.16.255.255',
  '127.0.0.1',
  '127.255.255.255',
  '169.254.0.1',
  '169.254.255.255'
]

const ipv6Goods = [
  '::',
  '2001:4860:4860::8888',
  '::1',
  'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
  '::ffff:192.168.100.228',
  '2001:0:4136:e378:8000:63bf:3fff:fdd2',
  'fe80::a40e:36ca:aa55:eb39'
]
const packedIPv6Goods = [
  [0x00000000, 0x00000000, 0x00000000, 0x00000000],
  [0x20014860, 0x48600000, 0x00000000, 0x00008888],
  [0x00000000, 0x00000000, 0x00000000, 0x00000001],
  [0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff],
  [0x00000000, 0x00000000, 0x0000ffff, 0xc0a864e4],
  [0x20010000, 0x4136e378, 0x800063bf, 0x3ffffdd2],
  [0xfe800000, 0x00000000, 0xa40e36ca, 0xaa55eb39]
]
const stringIPv6Goods = [
  chr(0, 16),
  chr(0x20) + chr(0x01) + (chr(0x48) + chr(0x60)).repeat(2) + chr(0, 8) + chr(0x88, 2),
  chr(0, 15) + chr(1),
  chr(255, 16),
  chr(0, 10) + chr(0xff, 2) + chr(192) + chr(168) + chr(100) + chr(228),
  chr(32) + chr(1) + chr(0, 2) + chr(65) + chr(54) + chr(227) + chr(120) + chr(128) + chr(0) + chr(99) + chr(191) + chr(63) + chr(255) + chr(253) + chr(210),
  chr(254) + chr(128) + chr(0, 6) + chr(164) + chr(14) + chr(54) + chr(202) + chr(170) + chr(85) + chr(235) + chr(57)
]
const paddedIPv6Goods = [
  '0000:0000:0000:0000:0000:0000:0000:0000',
  '2001:4860:4860:0000:0000:0000:0000:8888',
  '0000:0000:0000:0000:0000:0000:0000:0001',
  'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
  '0000:0000:0000:0000:0000:ffff:c0a8:64e4',
  '2001:0000:4136:e378:8000:63bf:3fff:fdd2',
  'fe80:0000:0000:0000:a40e:36ca:aa55:eb39'
]
const spcwebIPv6Goods = [
  '&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0',
  '2001:4860:4860:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:8888',
  '&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;1',
  'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
  '&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:ffff:c0a8:64e4',
  '2001:&nbsp;&nbsp;&nbsp;0:4136:e378:8000:63bf:3fff:fdd2',
  'fe80:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:a40e:36ca:aa55:eb39'
]
const ipv6Bads = [
  ':;',
  '2001.4860.4860::8888',
  '::-1',
  'ffff:ffff:ffff:ffff:ffff:fffg'
]
const packedIPv6Bads = [
  [0, 0, 0, -1],
  [0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff + 1],
  '::',
  'ffff:ffff:ffff:ffff:ffff:ffff'
]
const ipv6Privs = [
  '::',
  '::1',
  'fc00::',
  'fc00:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
  'fe80::',
  'fe80:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
]

network.suite('class:IPAddr4', (it) => {
  const resultIPv4Goods = [
    // isCorrect, isPrivate, isMulticast, isLoopback
    [true, false, false, false],
    [true, false, false, false],
    [true, true, false, true],
    [true, false, true, false],
    [true, false, false, false]
  ]
  const hexstrIPv4Goods = [
    '00:00:00:00',
    '08:08:08:08',
    '7f:00:00:01',
    'ef:ff:ff:fa',
    'ff:ff:ff:ff'
  ]
  const arrayIPv4Goods = [
    [0, 0, 0, 0],
    [8, 8, 8, 8],
    [127, 0, 0, 1],
    [239, 255, 255, 250],
    [255, 255, 255, 255]
  ]
  const group6IPv4Goods = [
    '0:0',
    '808:808',
    '7f00:1',
    'efff:fffa',
    'ffff:ffff'
  ]
  const startIPv4Goods = [
    '0.0.0.0',
    '8.8.8.0',
    '127.0.0.0',
    '239.255.255.0',
    '255.255.255.0'
  ]
  const stexclIPv4Goods = [
    '0.0.0.1',
    '8.8.8.1',
    '127.0.0.1',
    '239.255.255.1',
    '255.255.255.1'
  ]
  const endIPv4Goods = [
    '0.0.0.255',
    '8.8.8.255',
    '127.0.0.255',
    '239.255.255.255',
    '255.255.255.255'
  ]
  const endexclIPv4Goods = [
    '0.0.0.254',
    '8.8.8.254',
    '127.0.0.254',
    '239.255.255.254',
    '255.255.255.254'
  ]
  const maskIPv4Goods = [
    '000000000000000000000000',
    '000010000000100000001000',
    '011111110000000000000000',
    '111011111111111111111111',
    '111111111111111111111111'
  ]
  let ip, ip24
  let i = 0
  for (const ipv4Good of ipv4Goods) {
    const ipv4Good24 = `${ipv4Good}/24`
    const result = resultIPv4Goods[i]
    const hexstr = hexstrIPv4Goods[i]
    const array = arrayIPv4Goods[i]
    const group6 = group6IPv4Goods[i]
    const start = startIPv4Goods[i]
    const stexcl = stexclIPv4Goods[i]
    const end = endIPv4Goods[i]
    const endexcl = endexclIPv4Goods[i]
    const mask = maskIPv4Goods[i]
    it(`should construct IPAddr4(${jss(ipv4Good)})`, () => {
      ip = Network.IPAddr4(ipv4Good)
      ip24 = Network.IPAddr4(ipv4Good24)
      Assert.isType('IPAddr4', ip)
      Assert.isType('IPAddr4', ip24)
    })
    it(`assert ${bl(result[0])} === IPAddr4(${jss(ipv4Good)}).isCorrect()`, () => {
      Assert.eq(result[0], ip.isCorrect())
    })
    it(`assert ${bl(result[1])} === IPAddr4(${jss(ipv4Good)}).isPrivate()`, () => {
      Assert.eq(result[1], ip.isPrivate())
    })
    it(`assert ${bl(result[2])} === IPAddr4(${jss(ipv4Good)}).isMulticast()`, () => {
      Assert.eq(result[2], ip.isMulticast())
    })
    it(`assert ${bl(result[3])} === IPAddr4(${jss(ipv4Good)}).isLoopback()`, () => {
      Assert.eq(result[3], ip.isLoopback())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good)}).correctForm()`, () => {
      Assert.eq(ipv4Good, ip.correctForm())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good)}).toHex()`, () => {
      Assert.eq(hexstr, ip.toHex())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good)}).toArray()`, () => {
      Assert.eqDeep(array, ip.toArray())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good)}).toGroup6()`, () => {
      Assert.eq(group6, ip.toGroup6())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good)}).bigInteger()`, () => {
      Assert.isType('BigInteger', ip.bigInteger())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good24)}).startAddress()`, () => {
      Assert.eq(start, ip24.startAddress().correctForm())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good24)}).startAddressExclusive()`, () => {
      Assert.eq(stexcl, ip24.startAddressExclusive().correctForm())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good24)}).endAddress()`, () => {
      Assert.eq(end, ip24.endAddress().correctForm())
    })
    it(`assert expected  IPAddr4(${jss(ipv4Good24)}).endAddressExclusive()`, () => {
      Assert.eq(endexcl, ip24.endAddressExclusive().correctForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv4Good24)}).mask()`, () => {
      Assert.eq(mask, ip24.mask())
    })
    i++
  }
})
network.suite('class:IPAddr6', (it) => {
  const resultIPv6Goods = [
    // isCorrect, isCanonical, isPrivate, isLinkLocal
    //   isMulticast, is4, isTeredo, is6to4, isLoopback
    [true, false, true, false, false, false, false, false, true],
    [true, false, false, false, false, false, false, false, false],
    [true, false, true, false, false, false, false, false, true],
    [true, true, false, false, true, false, false, false, false],
    [false, false, true, false, false, true, false, false, false],
    [true, false, false, false, false, false, true, false, false],
    [true, false, true, true, false, false, false, false, false]
  ]
  const hexstrIPv6Goods = [
    '0000:0000:0000:0000:0000:0000:0000:0000',
    '2001:4860:4860:0000:0000:0000:0000:8888',
    '0000:0000:0000:0000:0000:0000:0000:0001',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '0000:0000:0000:0000:0000:ffff:c0a8:64e4',
    '2001:0000:4136:e378:8000:63bf:3fff:fdd2',
    'fe80:0000:0000:0000:a40e:36ca:aa55:eb39'
  ]
  const decimalIPv6Goods = [
    '00000:00000:00000:00000:00000:00000:00000:00000',
    '08193:18528:18528:00000:00000:00000:00000:34952',
    '00000:00000:00000:00000:00000:00000:00000:00001',
    '65535:65535:65535:65535:65535:65535:65535:65535',
    '00000:00000:00000:00000:00000:65535:49320:25828',
    '08193:00000:16694:58232:32768:25535:16383:64978',
    '65152:00000:00000:00000:41998:14026:43605:60217'
  ]
  const sbyteIPv6Goods = [
    [0],
    [32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, -120, -120],
    [1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, -1, -1, -64, -88, 100, -28],
    [32, 1, 0, 0, 65, 54, -29, 120, -128, 0, 99, -65, 63, -1, -3, -46],
    [-2, -128, 0, 0, 0, 0, 0, 0, -92, 14, 54, -54, -86, 85, -21, 57]
  ]
  const ubyteIPv6Goods = [
    [0],
    [32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, 136, 136],
    [1],
    [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
    [0, 255, 255, 192, 168, 100, 228],
    [32, 1, 0, 0, 65, 54, 227, 120, 128, 0, 99, 191, 63, 255, 253, 210],
    [254, 128, 0, 0, 0, 0, 0, 0, 164, 14, 54, 202, 170, 85, 235, 57]
  ]
  const startIPv6Goods = [
    '::',
    '2001:4860:4860::8800',
    '::',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff00',
    '::ffff:c0a8:6400',
    '2001:0:4136:e378:8000:63bf:3fff:fd00',
    'fe80::a40e:36ca:aa55:eb00'
  ]
  const stexcIPv6Goods = [
    '::1',
    '2001:4860:4860::8801',
    '::1',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff01',
    '::ffff:c0a8:6401',
    '2001:0:4136:e378:8000:63bf:3fff:fd01',
    'fe80::a40e:36ca:aa55:eb01'
  ]
  const endIPv6Goods = [
    '::ff',
    '2001:4860:4860::88ff',
    '::ff',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '::ffff:c0a8:64ff',
    '2001:0:4136:e378:8000:63bf:3fff:fdff',
    'fe80::a40e:36ca:aa55:ebff'
  ]
  const endexcIPv6Goods = [
    '::fe',
    '2001:4860:4860::88fe',
    '::fe',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe',
    '::ffff:c0a8:64fe',
    '2001:0:4136:e378:8000:63bf:3fff:fdfe',
    'fe80::a40e:36ca:aa55:ebfe'
  ]
  const maskIPv6Goods = [
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '001000000000000101001000011000000100100001100000000000000000000000000000000000000000000000000000000000000000000010001000',
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    '000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111110000001010100001100100',
    '001000000000000100000000000000000100000100110110111000110111100010000000000000000110001110111111001111111111111111111101',
    '111111101000000000000000000000000000000000000000000000000000000010100100000011100011011011001010101010100101010111101011'
  ]
  let ip, ip120
  let i = 0
  for (const ipv6Good of ipv6Goods) {
    const ipv6Good120 = `${ipv6Good}/120`
    const result = resultIPv6Goods[i]
    const hexstr = hexstrIPv6Goods[i]
    const decimal = decimalIPv6Goods[i]
    const sbyte = sbyteIPv6Goods[i]
    const ubyte = ubyteIPv6Goods[i]
    const start = startIPv6Goods[i]
    const stexc = stexcIPv6Goods[i]
    const end = endIPv6Goods[i]
    const endexc = endexcIPv6Goods[i]
    const mask = maskIPv6Goods[i]
    it(`should construct IPAddr6(${jss(ipv6Good)})`, () => {
      ip = Network.IPAddr6(ipv6Good)
      ip120 = Network.IPAddr6(ipv6Good120)
      Assert.isType('IPAddr6', ip)
      Assert.isType('IPAddr6', ip120)
    })
    it(`assert ${bl(result[0])} === IPAddr6(${jss(ipv6Good)}).isCorrect()`, () => {
      Assert.eq(result[0], ip.isCorrect())
    })
    it(`assert ${bl(result[1])} === IPAddr6(${jss(ipv6Good)}).isCanonical()`, () => {
      Assert.eq(result[1], ip.isCanonical())
    })
    it(`assert ${bl(result[2])} === IPAddr6(${jss(ipv6Good)}).isPrivate()`, () => {
      Assert.eq(result[2], ip.isPrivate())
    })
    it(`assert ${bl(result[3])} === IPAddr6(${jss(ipv6Good)}).isLinkLocal()`, () => {
      Assert.eq(result[3], ip.isLinkLocal())
    })
    it(`assert ${bl(result[4])} === IPAddr6(${jss(ipv6Good)}).isMulticast()`, () => {
      Assert.eq(result[4], ip.isMulticast())
    })
    it(`assert ${bl(result[5])} === IPAddr6(${jss(ipv6Good)}).is4()`, () => {
      Assert.eq(result[5], ip.is4())
    })
    it(`assert ${bl(result[6])} === IPAddr6(${jss(ipv6Good)}).isTeredo()`, () => {
      Assert.eq(result[6], ip.isTeredo())
    })
    it(`assert ${bl(result[7])} === IPAddr6(${jss(ipv6Good)}).is6to4()`, () => {
      Assert.eq(result[7], ip.is6to4())
    })
    it(`assert ${bl(result[8])} === IPAddr6(${jss(ipv6Good)}).isLoopback()`, () => {
      Assert.eq(result[8], ip.isLoopback())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good)}).correctForm()`, () => {
      const ipv6GoodFiltered = ip.parse4in6(ipv6Good)
      Assert.eq(ipv6GoodFiltered, ip.correctForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good)}).canonicalForm()`, () => {
      Assert.eq(hexstr, ip.canonicalForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good)}).decimal()`, () => {
      Assert.eq(decimal, ip.decimal())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good)}).toByteArray()`, () => {
      Assert.eqDeep(sbyte, ip.toByteArray())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good)}).toUnsignedByteArray()`, () => {
      Assert.eqDeep(ubyte, ip.toUnsignedByteArray())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good)}).bigInteger()`, () => {
      Assert.isType('BigInteger', ip.bigInteger())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good120)}).startAddress()`, () => {
      Assert.eq(start, ip120.startAddress().correctForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good120)}).startAddressExclusive()`, () => {
      Assert.eq(stexc, ip120.startAddressExclusive().correctForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good120)}).endAddress()`, () => {
      Assert.eq(end, ip120.endAddress().correctForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good120)}).endAddressExclusive()`, () => {
      Assert.eq(endexc, ip120.endAddressExclusive().correctForm())
    })
    it(`assert expected  IPAddr6(${jss(ipv6Good120)}).mask()`, () => {
      Assert.eq(mask, ip120.mask())
    })
    i++
  }
})
network.suite('isIPv4', (it) => {
  for (const ipv4Good of ipv4Goods) {
    it(`assert  true === isIPv4(${jss(ipv4Good)})`, () => {
      Assert.eq(true, Network.isIPv4(ipv4Good))
    })
  }
  for (const ipv4Bad of ipv4Bads) {
    it(`assert false === isIPv4(${jss(ipv4Bad)})`, () => {
      Assert.eq(false, Network.isIPv4(ipv4Bad))
    })
  }
})
network.suite('isIPv6', (it) => {
  for (const ipv6Good of ipv6Goods) {
    it(`assert  true === isIPv6(${jss(ipv6Good)})`, () => {
      Assert.eq(true, Network.isIPv6(ipv6Good))
    })
  }
  for (const ipv6Bad of ipv6Bads) {
    it(`assert false === isIPv6(${jss(ipv6Bad)})`, () => {
      Assert.eq(false, Network.isIPv6(ipv6Bad))
    })
  }
})
network.suite('isIP', (it) => {
  for (const ipv4Good of ipv4Goods) {
    it(`assert 4 === isIP(${jss(ipv4Good)})`, () => {
      Assert.eq(4, Network.isIP(ipv4Good))
    })
  }
  for (const ipv6Good of ipv6Goods) {
    it(`assert 6 === isIP(${jss(ipv6Good)})`, () => {
      Assert.eq(6, Network.isIP(ipv6Good))
    })
  }
  for (const ipv4Bad of ipv4Bads) {
    it(`assert 0 === isIP(${jss(ipv4Bad)})`, () => {
      Assert.eq(0, Network.isIP(ipv4Bad))
    })
  }
  for (const ipv6Bad of ipv6Bads) {
    it(`assert 0 === isIP(${jss(ipv6Bad)})`, () => {
      Assert.eq(0, Network.isIP(ipv6Bad))
    })
  }
})
network.suite('isPackedIPv4', (it) => {
  for (const packedIPv4Good of packedIPv4Goods) {
    it(`assert  true === isPackedIPv4(${jss(packedIPv4Good)})`, () => {
      Assert.eq(true, Network.isPackedIPv4(packedIPv4Good))
    })
  }
  for (const packedIPv4Bad of packedIPv4Bads) {
    it(`assert false === isPackedIPv4(${jss(packedIPv4Bad)})`, () => {
      Assert.eq(false, Network.isPackedIPv4(packedIPv4Bad))
    })
  }
})
network.suite('isPackedIPv6', (it) => {
  for (const packedIPv6Good of packedIPv6Goods) {
    it(`assert  true === isPackedIPv6(${jss(packedIPv6Good)})`, () => {
      Assert.eq(true, Network.isPackedIPv6(packedIPv6Good))
    })
  }
  for (const packedIPv6Bad of packedIPv6Bads) {
    it(`assert false === isPackedIPv6(${jss(packedIPv6Bad)})`, () => {
      Assert.eq(false, Network.isPackedIPv6(packedIPv6Bad))
    })
  }
})
network.suite('numberToString/stringToNumber', (it) => {
  let i = 0
  for (const packedIPv4Good of packedIPv4Goods) {
    const string = stringIPv4Goods[i]
    it(`assert expected numberToString(${jss(packedIPv4Good)})`, () => {
      Assert.eq(string, Network.numberToString(packedIPv4Good))
    })
    it(`assert expected stringToNumber(${jss(string)})`, () => {
      Assert.eqDeep(packedIPv4Good, Network.stringToNumber(string))
    })
    i++
  }
  i = 0
  for (const packedIPv6Good of packedIPv6Goods) {
    const string = stringIPv6Goods[i]
    it(`assert expected numberToString(${jss(packedIPv6Good)})`, () => {
      Assert.eq(string, Network.numberToString(packedIPv6Good))
    })
    it(`assert expected stringToNumber(${jss(string)})`, () => {
      Assert.eqDeep(packedIPv6Good, Network.stringToNumber(string))
    })
    i++
  }
})
network.suite('inetPtoN/inetNtoP', (it) => {
  let i = 0
  for (const ipv4Good of ipv4Goods) {
    const string = stringIPv4Goods[i]
    it(`assert expected inetPtoN(${jss(ipv4Good)})`, () => {
      Assert.eq(string, Network.inetPtoN(ipv4Good))
    })
    it(`assert expected inetNtoP(${jss(string)})`, () => {
      Assert.eqDeep(ipv4Good, Network.inetNtoP(string))
    })
    i++
  }
  i = 0
  for (const ipv6Good of ipv6Goods) {
    const string = stringIPv6Goods[i]
    it(`assert expected inetPtoN(${jss(ipv6Good)})`, () => {
      Assert.eq(string, Network.inetPtoN(ipv6Good))
    })
    it(`assert expected inetNtoP(${jss(string)})`, () => {
      Assert.eqDeep(ipv6Good, Network.inetNtoP(string))
    })
    i++
  }
})
network.suite('ip', (it) => {
  it('assert expected ip()', () => {
    Assert.eq('000.000.000.000', Network.ip())
  })
  let i = 0
  for (const ipv4Good of ipv4Goods) {
    const padded = paddedIPv4Goods[i]
    const spcweb = spcwebIPv4Goods[i]
    it(`assert expected ip(${jss(ipv4Good)})`, () => {
      Assert.eq(padded, Network.ip(ipv4Good))
    })
    it(`assert expected ip(${jss(ipv4Good)}, '')`, () => {
      Assert.eq(ipv4Good, Network.ip(ipv4Good, ''))
    })
    it(`assert expected ip(${jss(ipv4Good)}, ' ', true)`, () => {
      Assert.eq(spcweb, Network.ip(ipv4Good, ' ', true))
    })
    i++
  }
  i = 0
  for (const ipv6Good of ipv6Goods) {
    const padded = paddedIPv6Goods[i]
    const spcweb = spcwebIPv6Goods[i]
    it(`assert expected ip(${jss(ipv6Good)})`, () => {
      Assert.eq(padded, Network.ip(ipv6Good))
    })
    it(`assert expected ip(${jss(ipv6Good)}, '')`, () => {
      Assert.eq(ipv6Good, Network.ip(ipv6Good, ''))
    })
    it(`assert expected ip(${jss(ipv6Good)}, ' ', true)`, () => {
      Assert.eq(spcweb, Network.ip(ipv6Good, ' ', true))
    })
    i++
  }
  for (const ipv4Bad of ipv4Bads) {
    it(`assert '' === ip(${jss(ipv4Bad)})`, () => {
      Assert.eq('', Network.ip(ipv4Bad))
    })
  }
  for (const ipv6Bad of ipv6Bads) {
    it(`assert '' === ip(${jss(ipv6Bad)})`, () => {
      Assert.eq('', Network.ip(ipv6Bad))
    })
  }
})
network.suite('inetAtoN/inetNtoA', (it) => {
  let i = 0
  for (const ipv4Good of ipv4Goods) {
    const packed = packedIPv4Goods[i]
    it(`assert expected inetAtoN(${jss(ipv4Good)})`, () => {
      Assert.eq(packed, Network.inetAtoN(ipv4Good))
    })
    it(`assert expected inetNtoA(${jss(packed)})`, () => {
      Assert.eqDeep(ipv4Good, Network.inetNtoA(packed))
    })
    i++
  }
  i = 0
  for (const ipv6Good of ipv6Goods) {
    const packed = packedIPv6Goods[i]
    it(`assert expected inetAtoN(${jss(ipv6Good)})`, () => {
      Assert.eqDeep(packed, Network.inetAtoN(ipv6Good))
    })
    it(`assert expected inetNtoA(${jss(packed)})`, () => {
      Assert.eq(['[', ']'].join(ipv6Good), Network.inetNtoA(packed))
    })
    i++
  }
})
network.suite('compare', (it) => {
  for (const packedIPv4Good of packedIPv4Goods) {
    it(`assert  0 === compare(${jss(packedIPv4Good)}, ${jss(packedIPv4Good)})`, () => {
      Assert.eq(0, Network.compare(packedIPv4Good, packedIPv4Good))
    })
  }
  const packedIPv4A = 0x00000000
  const packedIPv4B = 0x7f000001
  it(`assert -1 === compare(${jss(packedIPv4A)}, ${jss(packedIPv4B)})`, () => {
    Assert.eq(-1, Network.compare(packedIPv4A, packedIPv4B))
  })
  it(`assert  1 === compare(${jss(packedIPv4B)}, ${jss(packedIPv4A)})`, () => {
    Assert.eq(1, Network.compare(packedIPv4B, packedIPv4A))
  })
  for (const packedIPv6Good of packedIPv6Goods) {
    it(`assert  0 === compare(${jss(packedIPv6Good)}, ${jss(packedIPv6Good)})`, () => {
      Assert.eq(0, Network.compare(packedIPv6Good, packedIPv6Good))
    })
  }
  const packedIPv6A = [0, 0, 0, 0]
  const packedIPv6B = [0, 0, 0, 1]
  it(`assert -1 === compare(${jss(packedIPv6A)}, ${jss(packedIPv6B)})`, () => {
    Assert.eq(-1, Network.compare(packedIPv6A, packedIPv6B))
  })
  it(`assert  1 === compare(${jss(packedIPv6B)}, ${jss(packedIPv6A)})`, () => {
    Assert.eq(1, Network.compare(packedIPv6B, packedIPv6A))
  })
})
network.suite('isPrivateIP', (it) => {
  for (const ipv4Priv of ipv4Privs) {
    it(`assert  true === isPrivateIP(${jss(ipv4Priv)})`, () => {
      Assert.eq(true, Network.isPrivateIP(ipv4Priv))
    })
  }
  for (const ipv6Priv of ipv6Privs) {
    it(`assert  true === isPrivateIP(${jss(ipv6Priv)})`, () => {
      Assert.eq(true, Network.isPrivateIP(ipv6Priv))
    })
  }
})
if (require.main === module) runner.execute().then((code) => process.exit(+code))
