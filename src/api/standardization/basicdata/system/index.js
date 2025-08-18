    import request from '@/utils/request'

    const api = {
    // 查询数据列表
    getList(query) {
        return request({
        url: '/api/v1/internal/tStdProcessStandardSystem/getList',
        method: 'get',
        params: query
        })
    },

    // 查询数据详细id
    getNameById(id) {
        return request({
        url: '/api/v1/internal/tStdProcessStandardSystem/getDetail/' + id,
        method: 'get'
        })
    },


    // 新增数据
    insertPort(data) {
        return request({
        url: '/api/v1/internal/tStdProcessStandardSystem/add',
        method: 'post',
        data: data
        })
    },

    // 修改数据
    updatePort(data) {
        return request({
        url: '/api/v1/internal/tStdProcessStandardSystem/update',
        method: 'put',
        data: data
        })
    },

    // 删除数据
    deleteById(id) {
        return request({
        url: '/api/v1/internal/tStdProcessStandardSystem/delete/' + id,
        method: 'delete'
        })
    }
    }

    export default api



