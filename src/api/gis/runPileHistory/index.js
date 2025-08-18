import request from '@/utils/request'

export function getRunPileHistoryList(query) {
  return request({
    url: '/api/v1/external/tRunPileHistory/getRunPileHistoryList',
    method: 'get',
    params: query 
  })
} 