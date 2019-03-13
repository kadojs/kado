$(document).ready(() => {
  $('.tui-content').each(function(){
    var element = $(this)
    var elId = '#' + element.attr('id')
    var editor = new TuiViewer({
      el: document.querySelector(elId),
      initialValue: new TextDecoder().decode(base64js.toByteArray(element.attr('data-src')))
    })
    editor.ok = true
  })
})
