'use strict';
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
