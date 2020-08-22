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
const focus = new RegExp((process.env.FOCUS || '.') + '', 'i')
const suites = [
  // early tests
  'TestRunner',
  // normal tests
  'Asset',
  'Assert',
  'BigInteger',
  'ChildProcess',
  'Cluster',
  'CommandServer',
  'Connect',
  'Cron',
  'Database',
  'Email',
  'ETag',
  'Event',
  'FileSystem',
  'Format',
  'GetOpt',
  'History',
  'HyperText',
  'Language',
  'Library',
  'Lifecycle',
  'Log',
  'Mapper',
  'Message',
  'Mime',
  'Model',
  'Module',
  'Multipart',
  'Mustache',
  'Navigation',
  'Parser',
  'PathExp',
  'Permission',
  'Profiler',
  'PromiseMore',
  'Query',
  'QueryCache',
  'Router',
  'Schema',
  'Search',
  'Session',
  'Stream',
  'Util',
  'Validate',
  'View',
  // late tests
  'Application'
]
const runnableSuites = suites.filter(fn => (fn.search(focus) > -1))
for (const suite of runnableSuites) require(`./${suite}.test.js`)
runner.execute().then(code => process.exit(code))
