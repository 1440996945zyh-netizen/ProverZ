import request from '@/utils/auth/request'
const requestApi = '/api/internal/bpmBusinessConfig'
const processInstanceApi = '/bpm/process-instance/'
const api = {
    /**
 * 获取流程定义信息
 * @param {*} query 流程定义查询参数
 * @param {*} businessTypeCode 业务类型编码
 * @param {*} businessId 业务实例ID
 * @returns 流程定义信息+表单信息
 */
    getProcDefInfo: (query) => {
        return request({
            url: requestApi + '/getProcDefInfo',
            method: 'get',
            params: query
        })
    },

    /**
     * 获取审批详情 校验
     * @param {*} params 审批详情查询参数
     * @returns 审批详情
     */
    getApprovalDetail: async params => {
        return request({
            url: processInstanceApi + 'getApprovalDetail',
            method: 'get',
            params,
        })
    }

}
export default api
