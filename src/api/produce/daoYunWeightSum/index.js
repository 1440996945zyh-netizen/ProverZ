import request from '@/utils/request'

const api= {

  getDaoYunWeightTable(data) {
    return request({
      url: `api/external/workTicketNew/getDaoYunWeightTable`,
      method: 'get',
      params: data,
    })
  },
  getSettlementStatistics(data) {
    return request({
      url: `/api/external/workTicketNew/getSettlementStatistics`,
      method: 'post',
      data: data,
    })
  },
  updateDaoYunWeightStatus(data,settlementDate) {
    return request({
      url: `api/external/workTicketNew/updateDaoYunWeightStatus?settlementDate=${settlementDate}`,
      method: 'put',
      data: data
    })
  },
  //更新结算单状态
  updateSettlementStatus(data,settlementDate,type) {
    return request({
      url: `api/external/workTicketNew/updateSettlementStatus?settlementDate=${settlementDate}&type=`+type,
      method: 'put',
      data: data
    })
  },
}
export default api
