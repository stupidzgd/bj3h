import request from '@/utils/request'



export function importExcel(data) {
  return request({
    url: '/api/excel/import',
    method: 'post',
    data
  })
}

export function getExcelData() {
  return request({
    url: '/api/excel/query',
    method: 'get'
  })
}

export function queryExcelData(params) {
  return request({
    url: '/api/excel/query',
    method: 'post',
    data: params
  })
}

export function updateExcelData(id, data) {
  return request({
    url: `/api/excel/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteExcelData(articleIds) {
  return request({
    url: '/api/excel/delete',
    method: 'post',
    data: { articleIds }
  })
}

export function clearExcelData() {
  return request({
    url: '/api/excel/clear',
    method: 'delete'
  })
}

export function getAnalysisData(params) {
  return request({
    url: '/api/excel/query',
    method: 'get',
    params
  })
}