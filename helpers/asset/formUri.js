'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
$(document).ready(() => {
  $('input[data-uri]').each(function(){
    let titleEl = $(this);
    let uriEl = $('#' + titleEl.attr('data-uri'));
    let uriEmpty = uriEl.val() === '';
    let updateUri = () => {
      let title = titleEl.val();
      let uri = title.replace(/[\s]+/g,'-').toLowerCase();
      if(uriEmpty) uriEl.val(uri);
    }
    titleEl.keyup(updateUri);
    titleEl.change(updateUri);
    titleEl.focusout(updateUri);
  })
})
