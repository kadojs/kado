'use strict';

window._printDate = function _printDate(d,emptyString){
  return (
    d ? moment(d).format('YYYY-MM-DD hh:mm:ssA')
      : ('string' === typeof emptyString) ? emptyString : 'Never'
  )
}

window._printSetting = function _printSetting(text,type,row){
  return text + '<div class="text-muted"><small><span>' + row.path + '</span></small>'
}

window._isActive = function _isActive(text){
  let icon = ('true' === text || true === text) ? 'check' : 'remove'
  return '<span class="glyphicon glyphicon-' + icon + '">&nbsp;</span>'
}
