'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

let height2;
let htmlBodyHeightUpdate = () => {
  let height3 = $(window).height();
  let height1 = $('.nav').height()+50;
  height2 = $('.main').height();
  if(height2 > height3){
    $('html').height(Math.max(height1,height3,height2)+10);
    $('body').height(Math.max(height1,height3,height2)+10);
  }
  else
  {
    $('html').height(Math.max(height1,height3,height2));
    $('body').height(Math.max(height1,height3,height2));
  }

}
$(document).ready(() => {
  htmlBodyHeightUpdate()
  $( window ).resize(() => {htmlBodyHeightUpdate()});
  $( window ).scroll(() => {
    height2 = $('.main').height()
    htmlBodyHeightUpdate()
  });
});
