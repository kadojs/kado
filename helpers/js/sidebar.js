let height2;
htmlBodyHeightUpdate() => {
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
