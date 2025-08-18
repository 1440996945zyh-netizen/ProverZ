    import request from '@/utils/request'

    const api = {
    // 查询数据列表
    getList(query) {
        return request({
        url: '/api/v1/internal/tStdProducePlan/getPageList',
        method: 'get',
        params: query
        })
    },
    // 删除数据
    deleteById(id) {
      return request({
        url: '/api/v1/internal/tStdProducePlan/delete/' + id,
        method: 'delete'
      })
    },

    // 查询数据详细id
    getDetail(id) {
      return request({
        url: '/api/v1/internal/tStdProducePlan/getDetail/' + id,
        method: 'get'
      })
    },

      // 新增数据
      insert(data) {
        return request({
          url: '/api/v1/internal/tStdProducePlan/add',
          method: 'post',
          data: data
        })
      },


/////////////////////////////////////////////////////////////////////////////////////////

    // 修改数据
    updatePort(data) {
        return request({
        url: '/api/v1/internal/tStdProducePlan/update',
        method: 'put',
        data: data
        })
    },


}

    export default api



