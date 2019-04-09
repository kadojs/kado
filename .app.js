'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
let K = require('./index')
K.configure({
  root: __dirname,
  interface: {
    admin: { enabled: true },
    main: { enabled: true }
  },
  module: {
    blog: { enabled: true },
    content: { enabled: true },
    doc: { enabled: true },
    setting: { enabled: true },
    staff: { enabled: true }
  }
})
K.go('Kado Core Thin')
