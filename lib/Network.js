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
const BigInteger = require('./BigInteger')
const net = require('net')

const padHex = (base10, bits = 8) => {
  let number
  switch (typeof base10) {
    case 'number':
      number = base10
      break
    case 'boolean':
      number = base10 ? 1 : 0
      break
    case 'string':
      number = parseInt(base10, 10)
      break
    default:
      number = Number(base10)
      break
  }
  return number.toString(16).padStart(bits / 4, '0')
}

const ipv6Normalizev4Mapped = (str) => {
  let rv = str
  if (rv.slice(0, 7) === '::ffff:') {
    const m = rv.match(/^(::ffff:)([\da-f]{1,4}):([\da-f]{1,4})$/)
    if (m && m[2] && m[3]) {
      const ab = parseInt(m[2], 16)
      const cd = parseInt(m[3], 16)
      rv = m[1] +
        [(ab >>> 8) & 0xff, ab & 0xff,
          (cd >>> 8) & 0xff, cd & 0xff].join('.')
    }
  }
  return rv
}

/**
 * @returns {String} the string with all zeroes contained in a <span>
 */
const spanAllZeroes =
  (s) => s.replace(/(0+)/g, '<span class="zero">$1</span>')
const spanLeadingZeroesSimple =
  (group) => group.replace(/^(0+)/, '<span class="zero">$1</span>')
const helpers = {
  spanAllZeroes: spanAllZeroes,

  /**
   * @returns {String} the string with each character contained in a <span>
   */
  spanAll: (s, optionalOffset) => {
    if (optionalOffset === undefined) {
      optionalOffset = 0
    }
    const letters = s.split('')
    return letters.map(function (n, i) {
      return `<span class="digit value-${n} position-${i + optionalOffset}">` +
        `${spanAllZeroes(n)}</span>` // XXX Use #base-2 .value-0 instead?
    }).join('')
  },

  /**
   * @returns {String} the string with leading zeroes contained in a <span>
   */
  spanLeadingZeroes: (address) => {
    const groups = address.split(':')
    return groups.map(function (g) {
      return spanLeadingZeroesSimple(g)
    }).join(':')
  },

  /**
   * Groups an address
   * @returns {String} a grouped address
   */
  simpleGroup: (addressString, offset) => {
    const groups = addressString.split(':')
    if (!offset) {
      offset = 0
    }
    return groups.map(function (g, i) {
      if (/group-v4/.test(g)) {
        return g
      }
      return `<span class="hover-group group-${i + offset}">${spanLeadingZeroesSimple(g)}</span>`
    }).join(':')
  }
}
const addCommas = (number) => {
  const r = /(\d+)(\d{3})/
  while (r.test(number)) {
    number = number.replace(r, '$1,$2')
  }
  return number
}
const spanLeadingZeroes4 = (n) => {
  n = n.replace(/^(0+)([1-9]+)$/, '<span class="parse-error">$1</span>$2')
  n = n.replace(/^(0+)(0)$/, '<span class="parse-error">$1</span>$2')
  return n
}

const maxUInt32 = 0xffffffff
const ADDRESS_BOUNDARY = '[^A-Fa-f0-9:]'
const constants4 = {
  BITS: 32,
  GROUPS: 4,
  TYPES: {
    '127.0.0.0/8': 'Loopback',
    '10.0.0.0/8': 'Private',
    '192.168.0.0/16': 'Private',
    '172.16.0.0/12': 'Private',
    '224.0.0.0/4': 'Multicast',
    '169.254.0.0/16': 'Link-local unicast'
  },
  RE_ADDRESS: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g,
  RE_SUBNET_STRING: /\/\d{1,2}$/
}
const constants6 = {
  BITS: 128,
  GROUPS: 8,
  SCOPES: {
    0: 'Reserved',
    1: 'Interface local',
    2: 'Link local',
    4: 'Admin local',
    5: 'Site local',
    8: 'Organization local',
    14: 'Global',
    15: 'Reserved'
  },
  TYPES: {
    'ff01::1/128': 'Multicast (All nodes on this interface)',
    'ff01::2/128': 'Multicast (All routers on this interface)',
    'ff02::1/128': 'Multicast (All nodes on this link)',
    'ff02::2/128': 'Multicast (All routers on this link)',
    'ff05::2/128': 'Multicast (All routers in this site)',
    'ff02::5/128': 'Multicast (OSPFv3 AllSPF routers)',
    'ff02::6/128': 'Multicast (OSPFv3 AllDR routers)',
    'ff02::9/128': 'Multicast (RIP routers)',
    'ff02::a/128': 'Multicast (EIGRP routers)',
    'ff02::d/128': 'Multicast (PIM routers)',
    'ff02::16/128': 'Multicast (MLDv2 reports)',
    'ff01::fb/128': 'Multicast (mDNSv6)',
    'ff02::fb/128': 'Multicast (mDNSv6)',
    'ff05::fb/128': 'Multicast (mDNSv6)',
    'ff02::1:2/128': 'Multicast (All DHCP servers and relay agents on this link)',
    'ff05::1:2/128': 'Multicast (All DHCP servers and relay agents in this site)',
    'ff02::1:3/128': 'Multicast (All DHCP servers on this link)',
    'ff05::1:3/128': 'Multicast (All DHCP servers in this site)',
    '::/128': 'Unspecified',
    '::1/128': 'Loopback',
    '2001::/32': 'Teredo',
    '2002::/16': '6to4',
    'fc00::/8': 'Reserved (ULA)',
    'fd00::/8': 'Private (ULA)',
    'ff00::/8': 'Multicast',
    'fe80::/10': 'Link-local unicast'
  },
  RE_BAD_CHARACTERS: /([^0-9a-f:/%])/ig,
  RE_BAD_ADDRESS: /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/ig,
  RE_SUBNET_STRING: /\/\d{1,3}(?=%|$)/,
  RE_ZONE_STRING: /%.*$/,
  RE_URL: /^\[?([0-9a-f:]+)]?/,
  RE_URL_WITH_PORT: /\[([0-9a-f:]+)]:([0-9]{1,5})/
}

const compact = (address, slice) => {
  const s1 = []
  const s2 = []
  for (let i = 0; i < address.length; i++) {
    if (i < slice[0]) {
      s1.push(address[i])
    } else if (i > slice[1]) {
      s2.push(address[i])
    }
  }
  return s1.concat(['compact']).concat(s2)
}
const ord = c => c.charCodeAt(0)
const chr = String.fromCharCode
const unsignByte = b => b & 0xFF
const paddedHex = (octet) => padHex(parseInt(octet, 16), 16)
const groupPossibilities = (possibilities) => `(${possibilities.join('|')})`
const padGroup = (group) => (group.length < 4)
  ? `0{0,${4 - group.length}}${group}`
  : group
