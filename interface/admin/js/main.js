'use strict';


/**
 * Set var to window
 * @param {string} name
 * @param {*} val
 */
let toWindow = function(name,val){
  window[name] = val
}

//jquery
let $ = require('jquery')

toWindow('$',$)
toWindow('jQuery',$)

//headless dependencies
require('bootstrap')
require('bootstrap-select')
require('chart.js')
require('jquery-ui')
require('datatables.net')(window,$)
require('datatables.net-bs')(window,$)
require('datatables.net-select-bs')(window,$)
require('datatables.net-buttons')(window,$)
require('datatables.net-buttons-bs')(window,$)

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
