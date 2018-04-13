'use strict';


/**
 * Set var to window
 * @param {string} name
 * @param {*} val
 */
var toWindow = function(name,val){
  window[name] = val
}

//jquery
var jQuery = require('jquery')
toWindow('$',jQuery)
toWindow('jQuery',jQuery)

//headless dependencies
require('bootstrap')
require('bootstrap-select')
require('chart.js')
require('jquery-ui')

//global dependencies
toWindow('bootbox',require('bootbox'))
toWindow('Ladda',require('ladda'))
toWindow('prettyBytes',require('pretty-bytes'))
toWindow('querystring',require('qs'))

//jquery plugins
require('../../../helpers/js/jqueryAnimateNumber.min')

//staff space
require('../../../helpers/js/dashboard')
require('../../../helpers/js/sidebar')
require('../../../helpers/js/table')
