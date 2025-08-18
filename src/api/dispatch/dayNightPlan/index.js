import request from '@/utils/request'
import ship from "../../master/ship";
const api = {

	// 查询昼夜计划
	getList(query) {
		return request({
			url: '/api/v1/internal/tDisShipDaynigttplan/getList',
			method: 'get',
			params: {
        planDate: query
      }
		})
	},
  //查询截止日期
  getPlanDate(planDate){
    return request({
      url: '/api/internal/public/getShiftClassInfoByPlanDate',
      method: 'get',
      params: {
        planDte: planDate
      }
    })
  },
  //查询昨日的计划
  importPlan(query) {
    return request({
      url: '/api/v1/internal/tDisShipDaynigttplan/getList2',
      method: 'get',
      params: {
        planDate: query
      }
    })
  },
  //查询从预报到离泊的船
  getShipVoyage() {
    return request({
      url: '/api/v1/internal/tDisShipDaynigttplan/getShipVoyage',
      method: 'get',
    })
  },
  //保存
  listSave(data, planDate){
    return request({
      url: '/api/v1/internal/tDisShipDaynigttplan/doSave?planDate=' + planDate,
      method: 'post',
      data: data
    })
  },

  //获取作业量
  getWorkNum(planDate,shipvoyageItemId){
    return request({
      url: '/api/v1/internal/tDisShipDaynigttplan/getWorkNum',
      method: 'get',
      params: {
        planDate: planDate,
        shipvoyageItemId: shipvoyageItemId
      }
    })
  },
  //清空作业计划
  deleteAll(planDate){
    return request({
      url: '/api/v1/internal/tDisShipDaynigttplan/delete/'+planDate,
      method: 'delete'
    })
  }
}
export default api
