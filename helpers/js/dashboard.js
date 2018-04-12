var commaSepStep = $.animateNumber.numberStepFactories.separator(',')
var updateStat = function(id,num){
  $('#' + id).animateNumber(
    {number: num,numberStep: commaSepStep},
    1000,
    function(){
      $('#' + id).prop('number',num)
    }
  )
}
var updateSize = function(id,num){
  var parts = num.split(' ')
  var size = parts[0]
  var label = parts[1]
  $('#' + id + 'Count').animateNumber(
    {number: size,numberStep: commaSepStep},
    1000,
    function(){
      $('#' + id + 'Count').prop('number',size)
    }
  )
  $('#' + id + 'Label').text(label)
}
var graphExists = false
var stretchHistory = {}
var drawGraph = function(data){
  var graphContainer = document.getElementById('mushroomHistory');
  if(!graphExists){
    graphExists = true
    stretchHistory = new Chart(graphContainer,{
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.data,
            fill: true,
            label: 'Requests',
            backgroundColor: '#cdd0d6',
            borderColor: '#2b6bd1'
          }
        ]
      }
    });
  }
  else{
    stretchHistory.data.labels = data.labels;
    stretchHistory.data.datasets[0].data = data.data;
    stretchHistory.update();
  }
}
var progressCount = 1
var progressPercentPrevious = 10
var intervalSeconds = 10
var intervalMilliseconds = intervalSeconds * 1000
var intervalStepPercent = 100 / intervalSeconds
var updateTopItems = function(inventoryList){
  var topItemsBody = $('#topItemsBody')
  var rows = []
  inventoryList.forEach(function(row){
    var tr = $(document.createElement('tr'));
    tr.append($("<td><div><a href='/inventory/edit?hash=" + row.hash + "'>"
      + row.hash + '</a></div></td>'));
    tr.append($('<td>' + parseInt(row.hitCount || 0,10) + '</td>'));
    tr.append($('<td>' + parseInt(row.byteCount || 0,10) + '</td>'));
    rows.push(tr);
  })
  topItemsBody.empty()
  topItemsBody.append(rows)
}
var updateTopPurchases = function(purchaseList){
  var topPurchases = $('#topPurchasesBody')
  var rows = []
  purchaseList.forEach(function(row){
    row.token = row._id.replace('purchase:','')
    var tr = $(document.createElement('tr'));
    tr.append($("<td><a href='/purchase/edit?token=" + row.token + "'>"
      + row.token + '</a></td>'));
    tr.append($("<td><a href='/inventory/edit?hash=" + row.hash + "'>" +
      row.hash + '</a></td>'));
    tr.append($('<td>' + parseInt(row.hitCount || 0,10) + '</td>'));
    tr.append($('<td>' + parseInt(row.byteCount || 0,10) + '</td>'));
    rows.push(tr);
  })
  topPurchases.empty()
  topPurchases.append(rows)
}
var updateProgressBar = function(progressPercent){
  var progressBar = $('#progressBar')
  if(!progressPercent){
    progressPercent = Math.round(progressCount * intervalStepPercent)
  }
  if(progressPercent > 100) progressPercent = 100
  if(progressPercent < 1) progressPercent = 1
  if(progressPercentPrevious > progressPercent){
    progressBar.css({width: progressPercent + '%'})
  }
  else{
    progressBar.animate({width: progressPercent + '%'},500)
  }
  progressPercentPrevious = progressPercent
  progressCount++
}
var lastHitCount = 0
var updateRate = function(reqCount){
  if(0 === lastHitCount){
    lastHitCount = reqCount
    updateStat('rate',0)
  }
  else{
    var delta = reqCount - lastHitCount
    lastHitCount = reqCount
    if(delta < 0) delta = delta * -1
    var rate = delta / intervalSeconds
    updateStat('rate',rate)
  }
}
var updateDashboard = function(){
  $.getJSON('/dashboard/getUpdate',{},function(data){
    if(data.status === 'error'){
      //bootbox.alert(data.message)
    } else if(!data || !data.stats){
      console.log(data)
      throw new Error('Invalid dashboard update response')
    } else {
      updateStat('reqCount',data.stats.reqCount)
      updateStat('inventoryCount',data.stats.inventoryCount)
      updateStat('copyCount',data.stats.copyCount)
      updateSize('size',data.stats.sizeHuman)
      updateSize('sizeTotal',data.stats.sizeTotalHuman)
      updateStat('jobCount',data.stats.jobCount)
      updateStat('prismCount',data.stats.prismCount)
      updateStat('storeCount',data.stats.storeCount)
      drawGraph(data.history)
      updateTopItems(data.inventoryList)
      updateTopPurchases(data.purchaseList)
      updateRate(data.stats.reqCount)
    }
  })
  progressCount = 1
}


/**
 * Export the updateDashboard primitive
 * @type {updateDashboard}
 */
window.dashboardUpdate = function(){
  updateDashboard()
}


/**
 * Export the dashboard progress bar update
 * @type {updateProgressBar}
 */
window.dashboardUpdateProgressBar = function(){
  updateProgressBar()
}