const simpleRegularExpression = (groups) => {
  const zeroIndexes = []
  groups.forEach(function (group, i) {
    const groupInteger = parseInt(group, 16)
    if (groupInteger === 0) {
      zeroIndexes.push(i)
    }
  })
  const possibilities = zeroIndexes.map(function (zeroIndex) {
    return groups.map(function (group, i) {
      if (i === zeroIndex) {
        const elision = (i === 0 || i === constants6.GROUPS - 1) ? ':' : ''
        return groupPossibilities([padGroup(group), elision])
      }
      return padGroup(group)
    }).join(':')
  })
  possibilities.push(groups.map(padGroup).join(':'))
  return groupPossibilities(possibilities)
}
const possibleElisions = (elidedGroups, moreLeft, moreRight) => {
  const left = moreLeft ? '' : ':'
  const right = moreRight ? '' : ':'
  const possibilities = []
  if (!moreLeft && !moreRight) {
    possibilities.push('::')
  }
  if (moreLeft && moreRight) {
    possibilities.push('')
  }
  if ((moreRight && !moreLeft) || (!moreRight && moreLeft)) {
    possibilities.push(':')
  }
  possibilities.push(`${left}(:0{1,4}){1,${elidedGroups - 1}}`)
  possibilities.push(`(0{1,4}:){1,${elidedGroups - 1}}${right}`)
  possibilities.push(`(0{1,4}:){${elidedGroups - 1}}0{1,4}`)
  for (let groups = 1; groups < elidedGroups - 1; groups++) {
    for (let position = 1; position < elidedGroups - groups; position++) {
      possibilities.push(`(0{1,4}:){${position}}:(0{1,4}:){${elidedGroups - position - groups - 1}}0{1,4}`)
    }
  }
  return groupPossibilities(possibilities)
}

const IPAddr = class IPAddr {
  constructor (address, optionalGroups) {
    this.address = address
    let subnet = constants6.RE_SUBNET_STRING.exec(this.address)
    if (subnet) {
      address = this.address.replace(constants6.RE_SUBNET_STRING, '')
    } else {
      subnet = constants4.RE_SUBNET_STRING.exec(this.address)
      if (subnet) {
        address = this.address.replace(constants4.RE_SUBNET_STRING, '')
      }
    }
    const isV4 = net.isIPv4(address)
    const isV6 = net.isIPv6(address)
    this.valid = true
    if (isV4) {
      this.v4 = true
    } else if (isV6) {
      this.v4 = false
    }
  }

  isValid () {
    return this.valid
  }

  isIPAddr4 () {
    return (this instanceof IPAddr4)
  }

  isIPAddr6 () {
    return (this instanceof IPAddr6)
  }

  falseIfInvalid (fn) {
    return (() => (!this.valid) ? false : fn.apply(this, arguments))()
  }

  /**
   * Returns true if the given address is in the subnet of the current address
   * @memberof IPAddr
   * @instance
   * @returns {boolean}
   */
  isInSubnet (address) {
    return (this.subnetMask < address.subnetMask)
      ? false
      : this.mask(address.subnetMask) === address.mask()
  }

  /**
   * Returns true if the address is correct, false otherwise
   * @memberof IPAddr
   * @instance
   * @returns {boolean}
   */
  isCorrect (defaultBits) {
    return this.falseIfInvalid(
      () => (this.addressMinusSuffix !== this.correctForm())
        ? false
        : (this.subnetMask === defaultBits && !this.parsedSubnet)
            ? true
            : this.parsedSubnet === String(this.subnetMask)
    )
  }

  /**
   * Return the type of the address
   * @memberof IPAddr
   * @instance
   * @param {object} IPADDR - Either IPAddr4 or IPAddr6 class
   * @param {object} types - Either constants4 or constants6 object
   * @returns {String}
   */
  getType (IPADDR, types) {
    for (const k in types) {
      if (this.isInSubnet(new IPADDR(k))) {
        return types[k]
      }
    }
    return 'Global unicast'
  }

  /**
   * Returns true if the address is a loopback address, false otherwise
   * @memberof IPAddr
   * @instance
   * @returns {boolean}
   */
  isLoopback () {
    return this.getType() === 'Loopback'
  }

  /**
   * Returns true if the address is a link local address, false otherwise
   * @memberof IPAddr
   * @instance
   * @returns {boolean}
   */
  isLinkLocal () {
    return this.getType().indexOf('Link-local') === 0
  }

  /**
   * Returns true if the given address is a multicast address
   * @memberof IPAddr
   * @instance
   * @returns {boolean}
   */
  isMulticast () {
    return this.getType().indexOf('Multicast') === 0
  }
}

