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
$(document).ready(function(){
  $('#table').DataTable({
    processing: true,
    serverSide: true,
    ajax: window.location.href,
    columns: function(){
      let cols = []
      $('#table th').each(function(i){
        cols.push({
          name: $(this).text(),
          data: $(this).attr('data-name'),
          target: i
        })
      })
      console.log(cols)
      return cols
    }()
  });
})

