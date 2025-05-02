/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The purpose of this file is to provide a centralized entry point for
 * importing all the core modules of the Kado framework. While direct
 * imports like `import Application from 'kado/lib/Application'` are
 * possible, having an index file allows for a cleaner and more organized
 * import structure. It simplifies the import statements for users by
 * allowing them to import multiple modules from a single source,
 * enhancing usability and maintainability. This approach also allows
 * for easier refactoring and management of module exports in the
 * future.
 */

// Core
const Application = require('./Application')
const Assert = require('./Assert')
const FileSystem = require('./FileSystem')
const Log = require('./Log')

// Data & Utilities
const Archive = require('./Archive')
const Asset = require('./Asset')
const BigInteger = require('./BigInteger')
const Format = require('./Format')
const Mapper = require('./Mapper')
const Util = require('./Util')

// Network & Processing
const ChildProcess = require('./ChildProcess')
const Cluster = require('./Cluster')
const Connect = require('./Connect')
const HyperText = require('./HyperText')
const Network = require('./Network')

// Database & Storage
const Database = require('./Database')
const Model = require('./Model')
const Query = require('./Query')
const Schema = require('./Schema')

// Web Framework
const CommandServer = require('./Command').CommandServer
const Router = require('./Router')
const Session = require('./Session')
const View = require('./View')

module.exports = {
  Application,
  Archive,
  Assert,
  Asset,
  BigInteger,
  ChildProcess,
  Cluster,
  CommandServer,
  Connect,
  Database,
  FileSystem,
  Format,
  HyperText,
  Log,
  Mapper,
  Model,
  Network,
  Query,
  Router,
  Schema,
  Session,
  Util,
  View
}
