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


//tui-viewer
require('markdown-it');
require('to-mark/dist/to-mark');
require('codemirror/lib/codemirror.js');
require('highlight.js/lib/highlight.js');
require('squire-rte/build/squire-raw.js');
require('tui-code-snippet/dist/tui-code-snippet');
toWindow('TuiViewer',require('tui-editor/dist/tui-editor-Viewer.js'));
