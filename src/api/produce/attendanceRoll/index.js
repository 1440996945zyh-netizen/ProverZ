import request from "@/utils/request";

const api = {
  //获取列表
  getAttendanceList(params){
    return request({
      url:'api/v1/internal/tPrdAttendance/getAttendanceList',
      method: 'get',
      params: params
    })
  },
  //新增数据
  insertAttendance(data) {
    return request({
      url:'/api/v1/internal/tPrdAttendance/insertAttendance',
      method: 'post',
      data: data,
    })
  },
  // 根据作业公司获取作业工班
  getDeptByCompany(id) {
    return request({
      url: 'api/v1/internal/tPrdAttendance/getDeptByCompany?companyId=' + id,
      method: 'get'
    })
  },
  //根据作业工班获取出勤人员列表
  getAttendanceUserByDeptId(id){
    return request({
      url:'api/v1/internal/tPrdAttendance/getUserByDeptId?deptId=' + id,
      method:'get'
  })
  },
  //根据作业工班获取出勤人员列表
  getUserSelect(id){
    return request({
      url:'api/v1/internal/tPrdAttendance/getUserSelect',
      method:'get'
  })
  },
  //更新数据
  updateAttendance(data) {
    return request({
      url:'api/v1/internal/tPrdAttendance/updateAttendance',
      method: 'put',
      data: data
    })
  },
  selectAttendance(id){
    return request({
      url:'api/v1/internal/tPrdAttendance/getAttendanceById?id=' + id ,
      method:'get',
    })
  },
  delete(id){
    return request({
      url:`/api/v1/internal/tPrdAttendance/deleteById/${id}`,
      method:'delete',
    })
  },

}
export default api
