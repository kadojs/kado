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
const typeMap = {
  'application/vnd.tcpdump.pcap': {
    magic: { bytes: [[0xD4, 0xC3, 0xB2, 0xA1], [0xA1, 0xB2, 0xC3, 0xD4]]
    },
    ext: ['pcap']
  },

  'text/plain': {
    magic: { bytes: ['\u0f0f', '\u0f0f'] },
    ext: ['txt', 'text']
  },
  'application/x-nintendo-nes-rom': {
    magic: { bytes: [[0x4E, 0x45, 0x53, 0x1A]] },
    ext: ['nes']
  },
  'application/x-7z-compressed': {
    magic: { bytes: [[0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]] },
    ext: ['7z']
  },
  'application/x-rar-compressed': {
    magic: { bytes: [[0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]] },
    ext: ['rar']
  },
  'application/x-apple-diskimage': {
    magic: { bytes: [[0x78, 0x01]] },
    ext: ['dmg']
  },
  'application/x-msdownload': {
    magic: { bytes: [[0x4D, 0x5A]] },
    ext: ['exe']
  },
  'application/postscript': {
    magic: { bytes: [[0x25, 0x21]] },
    ext: ['ps']
  },
  'application/x-compress': {
    magic: { bytes: [[0x1F, 0xA0], [0x1F, 0x9D]] },
    ext: ['z']
  },
  'image/jpeg': {
    magic: { bytes: [[0xFF, 0xD8, 0xFF]] },
    ext: ['jpg']
  },
  'image/vnd.ms-photo': {
    magic: { bytes: [[0x49, 0x49, 0xBC]] },
    ext: ['jxr']
  },
  'application/gzip': {
    magic: { bytes: [[0x1F, 0x8B, 0x8]] },
    ext: ['gz']
  },
  'image/gif': {
    magic: { bytes: [[0x47, 0x49, 0x46]] },
    ext: ['gif']
  },
  'audio/opus': {
    magic: { bytes: [[0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64]] },
    ext: ['opus']
  },
  'video/ogg': {
    magic: { bytes: [[0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61]] },
    ext: ['ogv']
  },
  'image/bpg': {
    magic: { bytes: [[0x42, 0x50, 0x47, 0xFB]] },
    ext: ['bpg']
  },
  'application/wasm': {
    magic: { bytes: [[0x00, 0x61, 0x73, 0x6D]] },
    ext: ['wasm']
  },
  'image/x-canon-cr2': {
    magic: { bytes: [[0x49, 0x49, 0x2A, 0x0]] },
    ext: ['cr2']
  },
  'image/x-nikon-nef': {
    magic: { bytes: [[0x1C, 0x00, 0xFE, 0x00]], [[8]] },
    ext: ['nef']
  },
  'image/tiff': {
    magic: { bytes: [[0x4D, 0x4D, 0x0, 0x2A]] },
    ext: ['tif']
  },
  'application/x-rpm': {
    magic: { bytes: [[0xED, 0xAB, 0xEE, 0xDB]] },
    ext: ['rpm']
  },
  'font/otf': {
    magic: { bytes: [[0x4F, 0x54, 0x54, 0x4F, 0x00]] },
    ext: ['otf']
  },
  'video/x-flv': {
    magic: { bytes: [[0x46, 0x4C, 0x56, 0x01]] },
    ext: ['flv']
  },
  'application/x-xz': {
    magic: { bytes: [[0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00]] },
    ext: ['xz']
  },
  'application/x-apache-arrow': {
    magic: { bytes: [[0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00]] },
    ext: ['arrow']
  }

}

const magicMap = {
  'text/plain': { string: ['text'] },
  'text/javascript': { string: ['js'] },
  'application/vnd.tcpdump.pcap': {
    bytes: [[0xD4, 0xC3, 0xB2, 0xA1], [0xA1, 0xB2, 0xC3, 0xD4]]
  },
  'application/x-nintendo-nes-rom': { bytes: [[0x4E, 0x45, 0x53, 0x1A]] },
  'application/x-7z-compressed': {
    bytes: [[0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]]
  },
  'application/x-rar-compressed': {
    bytes: [[0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]]
  },
  'application/x-apple-diskimage': { bytes: [[0x78, 0x01]] },
  'application/x-msdownload': { bytes: [[0x4D, 0x5A]] },
  'application/postscript': { bytes: [[0x25, 0x21]] },
  'application/x-compress': { bytes: [[0x1F, 0xA0], [0x1F, 0x9D]] },
  'image/jpeg': { bytes: [[0xFF, 0xD8, 0xFF]] },
  'image/vnd.ms-photo': { bytes: [[0x49, 0x49, 0xBC]] },
  'application/gzip': { bytes: [[0x1F, 0x8B, 0x8]] },
  'image/gif': { bytes: [[0x47, 0x49, 0x46]] },
  'audio/opus': { bytes: [[0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64]] },
  'video/ogg': { bytes: [[0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61]] },
  'image/bpg': { bytes: [[0x42, 0x50, 0x47, 0xFB]] },
  'application/wasm': { bytes: [[0x00, 0x61, 0x73, 0x6D]] },
  'image/x-canon-cr2': { bytes: [[0x49, 0x49, 0x2A, 0x0]] },
  'image/x-nikon-nef': { bytes: [[0x1C, 0x00, 0xFE, 0x00, offset: 8 ]], },
  'image/tiff': { bytes: [[0x4D, 0x4D, 0x0, 0x2A]] },
  'application/x-rpm': { bytes: [[0xED, 0xAB, 0xEE, 0xDB]] },
  'font/otf': { bytes: [[0x4F, 0x54, 0x54, 0x4F, 0x00]] },
  'video/x-flv': { bytes: [[0x46, 0x4C, 0x56, 0x01]] },
  'application/x-xz': { bytes: [[0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00]] },
  'application/x-apache-arrow': {
    bytes: [[0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00]] },
  'model/gltf-binary': {
    bytes: [[0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00]] },
}
