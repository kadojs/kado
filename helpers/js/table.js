var checkboxToggle = true
$('#toggle').click(function(){
  $('table.table td input').prop('checked',checkboxToggle)
  checkboxToggle = !checkboxToggle
})
$('#tableDelete').click(function(){
  if(!confirm('Are you sure you want to delete these items?')){
    return false
  }
})
$(document).ready(function(){
  $('[rel=tooltip]').tooltip()
})


