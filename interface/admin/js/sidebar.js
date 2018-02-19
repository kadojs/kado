var height2;
function htmlBodyHeightUpdate(){
  var height3 = $(window).height();
  var height1 = $('.nav').height()+50;
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
$(document).ready(function(){
  htmlBodyHeightUpdate()
  $( window ).resize(function(){
    htmlBodyHeightUpdate()
  });
  $( window ).scroll(function(){
    height2 = $('.main').height()
    htmlBodyHeightUpdate()
  });
});
