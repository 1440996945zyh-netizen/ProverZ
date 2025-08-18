import request from '@/utils/request'
import ship from "../../master/ship";
const api = {

  getList(query) {
    return request({
      url: '/api/v1/internal/comprehensiveQuery/getList',
      method: 'get',
      params: {
        planDate: query
      }
    })
  },
  getPieList(query) {
    return request({
      url: '/api/v1/internal/comprehensiveQuery/getPieList',
      method: 'get',
      params: {
        planDate: query
      }
    })
  },
}
export default api
