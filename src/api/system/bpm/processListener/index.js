import request from '@/utils/auth/request'

// BPM 流程监听器 API
export const ProcessListenerApi = {
  // 查询流程监听器分页
  getProcessListenerPage: async (params) => {
    return await request.get({ url: `/bpm/process-listener/page`, params })
  },

  // 查询流程监听器详情
  getProcessListener: async (id) => {
    return await request.get({ url: `/bpm/process-listener/get?id=` + id })
  },

  // 新增流程监听器
  createProcessListener: async (data) => {
    return await request.post({ url: `/bpm/process-listener/create`, data })
  },

  // 修改流程监听器
  updateProcessListener: async (data) => {
    return await request.put({ url: `/bpm/process-listener/update`, data })
  },

  // 删除流程监听器
  deleteProcessListener: async (id) => {
    return await request.delete({ url: `/bpm/process-listener/delete?id=` + id })
  }
}