const IPAddr4 = class IPAddr4 extends IPAddr {
  constructor (address, optionalGroups) {
    super(address)
    this.subnet = '/32'
    this.subnetMask = 32
    this.groups =
      (optionalGroups === undefined) ? constants4.GROUPS : optionalGroups
    const subnet = constants4.RE_SUBNET_STRING.exec(this.address)
    if (subnet) {
      this.parsedSubnet = subnet[0].replace('/', '')
      this.subnetMask = parseInt(this.parsedSubnet, 10)
      this.subnet = '/' + this.subnetMask
      if (this.subnetMask < 0 || this.subnetMask > constants4.BITS) {
        this.valid = false
        this.error = 'Invalid subnet mask.'
        return
      }
      address = this.address.replace(constants4.RE_SUBNET_STRING, '')
    }
    this.addressMinusSuffix = address
    this.parsedAddress = this.parse(address)
  }

  /*
 * Parses a v4 address
 */
  parse (address) {
    const groups = address.split('.')
    if (address.match(constants4.RE_ADDRESS)) {
      this.valid = true
    } else {
      this.error = 'Invalid IPv4 address.'
    }
    return groups
  }

  /**
   * Returns the correct form of an address
   * @memberof IPAddr4
   * @instance
   * @returns {String}
   */
  correctForm () {
    return this.parsedAddress.map(function (part) {
      return parseInt(part, 10)
    }).join('.')
  }

  /**
   * Returns true if the address is correct, false otherwise
   * @memberof IPAddr4
   * @instance
   * @returns {boolean}
   */
  isCorrect (defaultBits = constants4.BITS) {
    return super.isCorrect(defaultBits)
  }

  /**
   * Converts a hex string to an IPv4 address object
   * @memberof IPAddr4
   * @static
   * @param {string} hex - a hex string to convert
   * @returns {IPAddr4}
   */
  static fromHex (hex) {
    const padded = (hex.replace(/:/g, '')).padStart(8, '0')
    const groups = []
    for (let i = 0; i < 8; i += 2) {
      const h = padded.slice(i, i + 2)
      groups.push(parseInt(h, 16))
    }
    return new IPAddr4(groups.join('.'))
  }

  /**
   * Converts an integer into a IPv4 address object
   * @memberof IPAddr4
   * @static
   * @param {Number} integer - a number to convert
   * @returns {IPAddr4}
   */
  static fromInteger (integer) {
    return IPAddr4.fromHex(integer.toString(16))
  }

  /**
   * Converts an IPv4 address object to a hex string
   * @memberof IPAddr4
   * @instance
   * @returns {String}
   */
  toHex () {
    return this.parsedAddress.map(
      (part) => padHex(part)
    ).join(':')
  }

  toPadded (padding = '0') {
    return this.parsedAddress.map(
      (part) => parseInt(part, 10).toString().padStart(3, padding)
    ).join('.')
  }

  /**
   * Converts an IPv4 address object to an array of bytes
   * @memberof IPAddr4
   * @instance
   * @returns {Array}
   */
  toArray () {
    return this.parsedAddress.map(
      (part) => parseInt(part, 10)
    )
  }

  /**
   * Converts an IPv4 address object to an IPv6 address group
   * @memberof IPAddr4
   * @instance
   * @returns {String}
   */
  toGroup6 () {
    const output = []
    let i
    for (i = 0; i < constants4.GROUPS; i += 2) {
      const yy = parseInt(this.parsedAddress[i], 10) << 8
      const zz = parseInt(this.parsedAddress[i + 1], 10)
      output.push(padHex(yy + zz, 0))
    }
    return output.join(':')
  }

  /**
   * Returns the address as a BigInteger
   * @memberof IPAddr4
   * @instance
   * @returns {BigInteger}
   */
  bigInteger () {
    return (!this.valid)
      ? null
      : new BigInteger(this.parsedAddress.map(
        (n) => padHex(n)
      ).join(''), 16)
  }

  /**
   * Helper function getting start address.
   * @memberof IPAddr4
   * @instance
   * @returns {BigInteger}
   */
  _startAddress () {
    return new BigInteger(
      this.mask() + ('0').repeat(constants4.BITS - this.subnetMask), 2
    )
  }

  /**
   * The first address in the range given by this address' subnet.
   * Often referred to as the Network Address.
   * @memberof IPAddr4
   * @instance
   * @returns {IPAddr4}
   */
  startAddress () {
    return IPAddr4.fromBigInteger(this._startAddress())
  }

  /**
   * The first host address in the range given by this address's subnet ie
   * the first address after the Network Address
   * @memberof IPAddr4
   * @instance
   * @returns {IPAddr4}
   */
  startAddressExclusive () {
    const adjust = new BigInteger('1')
    return IPAddr4.fromBigInteger(this._startAddress().add(adjust))
  }

  /**
   * Helper function getting end address.
   * @memberof IPAddr4
   * @instance
   * @returns {BigInteger}
   */
  _endAddress () {
    return new BigInteger(
      this.mask() + ('1').repeat(constants4.BITS - this.subnetMask), 2
    )
  }

  /**
   * The last address in the range given by this address' subnet
   * Often referred to as the Broadcast
   * @memberof IPAddr4
   * @instance
   * @returns {IPAddr4}
   */
  endAddress () {
    return IPAddr4.fromBigInteger(this._endAddress())
  }

  /**
   * The last host address in the range given by this address's subnet ie
   * the last address prior to the Broadcast Address
   * @memberof IPAddr4
   * @instance
   * @returns {IPAddr4}
   */
  endAddressExclusive () {
    const adjust = new BigInteger('1')
    return IPAddr4.fromBigInteger(this._endAddress().subtract(adjust))
  }

  /**
   * Return the type of the address
   * @memberof IPAddr4
   * @instance
   * @returns {String}
   */
  getType () {
    return super.getType(IPAddr4, constants4.TYPES)
  }

  /**
   * Converts a BigInteger to a v4 address object
   * @memberof IPAddr4
   * @static
   * @param {BigInteger} bigInteger - a BigInteger to convert
   * @returns {IPAddr4}
   */
  static fromBigInteger (bigInteger) {
    return IPAddr4.fromInteger(parseInt(bigInteger.toString(), 10))
  }

  /**
   * Returns the first n bits of the address, defaulting to the
   * subnet mask
   * @memberof IPAddr4
   * @instance
   * @returns {String}
   */
  mask (optionalMask) {
    if (optionalMask === undefined) {
      optionalMask = this.subnetMask
    }
    return this.getBitsBase2(0, optionalMask)
  }

  /**
   * Returns the bits in the given range as a base-2 string
   * @memberof IPAddr4
   * @instance
   * @returns {string}
   */
  getBitsBase2 (start, end) {
    return this.binaryZeroPad().slice(start, end)
  }

  /**
   * Returns true if the given address is in the subnet of the current address
   * @memberof IPAddr4
   * @instance
   * @returns {boolean}
   */
  isInSubnet (ipaddr) {
    return super.isInSubnet(ipaddr)
  }

  /**
   * Returns true if the address is a private address, false otherwise
   * @memberof IPAddr4
   * @instance
   * @returns {boolean}
   */
  isPrivate () {
    return (this.getType().indexOf('Private') > -1) ||
      this.isLoopback() ||
      this.isLinkLocal()
  }

  /**
   * Returns a zero-padded base-2 string representation of the address
   * @memberof IPAddr4
   * @instance
   * @returns {string}
   */
  binaryZeroPad () {
    return (this.bigInteger().toString(2)).padStart(constants4.BITS, '0')
  }
}

