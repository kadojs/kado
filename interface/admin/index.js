'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
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
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'admin'
K.iface.master(K,interfaceName,interfaceRoot).then((master) => {
  if(require.main === module){
    K.infant.child(
      K.config.name + ':' + interfaceName + ':master',
      (done) => {
        master.start(done)
      },
      (done) => {
        master.stop(done)
      }
    )
  }
})
