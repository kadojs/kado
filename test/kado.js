'use strict';
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

describe('kado',function(){
  //load the subsystem tests
  require('./Asset.test')
  require('./CommandServer.test')
  require('./Connector.test')
  require('./Cron.test')
  require('./Database.test')
  require('./Email.test')
  require('./Event.test')
  require('./GetOpt.test')
  require('./History.test')
  require('./HyperText.test')
  require('./Language.test')
  require('./Library.test')
  require('./Logger.test')
  require('./Mapper.test')
  require('./Message.test')
  require('./Navigation.test')
  require('./Permission.test')
  require('./Profiler.test')
  require('./Router.test')
  require('./Search.test')
  require('./Util.test')
  require('./View.test')
})
