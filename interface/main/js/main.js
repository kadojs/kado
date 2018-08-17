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
toWindow('moment',require('moment'))

//global dependencies
toWindow('bootbox',require('bootbox'))
toWindow('Ladda',require('ladda'))
toWindow('prettyBytes',require('pretty-bytes'))
toWindow('querystring',require('qs'))

//datatables)
toWindow('pdfmake',require('pdfmake/build/pdfmake.min.js'));
require('datatables.net-bs')(window,$);
require('datatables.net-buttons/js/dataTables.buttons.js')(window,$);
require('datatables.net-buttons-bs')(window,$);
require('datatables.net-buttons/js/buttons.colVis.js')(window,$);
require('datatables.net-buttons/js/buttons.flash.js')(window,$);
require('datatables.net-buttons/js/buttons.html5.js')(window,$);
require('datatables.net-buttons/js/buttons.print.js')(window,$);
require('datatables.net-colreorder-bs')(window,$);
require('datatables.net-fixedcolumns-bs')(window,$);
require('datatables.net-fixedheader-bs')(window,$);
require('datatables.net-keytable')(window,$);
require('datatables.net-responsive-bs')(window,$);
require('datatables.net-rowreorder-bs')(window,$);
require('datatables.net-select-bs')(window,$);

//jquery plugins
require('../../../helpers/js/jqueryAnimateNumber.min')

//staff space
require('../../../helpers/js/dashboard')
require('../../../helpers/js/table')
require('../../../helpers/js/util')
