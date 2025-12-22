import request from '@/utils/auth/request'



// BPM 流程分类 API
export const CategoryApi = {
  /***
   * 查询流程分类分页
   * @param {*} params 
   * @returns 
   */
  getCategoryPage: async (params) => {
    return await request.get({ url: `/bpm/category/page`, params })
  },

 /**
  * 
  * 查询简单流程分类列表
  * @returns 
  */
  getCategorySimpleList: async () => {
    return await request.get({ url: `/bpm/category/simple-list` })
  },

/**
 * 查询流程分类详情
 * @param {*} id 
 * @returns 
 */
  getCategory: async (id) => {
    return await request.get({ url: `/bpm/category/get?id=` + id })
  },

  /**
   * 新增流程分类
   * @param {*} data 
   * @returns 
   */
  createCategory: async (data) => {
    return await request.post({ url: `/bpm/category/create`, data })
  },

  /**
   * 修改流程分类
   * @param {*} data 
   * @returns 
   */
  updateCategory: async (data) => {
    return await request.put({ url: `/bpm/category/update`, data })
  },

  /**
   * 
   * 批量修改流程分类的排序
   * @param {*} ids 
   * @returns 
   */
  updateCategorySortBatch: async (ids) => {
    return await request.put({
      url: `/bpm/category/update-sort-batch`,
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
    return await request.delete({ url: `/bpm/category/delete?id=` + id })
  }
}
