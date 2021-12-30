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
const {
  ipv4Goods, packedIPv4Goods, stringIPv4Goods, paddedIPv4Goods,
  spcwebIPv4Goods, ipv4Bads, packedIPv4Bads, ipv4Privs, ipv6Goods,
  packedIPv6Goods, stringIPv6Goods, paddedIPv6Goods, spcwebIPv6Goods, ipv6Bads,
  packedIPv6Bads, ipv6Privs, resultIPv4Goods, hexstrIPv4Goods, arrayIPv4Goods,
  group6IPv4Goods, startIPv4Goods, stexclIPv4Goods, endIPv4Goods,
  endexclIPv4Goods, maskIPv4Goods, resultIPv6Goods, hexstrIPv6Goods,
  decimalIPv6Goods, sbyteIPv6Goods, ubyteIPv6Goods, startIPv6Goods,
  stexcIPv6Goods, endIPv6Goods, endexcIPv6Goods, maskIPv6Goods
} = require('./fixture/Network/network.data')

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
const bl = (bool) => bool ? ' true' : 'false'

network.suite('class:IPAddr4', (it) => {
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
if (require.main === module) {
  runner.execute().then(code => { process.exitCode = +code })
}
