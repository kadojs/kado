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
const Assert = require('./Assert')
const fs = require('./FileSystem')
class MimeType {
  static getType (type, record, input) {
    Assert.isType('string', type)
    Assert.isType('Object', record)
    Assert.isType('string', input)
    input = fs.path.extname(input)
    input = input.replace(/^\./, '')
    if (record.ext.indexOf(input) >= 0) {
      return new MimeType(type, record)
    }
    return null
  }

  constructor (type, record) {
    this.setType(type)
    this.setRecord(record)
  }

  setType (type) {
    Assert.isType('string', type)
    this.type = type
    return this
  }

  setRecord (record) {
    if (!record.magic) record.magic = []
    Assert.isType('Object', record)
    Assert.isType('Array', record.magic)
    Assert.isType('Array', record.ext)
    this.magic = record.magic
    this.ext = record.ext
    this.extension = this.ext[0]
    return this
  }
}

class Mime {
  static getType (input, options = {}) {
    Assert.isType('Object', options)
    let mime = null
    for (const type in mimeDB) {
      if (!Object.prototype.hasOwnProperty.call(mimeDB, type)) continue
      mime = MimeType.getType(type, mimeDB[type], input)
      if (mime) break
    }
    return mime
  }
}

const mimeDB = {
  'application/vnd.tcpdump.pcap': {
    magic: [[0xD4, 0xC3, 0xB2, 0xA1], [0xA1, 0xB2, 0xC3, 0xD4]],
    ext: ['pcap', 'cap', 'dmp'],
    type: 'application/vnd.tcpdump.pcap'
  },
  'text/plain': {
    magic: [['\u0f0f', '\u0f0f']],
    ext: ['txt', 'text', 'confi', 'def', 'list', 'log', 'in', 'ini']
  },
  'application/x-nintendo-nes-rom': {
    magic: [[0x4E, 0x45, 0x53, 0x1A]],
    ext: ['nes']
  },
  'application/x-7z-compressed': {
    magic: [[0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]],
    ext: ['7z']
  },
  'application/x-rar-compressed': {
    magic: [[0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]],
    ext: ['rar']
  },
  'application/x-apple-diskimage': {
    magic: [[0x78, 0x01]],
    ext: ['dmg', '*dmg']
  },
  'application/x-msdownload': {
    magic: [[0x4D, 0x5A]],
    ext: ['exe', '*exe', '*dll', 'com', 'bat', '*msi']
  },
  'application/postscript': {
    magic: [[0x25, 0x21]],
    ext: ['ai', 'eps', 'ps']
  },
  'application/x-compress': {
    magic: [[0x1F, 0xA0], [0x1F, 0x9D]],
    ext: ['z']
  },
  'image/jpeg': {
    magic: [[0xFF, 0xD8, 0xFF]],
    ext: ['jpg', 'jpeg', 'jpe']
  },
  'image/vnd.ms-photo': {
    magic: [[0x49, 0x49, 0xBC]],
    ext: ['jxr', 'wdp']
  },
  'application/gzip': {
    magic: [[0x1F, 0x8B, 0x8]],
    ext: ['gz']
  },
  'image/gif': {
    magic: [[0x47, 0x49, 0x46]],
    ext: ['gif']
  },
  'audio/opus': {
    magic: [[0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64]],
    ext: ['opus']
  },
  'video/ogg': {
    magic: [
      [0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61],
      [0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00],
      [0x7F, 0x46, 0x4C, 0x41, 0x43]
    ],
    ext: ['ogv', 'ogm', 'oga']
  },
  'image/bpg': {
    magic: [[0x42, 0x50, 0x47, 0xFB]],
    ext: ['bpg']
  },
  'application/wasm': {
    magic: [[0x00, 0x61, 0x73, 0x6D]],
    ext: ['wasm']
  },
  'image/x-canon-cr2': {
    magic: [[0x49, 0x49, 0x2A, 0x0], { string: 'CR', offset: 8 }],
    ext: ['cr2']
  },
  'image/x-nikon-nef': {
    magic: [{ bytes: [0x1C, 0x00, 0xFE, 0x00], offset: 8 }],
    ext: ['nef']
  },
  'image/tiff': {
    magic: [[0x4D, 0x4D, 0x0, 0x2A]],
    ext: ['tif', 'tiff']
  },
  'application/x-rpm': {
    magic: [[0xED, 0xAB, 0xEE, 0xDB]],
    ext: ['rpm']
  },
  'font/otf': {
    magic: [[0x4F, 0x54, 0x54, 0x4F, 0x00]],
    ext: ['otf']
  },
  'video/x-flv': {
    magic: [[0x46, 0x4C, 0x56, 0x01]],
    ext: ['flv']
  },
  'application/x-xz': {
    magic: [[0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00]],
    ext: ['xz']
  },
  'application/x-apache-arrow': {
    magic: [[0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00]],
    ext: ['arrow']
  },
  'image/bmp': {
    magic: [[0x42, 0x4D]],
    ext: ['bmp']
  },
  'audio/vnd.dolby.dd-raw': {
    magic: [[0x0B, 0x77]],
    ext: ['ac3']
  },
  'application/x-bzip2': {
    magic: [[0x42, 0x5A, 0x68]],
    ext: ['bz2', 'boz']
  },
  'audio/x-musepack': {
    magic: ['MP+'],
    ext: ['mpc']
  },
  'application/x-shockwave-flash': {
    magic: [{ bytes: [0x57, 0x53], offset: 1 }],
    ext: ['sfw']
  },
  'image/flif': {
    magic: ['FLIF'],
    ext: ['flif']
  },
  'image/vnd.adobe.photoshop': {
    magic: ['8BPS'],
    ext: ['psd']
  },
  'image/webp': {
    magic: [{ string: 'WEBP', offset: 8 }],
    ext: ['webp']
  },
  'audio/aiff': {
    magic: ['FORM'],
    ext: ['aif']
  },
  'audio/ogg': {
    magic: [
      [0x7F, 0x46, 0x4C, 0x41, 0x43],
      [0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20]
    ],
    ext: ['oga', 'ogg', 'spx']
  },
  'application/zip': {
    magic: [[0x50, 0x4B]],
    ext: ['zip']
  },
  'audio/midi': {
    magic: ['MThd'],
    ext: ['mid', 'midi', 'kar', 'rmi']
  },
  'font/woff': {
    magic: [
      'wOFF',
      {
        bytes: [0x00, 0x01, 0x00, 0x00],
        offset: 4
      },
      {
        string: 'OTTO',
        offset: 4
      }
    ],
    ext: ['woff']
  },
  'font/woff2': {
    magic: [
      'wOF2',
      {
        bytes: [0x00, 0x01, 0x00, 0x00],
        offset: 4
      },
      {
        string: 'OTTO',
        offset: 4
      }
    ],
    ext: ['woff2']
  },
  'audio/x-dsf': {
    magic: ['DSD '],
    ext: ['dsf']
  },
  'application/x-lzip': {
    magic: ['LZIP'],
    ext: ['lz']
  },
  'audio/x-flac': {
    magic: ['fLaC'],
    ext: ['flac']
  },
  'audio/wavpack': {
    magic: ['wvpk'],
    ext: ['wv']
  },
  'image/x-adobe-dng': {
    magic: [
      { bytes: [0x08, 0x00, 0x00, 0x00], offset: 4 },
      { bytes: [0x2D, 0x00, 0xFE, 0x00], offset: 8 },
      { bytes: [0x27, 0x00, 0xFE, 0x00], offset: 8 }
    ],
    ext: ['dng']
  },
  'audio/ape': {
    magic: ['MAC '],
    ext: ['ape']
  },
  'video/vnd.avi': {
    magic: [
      [0x52, 0x49, 0x46, 0x46], { bytes: [0x41, 0x56, 0x49], offset: 8 }],
    ext: ['avi']
  },
  'audio/vnd.wave': {
    magic: { bytes: [[0x57, 0x41, 0x56, 0x45], { offset: 8 }] },
    ext: ['wav']
  },
  'audio/qcelp': {
    magic: { bytes: [[0x51, 0x4C, 0x43, 0x4D], { offset: 8 }] },
    ext: ['qcp']
  },
  'application/x-sqlite3': {
    magic: ['SQLi'],
    ext: ['sqlite']
  },
  'application/vnd.ms-cab-compressed': {
    magic: ['MSCF', 'ISc('],
    ext: ['cab']
  },
  'audio/amr': {
    magic: ['#!AMR'],
    ext: ['amr']
  },
  'application/rtf': {
    magic: ['{\\rtf'],
    ext: ['rtf']
  },
  'audio/x-it': {
    magic: ['IMPM'],
    ext: ['it']
  },
  'application/xml': {
    magic: ['<?xml '],
    ext: ['xml', 'xsl', 'xsd', 'rng']
  },
  'application/x-blender': {
    magic: ['BLENDER'],
    ext: ['blend']
  },
  'image/x-olympus-orf': {
    magic: [
      [0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18]
    ],
    ext: ['orf']
  },
  'image/x-panasonic-rw2': {
    magic: [
      [0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xE7, 0x74, 0xD8]
    ],
    ext: ['rw2']
  },
  'video/x-ms-asf': {
    magic: [[
      0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11,
      0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B
    ]],
    ext: ['wmv', 'asf', 'asx']
  },
  'image/ktx': {
    magic: [
      [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A]
    ],
    ext: ['ktx']
  },
  'audio/x-ms-wma': {
    magic: [
      [0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9],
      [0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11],
      [0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65],
      [0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11],
      [0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B]
    ],
    ext: ['wma']
  },
  'application/x-mie': {
    magic: [
      [0x7E, 0x10, 0x04], [0x7E, 0x18, 0x04],
      {
        bytes: [0x30, 0x4D, 0x49, 0x45],
        offset: 4
      }
    ],
    ext: ['mie']
  },
  'application/x-esri-shape': {
    magic: [
      {
        bytes: [
          0x27, 0x0A, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ],
        offset: 2
      }
    ],
    ext: ['shp']
  },
  'video/mpeg': {
    magic: [[0x0, 0x0, 0x1, 0xBA], [0x0, 0x0, 0x1, 0xB3]],
    ext: ['mpg', 'mpeg', 'mpe', 'm1v', 'm2v']
  },
  'font/ttf': {
    magic: [[0x00, 0x01, 0x00, 0x00, 0x00]],
    ext: ['ttf']
  },
  'image/x-icon': {
    magic: [[0x00, 0x00, 0x02, 0x00], [0x00, 0x00, 0x01, 0x00]],
    ext: ['cur', 'ico']
  },
  'audio/x-xm': {
    magic: ['Extended Module:'],
    ext: ['xm']
  },
  'audio/x-voc': {
    magic: ['Creative Voice File'],
    ext: ['voc']
  },
  'application/x-tar': {
    magic: [
      {
        bytes: [0x30, 0x30, 0x30, 0x30, 0x30, 0x30],
        offset: 148
      },
      [0xF8, 0xF8, 0xF8, 0xF8, 0xF8, 0xF8],
      {
        bytes: [0x30, 0x30, 0x30, 0x30, 0x30, 0x30],
        offset: 148
      },
      [0xF8, 0xF8, 0xF8, 0xF8, 0xF8, 0xF8]
    ],
    ext: ['tar']
  },
  'application/x-msi': {
    magic: [[
      0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x3E
    ]],
    ext: ['msi']
  },
  'application/mxf': {
    magic: [[
      0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01,
      0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02
    ]],
    ext: ['mfx']
  },
  'audio/x-s3m': {
    magic: { string: 'SCRM', offset: 44 },
    ext: ['sem']
  },
  'video/mp2t': {
    magic: [
      { bytes: [0x47], offset: 4 },
      { bytes: [0x47], offset: 192 },
      { bytes: [0x47], offset: 196 }
    ],
    ext: ['mts', 'ts']
  },
  'application/x-mobipocket-ebook': {
    magic: [
      { bytes: [0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], offset: 60 }
    ],
    ext: ['prc', 'mobi']
  },
  'application/dicom': {
    magic: [{ bytes: [0x44, 0x49, 0x43, 0x4D], offset: 128 }],
    ext: ['dcm']
  },
  'application/x.apple.alias': {
    magic: [[
      0x62, 0x6F, 0x6F, 0x6B, 0x00, 0x00, 0x00, 0x00,
      0x6D, 0x61, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x00
    ]],
    ext: ['alias']
  },
  'application/vnd.ms-fontobject': {
    magic: [
      { bytes: [0x4C, 0x50], offset: 34 },
      { bytes: [0x00, 0x00, 0x01], offset: 8 },
      { bytes: [0x01, 0x00, 0x02], offset: 8 },
      { bytes: [0x02, 0x00, 0x02], offset: 8 }
    ],
    ext: ['eot']
  },
  'audio/aac': {
    magic: [
      { bytes: [0x10], offset: 'start' + 1, mask: [0x16] },
      { bytes: [0x08], offset: 'start' + 1, mask: [0x08] }
    ],
    ext: ['aac']
  },
  'audio/mpeg': {
    magic: [
      { bytes: [0x02], offset: 'start' + 1, mask: [0x06] },
      { bytes: [0x04], offset: 'start' + 1, mask: [0x06] },
      { bytes: [0x06], offset: 'start' + 1, mask: [0x06] },
      'ID3'
    ],
    ext: ['mp3', 'mp2', 'mp1', 'mp2a', 'mpga', 'm2a', 'm3a']
  },
  'application/x-xpinstall': {
    magic: [[0x50, 0x4B, 0x3, 0x4]],
    ext: ['xpi']
  },
  'image/x-sony-arw': {
    magic: [
      { bytes: [0x10, 0xFB, 0x86, 0x01], offset: 4 },
      { bytes: [0x08, 0x00, 0x00, 0x00], offset: 4 },
      {
        bytes: [
          0x00, 0xFE, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00,
          0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x01
        ],
        offset: 9
      }
    ],
    ext: ['arw']
  },
  'video/MP1S': {
    magic: [
      [0x00, 0x00, 0x01, 0xBA],
      { bytes: [0x21], offset: 4, mask: [0xF1] }
    ],
    ext: ['mpg']
  },
  'video/MP2P': {
    magic: [{ bytes: [0x44], offset: 4, mask: [0xC4] }],
    ext: ['mpg']
  },
  'application/x-deb': {
    magic: ['!<arch>'],
    ext: ['deb']
  },
  'video/quicktime': {
    magic: [
      { bytes: [0x66, 0x72, 0x65, 0x65], offset: 4 },
      { bytes: [0x6D, 0x64, 0x61, 0x74], offset: 4 },
      { bytes: [0x6D, 0x6F, 0x6F, 0x76], offset: 4 },
      { bytes: [0x77, 0x69, 0x64, 0x65], offset: 4 }
    ],
    ext: ['mov', 'qt']
  },
  // types without magic
  'application/prs.cww': { ext: ['cww'] },
  'application/vnd.3gpp.pic-bw-large': { ext: ['plb'] },
  'application/vnd.3gpp.pic-bw-small': { ext: ['psb'] },
  'application/vnd.3gpp.pic-bw-var': { ext: ['pvb'] },
  'application/vnd.3gpp2.tcap': { ext: ['tcap'] },
  'application/vnd.3m.post-it-notes': { ext: ['pwn'] },
  'application/vnd.accpac.simply.aso': { ext: ['aso'] },
  'application/vnd.accpac.simply.imp': { ext: ['imp'] },
  'application/vnd.acucobol': { ext: ['acu'] },
  'application/vnd.acucorp': { ext: ['atc', 'acutc'] },
  'application/vnd.adobe.air-application-installer-package+zip': { ext: ['air'] },
  'application/vnd.adobe.formscentral.fcdt': { ext: ['fcdt'] },
  'application/vnd.adobe.fxp': { ext: ['fxp', 'fxpl'] },
  'application/vnd.adobe.xdp+xml': { ext: ['xdp'] },
  'application/vnd.adobe.xfdf': { ext: ['xfdf'] },
  'application/vnd.ahead.space': { ext: ['ahead'] },
  'application/vnd.airzip.filesecure.azf': { ext: ['azf'] },
  'application/vnd.airzip.filesecure.azs': { ext: ['azs'] },
  'application/vnd.amazon.ebook': { ext: ['azw'] },
  'application/vnd.americandynamics.acc': { ext: ['acc'] },
  'application/vnd.amiga.ami': { ext: ['ami'] },
  'application/vnd.android.package-archive': { ext: ['apk'] },
  'application/vnd.anser-web-certificate-issue-initiation': { ext: ['cii'] },
  'application/vnd.anser-web-funds-transfer-initiation': { ext: ['fti'] },
  'application/vnd.antix.game-component': { ext: ['atx'] },
  'application/vnd.apple.installer+xml': { ext: ['mpkg'] },
  'application/vnd.apple.keynote': { ext: ['keynote'] },
  'application/vnd.apple.mpegurl': { ext: ['m3u8'] },
  'application/vnd.apple.numbers': { ext: ['numbers'] },
  'application/vnd.apple.pages': { ext: ['pages'] },
  'application/vnd.apple.pkpass': { ext: ['pkpass'] },
  'application/vnd.aristanetworks.swi': { ext: ['swi'] },
  'application/vnd.astraea-software.iota': { ext: ['iota'] },
  'application/vnd.audiograph': { ext: ['aep'] },
  'application/vnd.blueice.multipass': { ext: ['mpm'] },
  'application/vnd.bmi': { ext: ['bmi'] },
  'application/vnd.businessobjects': { ext: ['rep'] },
  'application/vnd.chemdraw+xml': { ext: ['cdxml'] },
  'application/vnd.chipnuts.karaoke-mmd': { ext: ['mmd'] },
  'application/vnd.cinderella': { ext: ['cdy'] },
  'application/vnd.citationstyles.style+xml': { ext: ['csl'] },
  'application/vnd.claymore': { ext: ['cla'] },
  'application/vnd.cloanto.rp9': { ext: ['rp9'] },
  'application/vnd.clonk.c4group': { ext: ['c4g', 'c4d', 'c4f', 'c4p', 'c4u'] },
  'application/vnd.cluetrust.cartomobile-config': { ext: ['c11amc'] },
  'application/vnd.cluetrust.cartomobile-config-pkg': { ext: ['c11amz'] },
  'application/vnd.commonspace': { ext: ['csp'] },
  'application/vnd.contact.cmsg': { ext: ['cdbcmsg'] },
  'application/vnd.cosmocaller': { ext: ['cmc'] },
  'application/vnd.crick.clicker': { ext: ['clkx'] },
  'application/vnd.crick.clicker.keyboard': { ext: ['clkk'] },
  'application/vnd.crick.clicker.palette': { ext: ['clkp'] },
  'application/vnd.crick.clicker.template': { ext: ['clkt'] },
  'application/vnd.crick.clicker.wordbank': { ext: ['clkw'] },
  'application/vnd.criticaltools.wbs+xml': { ext: ['wbs'] },
  'application/vnd.ctc-posml': { ext: ['pml'] },
  'application/vnd.cups-ppd': { ext: ['ppd'] },
  'application/vnd.curl.car': { ext: ['car'] },
  'application/vnd.curl.pcurl': { ext: ['pcurl'] },
  'application/vnd.dart': { ext: ['dart'] },
  'application/vnd.data-vision.rdz': { ext: ['rdz'] },
  'application/vnd.dece.data': { ext: ['uvf', 'uvvf', 'uvd', 'uvvd'] },
  'application/vnd.dece.ttml+xml': { ext: ['uvt', 'uvvt'] },
  'application/vnd.dece.unspecified': { ext: ['uvx', 'uvvx'] },
  'application/vnd.dece.zip': { ext: ['uvz', 'uvvz'] },
  'application/vnd.denovo.fcselayout-link': { ext: ['fe_launch'] },
  'application/vnd.dna': { ext: ['dna'] },
  'application/vnd.dolby.mlp': { ext: ['mlp'] },
  'application/vnd.dpgraph': { ext: ['dpg'] },
  'application/vnd.dreamfactory': { ext: ['dfac'] },
  'application/vnd.ds-keypoint': { ext: ['kpxx'] },
  'application/vnd.dvb.ait': { ext: ['ait'] },
  'application/vnd.dvb.service': { ext: ['svc'] },
  'application/vnd.dynageo': { ext: ['geo'] },
  'application/vnd.ecowin.chart': { ext: ['mag'] },
  'application/vnd.enliven': { ext: ['nml'] },
  'application/vnd.epson.esf': { ext: ['esf'] },
  'application/vnd.epson.msf': { ext: ['msf'] },
  'application/vnd.epson.quickanime': { ext: ['qam'] },
  'application/vnd.epson.salt': { ext: ['slt'] },
  'application/vnd.epson.ssf': { ext: ['ssf'] },
  'application/vnd.eszigno3+xml': { ext: ['es3', 'et3'] },
  'application/vnd.ezpix-album': { ext: ['ez2'] },
  'application/vnd.ezpix-package': { ext: ['ez3'] },
  'application/vnd.fdf': { ext: ['fdf'] },
  'application/vnd.fdsn.mseed': { ext: ['mseed'] },
  'application/vnd.fdsn.seed': { ext: ['seed', 'dataless'] },
  'application/vnd.flographit': { ext: ['gph'] },
  'application/vnd.fluxtime.clip': { ext: ['ftc'] },
  'application/vnd.framemaker': { ext: ['fm', 'frame', 'maker', 'book'] },
  'application/vnd.frogans.fnc': { ext: ['fnc'] },
  'application/vnd.frogans.ltf': { ext: ['ltf'] },
  'application/vnd.fsc.weblaunch': { ext: ['fsc'] },
  'application/vnd.fujitsu.oasys': { ext: ['oas'] },
  'application/vnd.fujitsu.oasys2': { ext: ['oa2'] },
  'application/vnd.fujitsu.oasys3': { ext: ['oa3'] },
  'application/vnd.fujitsu.oasysgp': { ext: ['fg5'] },
  'application/vnd.fujitsu.oasysprs': { ext: ['bh2'] },
  'application/vnd.fujixerox.ddd': { ext: ['ddd'] },
  'application/vnd.fujixerox.docuworks': { ext: ['xdw'] },
  'application/vnd.fujixerox.docuworks.binder': { ext: ['xbd'] },
  'application/vnd.fuzzysheet': { ext: ['fzs'] },
  'application/vnd.genomatix.tuxedo': { ext: ['txd'] },
  'application/vnd.geogebra.file': { ext: ['ggb'] },
  'application/vnd.geogebra.tool': { ext: ['ggt'] },
  'application/vnd.geometry-explorer': { ext: ['gex', 'gre'] },
  'application/vnd.geonext': { ext: ['gxt'] },
  'application/vnd.geoplan': { ext: ['g2w'] },
  'application/vnd.geospace': { ext: ['g3w'] },
  'application/vnd.gmx': { ext: ['gmx'] },
  'application/vnd.google-apps.document': { ext: ['gdoc'] },
  'application/vnd.google-apps.presentation': { ext: ['gslides'] },
  'application/vnd.google-apps.spreadsheet': { ext: ['gsheet'] },
  'application/vnd.google-earth.kml+xml': { ext: ['kml'] },
  'application/vnd.google-earth.kmz': { ext: ['kmz'] },
  'application/vnd.grafeq': { ext: ['gqf', 'gqs'] },
  'application/vnd.groove-account': { ext: ['gac'] },
  'application/vnd.groove-help': { ext: ['ghf'] },
  'application/vnd.groove-identity-message': { ext: ['gim'] },
  'application/vnd.groove-injector': { ext: ['grv'] },
  'application/vnd.groove-tool-message': { ext: ['gtm'] },
  'application/vnd.groove-tool-template': { ext: ['tpl'] },
  'application/vnd.groove-vcard': { ext: ['vcg'] },
  'application/vnd.hal+xml': { ext: ['hal'] },
  'application/vnd.handheld-entertainment+xml': { ext: ['zmm'] },
  'application/vnd.hbci': { ext: ['hbci'] },
  'application/vnd.hhe.lesson-player': { ext: ['les'] },
  'application/vnd.hp-hpgl': { ext: ['hpgl'] },
  'application/vnd.hp-hpid': { ext: ['hpid'] },
  'application/vnd.hp-hps': { ext: ['hps'] },
  'application/vnd.hp-jlyt': { ext: ['jlt'] },
  'application/vnd.hp-pcl': { ext: ['pcl'] },
  'application/vnd.hp-pclxl': { ext: ['pclxl'] },
  'application/vnd.hydrostatix.sof-data': { ext: ['sfd-hdstx'] },
  'application/vnd.ibm.minipay': { ext: ['mpy'] },
  'application/vnd.ibm.modcap': { ext: ['afp', 'listafp', 'list3820'] },
  'application/vnd.ibm.rights-management': { ext: ['irm'] },
  'application/vnd.ibm.secure-container': { ext: ['sc'] },
  'application/vnd.iccprofile': { ext: ['icc', 'icm'] },
  'application/vnd.igloader': { ext: ['igl'] },
  'application/vnd.immervision-ivp': { ext: ['ivp'] },
  'application/vnd.immervision-ivu': { ext: ['ivu'] },
  'application/vnd.insors.igm': { ext: ['igm'] },
  'application/vnd.intercon.formnet': { ext: ['xpw', 'xpx'] },
  'application/vnd.intergeo': { ext: ['i2g'] },
  'application/vnd.intu.qbo': { ext: ['qbo'] },
  'application/vnd.intu.qfx': { ext: ['qfx'] },
  'application/vnd.ipunplugged.rcprofile': { ext: ['rcprofile'] },
  'application/vnd.irepository.package+xml': { ext: ['irp'] },
  'application/vnd.is-xpr': { ext: ['xpr'] },
  'application/vnd.isac.fcs': { ext: ['fcs'] },
  'application/vnd.jam': { ext: ['jam'] },
  'application/vnd.jcp.javame.midlet-rms': { ext: ['rms'] },
  'application/vnd.jisp': { ext: ['jisp'] },
  'application/vnd.joost.joda-archive': { ext: ['joda'] },
  'application/vnd.kahootz': { ext: ['ktz', 'ktr'] },
  'application/vnd.kde.karbon': { ext: ['karbon'] },
  'application/vnd.kde.kchart': { ext: ['chrt'] },
  'application/vnd.kde.kformula': { ext: ['kfo'] },
  'application/vnd.kde.kivio': { ext: ['flw'] },
  'application/vnd.kde.kontour': { ext: ['kon'] },
  'application/vnd.kde.kpresenter': { ext: ['kpr', 'kpt'] },
  'application/vnd.kde.kspread': { ext: ['ksp'] },
  'application/vnd.kde.kword': { ext: ['kwd', 'kwt'] },
  'application/vnd.kenameaapp': { ext: ['htke'] },
  'application/vnd.kidspiration': { ext: ['kia'] },
  'application/vnd.kinar': { ext: ['kne', 'knp'] },
  'application/vnd.koan': { ext: ['skp', 'skd', 'skt', 'skm'] },
  'application/vnd.kodak-descriptor': { ext: ['sse'] },
  'application/vnd.las.las+xml': { ext: ['lasxml'] },
  'application/vnd.llamagraphics.life-balance.desktop': { ext: ['lbd'] },
  'application/vnd.llamagraphics.life-balance.exchange+xml': { ext: ['lbe'] },
  'application/vnd.lotus-1-2-3': { ext: ['123'] },
  'application/vnd.lotus-approach': { ext: ['apr'] },
  'application/vnd.lotus-freelance': { ext: ['pre'] },
  'application/vnd.lotus-notes': { ext: ['nsf'] },
  'application/vnd.lotus-organizer': { ext: ['org'] },
  'application/vnd.lotus-screencam': { ext: ['scm'] },
  'application/vnd.lotus-wordpro': { ext: ['lwp'] },
  'application/vnd.macports.portpkg': { ext: ['portpkg'] },
  'application/vnd.mcd': { ext: ['mcd'] },
  'application/vnd.medcalcdata': { ext: ['mc1'] },
  'application/vnd.mediastation.cdkey': { ext: ['cdkey'] },
  'application/vnd.mfer': { ext: ['mwf'] },
  'application/vnd.mfmp': { ext: ['mfm'] },
  'application/vnd.micrografx.flo': { ext: ['flo'] },
  'application/vnd.micrografx.igx': { ext: ['igx'] },
  'application/vnd.mif': { ext: ['mif'] },
  'application/vnd.mobius.daf': { ext: ['daf'] },
  'application/vnd.mobius.dis': { ext: ['dis'] },
  'application/vnd.mobius.mbk': { ext: ['mbk'] },
  'application/vnd.mobius.mqy': { ext: ['mqy'] },
  'application/vnd.mobius.msl': { ext: ['msl'] },
  'application/vnd.mobius.plc': { ext: ['plc'] },
  'application/vnd.mobius.txf': { ext: ['txf'] },
  'application/vnd.mophun.application': { ext: ['mpn'] },
  'application/vnd.mophun.certificate': { ext: ['mpc'] },
  'application/vnd.mozilla.xul+xml': { ext: ['xul'] },
  'application/vnd.ms-artgalry': { ext: ['cil'] },
  'application/vnd.ms-excel': { ext: ['xls', 'xlm', 'xla', 'xlc', 'xlt', 'xlw'] },
  'application/vnd.ms-excel.addin.macroenabled.12': { ext: ['xlam'] },
  'application/vnd.ms-excel.sheet.binary.macroenabled.12': { ext: ['xlsb'] },
  'application/vnd.ms-excel.sheet.macroenabled.12': { ext: ['xlsm'] },
  'application/vnd.ms-excel.template.macroenabled.12': { ext: ['xltm'] },
  'application/vnd.ms-htmlhelp': { ext: ['chm'] },
  'application/vnd.ms-ims': { ext: ['ims'] },
  'application/vnd.ms-lrm': { ext: ['lrm'] },
  'application/vnd.ms-officetheme': { ext: ['thmx'] },
  'application/vnd.ms-outlook': { ext: ['msg'] },
  'application/vnd.ms-pki.seccat': { ext: ['cat'] },
  'application/vnd.ms-pki.stl': { ext: ['*stl'] },
  'application/vnd.ms-powerpoint': { ext: ['ppt', 'pps', 'pot'] },
  'application/vnd.ms-powerpoint.addin.macroenabled.12': { ext: ['ppam'] },
  'application/vnd.ms-powerpoint.presentation.macroenabled.12': { ext: ['pptm'] },
  'application/vnd.ms-powerpoint.slide.macroenabled.12': { ext: ['sldm'] },
  'application/vnd.ms-powerpoint.slideshow.macroenabled.12': { ext: ['ppsm'] },
  'application/vnd.ms-powerpoint.template.macroenabled.12': { ext: ['potm'] },
  'application/vnd.ms-project': { ext: ['mpp', 'mpt'] },
  'application/vnd.ms-word.document.macroenabled.12': { ext: ['docm'] },
  'application/vnd.ms-word.template.macroenabled.12': { ext: ['dotm'] },
  'application/vnd.ms-works': { ext: ['wps', 'wks', 'wcm', 'wdb'] },
  'application/vnd.ms-wpl': { ext: ['wpl'] },
  'application/vnd.ms-xpsdocument': { ext: ['xps'] },
  'application/vnd.mseq': { ext: ['mseq'] },
  'application/vnd.musician': { ext: ['mus'] },
  'application/vnd.muvee.style': { ext: ['msty'] },
  'application/vnd.mynfc': { ext: ['taglet'] },
  'application/vnd.neurolanguage.nlu': { ext: ['nlu'] },
  'application/vnd.nitf': { ext: ['ntf', 'nitf'] },
  'application/vnd.noblenet-directory': { ext: ['nnd'] },
  'application/vnd.noblenet-sealer': { ext: ['nns'] },
  'application/vnd.noblenet-web': { ext: ['nnw'] },
  'application/vnd.nokia.n-gage.data': { ext: ['ngdat'] },
  'application/vnd.nokia.n-gage.symbian.install': { ext: ['n-gage'] },
  'application/vnd.nokia.radio-preset': { ext: ['rpst'] },
  'application/vnd.nokia.radio-presets': { ext: ['rpss'] },
  'application/vnd.novadigm.edm': { ext: ['edm'] },
  'application/vnd.novadigm.edx': { ext: ['edx'] },
  'application/vnd.novadigm.ext': { ext: ['ext'] },
  'application/vnd.oasis.opendocument.chart': { ext: ['odc'] },
  'application/vnd.oasis.opendocument.chart-template': { ext: ['otc'] },
  'application/vnd.oasis.opendocument.database': { ext: ['odb'] },
  'application/vnd.oasis.opendocument.formula': { ext: ['odf'] },
  'application/vnd.oasis.opendocument.formula-template': { ext: ['odft'] },
  'application/vnd.oasis.opendocument.graphics': { ext: ['odg'] },
  'application/vnd.oasis.opendocument.graphics-template': { ext: ['otg'] },
  'application/vnd.oasis.opendocument.image': { ext: ['odi'] },
  'application/vnd.oasis.opendocument.image-template': { ext: ['oti'] },
  'application/vnd.oasis.opendocument.presentation': { ext: ['odp'] },
  'application/vnd.oasis.opendocument.presentation-template': { ext: ['otp'] },
  'application/vnd.oasis.opendocument.spreadsheet': { ext: ['ods'] },
  'application/vnd.oasis.opendocument.spreadsheet-template': { ext: ['ots'] },
  'application/vnd.oasis.opendocument.text': { ext: ['odt'] },
  'application/vnd.oasis.opendocument.text-master': { ext: ['odm'] },
  'application/vnd.oasis.opendocument.text-template': { ext: ['ott'] },
  'application/vnd.oasis.opendocument.text-web': { ext: ['oth'] },
  'application/vnd.olpc-sugar': { ext: ['xo'] },
  'application/vnd.oma.dd2+xml': { ext: ['dd2'] },
  'application/vnd.openofficeorg.extension': { ext: ['oxt'] },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    ext: ['pptx']
  },
  'application/vnd.openxmlformats-officedocument.presentationml.slide': {
    ext: ['sldx']
  },
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': {
    ext: ['ppsx']
  },
  'application/vnd.openxmlformats-officedocument.presentationml.template': {
    ext: ['potx']
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    ext: ['xlsx']
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template': {
    ext: ['xltx']
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: ['docx']
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template': {
    ext: ['dotx']
  },
  'application/vnd.osgeo.mapguide.package': { ext: ['mgp'] },
  'application/vnd.osgi.dp': { ext: ['dp'] },
  'application/vnd.osgi.subsystem': { ext: ['esa'] },
  'application/vnd.palm': { ext: ['pdb', 'pqa', 'oprc'] },
  'application/vnd.pawaafile': { ext: ['paw'] },
  'application/vnd.pg.format': { ext: ['str'] },
  'application/vnd.pg.osasli': { ext: ['ei6'] },
  'application/vnd.picsel': { ext: ['efif'] },
  'application/vnd.pmi.widget': { ext: ['wg'] },
  'application/vnd.pocketlearn': { ext: ['plf'] },
  'application/vnd.powerbuilder6': { ext: ['pbd'] },
  'application/vnd.previewsystems.box': { ext: ['box'] },
  'application/vnd.proteus.magazine': { ext: ['mgz'] },
  'application/vnd.publishare-delta-tree': { ext: ['qps'] },
  'application/vnd.pvi.ptid1': { ext: ['ptid'] },
  'application/vnd.quark.quarkxpress': { ext: ['qxd', 'qxt', 'qwd', 'qwt', 'qxl', 'qxb'] },
  'application/vnd.realvnc.bed': { ext: ['bed'] },
  'application/vnd.recordare.musicxml': { ext: ['mxl'] },
  'application/vnd.recordare.musicxml+xml': { ext: ['musicxml'] },
  'application/vnd.rig.cryptonote': { ext: ['cryptonote'] },
  'application/vnd.rim.cod': { ext: ['cod'] },
  'application/vnd.rn-realmedia': { ext: ['rm'] },
  'application/vnd.rn-realmedia-vbr': { ext: ['rmvb'] },
  'application/vnd.route66.link66+xml': { ext: ['link66'] },
  'application/vnd.sailingtracker.track': { ext: ['st'] },
  'application/vnd.seemail': { ext: ['see'] },
  'application/vnd.sema': { ext: ['sema'] },
  'application/vnd.semd': { ext: ['semd'] },
  'application/vnd.semf': { ext: ['semf'] },
  'application/vnd.shana.informed.formdata': { ext: ['ifm'] },
  'application/vnd.shana.informed.formtemplate': { ext: ['itp'] },
  'application/vnd.shana.informed.interchange': { ext: ['iif'] },
  'application/vnd.shana.informed.package': { ext: ['ipk'] },
  'application/vnd.simtech-mindmapper': { ext: ['twd', 'twds'] },
  'application/vnd.smaf': { ext: ['mmf'] },
  'application/vnd.smart.teacher': { ext: ['teacher'] },
  'application/vnd.solent.sdkm+xml': { ext: ['sdkm', 'sdkd'] },
  'application/vnd.spotfire.dxp': { ext: ['dxp'] },
  'application/vnd.spotfire.sfs': { ext: ['sfs'] },
  'application/vnd.stardivision.calc': { ext: ['sdc'] },
  'application/vnd.stardivision.draw': { ext: ['sda'] },
  'application/vnd.stardivision.impress': { ext: ['sdd'] },
  'application/vnd.stardivision.math': { ext: ['smf'] },
  'application/vnd.stardivision.writer': { ext: ['sdw', 'vor'] },
  'application/vnd.stardivision.writer-global': { ext: ['sgl'] },
  'application/vnd.stepmania.package': { ext: ['smzip'] },
  'application/vnd.stepmania.stepchart': { ext: ['sm'] },
  'application/vnd.sun.wadl+xml': { ext: ['wadl'] },
  'application/vnd.sun.xml.calc': { ext: ['sxc'] },
  'application/vnd.sun.xml.calc.template': { ext: ['stc'] },
  'application/vnd.sun.xml.draw': { ext: ['sxd'] },
  'application/vnd.sun.xml.draw.template': { ext: ['std'] },
  'application/vnd.sun.xml.impress': { ext: ['sxi'] },
  'application/vnd.sun.xml.impress.template': { ext: ['sti'] },
  'application/vnd.sun.xml.math': { ext: ['sxm'] },
  'application/vnd.sun.xml.writer': { ext: ['sxw'] },
  'application/vnd.sun.xml.writer.global': { ext: ['sxg'] },
  'application/vnd.sun.xml.writer.template': { ext: ['stw'] },
  'application/vnd.sus-calendar': { ext: ['sus', 'susp'] },
  'application/vnd.svd': { ext: ['svd'] },
  'application/vnd.symbian.install': { ext: ['sis', 'sisx'] },
  'application/vnd.syncml+xml': { ext: ['xsm'] },
  'application/vnd.syncml.dm+wbxml': { ext: ['bdm'] },
  'application/vnd.syncml.dm+xml': { ext: ['xdm'] },
  'application/vnd.tao.intent-module-archive': { ext: ['tao'] },
  'application/vnd.tmobile-livetv': { ext: ['tmo'] },
  'application/vnd.trid.tpt': { ext: ['tpt'] },
  'application/vnd.triscape.mxs': { ext: ['mxs'] },
  'application/vnd.trueapp': { ext: ['tra'] },
  'application/vnd.ufdl': { ext: ['ufd', 'ufdl'] },
  'application/vnd.uiq.theme': { ext: ['utz'] },
  'application/vnd.umajin': { ext: ['umj'] },
  'application/vnd.unity': { ext: ['unityweb'] },
  'application/vnd.uoml+xml': { ext: ['uoml'] },
  'application/vnd.vcx': { ext: ['vcx'] },
  'application/vnd.visio': { ext: ['vsd', 'vst', 'vss', 'vsw'] },
  'application/vnd.visionary': { ext: ['vis'] },
  'application/vnd.vsf': { ext: ['vsf'] },
  'application/vnd.wap.wbxml': { ext: ['wbxml'] },
  'application/vnd.wap.wmlc': { ext: ['wmlc'] },
  'application/vnd.wap.wmlscriptc': { ext: ['wmlsc'] },
  'application/vnd.webturbo': { ext: ['wtb'] },
  'application/vnd.wolfram.player': { ext: ['nbp'] },
  'application/vnd.wordperfect': { ext: ['wpd'] },
  'application/vnd.wqd': { ext: ['wqd'] },
  'application/vnd.wt.stf': { ext: ['stf'] },
  'application/vnd.xara': { ext: ['xar'] },
  'application/vnd.xfdl': { ext: ['xfdl'] },
  'application/vnd.yamaha.hv-dic': { ext: ['hvd'] },
  'application/vnd.yamaha.hv-script': { ext: ['hvs'] },
  'application/vnd.yamaha.hv-voice': { ext: ['hvp'] },
  'application/vnd.yamaha.openscoreformat': { ext: ['osf'] },
  'application/vnd.yamaha.openscoreformat.osfpvg+xml': { ext: ['osfpvg'] },
  'application/vnd.yamaha.smaf-audio': { ext: ['saf'] },
  'application/vnd.yamaha.smaf-phrase': { ext: ['spf'] },
  'application/vnd.yellowriver-custom-menu': { ext: ['cmp'] },
  'application/vnd.zul': { ext: ['zir', 'zirz'] },
  'application/vnd.zzazz.deck+xml': { ext: ['zaz'] },
  'application/x-abiword': { ext: ['abw'] },
  'application/x-ace-compressed': { ext: ['ace'] },
  'application/x-arj': { ext: ['arj'] },
  'application/x-authorware-bin': { ext: ['aab', 'x32', 'u32', 'vox'] },
  'application/x-authorware-map': { ext: ['aam'] },
  'application/x-authorware-seg': { ext: ['aas'] },
  'application/x-bcpio': { ext: ['bcpio'] },
  'application/x-bdoc': { ext: ['*bdoc'] },
  'application/x-bittorrent': { ext: ['torrent'] },
  'application/x-blorb': { ext: ['blb', 'blorb'] },
  'application/x-bzip': { ext: ['bz'] },
  'application/x-cbr': { ext: ['cbr', 'cba', 'cbt', 'cbz', 'cb7'] },
  'application/x-cdlink': { ext: ['vcd'] },
  'application/x-cfs-compressed': { ext: ['cfs'] },
  'application/x-chat': { ext: ['chat'] },
  'application/x-chess-pgn': { ext: ['pgn'] },
  'application/x-chrome-extension': { ext: ['crx'] },
  'application/x-cocoa': { ext: ['cco'] },
  'application/x-conference': { ext: ['nsc'] },
  'application/x-cpio': { ext: ['cpio'] },
  'application/x-csh': { ext: ['csh'] },
  'application/x-debian-package': { ext: ['*deb', 'udeb'] },
  'application/x-dgc-compressed': { ext: ['dgc'] },
  'application/x-director': {
    ext: ['dir', 'dcr', 'dxr', 'cst', 'cct', 'cxt', 'w3d', 'fgd', 'swa']
  },
  'application/x-doom': { ext: ['wad'] },
  'application/x-dtbncx+xml': { ext: ['ncx'] },
  'application/x-dtbook+xml': { ext: ['dtb'] },
  'application/x-dtbresource+xml': { ext: ['res'] },
  'application/x-dvi': { ext: ['dvi'] },
  'application/x-envoy': { ext: ['evy'] },
  'application/x-eva': { ext: ['eva'] },
  'application/x-font-bdf': { ext: ['bdf'] },
  'application/x-font-ghostscript': { ext: ['gsf'] },
  'application/x-font-linux-psf': { ext: ['psf'] },
  'application/x-font-pcf': { ext: ['pcf'] },
  'application/x-font-snf': { ext: ['snf'] },
  'application/x-font-type1': { ext: ['pfa', 'pfb', 'pfm', 'afm'] },
  'application/x-freearc': { ext: ['arc'] },
  'application/x-futuresplash': { ext: ['spl'] },
  'application/x-gca-compressed': { ext: ['gca'] },
  'application/x-glulx': { ext: ['ulx'] },
  'application/x-gnumeric': { ext: ['gnumeric'] },
  'application/x-gramps-xml': { ext: ['gramps'] },
  'application/x-gtar': { ext: ['gtar'] },
  'application/x-hdf': { ext: ['hdf'] },
  'application/x-httpd-php': { ext: ['php'] },
  'application/x-install-instructions': { ext: ['install'] },
  'application/x-iso9660-image': { ext: ['*iso'] },
  'application/x-java-archive-diff': { ext: ['jardiff'] },
  'application/x-java-jnlp-file': { ext: ['jnlp'] },
  'application/x-latex': { ext: ['latex'] },
  'application/x-lua-bytecode': { ext: ['luac'] },
  'application/x-lzh-compressed': { ext: ['lzh', 'lha'] },
  'application/x-makeself': { ext: ['run'] },
  'application/x-ms-application': { ext: ['application'] },
  'application/x-ms-shortcut': { ext: ['lnk'] },
  'application/x-ms-wmd': { ext: ['wmd'] },
  'application/x-ms-wmz': { ext: ['wmz'] },
  'application/x-ms-xbap': { ext: ['xbap'] },
  'application/x-msaccess': { ext: ['mdb'] },
  'application/x-msbinder': { ext: ['obd'] },
  'application/x-mscardfile': { ext: ['crd'] },
  'application/x-msclip': { ext: ['clp'] },
  'application/x-msdos-program': { ext: ['*exe'] },
  'application/x-msmediaview': { ext: ['mvb', 'm13', 'm14'] },
  'application/x-msmetafile': { ext: ['*wmf', '*wmz', '*emf', 'emz'] },
  'application/x-msmoney': { ext: ['mny'] },
  'application/x-mspublisher': { ext: ['pub'] },
  'application/x-msschedule': { ext: ['scd'] },
  'application/x-msterminal': { ext: ['trm'] },
  'application/x-mswrite': { ext: ['wri'] },
  'application/x-netcdf': { ext: ['nc', 'cdf'] },
  'application/x-ns-proxy-autoconfig': { ext: ['pac'] },
  'application/x-nzb': { ext: ['nzb'] },
  'application/x-perl': { ext: ['pl', 'pm'] },
  'application/x-pilot': { ext: ['*prc', '*pdb'] },
  'application/x-pkcs12': { ext: ['p12', 'pfx'] },
  'application/x-pkcs7-certificates': { ext: ['p7b', 'spc'] },
  'application/x-pkcs7-certreqresp': { ext: ['p7r'] },
  'application/x-redhat-package-manager': { ext: ['rpm'] },
  'application/x-research-info-systems': { ext: ['ris'] },
  'application/x-sea': { ext: ['sea'] },
  'application/x-sh': { ext: ['sh'] },
  'application/x-shar': { ext: ['shar'] },
  'application/x-silverlight-app': { ext: ['xap'] },
  'application/x-sql': { ext: ['sql'] },
  'application/x-stuffit': { ext: ['sit'] },
  'application/x-stuffitx': { ext: ['sitx'] },
  'application/x-subrip': { ext: ['srt'] },
  'application/x-sv4cpio': { ext: ['sv4cpio'] },
  'application/x-sv4crc': { ext: ['sv4crc'] },
  'application/x-t3vm-image': { ext: ['t3'] },
  'application/x-tads': { ext: ['gam'] },
  'application/x-tcl': { ext: ['tcl', 'tk'] },
  'application/x-tex': { ext: ['tex'] },
  'application/x-tex-tfm': { ext: ['tfm'] },
  'application/x-texinfo': { ext: ['texinfo', 'texi'] },
  'application/x-tgif': { ext: ['obj'] },
  'application/x-ustar': { ext: ['ustar'] },
  'application/x-virtualbox-hdd': { ext: ['hdd'] },
  'application/x-virtualbox-ova': { ext: ['ova'] },
  'application/x-virtualbox-ovf': { ext: ['ovf'] },
  'application/x-virtualbox-vbox': { ext: ['vbox'] },
  'application/x-virtualbox-vbox-extpack': { ext: ['vbox-extpack'] },
  'application/x-virtualbox-vdi': { ext: ['vdi'] },
  'application/x-virtualbox-vhd': { ext: ['vhd'] },
  'application/x-virtualbox-vmdk': { ext: ['vmdk'] },
  'application/x-wais-source': { ext: ['src'] },
  'application/x-web-app-manifest+json': { ext: ['webapp'] },
  'application/x-x509-ca-cert': { ext: ['der', 'crt', 'pem'] },
  'application/x-xfig': { ext: ['fig'] },
  'application/x-xliff+xml': { ext: ['xlf'] },
  'application/x-zmachine': {
    ext: ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8']
  },
  'audio/vnd.dece.audio': { ext: ['uva', 'uvva'] },
  'audio/vnd.digital-winds': { ext: ['eol'] },
  'audio/vnd.dra': { ext: ['dra'] },
  'audio/vnd.dts': { ext: ['dts'] },
  'audio/vnd.dts.hd': { ext: ['dtshd'] },
  'audio/vnd.lucent.voice': { ext: ['lvp'] },
  'audio/vnd.ms-playready.media.pya': { ext: ['pya'] },
  'audio/vnd.nuera.ecelp4800': { ext: ['ecelp4800'] },
  'audio/vnd.nuera.ecelp7470': { ext: ['ecelp7470'] },
  'audio/vnd.nuera.ecelp9600': { ext: ['ecelp9600'] },
  'audio/vnd.rip': { ext: ['rip'] },
  'audio/x-aac': { ext: ['aac'] },
  'audio/x-aiff': { ext: ['aif', 'aiff', 'aifc'] },
  'audio/x-caf': { ext: ['caf'] },
  'audio/x-m4a': { ext: ['*m4a'] },
  'audio/x-matroska': { ext: ['mka'] },
  'audio/x-mpegurl': { ext: ['m3u'] },
  'audio/x-ms-wax': { ext: ['wax'] },
  'audio/x-pn-realaudio': { ext: ['ram', 'ra'] },
  'audio/x-pn-realaudio-plugin': { ext: ['rmp'] },
  'audio/x-realaudio': { ext: ['*ra'] },
  'audio/x-wav': { ext: ['*wav'] },
  'chemical/x-cdx': { ext: ['cdx'] },
  'chemical/x-cif': { ext: ['cif'] },
  'chemical/x-cmdf': { ext: ['cmdf'] },
  'chemical/x-cml': { ext: ['cml'] },
  'chemical/x-csml': { ext: ['csml'] },
  'chemical/x-xyz': { ext: ['xyz'] },
  'image/prs.btif': { ext: ['btif'] },
  'image/prs.pti': { ext: ['pti'] },
  'image/vnd.airzip.accelerator.azv': { ext: ['azv'] },
  'image/vnd.dece.graphic': { ext: ['uvi', 'uvvi', 'uvg', 'uvvg'] },
  'image/vnd.djvu': { ext: ['djvu', 'djv'] },
  'image/vnd.dvb.subtitle': { ext: ['*sub'] },
  'image/vnd.dwg': { ext: ['dwg'] },
  'image/vnd.dxf': { ext: ['dxf'] },
  'image/vnd.fastbidsheet': { ext: ['fbs'] },
  'image/vnd.fpx': { ext: ['fpx'] },
  'image/vnd.fst': { ext: ['fst'] },
  'image/vnd.fujixerox.edmics-mmr': { ext: ['mmr'] },
  'image/vnd.fujixerox.edmics-rlc': { ext: ['rlc'] },
  'image/vnd.microsoft.icon': { ext: ['ico'] },
  'image/vnd.ms-modi': { ext: ['mdi'] },
  'image/vnd.net-fpx': { ext: ['npx'] },
  'image/vnd.tencent.tap': { ext: ['tap'] },
  'image/vnd.valve.source.texture': { ext: ['vtf'] },
  'image/vnd.wap.wbmp': { ext: ['wbmp'] },
  'image/vnd.xiff': { ext: ['xif'] },
  'image/vnd.zbrush.pcx': { ext: ['pcx'] },
  'image/x-3ds': { ext: ['3ds'] },
  'image/x-cmu-raster': { ext: ['ras'] },
  'image/x-cmx': { ext: ['cmx'] },
  'image/x-freehand': { ext: ['fh', 'fhc', 'fh4', 'fh5', 'fh7'] },
  'image/x-jng': { ext: ['jng'] },
  'image/x-mrsid-image': { ext: ['sid'] },
  'image/x-ms-bmp': { ext: ['*bmp'] },
  'image/x-pcx': { ext: ['*pcx'] },
  'image/x-pict': { ext: ['pic', 'pct'] },
  'image/x-portable-anymap': { ext: ['pnm'] },
  'image/x-portable-bitmap': { ext: ['pbm'] },
  'image/x-portable-graymap': { ext: ['pgm'] },
  'image/x-portable-pixmap': { ext: ['ppm'] },
  'image/x-rgb': { ext: ['rgb'] },
  'image/x-tga': { ext: ['tga'] },
  'image/x-xbitmap': { ext: ['xbm'] },
  'image/x-xpixmap': { ext: ['xpm'] },
  'image/x-xwindowdump': { ext: ['xwd'] },
  'message/vnd.wfa.wsc': { ext: ['wsc'] },
  'model/vnd.collada+xml': { ext: ['dae'] },
  'model/vnd.dwf': { ext: ['dwf'] },
  'model/vnd.gdl': { ext: ['gdl'] },
  'model/vnd.gtw': { ext: ['gtw'] },
  'model/vnd.mts': { ext: ['mts'] },
  'model/vnd.opengex': { ext: ['ogex'] },
  'model/vnd.parasolid.transmit.binary': { ext: ['x_b'] },
  'model/vnd.parasolid.transmit.text': { ext: ['x_t'] },
  'model/vnd.usdz+zip': { ext: ['usdz'] },
  'model/vnd.valve.source.compiled-map': { ext: ['bsp'] },
  'model/vnd.vtu': { ext: ['vtu'] },
  'text/prs.lines.tag': { ext: ['dsc'] },
  'text/vnd.curl': { ext: ['curl'] },
  'text/vnd.curl.dcurl': { ext: ['dcurl'] },
  'text/vnd.curl.mcurl': { ext: ['mcurl'] },
  'text/vnd.curl.scurl': { ext: ['scurl'] },
  'text/vnd.dvb.subtitle': { ext: ['sub'] },
  'text/vnd.fly': { ext: ['fly'] },
  'text/vnd.fmi.flexstor': { ext: ['flx'] },
  'text/vnd.graphviz': { ext: ['gv'] },
  'text/vnd.in3d.3dml': { ext: ['3dml'] },
  'text/vnd.in3d.spot': { ext: ['spot'] },
  'text/vnd.sun.j2me.app-descriptor': { ext: ['jad'] },
  'text/vnd.wap.wml': { ext: ['wml'] },
  'text/vnd.wap.wmlscript': { ext: ['wmls'] },
  'text/x-asm': { ext: ['s', 'asm'] },
  'text/x-c': { ext: ['c', 'cc', 'cxx', 'cpp', 'h', 'hh', 'dic'] },
  'text/x-component': { ext: ['htc'] },
  'text/x-fortran': { ext: ['f', 'for', 'f77', 'f90'] },
  'text/x-handlebars-template': { ext: ['hbs'] },
  'text/x-java-source': { ext: ['java'] },
  'text/x-lua': { ext: ['lua'] },
  'text/x-markdown': { ext: ['mkd'] },
  'text/x-nfo': { ext: ['nfo'] },
  'text/x-opml': { ext: ['opml'] },
  'text/x-org': { ext: ['*org'] },
  'text/x-pascal': { ext: ['p', 'pas'] },
  'text/x-processing': { ext: ['pde'] },
  'text/x-sass': { ext: ['sass'] },
  'text/x-scss': { ext: ['scss'] },
  'text/x-setext': { ext: ['etx'] },
  'text/x-sfv': { ext: ['sfv'] },
  'text/x-suse-ymp': { ext: ['ymp'] },
  'text/x-uuencode': { ext: ['uu'] },
  'text/x-vcalendar': { ext: ['vcs'] },
  'text/x-vcard': { ext: ['vcf'] },
  'video/vnd.dece.hd': { ext: ['uvh', 'uvvh'] },
  'video/vnd.dece.mobile': { ext: ['uvm', 'uvvm'] },
  'video/vnd.dece.pd': { ext: ['uvp', 'uvvp'] },
  'video/vnd.dece.sd': { ext: ['uvs', 'uvvs'] },
  'video/vnd.dece.video': { ext: ['uvv', 'uvvv'] },
  'video/vnd.dvb.file': { ext: ['dvb'] },
  'video/vnd.fvt': { ext: ['fvt'] },
  'video/vnd.mpegurl': { ext: ['mxu', 'm4u'] },
  'video/vnd.ms-playready.media.pyv': { ext: ['pyv'] },
  'video/vnd.uvvu.mp4': { ext: ['uvu', 'uvvu'] },
  'video/vnd.vivo': { ext: ['viv'] },
  'video/x-f4v': { ext: ['f4v'] },
  'video/x-fli': { ext: ['fli'] },
  'video/x-m4v': { ext: ['m4v'] },
  'video/x-matroska': { ext: ['mkv', 'mk3d', 'mks'] },
  'video/x-mng': { ext: ['mng'] },
  'video/x-ms-vob': { ext: ['vob'] },
  'video/x-ms-wm': { ext: ['wm'] },
  'video/x-ms-wmv': { ext: ['wmv'] },
  'video/x-ms-wmx': { ext: ['wmx'] },
  'video/x-ms-wvx': { ext: ['wvx'] },
  'video/x-msvideo': { ext: ['avi'] },
  'video/x-sgi-movie': { ext: ['movie'] },
  'video/x-smv': { ext: ['smv'] },
  'x-conference/x-cooltalk': { ext: ['ice'] },
  'application/andrew-inset': { ext: ['ez'] },
  'application/applixware': { ext: ['aw'] },
  'application/atom+xml': { ext: ['atom'] },
  'application/atomcat+xml': { ext: ['atomcat'] },
  'application/atomsvc+xml': { ext: ['atomsvc'] },
  'application/bdoc': { ext: ['bdoc'] },
  'application/ccxml+xml': { ext: ['ccxml'] },
  'application/cdmi-capability': { ext: ['cdmia'] },
  'application/cdmi-container': { ext: ['cdmic'] },
  'application/cdmi-domain': { ext: ['cdmid'] },
  'application/cdmi-object': { ext: ['cdmio'] },
  'application/cdmi-queue': { ext: ['cdmiq'] },
  'application/cu-seeme': { ext: ['cu'] },
  'application/dash+xml': { ext: ['mpd'] },
  'application/davmount+xml': { ext: ['davmount'] },
  'application/docbook+xml': { ext: ['dbk'] },
  'application/dssc+der': { ext: ['dssc'] },
  'application/dssc+xml': { ext: ['xdssc'] },
  'application/ecmascript': { ext: ['ecma', 'es'] },
  'application/emma+xml': { ext: ['emma'] },
  'application/epub+zip': { ext: ['epub'] },
  'application/exi': { ext: ['exi'] },
  'application/font-tdpfr': { ext: ['pfr'] },
  'application/geo+json': { ext: ['geojson'] },
  'application/gml+xml': { ext: ['gml'] },
  'application/gpx+xml': { ext: ['gpx'] },
  'application/gxf': { ext: ['gxf'] },
  'application/hjson': { ext: ['hjson'] },
  'application/hyperstudio': { ext: ['stk'] },
  'application/inkml+xml': { ext: ['ink', 'inkml'] },
  'application/ipfix': { ext: ['ipfix'] },
  'application/java-archive': { ext: ['jar', 'war', 'ear'] },
  'application/java-serialized-object': { ext: ['ser'] },
  'application/java-vm': { ext: ['class'] },
  'application/javascript': { ext: ['js', 'mjs'] },
  'application/json': { ext: ['json', 'map'] },
  'application/json5': { ext: ['json5'] },
  'application/jsonml+json': { ext: ['jsonml'] },
  'application/ld+json': { ext: ['jsonld'] },
  'application/lost+xml': { ext: ['lostxml'] },
  'application/mac-binhex40': { ext: ['hqx'] },
  'application/mac-compactpro': { ext: ['cpt'] },
  'application/mads+xml': { ext: ['mads'] },
  'application/manifest+json': { ext: ['webmanifest'] },
  'application/marc': { ext: ['mrc'] },
  'application/marcxml+xml': { ext: ['mrcx'] },
  'application/mathematica': { ext: ['ma', 'nb', 'mb'] },
  'application/mathml+xml': { ext: ['mathml'] },
  'application/mbox': { ext: ['mbox'] },
  'application/mediaservercontrol+xml': { ext: ['mscml'] },
  'application/metalink+xml': { ext: ['metalink'] },
  'application/metalink4+xml': { ext: ['meta4'] },
  'application/mets+xml': { ext: ['mets'] },
  'application/mods+xml': { ext: ['mods'] },
  'application/mp21': { ext: ['m21', 'mp21'] },
  'application/mp4': { ext: ['mp4s', 'm4p'] },
  'application/msword': { ext: ['doc', 'dot'] },
  'application/n-quads': { ext: ['nq'] },
  'application/n-triples': { ext: ['nt'] },
  'application/octet-stream': {
    ext: [
      'bin', 'dms', 'lrf', 'mar', 'so', 'dist', 'distz', 'pkg', 'bpk', 'dump',
      'elc', 'deploy', 'exe', 'dll', 'deb', 'dmg', 'iso', 'img', 'msi', 'msp',
      'msm', 'buffer']
  },
  'application/oda': { ext: ['oda'] },
  'application/oebps-package+xml': { ext: ['opf'] },
  'application/ogg': { ext: ['ogx'] },
  'application/omdoc+xml': { ext: ['omdoc'] },
  'application/onenote': { ext: ['onetoc', 'onetoc2', 'onetmp', 'onepkg'] },
  'application/oxps': { ext: ['oxps'] },
  'application/patch-ops-error+xml': { ext: ['xer'] },
  'application/pdf': { ext: ['pdf'] },
  'application/pgp-encrypted': { ext: ['pgp'] },
  'application/pgp-signature': { ext: ['asc', 'sig'] },
  'application/pics-rules': { ext: ['prf'] },
  'application/pkcs10': { ext: ['p10'] },
  'application/pkcs7-mime': { ext: ['p7m', 'p7c'] },
  'application/pkcs7-signature': { ext: ['p7s'] },
  'application/pkcs8': { ext: ['p8'] },
  'application/pkix-attr-cert': { ext: ['ac'] },
  'application/pkix-cert': { ext: ['cer'] },
  'application/pkix-crl': { ext: ['crl'] },
  'application/pkix-pkipath': { ext: ['pkipath'] },
  'application/pkixcmp': { ext: ['pki'] },
  'application/pls+xml': { ext: ['pls'] },
  'application/pskc+xml': { ext: ['pskcxml'] },
  'application/raml+yaml': { ext: ['raml'] },
  'application/rdf+xml': { ext: ['rdf', 'owl'] },
  'application/reginfo+xml': { ext: ['rif'] },
  'application/relax-ng-compact-syntax': { ext: ['rnc'] },
  'application/resource-lists+xml': { ext: ['rl'] },
  'application/resource-lists-diff+xml': { ext: ['rld'] },
  'application/rls-services+xml': { ext: ['rs'] },
  'application/rpki-ghostbusters': { ext: ['gbr'] },
  'application/rpki-manifest': { ext: ['mft'] },
  'application/rpki-roa': { ext: ['roa'] },
  'application/rsd+xml': { ext: ['rsd'] },
  'application/rss+xml': { ext: ['rss'] },
  'application/sbml+xml': { ext: ['sbml'] },
  'application/scvp-cv-request': { ext: ['scq'] },
  'application/scvp-cv-response': { ext: ['scs'] },
  'application/scvp-vp-request': { ext: ['spq'] },
  'application/scvp-vp-response': { ext: ['spp'] },
  'application/sdp': { ext: ['sdp'] },
  'application/set-payment-initiation': { ext: ['setpay'] },
  'application/set-registration-initiation': { ext: ['setreg'] },
  'application/shf+xml': { ext: ['shf'] },
  'application/sieve': { ext: ['siv', 'sieve'] },
  'application/smil+xml': { ext: ['smi', 'smil'] },
  'application/sparql-query': { ext: ['rq'] },
  'application/sparql-results+xml': { ext: ['srx'] },
  'application/srgs': { ext: ['gram'] },
  'application/srgs+xml': { ext: ['grxml'] },
  'application/sru+xml': { ext: ['sru'] },
  'application/ssdl+xml': { ext: ['ssdl'] },
  'application/ssml+xml': { ext: ['ssml'] },
  'application/tei+xml': { ext: ['tei', 'teicorpus'] },
  'application/thraud+xml': { ext: ['tfi'] },
  'application/timestamped-data': { ext: ['tsd'] },
  'application/voicexml+xml': { ext: ['vxml'] },
  'application/widget': { ext: ['wgt'] },
  'application/winhlp': { ext: ['hlp'] },
  'application/wsdl+xml': { ext: ['wsdl'] },
  'application/wspolicy+xml': { ext: ['wspolicy'] },
  'application/xaml+xml': { ext: ['xaml'] },
  'application/xcap-diff+xml': { ext: ['xdf'] },
  'application/xenc+xml': { ext: ['xenc'] },
  'application/xhtml+xml': { ext: ['xhtml', 'xht'] },
  'application/xml-dtd': { ext: ['dtd'] },
  'application/xop+xml': { ext: ['xop'] },
  'application/xproc+xml': { ext: ['xpl'] },
  'application/xslt+xml': { ext: ['xslt'] },
  'application/xspf+xml': { ext: ['xspf'] },
  'application/xv+xml': { ext: ['mxml', 'xhvml', 'xvml', 'xvm'] },
  'application/yang': { ext: ['yang'] },
  'application/yin+xml': { ext: ['yin'] },
  'audio/3gpp': { ext: ['*3gpp'] },
  'audio/adpcm': { ext: ['adp'] },
  'audio/basic': { ext: ['au', 'snd'] },
  'audio/mp3': { ext: ['*mp3'] },
  'audio/mp4': { ext: ['m4a', 'mp4a'] },
  'audio/s3m': { ext: ['s3m'] },
  'audio/silk': { ext: ['sil'] },
  'audio/wav': { ext: ['wav'] },
  'audio/wave': { ext: ['*wav'] },
  'audio/webm': { ext: ['weba'] },
  'audio/xm': { ext: ['xm'] },
  'font/collection': { ext: ['ttc'] },
  'image/aces': { ext: ['exr'] },
  'image/apng': { ext: ['apng'] },
  'image/cgm': { ext: ['cgm'] },
  'image/dicom-rle': { ext: ['drle'] },
  'image/emf': { ext: ['emf'] },
  'image/fits': { ext: ['fits'] },
  'image/g3fax': { ext: ['g3'] },
  'image/heic': { ext: ['heic'] },
  'image/heic-sequence': { ext: ['heics'] },
  'image/heif': { ext: ['heif'] },
  'image/heif-sequence': { ext: ['heifs'] },
  'image/ief': { ext: ['ief'] },
  'image/jls': { ext: ['jls'] },
  'image/jp2': { ext: ['jp2', 'jpg2'] },
  'image/jpm': { ext: ['jpm'] },
  'image/jpx': { ext: ['jpx', 'jpf'] },
  'image/jxr': { ext: ['jxr'] },
  'image/png': { ext: ['png'] },
  'image/sgi': { ext: ['sgi'] },
  'image/svg+xml': { ext: ['svg', 'svgz'] },
  'image/t38': { ext: ['t38'] },
  'image/tiff-fx': { ext: ['tfx'] },
  'image/wmf': { ext: ['wmf'] },
  'message/disposition-notification': { ext: ['disposition-notification'] },
  'message/global': { ext: ['u8msg'] },
  'message/global-delivery-status': { ext: ['u8dsn'] },
  'message/global-disposition-notification': { ext: ['u8mdn'] },
  'message/global-headers': { ext: ['u8hdr'] },
  'message/rfc822': { ext: ['eml', 'mime'] },
  'model/3mf': { ext: ['3mf'] },
  'model/gltf+json': { ext: ['gltf'] },
  'model/gltf-binary': { ext: ['glb'] },
  'model/iges': { ext: ['igs', 'iges'] },
  'model/mesh': { ext: ['msh', 'mesh', 'silo'] },
  'model/stl': { ext: ['stl'] },
  'model/vrml': { ext: ['wrl', 'vrml'] },
  'model/x3d+binary': { ext: ['*x3db', 'x3dbz'] },
  'model/x3d+fastinfoset': { ext: ['x3db'] },
  'model/x3d+vrml': { ext: ['*x3dv', 'x3dvz'] },
  'model/x3d+xml': { ext: ['x3d', 'x3dz'] },
  'model/x3d-vrml': { ext: ['x3dv'] },
  'text/cache-manifest': { ext: ['appcache', 'manifest'] },
  'text/calendar': { ext: ['ics', 'ifb'] },
  'text/coffeescript': { ext: ['coffee', 'litcoffee'] },
  'text/css': { ext: ['css'] },
  'text/csv': { ext: ['csv'] },
  'text/html': { ext: ['html', 'htm', 'shtml'] },
  'text/jade': { ext: ['jade'] },
  'text/jsx': { ext: ['jsx'] },
  'text/less': { ext: ['less'] },
  'text/markdown': { ext: ['markdown', 'md'] },
  'text/mathml': { ext: ['mml'] },
  'text/mdx': { ext: ['mdx'] },
  'text/n3': { ext: ['n3'] },
  'text/richtext': { ext: ['rtx'] },
  'text/rtf': { ext: ['*rtf'] },
  'text/sgml': { ext: ['sgml', 'sgm'] },
  'text/shex': { ext: ['shex'] },
  'text/slim': { ext: ['slim', 'slm'] },
  'text/stylus': { ext: ['stylus', 'styl'] },
  'text/tab-separated-values': { ext: ['tsv'] },
  'text/troff': { ext: ['t', 'tr', 'roff', 'man', 'me', 'ms'] },
  'text/turtle': { ext: ['ttl'] },
  'text/uri-list': { ext: ['uri', 'uris', 'urls'] },
  'text/vcard': { ext: ['vcard'] },
  'text/vtt': { ext: ['vtt'] },
  'text/xml': { ext: ['*xml'] },
  'text/yaml': { ext: ['yaml', 'yml'] },
  'video/3gpp': { ext: ['3gp', '3gpp'] },
  'video/3gpp2': { ext: ['3g2'] },
  'video/h261': { ext: ['h261'] },
  'video/h263': { ext: ['h263'] },
  'video/h264': { ext: ['h264'] },
  'video/jpeg': { ext: ['jpgv'] },
  'video/jpm': { ext: ['*jpm', 'jpgm'] },
  'video/mj2': { ext: ['mj2', 'mjp2'] },
  'video/mp4': { ext: ['mp4', 'mp4v', 'mpg4'] },
  'video/webm': { ext: ['webm'] }
}

Mime.MimeType = MimeType
Mime.db = mimeDB
module.exports = Mime
