import request from '@/utils/request'

export function getRunPileNeedList(query) {
  return request({
    url: '/api/v1/external/tRunPile/getRunPileNeedList',
    method: 'get',
    params: query 
  })
} 