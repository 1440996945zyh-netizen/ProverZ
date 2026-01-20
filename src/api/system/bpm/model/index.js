import request from '@/utils/auth/request'

// 统一封装 BPM 流程模型 API 对象
const BpmModelApi = {
  /**
   * 查询流程模型分页
   * @param {*} name 
   * @returns 
   */
  getModelList: async (name) => {
    return request({
      url: '/bpm/model/list',
      method: 'get',
      params: { name }
    })
  },

  /**
   * 查询流程模型详情
   * @param {*} id 
   * @returns 
   */
  getModel: async (id) => {
    return request({
      url: '/bpm/model/getDetail?id=' + id,
      method: 'get'
    })
  },

  /**
   * 更新流程模型
   * @param {*} data 
   * @returns 
   */
  updateModel: async (data) => {
    return request({
      url: '/bpm/model/update',
      method: 'put',
      data // 简化对象属性简写，等价于 data: data
    })
  },

  /**
   * 批量修改流程模型排序
   * @param {*} ids 
   * @returns 
   */
  updateModelSortBatch: async (ids) => {
    return request({
      url: `/bpm/model/update-sort-batch`,
      method: 'put',
      params: {
        ids: ids.join(',')
      }
    })
  },

  /**
   * 更新流程模型 BPMN 定义
   * @param {*} data 
   * @returns 
   */
  updateModelBpmn: async (data) => {
    return request({
      url: '/bpm/model/update-bpmn',
      method: 'put',
      data // 简化对象属性简写
    })
  },

  /**
   * 更新流程模型状态
   * @param {*} id 
   * @param {*} state 
   * @returns 
   */
  updateModelState: async (data) => {
    
    return request({
      url: '/bpm/model/updateState',
      method: 'put',
      data
    })
  },

  /**
   * 创建流程模型
   * @param {*} data 
   * @returns 
   */
  createModel: async (data) => {
    return request({
      url: '/bpm/model/insert',
      method: 'post',
      data // 简化对象属性简写
    })
  },

  /**
   * 删除流程模型
   * @param {*} id 
   * @returns 
   */
  deleteModel: async (id) => {
    return request({
      url: `/bpm/model/delete/${id}`,
      method: 'delete'
    })
  },

  /**
   * 部署流程模型
   * @param {*} id 
   * @returns 
   */
  deployModel: async (id) => {
    return request({
      url: '/bpm/model/deploy?id=' + id,
      method: 'post'
    })
  },

  /**
   * 清除流程模型部署
   * @param {*} id 
   * @returns 
   */
  cleanModel: async (id) => {
    return request({
      url: '/bpm/model/clean?id=' + id,
      method: 'delete'
    })
  }
}

// 导出统一的 API 对象（默认导出，方便页面导入）
export default BpmModelApi