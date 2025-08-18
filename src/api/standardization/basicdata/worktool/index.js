import request from '@/utils/request'
const api = {

  // 工属具配置详细信息
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/getSumList',
      method: 'get',
      params: query
    })
  },
  //删除工属具配置
  deleteWorkTool(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/delete/`+id,
      method: 'delete'
    })
  },
  //删除工属具配置 批量
  deleteWorkToolBatch(data) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/deleteWorktoolBatch`,
      method: 'delete',
      data: data
    })
  },
  //通过工艺流程ID删除工属具配置
  deleteBYProcessSystemID(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/deleteByProcessId/`+id,
      method: 'delete'
    })
  },
  //通过工艺流程ID删除工属具配置
  getProcessListBySYstem(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/getProcessBySystem/`+id,
      method: 'get'
    })
  },
  //获取工属
  getWorkToolList(){
    return request({
      url: '/api/internal/public/getDictListByType/PROCESS_WORKTOOL',
      method: 'get'
    })
  },
  //获取工艺流程下拉列表
  getProcessList(){
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/getProcessList',
      method: 'get'
    })
  },
  updateWorktool(data){
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/update',
      method: 'post',
      data:data
    })
  },
  //保存
  listSave(data){
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/add',
      method: 'post',
      data: data
    })
  },
  getWorktoolDetailList(data){
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/getList',
      method: 'post',
      data: data
    })
  },
  //动态判断参数是否合法
  checkParameter(data){
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/checkParameter',
      method: 'post',
      data:data
    })
  },
  listByRoleClass(query) {
    return request({
      url: '/api/internal/sysRole/listByRoleClass',
      method: 'get',
      params: query,
    })
  },
}
export default api
