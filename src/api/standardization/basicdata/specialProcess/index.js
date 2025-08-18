import request from '@/utils/request'
const api = {
    // 后台url   /api/v1/internal/tStdWorkSafetyBan
    // 后台url   /api/v1/internal/tStdWorkSafetyBanDetail
    // 工属具配置详细信息
    getList(query) {
        return request({
        url: '/api/v1/internal/tStdSpecialProcess/getList',
        method: 'get',
        params: query
        })
    },
    //通过工艺流程和标准体系删除
    deleteBYProcessSystemID(data) {
        return request({
        url: '/api/v1/internal/tStdSpecialProcess/delList',
        method: 'delete',
        data: data
        })
    },
    //通过标准体系id获取工艺流程id
    getProcessListBySystem(id) {
        return request({
        url: `/api/v1/internal/tStdProcessWorktool/getProcessBySystem/`+id,
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
        url: '/api/v1/internal/tStdSpecialProcess/add',
        method: 'post',
        data: data
        })
    },
    getWorktoolDetailList(data){
        return request({
        url: '/api/v1/internal/tStdSpecialProcess/getAllList',
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
    //根据标准体系和工艺流程去数据库中比对是否已经存在
    getBySystemIdAndProcessId(query) {
        return request({
        url: '/api/v1/internal/tStdSpecialProcess/getBySystemIdAndProcessId',
        method: 'post',
        data: query,
        })
    },
    //
    listByRoleClass(query) {
    return request({
      url: '/api/internal/sysRole/listByRoleClass',
      method: 'get',
      params: query,
    })
  },
}
export default api
