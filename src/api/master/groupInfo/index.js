import request from '@/utils/auth/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/external/group/listGroup',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(id) {
  return request({
    url: `/api/external/group/getById/${id}`,
    method: 'get'
  })
},


// 新建
insert(data) {
  return request({
    url: '/api/external/group/insert',
    method: 'post',
    data: data
  })
},
  //删除
  delete(id) {
  return request({
    url: `/api/external/group/deleteById/${id}`,
    method: 'delete'
  })
},
/**
	 * 获取操作工班
	 */
listPieceWorkTeam() {
    return request({
        url: '/api/external/workTicket/listPieceWorkTeam',
        method: 'get',
    })
}
}

export default api

