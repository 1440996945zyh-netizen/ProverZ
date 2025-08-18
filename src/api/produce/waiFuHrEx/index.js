import request from '@/utils/request'

const api= {
  //获取列表
  hrExV(params) {
    return request({
      url: 'api/external/WaiFuExController/hrExV',
      method: 'get',
      params: params,
    })
  },
  hrEx(params) {
    return request({
      url: 'api/external/WaiFuExController/hrEx',
      method: 'get',
      params: params,
    })
  },
  //审核新表数据 与上面两个无关
  hrNewEx(params) {
    return request({
      url: 'api/external/WaiFuExController/hrNewEx',
      method: 'get',
      params: params,
    })
  },
  hrNewExV(params) {
    return request({
      url: 'api/external/WaiFuExController/HrNewExV',
      method: 'get',
      params: params,
    })
  },
}
export default api
