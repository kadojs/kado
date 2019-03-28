$(document).ready(() => {
  let editor = {}
  $('.tui-content').each(function(){
    var element = $(this)
    var elId = '#' + element.attr('id')
    editor[elId] = new TuiEditor({
      el: document.querySelector(elId),
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      height: '400px',
      codeBlockLanguages: ['ruby','PHP','javascript'],
      initialValue: new TextDecoder().decode(b64.toByteArray(element.attr('data-src'))),
      events: {
        change: () => {
          $(element.attr('data-text-id')).val(editor[elId].getMarkdown())
          $(element.attr('data-html-id')).val(editor[elId].getHtml())
        }
      }
    })
  })
})
