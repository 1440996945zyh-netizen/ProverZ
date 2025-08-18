import request from '@/utils/request'

const api= {
  //获取列表
  prdExV(params) {
    return request({
      url: 'api/external/WaiFuExController/prdExV',
      method: 'get',
      params: params,
    })
  },
  isTrueCompany(params) {
    return request({
      url: 'api/external/WaiFuExController/isTrueCompany',
      method: 'get',
      params: params,
    })
  },
  getNowUser() {
    return request({
      url: 'api/external/WaiFuExController/getNowUser',
      method: 'get',
    })
  },
  prdEx(params) {
    return request({
      url: 'api/external/WaiFuExController/prdEx',
      method: 'get',
      params: params,
    })
  },
}
export default api
