import request from '@/utils/request'

const api = {
// 查询数据列表
getList(query) {
    return request({
    url: '/api/v1/internal/tStdTechnologicalProcess/getList',
    method: 'get',
    params: query
    })
},

// 查询数据详细id
getDataById(id) {
    return request({
    url: '/api/v1/internal/tStdTechnologicalProcess/getDetail/' + id,
    method: 'get'
    })
},


// 新增数据
insert(data) {
    return request({
    url: '/api/v1/internal/tStdTechnologicalProcess/add',
    method: 'post',
    data: data
    })
},

// 修改数据
update(data) {
    return request({
    url: '/api/v1/internal/tStdTechnologicalProcess/update',
    method: 'put',
    data: data
    })
},

// 删除数据
delete(id) {
    return request({
    url: '/api/v1/internal/tStdTechnologicalProcess/deleteById/' + id,
    method: 'delete'
    })
},

// 查询体系名称
getData() {
    return request({
    url: '/api/v1/internal/tStdTechnologicalProcess/getSystemList',
    method: 'get'
    })
},
  //动态判断参数是否合法
    checkParameter(data){
        return request({
        url: '/api/v1/internal/tStdTechnologicalProcess/checkParameter',
        method: 'post',
        data:data
        })
    }
}

export default api



