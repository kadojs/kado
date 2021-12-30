const chr = (n, count = 1) => String.fromCharCode(n).repeat(count)
module.exports = {
  ipv4Goods: [
    '0.0.0.0',
    '8.8.8.8',
    '127.0.0.1',
    '239.255.255.250',
    '255.255.255.255'
  ],
  packedIPv4Goods: [
    0,
    134744072,
    2130706433,
    4026531834,
    4294967295
  ],
  stringIPv4Goods: [
    chr(0, 4),
    chr(8, 4),
    chr(127) + chr(0, 2) + chr(1),
    chr(239) + chr(255, 2) + chr(250),
    chr(255, 4)
  ],
  paddedIPv4Goods: [
    '000.000.000.000',
    '008.008.008.008',
    '127.000.000.001',
    '239.255.255.250',
    '255.255.255.255'
  ],
  spcwebIPv4Goods: [
    '&nbsp;&nbsp;0.&nbsp;&nbsp;0.&nbsp;&nbsp;0.&nbsp;&nbsp;0',
    '&nbsp;&nbsp;8.&nbsp;&nbsp;8.&nbsp;&nbsp;8.&nbsp;&nbsp;8',
    '127.&nbsp;&nbsp;0.&nbsp;&nbsp;0.&nbsp;&nbsp;1',
    '239.255.255.250',
    '255.255.255.255'
  ],
  ipv4Bads: [
    '0.0.0.-1',
    '8.8.8',
    '127.0.0.256',
    '266.299.266.299'
  ],
  packedIPv4Bads: [
    -1,
    4294967296
  ],
  ipv4Privs: [
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
  ],
  ipv6Goods: [
    '::',
    '2001:4860:4860::8888',
    '::1',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '::ffff:192.168.100.228',
    '2001:0:4136:e378:8000:63bf:3fff:fdd2',
    'fe80::a40e:36ca:aa55:eb39'
  ],
  packedIPv6Goods: [
    [0x00000000, 0x00000000, 0x00000000, 0x00000000],
    [0x20014860, 0x48600000, 0x00000000, 0x00008888],
    [0x00000000, 0x00000000, 0x00000000, 0x00000001],
    [0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff],
    [0x00000000, 0x00000000, 0x0000ffff, 0xc0a864e4],
    [0x20010000, 0x4136e378, 0x800063bf, 0x3ffffdd2],
    [0xfe800000, 0x00000000, 0xa40e36ca, 0xaa55eb39]
  ],
  stringIPv6Goods: [
    chr(0, 16),
    chr(0x20) + chr(0x01) + (chr(0x48) + chr(0x60)).repeat(2) + chr(0, 8) + chr(0x88, 2),
    chr(0, 15) + chr(1),
    chr(255, 16),
    chr(0, 10) + chr(0xff, 2) + chr(192) + chr(168) + chr(100) + chr(228),
    chr(32) + chr(1) + chr(0, 2) + chr(65) + chr(54) + chr(227) + chr(120) + chr(128) + chr(0) + chr(99) + chr(191) + chr(63) + chr(255) + chr(253) + chr(210),
    chr(254) + chr(128) + chr(0, 6) + chr(164) + chr(14) + chr(54) + chr(202) + chr(170) + chr(85) + chr(235) + chr(57)
  ],
  paddedIPv6Goods: [
    '0000:0000:0000:0000:0000:0000:0000:0000',
    '2001:4860:4860:0000:0000:0000:0000:8888',
    '0000:0000:0000:0000:0000:0000:0000:0001',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '0000:0000:0000:0000:0000:ffff:c0a8:64e4',
    '2001:0000:4136:e378:8000:63bf:3fff:fdd2',
    'fe80:0000:0000:0000:a40e:36ca:aa55:eb39'
  ],
  spcwebIPv6Goods: [
    '&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0',
    '2001:4860:4860:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:8888',
    '&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;1',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:ffff:c0a8:64e4',
    '2001:&nbsp;&nbsp;&nbsp;0:4136:e378:8000:63bf:3fff:fdd2',
    'fe80:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:&nbsp;&nbsp;&nbsp;0:a40e:36ca:aa55:eb39'
  ],
  ipv6Bads: [
    ':;',
    '2001.4860.4860::8888',
    '::-1',
    'ffff:ffff:ffff:ffff:ffff:fffg'
  ],
  packedIPv6Bads: [
    [0, 0, 0, -1],
    [0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff + 1],
    '::',
    'ffff:ffff:ffff:ffff:ffff:ffff'
  ],
  ipv6Privs: [
    '::',
    '::1',
    'fc00::',
    'fc00:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    'fe80::',
    'fe80:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
  ],
  resultIPv4Goods: [
    // isCorrect, isPrivate, isMulticast, isLoopback
    [true, false, false, false],
    [true, false, false, false],
    [true, true, false, true],
    [true, false, true, false],
    [true, false, false, false]
  ],
  hexstrIPv4Goods: [
    '00:00:00:00',
    '08:08:08:08',
    '7f:00:00:01',
    'ef:ff:ff:fa',
    'ff:ff:ff:ff'
  ],
  arrayIPv4Goods: [
    [0, 0, 0, 0],
    [8, 8, 8, 8],
    [127, 0, 0, 1],
    [239, 255, 255, 250],
    [255, 255, 255, 255]
  ],
  group6IPv4Goods: [
    '0:0',
    '808:808',
    '7f00:1',
    'efff:fffa',
    'ffff:ffff'
  ],
  startIPv4Goods: [
    '0.0.0.0',
    '8.8.8.0',
    '127.0.0.0',
    '239.255.255.0',
    '255.255.255.0'
  ],
  stexclIPv4Goods: [
    '0.0.0.1',
    '8.8.8.1',
    '127.0.0.1',
    '239.255.255.1',
    '255.255.255.1'
  ],
  endIPv4Goods: [
    '0.0.0.255',
    '8.8.8.255',
    '127.0.0.255',
    '239.255.255.255',
    '255.255.255.255'
  ],
  endexclIPv4Goods: [
    '0.0.0.254',
    '8.8.8.254',
    '127.0.0.254',
    '239.255.255.254',
    '255.255.255.254'
  ],
  maskIPv4Goods: [
    '000000000000000000000000',
    '000010000000100000001000',
    '011111110000000000000000',
    '111011111111111111111111',
    '111111111111111111111111'
  ],
  resultIPv6Goods: [
    // isCorrect, isCanonical, isPrivate, isLinkLocal
    //   isMulticast, is4, isTeredo, is6to4, isLoopback
    [true, false, true, false, false, false, false, false, true],
    [true, false, false, false, false, false, false, false, false],
    [true, false, true, false, false, false, false, false, true],
    [true, true, false, false, true, false, false, false, false],
    [false, false, true, false, false, true, false, false, false],
    [true, false, false, false, false, false, true, false, false],
    [true, false, true, true, false, false, false, false, false]
  ],
  hexstrIPv6Goods: [
    '0000:0000:0000:0000:0000:0000:0000:0000',
    '2001:4860:4860:0000:0000:0000:0000:8888',
    '0000:0000:0000:0000:0000:0000:0000:0001',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '0000:0000:0000:0000:0000:ffff:c0a8:64e4',
    '2001:0000:4136:e378:8000:63bf:3fff:fdd2',
    'fe80:0000:0000:0000:a40e:36ca:aa55:eb39'
  ],
  decimalIPv6Goods: [
    '00000:00000:00000:00000:00000:00000:00000:00000',
    '08193:18528:18528:00000:00000:00000:00000:34952',
    '00000:00000:00000:00000:00000:00000:00000:00001',
    '65535:65535:65535:65535:65535:65535:65535:65535',
    '00000:00000:00000:00000:00000:65535:49320:25828',
    '08193:00000:16694:58232:32768:25535:16383:64978',
    '65152:00000:00000:00000:41998:14026:43605:60217'
  ],
  sbyteIPv6Goods: [
    [0],
    [32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, -120, -120],
    [1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, -1, -1, -64, -88, 100, -28],
    [32, 1, 0, 0, 65, 54, -29, 120, -128, 0, 99, -65, 63, -1, -3, -46],
    [-2, -128, 0, 0, 0, 0, 0, 0, -92, 14, 54, -54, -86, 85, -21, 57]
  ],
  ubyteIPv6Goods: [
    [0],
    [32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, 136, 136],
    [1],
    [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
    [0, 255, 255, 192, 168, 100, 228],
    [32, 1, 0, 0, 65, 54, 227, 120, 128, 0, 99, 191, 63, 255, 253, 210],
    [254, 128, 0, 0, 0, 0, 0, 0, 164, 14, 54, 202, 170, 85, 235, 57]
  ],
  startIPv6Goods: [
    '::',
    '2001:4860:4860::8800',
    '::',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff00',
    '::ffff:c0a8:6400',
    '2001:0:4136:e378:8000:63bf:3fff:fd00',
    'fe80::a40e:36ca:aa55:eb00'
  ],
  stexcIPv6Goods: [
    '::1',
    '2001:4860:4860::8801',
    '::1',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff01',
    '::ffff:c0a8:6401',
    '2001:0:4136:e378:8000:63bf:3fff:fd01',
    'fe80::a40e:36ca:aa55:eb01'
  ],
  endIPv6Goods: [
    '::ff',
    '2001:4860:4860::88ff',
    '::ff',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    '::ffff:c0a8:64ff',
    '2001:0:4136:e378:8000:63bf:3fff:fdff',
    'fe80::a40e:36ca:aa55:ebff'
  ],
  endexcIPv6Goods: [
    '::fe',
    '2001:4860:4860::88fe',
    '::fe',
    'ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe',
    '::ffff:c0a8:64fe',
    '2001:0:4136:e378:8000:63bf:3fff:fdfe',
    'fe80::a40e:36ca:aa55:ebfe'
  ],
  maskIPv6Goods: [
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '001000000000000101001000011000000100100001100000000000000000000000000000000000000000000000000000000000000000000010001000',
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    '000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111110000001010100001100100',
    '001000000000000100000000000000000100000100110110111000110111100010000000000000000110001110111111001111111111111111111101',
    '111111101000000000000000000000000000000000000000000000000000000010100100000011100011011011001010101010100101010111101011'
  ]
}
