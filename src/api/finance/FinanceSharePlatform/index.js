import request from '@/utils/request'

const api = {
  //获取数据列表
  getList(params) {
    return request({
      url: '/api/v1/internal/FinanceSharePlatform/getList',
      method: 'get',
      params: params,
    })
  },
   reSend(params) {
    return request({
      url: '/api/v1/internal/FinanceSharePlatform/reSend',
      method: 'get',
      params: params,
    })
  },


}
export default api
