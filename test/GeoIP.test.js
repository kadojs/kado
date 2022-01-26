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
const GeoIP = require('../lib/GeoIP').getInstance()
const freeVersion = {
  country: '480b2d18f8423ae1f9370722fb6d12d8',
  city: '738794f02b34c28847582790e570b533'
}
const expectMap = {
  'Data-IP4;72.229.28.185': {
    country: 'US',
    region: 'NY',
    eu: '0',
    timezone: 'America/New_York',
    city: {
      default: 'New York',
      ea48f58ba950f740db7432325f96a3ca: 'Queens',
      '0ed46f1890c591dec7ed16ea9ee49820': 'Queens'
    },
    metro: 501,
    area: {
      free: 1,
      default: 5
    }
  },
  'Data-IP6;2001:1c04:400::1': {
    country: 'NL',
    region: 'NH',
    eu: '1',
    timezone: 'Europe/Amsterdam',
    city: 'Amsterdam',
    metro: 0,
    area: 5
  },
  'UTF8;2.139.175.1': {
    city: {
      bc89d8fe9d357cb37fe63596d5558351: 'Zaragoza',
      free: 'Pamplona',
      default: 'Girona'
    }
  },
  'Metro;23.240.63.68': {
    city: {
      '0ed46f1890c591dec7ed16ea9ee49820': 'Perris',
      ea48f58ba950f740db7432325f96a3ca: 'Perris',
      default: 'Riverside'
    },
    metro: 803
  },
  'IPv4-Mapped-IPv6;195.16.170.74': {
    city: {
      '0ed46f1890c591dec7ed16ea9ee49820': 'Drogheda',
      ea48f58ba950f740db7432325f96a3ca: 'Drogheda',
      default: ''
    },
    metro: 0
  }
}
const getExpected = (suiteName, version) => {
  const expect = expectMap[suiteName]
  const expected = {}
  Object.keys(expect).forEach((element) => {
    let ee = expect[element]
    if (typeof expect[element] === 'object') {
      if (version === freeVersion.city) version = 'free'
      ee = expect[element][version] || expect[element].default
    }
    expected[element] = ee
  })
  return expected
}

