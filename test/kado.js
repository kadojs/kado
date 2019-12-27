'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
  require('./History.test')
  require('./HyperText.test')
  require('./Language.test')
  require('./Library.test')
  require('./Logger.test')
  require('./Message.test')
  require('./Navigation.test')
  require('./Permission.test')
  require('./Profiler.test')
  require('./Router.test')
  require('./Search.test')
  require('./Util.test')
  require('./View.test')
})
