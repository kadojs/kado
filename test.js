'use strict';
let K = require('./index')
K.configure({
  root: __dirname,
  db: {
    sequelize: {
      enabled: true,
      user: 'kado',
      password: 'kado',
    }
  },
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
K.go('Test')
