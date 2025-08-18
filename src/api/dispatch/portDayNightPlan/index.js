import request from '@/utils/request'
import ship from "../../master/ship";
const api = {

	// 查询昼夜计划
	getList(query) {
		return request({
			url: '/api/v1/internal/tDisPortDaynightplan/getList',
			method: 'get',
			params: query
		})
	},
  // 查询昨日昼夜计划
  importYesterdayPlan(planDate,businessNo) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/importYesterdayPlan',
      method: 'get',
        params: {planDate:planDate,businessNo: businessNo}
    })
  },
  // 查询昼夜计划
  getTrustCargoDetail(planDate,shipvoyageItemId,cargoOwnerId, businessNo,cargoCode) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/getTrustCargoDetail',
      method: 'get',
      params: {
        searchDate: planDate,
        shipvoyageItemId: shipvoyageItemId,
        cargoOwnerId: cargoOwnerId,
        businessNo: businessNo,
        cargoCode:cargoCode
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
/*  //查询昨日的计划
  importTodayPlan(query) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/importTodayPlan',
      method: 'get',
      params: {
        planDate: query
      }
    })
  },*/
  approve(id){
    return request({
      url: `/api/v1/internal/tDisPortDaynightplan/approve/${id}`,
      method: 'get',
    })
  },
  approveRevoke(id,approveList){
    return request({
      url: `/api/v1/internal/tDisPortDaynightplan/approveRevoke/${id}`,
      method: 'get',
    })
  },
  //批量销审
  approveListRevoke(data) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/approveListRevoke',
      method: 'post',
      data: data
    })
  },
  //批量审核
  approveList(data) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/approveList',
      method: 'post',
      data: data
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
      url: '/api/v1/internal/tDisPortDaynightplan/doSave?planDate=' + planDate,
      method: 'post',
      data: data
    })
  },
  //删除
  delete(params) {
    return request({
      url: `/api/v1/internal/tDisPortDaynightplan/delete/${params}`,
      method: 'delete',
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
  },
  // 同步集疏港昼夜计划开始、结束时间到渤海通、车辆集疏港预约表
  tosToBoHaiTongDayNightPlan(id) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/tosToBoHaiTongDayNightPlan?id=' + id,
      method: 'put'
    })
  },
  //导出结算
  exportPlan(planDate) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/exportPlan?planDate=' + planDate,
      method: 'get',
      responseType: 'blob',
    })
  },
  //返回计划量、过磅量、计划剩余量
  getCount(query) {
    return request({
      url: '/api/v1/internal/tDisPortDaynightplan/getCount',
      method: 'get',
      params: {
        businessNo: query
      }
    })
  },
}
export default api
