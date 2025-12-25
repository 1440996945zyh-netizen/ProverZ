import request from '@/utils/auth/request'

// BPM 流程分类 API
export const CategoryApi = {
  /**
   * 查询流程分类分页
   * @param {*} params 
   * @returns 
   */
  getCategoryPage: async (params) => {
    return request({
      url: `/bpm/category/getList`,
      method: 'get',
      params
    })
  },

  /**
   * 查询简单流程分类列表
   * @returns 
   */
  getCategorySimpleList: async () => {
    return request({
      url: `/bpm/category/simple-list`,
      method: 'get'
    })
  },

  /**
   * 查询流程分类详情
   * @param {*} id 
   * @returns 
   */
  getCategoryDetail: async (id) => {
    return request({
      url: `/bpm/category/getDetail?id=` + id,
      method: 'get'
    })
  },

  /**
   * 新增流程分类
   * @param {*} data 
   * @returns 
   */
  createCategory: async (data) => {
    return request({
      url: `/bpm/category/insert`,
      method: 'post',
      data
    })
  },

  /**
   * 修改流程分类
   * @param {*} data 
   * @returns 
   */
  updateCategory: async (data) => {
    return request({
      url: `/bpm/category/update`,
      method: 'put',
      data
    })
  },

  /**
   * 批量修改流程分类的排序
   * @param {*} ids 
   * @returns 
   */
  updateCategorySortBatch: async (ids) => {
    return request({
      url: `/bpm/category/update-sort-batch`,
      method: 'put',
      params: {
        ids: ids.join(',')
      }
    })
  },

  /**
   * 删除流程分类
   * @param {*} id 
   * @returns 
   */
  deleteCategory: async (id) => {
    return request({
      url: `/bpm/category/delete/${id}`,
      method: 'delete'
    })
  }
}