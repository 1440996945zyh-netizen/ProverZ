import request from '@/utils/request'

const api = {

  //获取数据列表
  getList(params) {
    return request({
      url: '/api/v1/external/tMacTerminal/getCarInHarborForApp',
      method: 'get',
      params: params,
    })
  },
  updateLocation(data) {
    return request({
      url: '/api/v1/external/tMacTerminal/updateLocation',
      method: 'put',
      data: data,
    })
  },
  cancelTally(weighbridgeId) {
    return request({
      url: '/api/v1/external/tMacTerminal/cancelTally/'+weighbridgeId,
      method: 'get',
    })
  },
}
export default api
