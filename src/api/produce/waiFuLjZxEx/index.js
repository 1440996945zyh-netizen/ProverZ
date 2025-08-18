import request from '@/utils/request'

const api= {
  //获取列表
  waiFuLjExV(params) {
    return request({
      url: 'api/external/WaiFuExController/waiFuLjExV',
      method: 'get',
      params: params,
    })
  },
  waiFuLjEx(params) {
    return request({
      url: 'api/external/WaiFuExController/waiFuLjEx',
      method: 'get',
      params: params,
    })
  },
  waiFuZxExV(params) {
    return request({
      url: 'api/external/WaiFuExController/waiFuZxExV',
      method: 'get',
      params: params,
    })
  },
  waiFuZxEx(params) {
    return request({
      url: 'api/external/WaiFuExController/waiFuZxExV',
      method: 'get',
      params: params,
    })
  },
}
export default api
