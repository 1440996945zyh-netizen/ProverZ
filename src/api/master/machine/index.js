import request from '@/utils/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/v1/internal/mMachine/getList',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(id) {
  return request({
    url: `/api/v1/internal/mMachine/getDetail?id=${id}`,
    method: 'get'
  })
},


// 新建
insert(data) {
  return request({
    url: '/api/v1/internal/mMachine/add',
    method: 'post',
    data: data
  })
},


// 修改
update(data) {
  return request({
    url: '/api/v1/internal/mMachine/update',
    method: 'put',
    data: data
  })
},


  //删除
  delete(id) {
  return request({
    url: `/api/v1/internal/mMachine/delete/${id}`,
    method: 'delete'
  })
},
  // 根据机械类型code查询机械型号
  getMacModelByTypeCode(id) {
    return request({
      url: '/api/internal/bmachinetype/getMacModelByTypeCode?id=' + id,
      method: 'get',
    })
  },
}
export default api

