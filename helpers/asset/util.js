'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

window._printDate = function _printDate(d){
  if(!(d instanceof Date)) d = new Date(d)
  return d ? moment(d).format('YYYY-MM-DD hh:mm:ssA') :  'Never'
}

window._printSetting = function _printSetting(text,type,row){
  return text + '<div class="text-muted"><small><span>' + row.path + '</span></small>'
}

window._isActive = function _isActive(text){
  let icon = ('true' === text || true === text) ? 'check' : 'times'
  return '<span class="fa fa-' + icon + '">&nbsp;</span>'
}
