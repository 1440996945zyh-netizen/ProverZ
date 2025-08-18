import request from '@/utils/request'

const api = {
    // 查询在线用户列表
    getOnLineList(query) {
        return request({
            url: '/api/internal/sysOnLineUser/getlist',
            method: 'get',
            params: query
        })
    },


    // 强退
    offLine(params) {
        return request({
            url: '/api/internal/sysOnLineUser/offline' ,
            method: 'get',
            params: params
        })
    }
}
export default api