const IPAddr6 = class IPAddr6 extends IPAddr {
  /**
   * Represents an IPv6 address
   * @class IPAddr6
   * @param {string} address - An IPv6 address string
   * @param {number} optionalGroups [groups=8] How many octets to parse
   * @example
   * let address = new IPAddr6('2001::/32')
   */
  constructor (address, optionalGroups) {
    super(address)
    if (optionalGroups === undefined) {
      this.groups = constants6.GROUPS
    } else {
      this.groups = optionalGroups
    }
    this.v4 = false
    this.subnet = '/128'
    this.subnetMask = 128
    this.zone = ''
    this.address = address
    const subnet = constants6.RE_SUBNET_STRING.exec(address)
    if (subnet) {
      this.parsedSubnet = subnet[0].replace('/', '')
      this.subnetMask = parseInt(this.parsedSubnet, 10)
      this.subnet = `/${this.subnetMask}`
      if (isNaN(this.subnetMask) ||
        this.subnetMask < 0 ||
        this.subnetMask > constants6.BITS) {
        this.valid = false
        this.error = 'Invalid subnet mask.'
        return
      }
      address = address.replace(constants6.RE_SUBNET_STRING, '')
    } else if (/\//.test(address)) {
      this.valid = false
      this.error = 'Invalid subnet mask.'
      return
    }
    const zone = constants6.RE_ZONE_STRING.exec(address)
    if (zone) {
      this.zone = zone[0]
      address = address.replace(constants6.RE_ZONE_STRING, '')
    }
    this.addressMinusSuffix = address
    this.parsedAddress = this.parse(this.addressMinusSuffix)
  }

  /**
   * Returns true if the address is correct, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  isCorrect (defaultBits = constants6.BITS) {
    return super.isCorrect(defaultBits)
  }

  /**
   * Returns true if the address is in the canonical form, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  isCanonical () {
    return super.falseIfInvalid(
      () => this.addressMinusSuffix === this.canonicalForm()
    )
  }

  /**
   * Returns true if the address is a private address, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  isPrivate () {
    return (this.getType().indexOf('ULA') > -1) ||
      this.isLoopback() ||
      this.isLinkLocal() ||
      (this.is4() && (new IPAddr4(this.to4()).isPrivate()))
  }

  /**
   * Returns true if the address is a v4-in-v6 address, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  is4 () {
    return super.falseIfInvalid(
      () => { return this.v4 }
    )
  }

  /**
   * Returns true if the address is a Teredo address, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  isTeredo () {
    return super.falseIfInvalid(
      () => this.getType().indexOf('Teredo') === 0
    )
  }

  /**
   * Returns true if the address is a 6to4 address, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  is6to4 () {
    return super.falseIfInvalid(
      () => this.getType().indexOf('6to4') === 0
    )
  }

  /**
   * Returns true if the address is a loopback address, false otherwise
   * @memberof IPAddr6
   * @instance
   * @returns {boolean}
   */
  isLoopback () {
    return super.falseIfInvalid(
      () => ['Loopback', 'Unspecified'].indexOf(this.getType()) > -1
    )
  }

  /**
   * @returns {String} the address in link form with a default port of 80
   */
  href (optionalPort) {
    if (optionalPort === undefined) {
      optionalPort = ''
    } else {
      optionalPort = `:${optionalPort}`
    }
    return `http://[${this.correctForm()}]${optionalPort}/`
  }

  /**
   * @returns {String} a link suitable for conveying the address via a URL hash
   */
  link (options) {
    if (!options) {
      options = {}
    }
    if (options.className === undefined) {
      options.className = ''
    }
    if (options.prefix === undefined) {
      options.prefix = '/#address='
    }
    if (options.v4 === undefined) {
      options.v4 = false
    }
    let formFunction = this.correctForm
    if (options.v4) {
      formFunction = this.to4in6
    }
    const wrap = formFunction.call(this)
    if (options.className) {
      return `<a href="${options.prefix}${wrap}" ` +
        `class="${options.className}">${wrap}</a>`
    }
    return `<a href="${options.prefix}${wrap}">${wrap}</a>`
  }

  /**
   * Groups an address
   * @returns {String}
   */
  group () {
    const address4 = this.address.match(constants4.RE_ADDRESS)
    let i
    if (address4) {
      // The IPv4 case
      const segments = address4[0].split('.')
      const group6 = segments.slice(0, 2).join('.')
      const group7 = segments.slice(2, 4).join('.')
      this.address = this.address.replace(constants4.RE_ADDRESS,
        `<span class="hover-group group-v4 group-6">${group6}</span>.` +
        `<span class="hover-group group-v4 group-7">${group7}</span>`
      )
    }
    if (this.elidedGroups === 0) {
      // The simple case
      return helpers.simpleGroup(this.address)
    }
    // The elided case
    const output = []
    const halves = this.address.split('::')
    if (halves[0].length) {
      output.push(helpers.simpleGroup(halves[0]))
    } else {
      output.push('')
    }
    const classes = ['hover-group']
    i = this.elisionBegin
    for (; i < this.elisionBegin + this.elidedGroups; i++) {
      classes.push(`group-${i.toString().padStart(5, '0')}`)
    }
    const classElements = classes.join(' ')
    output.push(`<span class="${classElements}"></span>`)
    if (halves[1].length) {
      output.push(helpers.simpleGroup(halves[1], this.elisionEnd))
    } else {
      output.push('')
    }
    return output.join(':')
  }

  /**
   * Generate a regular expression string that can be used to find or validate
   * all variations of this address
   * @memberof IPAddr6
   * @instance
   * @param {string} optionalSubString
   * @returns {string}
   */
  regularExpressionString (optionalSubString) {
    if (optionalSubString === undefined) {
      optionalSubString = false
    }
    let output = []
    const address6 = new this.constructor(this.correctForm())
    if (address6.elidedGroups === 0) {
      output.push(simpleRegularExpression(address6.parsedAddress))
    } else if (address6.elidedGroups === constants6.GROUPS) {
      output.push(possibleElisions(constants6.GROUPS))
    } else {
      const halves = address6.address.split('::')
      if (halves[0].length) {
        output.push(simpleRegularExpression(halves[0].split(':')))
      }
      output.push(possibleElisions(address6.elidedGroups,
        halves[0].length !== 0,
        halves[1].length !== 0))
      if (halves[1].length) {
        output.push(simpleRegularExpression(halves[1].split(':')))
      }
      output = [output.join(':')]
    }
    if (!optionalSubString) {
      output = [].concat(
        '(?=^|',
        ADDRESS_BOUNDARY,
        '|[^\\w\\:])(', output, ')(?=[^\\w\\:]|',
        ADDRESS_BOUNDARY,
        '|$)')
    }
    return output.join('')
  }

  /**
   * Generate a regular expression that can be used to find or validate all
   * variations of this address.
   * @memberof IPAddr6
   * @instance
   * @param {string} optionalSubstring
   * @returns {RegExp}
   */
  regularExpression (optionalSubstring) {
    return new RegExp(this.regularExpressionString(optionalSubstring), 'i')
  }

  /**
   * Convert a BigInteger to a v6 address object
   * @memberof IPAddr6
   * @static
   * @param {BigInteger} bigInteger - a BigInteger to convert
   * @returns {IPAddr6}
   * @example
   * let bigInteger = new BigInteger('1000000000000')
   * let address = IPAddr6.fromBigInteger(bigInteger)
   * address.correctForm(); // '::e8:d4a5:1000'
   */
  static fromBigInteger (bigInteger) {
    const hex = (bigInteger.toString(16)).padStart(32, '0')
    const groups = []
    let i
    for (i = 0; i < constants6.GROUPS; i++) {
      groups.push(hex.slice(i * 4, (i + 1) * 4))
    }
    return new IPAddr6(groups.join(':'))
  }

  /**
   * Convert a URL (with optional port number) to an address object
   * @memberof IPAddr6
   * @static
   * @param {string} url - a URL with optional port number
   * @returns {IPAddr6}
   * @example
   * let addressAndPort = IPAddr6.fromURL('http://[ffff::]:8080/foo/')
   * addressAndPort.address.correctForm(); // 'ffff::'
   * addressAndPort.port; // 8080
   */
  static fromURL (url) {
    let host
    let port
    let result
    // If we have brackets parse them and find a port
    if (url.indexOf('[') !== -1 && url.indexOf(']:') !== -1) {
      result = constants6.RE_URL_WITH_PORT.exec(url)
      if (result === null) {
        return {
          error: 'failed to parse address with port',
          address: null,
          port: null
        }
      }
      host = result[1]
      port = result[2]
      // If there's a URL extract the address
    } else if (url.indexOf('/') !== -1) {
      // Remove the protocol prefix
      url = url.replace(/^[a-z0-9]+:\/\//, '')
      // Parse the address
      result = constants6.RE_URL.exec(url)
      if (result === null) {
        return {
          error: 'failed to parse address from URL',
          address: null,
          port: null
        }
      }
      host = result[1]
      // Otherwise just assign the URL to the host and let the library parse it
    } else {
      host = url
    }
    // If there's a port convert it to an integer
    if (port) {
      port = parseInt(port, 10)
      // squelch out of range ports
      if (port < 0 || port > 65536) {
        port = null
      }
    } else {
      // Standardize `undefined` to `null`
      port = null
    }
    return {
      address: new IPAddr6(host),
      port: port
    }
  }

  /**
   * Create an IPv6-mapped address given an IPv4 address
   * @memberof IPAddr6
   * @static
   * @param {string} address - An IPv4 address string
   * @returns {IPAddr6}
   * @example
   * let address = IPAddr6.fromAddress4('192.168.0.1')
   * address.correctForm(); // '::ffff:c0a8:1'
   * address.to4in6(); // '::ffff:192.168.0.1'
   */
  static fromAddress4 (address) {
    const address4 = new IPAddr4(address)
    const mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask)
    return new IPAddr6('::ffff:' + address4.correctForm() + '/' + mask6)
  }

  /**
   * Return an address from ip6.arpa form
   * @memberof IPAddr6
   * @static
   * @param {string} arpaFormAddress - an 'ip6.arpa' form address
   * @returns {IPAddr6}
   * @example
   * let address = IPAddr6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
   * address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
   */
  static fromArpa (arpaFormAddress) {
    // remove ending ".ip6.arpa." or just "."
    let address = arpaFormAddress.replace(/(\.ip6\.arpa)?\.$/, '')
    const semicolonAmount = 7
    // correct ip6.arpa form with ending removed will be 63 characters
    if (address.length !== 63) {
      address = {
        error: "Not Valid 'ip6.arpa' form",
        address: null
      }
      return address
    }
    address = address.split('.').reverse()
    for (let i = semicolonAmount; i > 0; i--) {
      const insertIndex = i * 4
      address.splice(insertIndex, 0, ':')
    }
    address = address.join('')
    return new IPAddr6(address)
  }

  toPadded (padding = '0') {
    return this.parsedAddress.map(
      (part) => parseInt(part, 16).toString(16).padStart(4, padding)
    ).join(':')
  }

  /**
   * Return the Microsoft UNC transcription of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String} the Microsoft UNC transcription of the address
   */
  microsoftTranscription () {
    return `${this.correctForm().replace(/:/g, '-')}.ipv6-literal.net`
  }

  /**
   * Return the first n bits of the address, defaulting to the subnet mask
   * @memberof IPAddr6
   * @instance
   * @param {number=} optionalMask [mask=subnet] the number of bits to mask
   * @returns {String} the first n bits of the address as a string
   */
  mask (optionalMask) {
    if (optionalMask === undefined) {
      optionalMask = this.subnetMask
    }
    return this.getBitsBase2(0, optionalMask)
  }

  /**
   * Return the number of possible subnets of a given size in the address
   * @memberof IPAddr6
   * @instance
   * @param {number} optionalSubnetSize [size=128] the subnet size
   * @returns {String}
   */
  possibleSubnets (optionalSubnetSize) {
    if (optionalSubnetSize === undefined) {
      optionalSubnetSize = 128
    }
    const availableBits = constants6.BITS - this.subnetMask
    const subnetBits = Math.abs(optionalSubnetSize - constants6.BITS)
    const subnetPowers = availableBits - subnetBits
    if (subnetPowers < 0) {
      return '0'
    }
    return addCommas(new BigInteger('2', 10).pow(subnetPowers).toString(10))
  }

  /**
   * Helper function getting start address.
   * @memberof IPAddr6
   * @instance
   * @returns {BigInteger}
   */
  _startAddress () {
    return new BigInteger(
      this.mask() + ('0').repeat(constants6.BITS - this.subnetMask), 2
    )
  }

  /**
   * The first address in the range given by this address' subnet
   * Often referred to as the Network Address.
   * @memberof IPAddr6
   * @instance
   * @returns {IPAddr6}
   */
  startAddress () {
    return IPAddr6.fromBigInteger(this._startAddress())
  }

  /**
   * The first host address in the range given by this address's subnet ie
   * the first address after the Network Address
   * @memberof IPAddr6
   * @instance
   * @returns {IPAddr6}
   */
  startAddressExclusive () {
    const adjust = new BigInteger('1')
    return IPAddr6.fromBigInteger(this._startAddress().add(adjust))
  }

  /**
   * Helper function getting end address.
   * @memberof IPAddr6
   * @instance
   * @returns {BigInteger}
   */
  _endAddress () {
    return new BigInteger(
      this.mask() + ('1').repeat(constants6.BITS - this.subnetMask), 2
    )
  }

  /**
   * The last address in the range given by this address' subnet
   * Often referred to as the Broadcast
   * @memberof IPAddr6
   * @instance
   * @returns {IPAddr6}
   */
  endAddress () {
    return IPAddr6.fromBigInteger(this._endAddress())
  }

  /**
   * The last host address in the range given by this address's subnet ie
   * the last address prior to the Broadcast Address
   * @memberof IPAddr6
   * @instance
   * @returns {IPAddr6}
   */
  endAddressExclusive () {
    const adjust = new BigInteger('1')
    return IPAddr6.fromBigInteger(this._endAddress().subtract(adjust))
  }

  /**
   * Return the scope of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  getScope () {
    let scope = constants6.SCOPES[this.getBits(12, 16)]
    if (this.getType() === 'Global unicast' &&
      scope !== 'Link local') {
      scope = 'Global'
    }
    return scope
  }

  /**
   * Return the type of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  getType () {
    return super.getType(IPAddr6, constants6.TYPES)
  }

  /**
   * Return the bits in the given range as a BigInteger
   * @memberof IPAddr6
   * @instance
   * @returns {BigInteger}
   */
  getBits (start, end) {
    return new BigInteger(this.getBitsBase2(start, end), 2)
  }

  /**
   * Return the bits in the given range as a base-2 string
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  getBitsBase2 (start, end) {
    return this.binaryZeroPad().slice(start, end)
  }

  /**
   * Return the bits in the given range as a base-16 string
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  getBitsBase16 (start, end) {
    const length = end - start
    if (length % 4 !== 0) {
      return null
    }
    return (this.getBits(start, end).toString(16)).padStart(length / 4, '0')
  }

  /**
   * Return the bits that are set past the subnet mask length
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  getBitsPastSubnet () {
    return this.getBitsBase2(this.subnetMask, constants6.BITS)
  }

  /**
   * Return the reversed ip6.arpa form of the address
   * @memberof IPAddr6
   * @param {Object} options
   * @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
   * @instance
   * @returns {String}
   */
  reverseForm (options) {
    if (!options) {
      options = {}
    }
    const characters = Math.floor(this.subnetMask / 4)
    const reversed = this.canonicalForm()
      .replace(/:/g, '')
      .split('')
      .slice(0, characters)
      .reverse()
      .join('.')
    if (characters > 0) {
      if (options.omitSuffix) {
        return reversed
      }
      return `${reversed}.ip6.arpa.`
    }
    if (options.omitSuffix) {
      return ''
    }
    return 'ip6.arpa.'
  }

  /**
   * Return the correct form of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  correctForm () {
    if (!this.parsedAddress) {
      return null
    }
    let i
    let groups = []
    let zeroCounter = 0
    const zeroes = []
    for (i = 0; i < this.parsedAddress.length; i++) {
      const value = parseInt(this.parsedAddress[i], 16)
      if (value === 0) {
        zeroCounter++
      }
      if (value !== 0 && zeroCounter > 0) {
        if (zeroCounter > 1) {
          zeroes.push([i - zeroCounter, i - 1])
        }
        zeroCounter = 0
      }
    }
    if (zeroCounter > 1) {
      zeroes.push([this.parsedAddress.length - zeroCounter,
        this.parsedAddress.length - 1])
    }
    const zeroLengths = zeroes.map(n => (n[1] - n[0]) + 1)
    if (zeroes.length > 0) {
      const index = zeroLengths.indexOf(Math.max(...zeroLengths))
      groups = compact(this.parsedAddress, zeroes[index])
    } else {
      groups = this.parsedAddress
    }
    for (i = 0; i < groups.length; i++) {
      if (groups[i] !== 'compact') {
        groups[i] = parseInt(groups[i], 16).toString(16)
      }
    }
    let correct = groups.join(':')
    correct = correct.replace(/^compact$/, '::')
    correct = correct.replace(/^compact|compact$/, ':')
    correct = correct.replace(/compact/, '')
    return correct
  }

  /**
   * Return a zero-padded base-2 string representation of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   * @example
   * let address = new IPAddr6('2001:4860:4001:803::1011')
   * address.binaryZeroPad()
   * // '0010000000000001010010000110000001000000000000010000100000000011
   * //  0000000000000000000000000000000000000000000000000001000000010001'
   */
  binaryZeroPad () {
    return (this.bigInteger().toString(2)).padStart(constants6.BITS, '0')
  }

  parse4in6 (address) {
    const groups = address.split(':')
    const lastGroup = groups.slice(-1)[0]
    const address4 = lastGroup.match(constants4.RE_ADDRESS)
    if (address4) {
      const temp4 = new IPAddr4(address4[0])
      for (let i = 0; i < temp4.groups; i++) {
        if (/^0[0-9]+/.test(temp4.parsedAddress[i])) {
          this.valid = false
          this.error = 'IPv4 addresses can not have leading zeroes.'
          this.parseError = address.replace(constants4.RE_ADDRESS,
            temp4.parsedAddress.map(spanLeadingZeroes4).join('.'))
          return null
        }
      }
      this.v4 = true
      groups[groups.length - 1] = temp4.toGroup6()
      address = groups.join(':')
    }
    return address
  }

  parse (address) {
    address = this.parse4in6(address)
    if (this.error) {
      return null
    }
    const badCharacters = address.match(constants6.RE_BAD_CHARACTERS)
    if (badCharacters) {
      this.valid = false
      this.error = `Bad character${badCharacters.length > 1 ? 's' : ''}` +
        ` detected in address: ${badCharacters.join('')}`
      this.parseError = address.replace(constants6.RE_BAD_CHARACTERS,
        '<span class="parse-error">$1</span>')
      return null
    }
    const badAddress = address.match(constants6.RE_BAD_ADDRESS)
    if (badAddress) {
      this.valid = false
      this.error = `Address failed regex: ${badAddress.join('')}`
      this.parseError = address.replace(constants6.RE_BAD_ADDRESS,
        '<span class="parse-error">$1</span>')
      return null
    }
    let groups = []
    const halves = address.split('::')
    if (halves.length === 2) {
      let first = halves[0].split(':')
      let last = halves[1].split(':')
      if (first.length === 1 &&
        first[0] === '') {
        first = []
      }
      if (last.length === 1 &&
        last[0] === '') {
        last = []
      }
      const remaining = this.groups - (first.length + last.length)
      if (!remaining) {
        this.valid = false
        this.error = 'Error parsing groups'
        return null
      }
      this.elidedGroups = remaining
      this.elisionBegin = first.length
      this.elisionEnd = first.length + this.elidedGroups
      first.forEach(function (group) {
        groups.push(group)
      })
      for (let i = 0; i < remaining; i++) {
        groups.push(0)
      }
      last.forEach(function (group) {
        groups.push(group)
      })
    } else if (halves.length === 1) {
      groups = address.split(':')
      this.elidedGroups = 0
    } else {
      this.valid = false
      this.error = 'Too many :: groups found'
      return null
    }
    groups = groups.map((g) => padHex(parseInt(g, 16), 0))
    if (groups.length !== this.groups) {
      this.valid = false
      this.error = 'Incorrect number of groups found'
      return null
    }
    this.valid = true
    return groups
  }

  /**
   * Return the canonical form of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  canonicalForm () {
    if (!this.valid) {
      return null
    }
    return this.parsedAddress.map(paddedHex).join(':')
  }

  /**
   * Return the decimal form of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  decimal () {
    if (!this.valid) {
      return null
    }
    return this.parsedAddress.map((n) =>
      parseInt(n, 16).toString().padStart(5, '0')).join(':')
  }

  /**
   * Return the address as a BigInteger
   * @memberof IPAddr6
   * @instance
   * @returns {BigInteger}
   */
  bigInteger () {
    if (!this.valid) {
      return null
    }
    return new BigInteger(this.parsedAddress.map(paddedHex).join(''), 16)
  }

  /**
   * Return the last two groups of this address as an IPv4 address string
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   * @example
   * let address = new IPAddr6('2001:4860:4001::1825:bf11')
   * address.to4(); // '24.37.191.17'
   */
  to4 () {
    const binary = this.binaryZeroPad().split('')
    return IPAddr4.fromHex(new BigInteger(binary.slice(96, 128)
      .join(''), 2).toString(16)).correctForm()
  }

  /**
   * Return the v4-in-v6 form of the address
   * @memberof IPAddr6
   * @instance
   * @returns {String}
   */
  to4in6 () {
    const address4 = this.to4()
    const address6 = new IPAddr6(this.parsedAddress.slice(0, 6).join(':'), 6)
    const correct = address6.correctForm()
    let infix = ''
    if (!/:$/.test(correct)) {
      infix = ':'
    }
    return address6.correctForm() + infix + address4
  }

  /**
   * Return an object containing the Teredo properties of the address
   * @memberof IPAddr6
   * @instance
   * @returns {Object}
   */
  inspectTeredo () {
    /*
    - Bits 0 to 31 are set to the Teredo prefix (normally 2001:0000::/32).
    - Bits 32 to 63 embed the primary IPv4 address of the Teredo server that
      is used.
    - Bits 64 to 79 can be used to define some flags. Currently only the
      higher order bit is used; it is set to 1 if the Teredo client is
      located behind a cone NAT, 0 otherwise. For Microsoft's Windows Vista
      and Windows Server 2008 implementations, more bits are used. In those
      implementations, the format for these 16 bits is "CRAAAAUG AAAAAAAA",
      where "C" remains the "Cone" flag. The "R" bit is reserved for future
      use. The "U" bit is for the Universal/Local flag (set to 0). The "G" bit
      is Individual/Group flag (set to 0). The A bits are set to a 12-bit
      randomly generated number chosen by the Teredo client to introduce
      additional protection for the Teredo node against IPv6-based scanning
      attacks.
    - Bits 80 to 95 contains the obfuscated UDP port number. This is the
      port number that is mapped by the NAT to the Teredo client with all
      bits inverted.
    - Bits 96 to 127 contains the obfuscated IPv4 address. This is the
      public IPv4 address of the NAT with all bits inverted.
    */
    const prefix = this.getBitsBase16(0, 32)
    const udpPort = this.getBits(80, 96).xor(new BigInteger('ffff', 16)).toString()
    const server4 = IPAddr4.fromHex(this.getBitsBase16(32, 64))
    const client4 = IPAddr4.fromHex(this.getBits(96, 128)
      .xor(new BigInteger('ffffffff', 16)).toString(16))
    const flags = this.getBits(64, 80)
    const flagsBase2 = this.getBitsBase2(64, 80)
    const coneNat = flags.testBit(15)
    const reserved = flags.testBit(14)
    const groupIndividual = flags.testBit(8)
    const universalLocal = flags.testBit(9)
    const nonce = new BigInteger(flagsBase2.slice(2, 6) +
      flagsBase2.slice(8, 16), 2).toString(10)
    return {
      prefix: `${prefix.slice(0, 4)}:${prefix.slice(4, 8)}`,
      server4: server4.address,
      client4: client4.address,
      flags: flagsBase2,
      coneNat: coneNat,
      microsoft: {
        reserved: reserved,
        universalLocal: universalLocal,
        groupIndividual: groupIndividual,
        nonce: nonce
      },
      udpPort: udpPort
    }
  }

  /**
   * Return an object containing the 6to4 properties of the address
   * @memberof IPAddr6
   * @instance
   * @returns {Object}
   */
  inspect6to4 () {
    /*
    - Bits 0 to 15 are set to the 6to4 prefix (2002::/16).
    - Bits 16 to 48 embed the IPv4 address of the 6to4 gateway that is used.
    */
    const prefix = this.getBitsBase16(0, 16)
    const gateway = IPAddr4.fromHex(this.getBitsBase16(16, 48))
    return {
      prefix: `${prefix.slice(0, 4)}`,
      gateway: gateway.address
    }
  }

  /**
   * Return a v6 6to4 address from a v6 v4inv6 address
   * @memberof IPAddr6
   * @instance
   * @returns {IPAddr6}
   */
  to6to4 () {
    if (!this.is4()) {
      return null
    }
    const addr6to4 = [
      '2002',
      this.getBitsBase16(96, 112),
      this.getBitsBase16(112, 128),
      '',
      '/16'
    ].join(':')
    return new IPAddr6(addr6to4)
  }

  /**
   * Return a byte array
   * @memberof IPAddr6
   * @instance
   * @returns {Array}
   */
  toByteArray () {
    const byteArray = this.bigInteger().toByteArray()
    // work around issue where `toByteArray` returns a leading 0 element
    if (byteArray.length === 17 && byteArray[0] === 0) {
      return byteArray.slice(1)
    }
    return byteArray
  }

  /**
   * Return an unsigned byte array
   * @memberof IPAddr6
   * @instance
   * @returns {Array}
   */
  toUnsignedByteArray () {
    return this.toByteArray().map(unsignByte)
  }

  /**
   * Convert a byte array to an IPAddr6 object
   * @memberof IPAddr6
   * @static
   * @returns {IPAddr6}
   */
  static fromByteArray (bytes) {
    return this.fromUnsignedByteArray(bytes.map(unsignByte))
  }

  /**
   * Convert an unsigned byte array to an IPAddr6 object
   * @memberof IPAddr6
   * @static
   * @returns {IPAddr6}
   */
  static fromUnsignedByteArray (bytes) {
    const BYTE_MAX = new BigInteger('256', 10)
    let result = new BigInteger('0', 10)
    let multiplier = new BigInteger('1', 10)
    for (let i = bytes.length - 1; i >= 0; i--) {
      result = result.add(
        multiplier.multiply(new BigInteger(bytes[i].toString(10), 10))
      )
      multiplier = multiplier.multiply(BYTE_MAX)
    }
    return IPAddr6.fromBigInteger(result)
  }
}

