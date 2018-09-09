'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
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
