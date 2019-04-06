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

//extra
require('jquery-ui')
require('bootstrap')
require('bootstrap-select')
toWindow('moment',require('moment'))
toWindow('Holder',require('holderjs'))
toWindow('querystring',require('qs'))
toWindow('prettyBytes',require('pretty-bytes'))

//panel plugins
require('../../../helpers/asset/DataTableConfig')
require('../../../helpers/asset/util')

//page holder
$(document).ready(function(){
  Holder.addTheme('thumb', {
    bg: '#55595c',
    fg: '#eceeef',
    text: 'Thumbnail'
  })
})
