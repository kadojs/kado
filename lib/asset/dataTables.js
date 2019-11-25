'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

/**
 * Set var to window
 * @param {string} name
 * @param {*} val
 */
let toWindow = (name,val) => {
  window[name] = val
}

//datatables)
toWindow('pdfmake',require('pdfmake/build/pdfmake.js'));
require('datatables.net-bs4')(window,$);
require('datatables.net-buttons/js/dataTables.buttons.js')(window,$);
require('datatables.net-buttons-bs4')(window,$);
require('datatables.net-buttons/js/buttons.colVis.js')(window,$);
require('datatables.net-buttons/js/buttons.flash.js')(window,$);
require('datatables.net-buttons/js/buttons.html5.js')(window,$);
require('datatables.net-buttons/js/buttons.print.js')(window,$);
require('datatables.net-colreorder-bs4')(window,$);
require('datatables.net-fixedcolumns-bs4')(window,$);
require('datatables.net-fixedheader-bs4')(window,$);
require('datatables.net-keytable')(window,$);
require('datatables.net-responsive-bs4')(window,$);
require('datatables.net-rowreorder-bs4')(window,$);
require('datatables.net-select-bs4')(window,$);
require('jszip/dist/jszip');
require('pdfmake/build/vfs_fonts');
