/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const focus = new RegExp((process.env.FOCUS || '.') + '', 'i')
const suites = [
  // early tests
  'TestRunner',
  // normal tests
  'Asset',
  'Assert',
  'Archive',
  'Bundle',
  'BundleIntegration',
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
  'GeoIP',
  'GetOpt',
  'History',
  'HyperText',
  'Language',
  'Library',
  'License',
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
  'Network',
  'Parser',
  'PathExp',
  'Permission',
  'Profiler',
  'PromiseMore',
  'Query',
  'QueryCache',
  'RequestEngine',
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
