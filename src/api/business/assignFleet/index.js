import request from '@/utils/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/external/assignFleet/listTrustCargo',
    method: 'get',
    params: query
  })
},

// 新建
insert(data) {
  return request({
    url: `/api/external/assignFleet/insertAssignFleet?trustCargoId=${data.trustCargoId}`,
    method: 'post',
    data: data.assignFleets
  })
},


// 修改
update(data) {
  return request({
    url: `/api/external/assignFleet/updateAssignFleet?trustCargoId=${data.trustCargoId}`,
    method: 'put',
    data: data.assignFleets
  })
},


  //删除
  delete(trustCargoIds) {
  return request({
    url: `/api/external/assignFleet/deleteAssignFleet?trustCargoIds=${trustCargoIds}`,
    method: 'delete'
  })
},

}
export default api

