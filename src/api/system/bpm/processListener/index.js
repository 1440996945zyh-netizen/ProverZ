import request from '@/utils/auth/request'

// BPM 流程监听器 API
export const ProcessListenerApi = {
  // 查询流程监听器分页
  getProcessListenerPage: async (params) => {
    return request({
      url: `/bpm/process-listener/page`,
      method: 'get',
      params
    })
  },

  // 查询流程监听器详情
  getProcessListener: async (id) => {
    return request({
      url: `/bpm/process-listener/get?id=` + id,
      method: 'get'
    })
  },

  // 新增流程监听器
  createProcessListener: async (data) => {
    return request({
      url: `/bpm/process-listener/create`,
      method: 'post',
      data
    })
  },

  // 修改流程监听器
  updateProcessListener: async (data) => {
    return request({
      url: `/bpm/process-listener/update`,
      method: 'put',
      data
    })
  },

  // 删除流程监听器
  deleteProcessListener: async (id) => {
    return request({
      url: `/bpm/process-listener/delete?id=` + id,
      method: 'delete'
    })
  }
}