const ver = {
  country: (GeoIP.dataVersions.country === freeVersion.country)
    ? 'free'
    : GeoIP.dataVersions.country,
  city: (GeoIP.dataVersions.city === freeVersion.city)
    ? 'free'
    : GeoIP.dataVersions.city
}
runner.suite('GeoIP', (it, suite) => {
  suite.suite('Dataset', (it) => {
    it(`version [${ver.country}] country data`, () => {})
    it(`version [${ver.city}] city data`, () => {})
  })
  suite.suite('Lookup', (it) => {
    const ip = '8.8.4.4'
    const ipv6 = '2001:4860:b002::68'
    it(`IPv4 [${ip}] should return data`, () => {
      const actual = GeoIP.lookup(ip)
      Assert.isType('Object', actual)
    })
    it(`IPv6 [${ipv6}] should return data`, () => {
      const actual = GeoIP.lookup(ipv6)
      Assert.isType('Object', actual)
    })
  })
  suite.suite('Data-IP4', (it, suite) => {
    const ip = '72.229.28.185'
    const expect = getExpected([suite.name, ip].join(';'), GeoIP.dataVersions.city)
    const actual = GeoIP.lookup(ip)
    it(`IPv4 [${ip}] should contain IPv4 range`, () => {
      Assert.neq(undefined, actual.range)
    })
    it(`IPv4 [${ip}] should contain coordinates`, () => {
      Assert.isType('Array', actual.ll)
    })
    Object.keys(expect).sort().forEach((item) => {
      it(`IPv4 [${ip}] should match ${item} [${expect[item]}]`, () => {
        Assert.eq(expect[item], actual[item])
      })
    })
  })
  suite.suite('Data-IP6', (it, suite) => {
    const ipv6 = '2001:1c04:400::1'
    const expect = getExpected([suite.name, ipv6].join(';'), GeoIP.dataVersions.city)
    const actual = GeoIP.lookup(ipv6)
    it(`IPv6 [${ipv6}] should contain IPv6 range`, () => {
      Assert.neq(undefined, actual.range)
    })
    it(`IPv6 [${ipv6}] should contain coordinates`, () => {
      Assert.isType('Array', actual.ll)
    })
    Object.keys(expect).sort().forEach((item) => {
      it(`IPv6 [${ipv6}] should match ${item} [${expect[item]}]`, () => {
        Assert.eq(expect[item], actual[item])
      })
    })
  })
  suite.suite('UTF8', (it, suite) => {
    const ip = '2.139.175.1'
    const expect = getExpected([suite.name, ip].join(';'), GeoIP.dataVersions.city)
    const actual = GeoIP.lookup(ip)
    it(`IPv4 [${ip}] should return a non-null value`, () => {
      Assert.isOk(actual)
    })
    Object.keys(expect).sort().forEach((item) => {
      it(`IPv4 [${ip}] should match ${item} [${expect[item]}]`, () => {
        Assert.eq(expect[item], actual[item])
      })
    })
  })
  suite.suite('Metro', (it, suite) => {
    const ip = '23.240.63.68'
    const expect = getExpected([suite.name, ip].join(';'), GeoIP.dataVersions.city)
    const actual = GeoIP.lookup(ip)
    Object.keys(expect).sort().forEach((item) => {
      it(`IPv4 [${ip}] should have matching ${item} [${expect[item]}]`, () => {
        Assert.eq(expect[item], actual[item])
      })
    })
  })
  suite.suite('IPv4-Mapped-IPv6', (it, suite) => {
    const ip = '195.16.170.74'
    const expect = getExpected([suite.name, ip].join(';'), GeoIP.dataVersions.city)
    const actual = GeoIP.lookup(ip)
    Object.keys(expect).sort().forEach((item) => {
      it(expect[item]
        ? `IPv4 [${ip}] should have matching ${item} [${expect[item]}]`
        : `IPv4 [${ip}] should have no ${item}`, () => {
        Assert.eq(expect[item], actual[item])
      })
    })
  })
  suite.suite('Reload', (it) => {
    const ip4 = '75.82.117.180'
    const ip6 = '::ffff:173.185.182.82'
    it('should reload sync', () => {
      // get original data
      const before4 = GeoIP.lookup(ip4)
      Assert.neq(null, before4)
      const before6 = GeoIP.lookup(ip6)
      Assert.neq(null, before6)
      // clear data
      GeoIP.clear()
      // make sure data is cleared
      const none4 = GeoIP.lookup(ip4)
      Assert.eq(null, none4)
      const none6 = GeoIP.lookup(ip6)
      Assert.eq(null, none6)
      // reload data synchronized
      GeoIP.reloadDataSync()
      // make sure we have value from before
      const after4 = GeoIP.lookup(ip4)
      Assert.eqDeep(before4, after4)
      const after6 = GeoIP.lookup(ip6)
      Assert.eqDeep(before6, after6)
    })
    it('should reload async', () => {
      // get original data
      const before4 = GeoIP.lookup(ip4)
      Assert.neq(null, before4)
      const before6 = GeoIP.lookup(ip6)
      Assert.neq(null, before6)
      // clear data;
      GeoIP.clear()
      // make sure data is cleared
      const none4 = GeoIP.lookup(ip4)
      Assert.eq(null, none4)
      const none6 = GeoIP.lookup(ip6)
      Assert.eq(null, none6)
      // reload data asynchronously
      GeoIP.reloadData(() => {
        // make sure we have value from before
        const after4 = GeoIP.lookup(ip4)
        Assert.eqDeep(before4, after4)
        const after6 = GeoIP.lookup(ip6)
        Assert.eqDeep(before6, after6)
      })
    })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
