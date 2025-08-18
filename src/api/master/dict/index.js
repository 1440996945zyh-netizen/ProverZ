import request from '@/utils/request'

const api = {
    // 查询字典类型列表
    getAllDictTypeList(query) {
        return request({
            url: '/api/internal/dict/getAllDictTypeList',
            method: 'get',
            params: query
        })
    },


    // 新增字典类型
    insertDictType(data) {
        return request({
            url: '/api/internal/dict/insertDictType',
            method: 'post',
            data: data
        })
    },

    // 修改字典类型
    updateDictType(data) {
        return request({
            url: '/api/internal/dict/updateDictType',
            method: 'put',
            data: data
        })
    },

    // 删除字典类型
    deleteDictTypeById(id) {
        return request({
            url: '/api/internal/dict/deleteDictTypeById/' + id,
            method: 'delete'
        })
    },

    //根据id查询字典类型
    getDictTypeById(id) {
        return request({
            url: '/api/internal/dict/getDictTypeById/' + id,
            method: 'get'
        })
    },


    // 字典类型操作↑
    //字典操作   ↓

    // 查询字典列表
    getDictList(query) {
        return request({
            url: '/api/internal/dict/getDictList',
            method: 'get',
            params: query
        })
    },


    // 新增字典
    insertDict(data) {
        return request({
            url: '/api/internal/dict/insertDict',
            method: 'post',
            data: data
        })
    },

    // 修改字典
    updateDict(data) {
    return request({
        url: '/api/internal/dict/updateDict',
        method: 'put',
        data: data
    })
    },

    // 删除字典
    deleteDictById(id) {
        return request({
            url: '/api/internal/dict/deleteDictById/' + id,
            method: 'delete'
        })
    },

    //根据字典类型查询字典列表
    getDictListByType(typeCd) {
        return request({
            url: '/api/internal/dict/getDictListByType',
            method: 'get',
            params: typeCd
        })
    },


    //根据id查询字典
    getDictById(id) {
        return request({
            url: '/api/internal/dict/getDictById/' + id,
            method: 'get',
        })
    },


    // 刷新字典缓存
    // refreshCache() {
    //   return request({
    //     url: '/system/dict/type/refreshCache',
    //     method: 'delete'
    //   })
    // },

    // 获取字典选择框列表
    // optionselect() {
    //   return request({
    //     url: '/system/dict/type/optionselect',
    //     method: 'get'
    //   })
    // },
}
export default api
