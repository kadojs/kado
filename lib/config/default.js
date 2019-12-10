'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const path = require('path')

module.exports = {
  dev: null,
  title: 'Kado',
  pageTitle: 'Kado',
  name: 'kado',
  instanceName: null,
  autoSaveInstance: true,
  userModuleFolderName: 'kado_modules',
  version: require(__dirname + '/../../package.json').version,
  log: {
    dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
  },
  //interface options that got moved
  baseUrl: '',
  viewCache: true,
  view: {},
  library: [],
  libraryPaths: [],
  scriptServer: [],
  staticRoot: [],
  addCss: [],
  removeCss: [],
  addScript: [],
  removeScript: [],
  languagePacks: [
    path.resolve(__dirname + '/../../lang/eng.js'),
    path.resolve(__dirname + '/../..//lang/spa.js'),
  ],
  override: {
    languagePacks: [],
    lang: {},
    library: [],
    libraryPaths: [],
    nav: {},
    permission: {allowed: {}, available: []},
    uri: {},
    view: {}
  },
  //search support
  search: {
    enabled: false
  },
  //session support
  session: {
    enabled: false,
    enableFlash: false,
    enableLogin: false,
    allowedUri: [], //when login required, still let the public use these
    tableModel: null,
    cookie: {
      secret: 'kado',
      maxAge: 2592000000
    }
  },
  //view rendering support
  render: {
    enabled: false,
    mustache: {
      enabled: false,
      root: path.resolve(__dirname + '/../view/mustache.js')
    }
  },
  //dynamic connectors
  connector: {
    stretchfs: {
      load: false,
      root: path.resolve(__dirname + '/../connector/stretchfs.js'),
      callback: {
        method: 'post',
        url: 'http://localhost:8160/file/jobUpdate',
        rejectUnauthorized: false
      },
      referrer: ['localhost'],
      domain: 'localhost:8162',
      token: 'changeme',
      host: 'localhost',
      port: 8161,
      username: '',
      password: ''
    }
  },
  //database connectors
  db: {
    modelInit: null,
    sequelize: {
      enabled: false,
      load: false,
      root: path.resolve(__dirname + '/../db/sequelize.js'),
      skipConnect: false,
      name: 'kado',
      host: '127.0.0.1',
      port: 3306,
      user: '',
      password: '',
      logging: false,
      skipLoggingTable: ['Session'],
      benchmark: false,
      slowQueryTime: 10000,
      dialect: 'mysql',
      options: {}
    }
  },
  //email connectors
  emailConfig: {
    notifyTo: 'Kado <kado@localhost>',
    notifyCc: '',
    replyTo: 'Kado <kado@localhost>',
    defaultFrom: 'Kado <kado@localhost>',
    defaultSubject: 'Email from Kado',
    log:{
      enable: false,
      file: '/var/log/emailinfo'
    }
  },
  email: {
    emailjs: {
      enabled: false,
      load: true,
      root: path.resolve(__dirname + '/../email/emailjs.js'),
      user: 'kado@localhost',
      password: '',
      host: 'localhost',
      port: null,
      ssl: false,
      tls: false,
      timeout: null
    }
  },
  module: {
    kado: {
      enabled: true,
      root: path.resolve(__dirname + '/../../kado_modules/kado/kado.js')
    }
  }
}