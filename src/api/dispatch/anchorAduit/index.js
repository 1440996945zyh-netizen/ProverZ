import request from '@/utils/request'

const api = {
// 获取预约列表
  getAnchApplyList(query) {
    return request({
      url: '/api/external/anchApply/getlist',
      method: 'get',
      params: query
    })
  },

//审核预约
  verifyAnchApply(data) {
    return request({
      url: '/api/external/anchApply/verify',
      method: 'get',
      params: data
    })
  },

  //更新实际离锚时间
  updateLeaveAnchTime(data) {
    return request({
      url: '/api/external/anchApply/leaveAnchTime',
      method: 'get',
      params: data
    })
  },
}
export default api