module.exports = class Network {
  // basic constructors
  static IPAddr4 (address, optionalGroups) {
    return new IPAddr4(address, optionalGroups)
  }

  static IPAddr6 (address, optionalGroups) {
    return new IPAddr6(address, optionalGroups)
  }

  static IPAddrX (address, optionalGroups) {
    return ((this.isIPv6(address))
      ? this.IPAddr6
      : (this.isIPv4(address)) ? this.IPAddr4 : null)(address, optionalGroups)
  }

  // all static no constructor needed
  static isIPv4 (s) { return net.isIPv4(s) }

  static isIPv6 (s) { return net.isIPv6(s) }

  static isIP (s) { return net.isIP(s) }

  static isPackedIPv4 (n) {
    return (typeof n === 'number') && (n >= 0) && (n <= maxUInt32)
  }

  static isPackedIPv6 (a) {
    return (a instanceof Array && a.length === 4 && (
      (typeof a[0] === 'number') && (a[0] >= 0) && (a[0] <= maxUInt32) &&
      (typeof a[1] === 'number') && (a[1] >= 0) && (a[1] <= maxUInt32) &&
      (typeof a[2] === 'number') && (a[2] >= 0) && (a[2] <= maxUInt32) &&
      (typeof a[3] === 'number') && (a[3] >= 0) && (a[3] <= maxUInt32)
    ))
  }

  static numberToString (n) {
    const m4 = this.isPackedIPv4(n)
    const m6 = this.isPackedIPv6(n)
    if ((!m4) && (!m6)) {
      throw new TypeError(`Expected a valid packed IP, got: ${n}`)
    }

    let s = ''
    let a = n
    if (m4) {
      a = [n]
    }
    for (let i = 0; i < a.length; i++) {
      s +=
        chr(a[i] >>> 24 & 0xff) +
        chr(a[i] >>> 16 & 0xff) +
        chr(a[i] >>> 8 & 0xff) +
        chr(a[i] & 0xff)
    }
    return s
  }

  static stringToNumber (c) {
    if (typeof c !== 'string') {
      throw new TypeError(`Expected a string, got ${typeof c}: ${c}`)
    }
    const l = c.length
    if ((l !== 4) && (l !== 16)) {
      throw new TypeError(`Expected a valid IP length (4 or 16), got: ${l}`)
    }
    const r = []
    for (let i = 0; i < l; i += 4) {
      r.push(
        ((ord(c[i]) << 24) >>> 0) +
        ((ord(c[i + 1]) << 16) >>> 0) +
        ((ord(c[i + 2]) << 8) >>> 0) +
        (ord(c[i + 3]) >>> 0)
      )
    }
    if (l === 4) {
      return r[0]
    }
    return r
  }

  static inetPtoN (p, onFail = 'throw') {
    if (typeof p !== 'string') {
      if (onFail === 'throw') {
        throw new TypeError(`Expected a string, got ${typeof p}: ${p}`)
      } else return onFail
    }

    const v4Seg = '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])'
    const IPv4Reg = `(${v4Seg}[.]){3}(${v4Seg})`
    const m4 = p.match(new RegExp(`^${IPv4Reg}$`))
    let m6
    if (!m4) {
      const IPv6Reg = /^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/
      m6 = p.match(IPv6Reg)
      if (!m6) {
        const v4MappedReg = `^(.*:)(${IPv4Reg})$`
        const n6 = p.match(new RegExp(v4MappedReg))
        if (n6 && n6.length === 5 && n6[1] && n6[2]) {
          const v4 = n6[2].split('.')
          const r = n6[1] +
            [
              padHex((v4[0] << 8) | v4[1], 0),
              padHex((v4[2] << 8) | v4[3], 0)
            ].join(':')
          m6 = r.match(IPv6Reg)
        }
      }
    }
    if ((!m4) && (!m6)) {
      if (onFail === 'throw') {
        throw new TypeError(`Expected a valid IP, got: ${p}`)
      } else return onFail
    }

    let m, x, i, j

    // IPv4
    if (m4) {
      m = m4[0].split('.')
      m = chr(m[0]) + chr(m[1]) + chr(m[2]) + chr(m[3])
      return (m.length === 4) ? m : false
    }

    // IPv6
    if (m6) {
      for (j = 1; j < 4; j++) {
        if (j === 2 || m6[j].length === 0) continue
        m6[j] = m6[j].split(':')
        for (i = 0; i < m6[j].length; i++) {
          m6[j][i] = parseInt(m6[j][i], 16)
          if (isNaN(m6[j][i])) return false
          // jshint -W016
          m6[j][i] = chr(m6[j][i] >> 8) + chr(m6[j][i] & 0xFF)
          // jshint +W016
        }
        m6[j] = m6[j].join('')
      }
      x = m6[1].length + m6[3].length
      if (x === 16) {
        return m6[1] + m6[3]
      } else if (x < 16 && m6[2].length > 0) {
        return m6[1] + (new Array(16 - x + 1)).join('\x00') + m6[3]
      }
    }
    return false
  }

  static inetNtoP (n, onFail = 'throw') {
    if (typeof n !== 'string') {
      if (onFail === 'throw') {
        throw new TypeError(`Expected a string, got ${typeof n}: ${n}`)
      } else return onFail
    }

    const l = n.length
    if ((l !== 4) && (l !== 16)) {
      throw new TypeError(`Expected a valid IP length (4 or 16), got: ${l}`)
    }

    let m, x, j

    // IPv4
    if (l === 4) {
      m = [ord(n[0]), ord(n[1]), ord(n[2]), ord(n[3])].join('.')
      return m
    }

    // IPv6
    if (l === 16) {
      const hex = d => padHex(d)
      m = ''
      for (j = 0; j < 16; j += 2) {
        m = m + hex(ord(n[j])) + hex(ord(n[j + 1])) + ':'
      }
      while (m !== (x = m.replace(/\b0+\b/g, '').replace(/::[:*]/, '::'))) m = x
      const rv = ipv6Normalizev4Mapped(m.replace(/\b0+/g, '').replace(/:$/, ''))
      if (rv === ':') return '::'
      if ((/::/).test(rv) && (rv.match(/:/g) || []).length === 7) {
        return rv.replace('::', ':0:')
      }
      return rv
    }
    return false
  }

  static ip (ip = '0.0.0.0', padding = '0', web = false) {
    if (!this.isIP(ip)) return ''
    if (web) padding = ' '
    const addr = this.IPAddrX(ip)
    let rv = addr.toPadded(padding)
    if (addr.isIPAddr6()) {
      if (addr.is4() && padding === '') return addr.to4in6()
      let sv = ''
      while (sv !== rv) {
        sv = rv
        rv = rv.replace(/^0:/, '::').replace(/:0:/g, '::').replace(/::::/g, '::').replace(/:::/, '::')
      }
      if ((/::/).test(rv) && (rv.match(/:/g) || []).length === 7) {
        rv = rv.replace('::', ':0:')
      }
      if (rv.indexOf(':') === 0 && rv.indexOf(':', 1) !== 1) rv = `:${rv}`
      if (rv === '::0') rv = '::'
      rv = ipv6Normalizev4Mapped(rv)
    }
    if (web) rv = rv.replace(/ /g, '&nbsp;')
    return rv
  }

  static inetAtoN (a, onFail = 'throw') {
    if (typeof a !== 'string') {
      if (onFail === 'throw') {
        throw new TypeError(`Expected a string, got ${typeof a}: ${a}`)
      } else return onFail
    }

    const m4 = this.isIPv4(a)
    const m6 = this.isIPv6(a)

    if ((!m4) && (!m6)) {
      if (onFail === 'throw') {
        throw new TypeError(`Expected a valid IP, got: ${a}`)
      } else return onFail
    }

    return this.stringToNumber(this.inetPtoN(a))
  }

  static inetNtoA (n, onFail = 'throw') {
    const m4 = this.isPackedIPv4(n)
    const m6 = this.isPackedIPv6(n)

    if ((!m4) && (!m6)) {
      if (onFail === 'throw') {
        throw new TypeError(`Expected a valid packed IP, got: ${n}`)
      } else return onFail
    }

    const p = this.inetNtoP(this.numberToString(n))
    return m4 ? p : `[${p}]`
  }

  static compare (a, b) {
    if (this.isPackedIPv4(a) && this.isPackedIPv4(b)) {
      return (a < b ? -1 : (a > b ? 1 : 0))
    } else if (a instanceof Array && b instanceof Array) {
      const l = Math.min(a.length, b.length)
      for (let ii = 0; ii < l; ii++) {
        if (a[ii] < b[ii]) {
          return -1
        }
        if (a[ii] > b[ii]) {
          return 1
        }
      }
      return 0
    }
    return null
  }

  static isPrivateIP (ip) {
    return this.IPAddrX(ip).isPrivate()
  }
}
