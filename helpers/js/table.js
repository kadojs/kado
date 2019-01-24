'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
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
      $('#table th').each(function(i){
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
  if(serverSide) dtCfg.ajax = window.location.href
  return dtCfg
}
