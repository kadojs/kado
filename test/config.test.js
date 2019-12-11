'use strict';

module.exports = {
  port: 3000,
  host: null,
  db: {
    sequelize: {
      load: true,
      enabled: true,
      user: 'kado',
      password: 'kado',
      name: 'kado'
    }
  }
}
