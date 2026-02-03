import request from '@/utils/auth/request'

const baseApi = '/api/internal/bpmProcessListener'
// BPM 流程监听器 API
export const ProcessListenerApi = {
  // 查询流程监听器分页
  getList: (query) => {
    return request({
      url: baseApi + '/getList',
      method: 'get',
      params: query,
    })
  },

  // 查询流程监听器详情
  getProcessListener: async (id) => {
    return request({
      url: baseApi + `/getDetail/${id}`,
      method: 'get'
    })
  },

  // 新增流程监听器
  insertProcessListener: async (data) => {
    return request({
      url: baseApi + '/insert',
      method: 'post',
      data
    })
  },

  // 修改流程监听器
  updateProcessListener: async (data) => {
    return request({
      url: baseApi + '/update',
      method: 'post',
      data
    })
  },

  // 删除流程监听器
  deleteProcessListener: async (id) => {
    return request({
      url: baseApi + `/deleteById/${id}`,
      method: 'delete'
    })
  }
}