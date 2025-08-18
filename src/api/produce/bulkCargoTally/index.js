import request from '@/utils/request'

const api = {

	/**
	 * 查询电子围栏距离
	 */
	getMacDistance() {
		return request({
			url: '/api/v1/external/tMacTerminal/getMacDistance',
			method: 'get',
		})
	},

	/**
	 * 根据imei号查询设备信息
	 * @param {*} imei 
	 * @returns 
	 */
	getMachineByImei(imei) {
		return request({
			url: `/api/v1/external/tMacTerminal/getMachineByImei?workPlanId=${imei}`,
			method: 'get',
		})
	},

	/**
	 * 根据设备信息查询作业指令
	 * @param {*} imei 
	 * @param {*} macCode 
	 * @param {*} workPlanId 
	 * @param {*} carNo 
	 * @returns 
	 */
	getWorkPlanByConditionForAppPC(params) {
		return request({
			url: `/api/v1/external/tMacTerminal/getWorkPlanByConditionForAppPC`,
			method: 'get',
			params,
		})
	},

	/**
	 * 根据设备信息查询作业指令
	 * @param {*} imei 
	 * @param {*} macCode 
	 * @returns 
	 */
	getWorkPlan(imei, macCode) {
		return request({
			url: `/api/v1/external/tMacTerminal/getWorkPlan?imei=${imei}&macCode=${macCode}`,
			method: 'get',
		})
	},

	/**
	 * 设备开始作业
	 * @param {*} data 
	 * @returns 
	 */
	macWorkStart(data) {
		return request({
			url: '/api/v1/external/tMacTerminal/macWorkStart',
			method: 'post',
			data,
		})
	},

	/**
	 * 设备结束作业
	 * @param {*} data 
	 * @returns 
	 */
	macWorkEnd(data) {
		return request({
			url: '/api/v1/external/tMacTerminal/macWorkEnd',
			method: 'post',
			data,
		})
	},

	/**
	 * 散货理货
	 * @param {*} data 
	 * @returns 
	 */
	macWorkPC(data) {
		return request({
			url: '/api/v1/external/tMacTerminal/macWorkPC',
			method: 'post',
			data,
		})
	},

	/**
	 * 根据磅单id查询装车信息
	 * @param {*} workPlanId 
	 * @returns 
	 */
	getLoadCarByWeighbridgeId(weighbridgeId) {
		return request({
			url: `/api/v1/external/tMacTerminal/getLoadCarByWeighbridgeId?weighbridgeId=${weighbridgeId}`,
			method: 'get',
		})
	},
}
export default api
