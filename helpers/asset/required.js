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

//headless dependencies
toWindow('$',require('jquery'))
toWindow('jQuery',window.$)
toWindow('jquery',window.$)

//global dependencies
toWindow('base64js',require('base64-js'))
toWindow('b64',window.base64js)

