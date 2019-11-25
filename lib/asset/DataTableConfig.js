'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

window.DataTableConfig = (tableName) => {
  if(!tableName) tableName = 'table'
  let tableEl = $('#' + tableName)
  let removeClass = tableEl.attr('data-remove-class')
  let removeText = tableEl.attr('data-remove-text')
  let dataSrc = tableEl.attr('data-src')
  let serverSide = dataSrc !== 'local'
  let dtCfg = {
    dom: 'lBfrt<<"float-right"p>i>',
    buttons: [
      'copyHtml5',
      'excelHtml5',
      'pdfHtml5',
      'csvHtml5',
      'print',
      'selectAll',
      'selectNone',
      {
        text: removeText || 'Remove',
        className: removeClass || 'btn-danger',
        action: (e,dt,node,config) => {
          let ids = $.map(dt.rows('.selected').data(),(item) => {
            return item.id
          });
          let rowCount = ids.length;
          let confMsg = 'Are you sure you want to remove ' +
            rowCount + ' rows?';
          let removeUri = tableEl.attr('data-remove-uri');
          let removeKey = tableEl.attr('data-remove')

          let removeUrl = removeUri + '?' + removeKey + '=' + ids
          if(confirm(confMsg)){
            window.location.href = removeUrl
          }
          else{
            return e.preventDefault()
          }
        }
      }
    ],
    select: 'multi',
    processing: true,
    serverSide: serverSide,
    stateSave: true,
    pageLength: 10,
    lengthMenu: [ [10, 20, 50, 100, 250, -1], [10 ,20, 50, 100, 250, 'All'] ],
    columns: (() => {
      let cols = []
      $('#' + tableName +' th').each(function(i){
        let that = this
        let dataName = $(that).attr('data-name')
        let dataFormat = $(that).attr('data-format')
        if(!dataName) return
        cols.push({
          name: $(that).text(),
          data: dataName,
          targets: i,
          render: (data,type,row) => {
            let dataLink = $(that).attr('data-link')
            let dataUri = $(that).attr('data-uri')
            if(!dataLink && !dataFormat) return data
            if(dataLink){
              data = '<a href="' + dataUri + '?' + dataLink + '=' +
                row[dataLink] + '">' + data + '</a>'
            }
            if(dataFormat){
              data = window[dataFormat](data,type,row)
            }
            return data
          }
        })
      })
      return cols
    })()
  }
  if(serverSide) dtCfg.ajax = (undefined === dataSrc) ? window.location.href : dataSrc
  return dtCfg
}
