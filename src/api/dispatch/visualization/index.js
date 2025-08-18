import request from '@/utils/request'

const api = {
	//查询吞吐量信息（散杂货）
	getThroughputSInfo(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getThroughputSInfo',
			method: 'get',
			params: params,
		})
	},
	//查询吞吐量信息（集装箱）
	getThroughputJInfo(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getThroughputJInfo',
			method: 'get',
			params: params,
		})
	},
	//查询散杂货吞吐量列表
	getThroughputSList(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getThroughputSList',
			method: 'get',
			params: params,
		})
	},
	//查询集装箱吞吐量列表
	getThroughputJList(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getThroughputJList',
			method: 'get',
			params: params,
		})
	},
	//查询在港车辆数量、在港时长、在港车辆列表
	getInPortCarNumAndDuration(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getInPortCarNumAndDuration',
			method: 'get',
			params: params,
		})
	},
	//查询散杂货港货信息（饼状图）
	getPortStorage(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getPortStorage',
			method: 'get',
			params: params,
		})
	},
	//查询船舶计划
	getShipPlanList(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getShipPlanList',
			method: 'get',
			params: params,
		})
	},
	//查询船舶动态
	getShipDynamicsList(params) {
		return request({
			url: '/api/v1/external/tLargeScreen/getShipDynamicsList',
			method: 'get',
			params: params,
		})
	},
}
export default api
