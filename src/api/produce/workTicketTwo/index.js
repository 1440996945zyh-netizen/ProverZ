import request from '@/utils/request'

const api = {
	/**
	 * 获取作业票主列表
	 * @param {*} params {workDate，classCode}
	 */
	 listWorkTicket(params) {
		return request({
			url: '/api/external/workTicketTwo/listWorkTicket',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取作业计划
	 * @param {*} params {workDate，classCode}
	 */
	 listWorkPlan(params) {
		return request({
			url: '/api/external/workTicketTwo/listWorkPlan',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取作业票明细
	 */
	 queryWorkTicket(params) {
		return request({
			url: '/api/external/workTicketTwo/queryWorkTicket',
			method: 'get',
			params,
		})
	},
	listMass(id) {
		return request({
			url: '/api/internal/public/listMass?regionId=' + id,
			method: 'get',
		})
	},
	// 查看是否有权限
	getUserRole(flag) {
		return request({
			url: `/api/external/workTicketTwo/getUserRole?flag=${flag}`,
			method: 'get',
		})
	},
	/**
	 * 获取指令票货id
	 * @param {String} workPlanId
	 */
	listTrustCargo(workPlanId) {
		return request({
			url: `/api/external/workTicketTwo/listTrustCargo?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	/**
	 * 根据票货id查目标票货
	 * @param {String} cargoInfoId
	 */
	listTargetCargo(cargoInfoId) {
		return request({
			url: `/api/external/workTicketTwo/listTargetCargo?cargoInfoId=${cargoInfoId}`,
			method: 'get',
		})
	},
	/**
	 * 根据计划id查起始终点位置
	 * @param {String} workPlanId
	 */
	listWorkPlanLocation(workPlanId) {
		return request({
			url: `/api/external/workTicketTwo/listWorkPlanLocation?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	/**
	 * 获取操作工班
	 */
	listPieceWorkTeam() {
		return request({
			url: '/api/external/workTicketTwo/listPieceWorkTeam',
			method: 'get',
		})
	},
	/**
	 * 获取装卸队
	 * @param {String} workPlanId
	 */
	listLabor(workPlanId) {
		return request({
			url: `/api/external/workTicketTwo/listLabor?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	// 新增签票
	insertWorkTicket(data) {
		return request({
			url: '/api/external/workTicketTwo/insertWorkTicket',
			method: 'post',
			data,
		})
	},
	// 修改签票
	updateWorkTicket(data) {
		return request({
			url: '/api/external/workTicketTwo/updateWorkTicket',
			method: 'put',
			data,
		})
	},
	// 查询作业票
	getWorkTicket(data) {
		return request({
			url: `/api/external/workTicketTwo/getWorkTicket?workPlanId=${data.workPlanId}&ticketType=${data.ticketType}`,
			method: 'get',
		})
	},
	// 根据指令票货查票货详情
	getTicketInfo(data) {
		return request({
			url: `/api/external/workTicketTwo/getTicketInfo?workPlanId=${data.workPlanId}&type=${data.type}&cargoCode=${data.cargoCode}&processCode=${data.processCode}`,
			method: 'get',
		})
	},
	// 删除作业票
	deleteWorkTicke(data) {
		return request({
			url: `/api/external/workTicketTwo/deleteWorkTicket`,
			method: 'delete',
			data
		})
	},
	// 审核作业票
	getAuditTicket(workPlanId) {
		return request({
			url: `/api/external/workTicketTwo/reviewWorkTicket?workPlanId=${workPlanId}`,
			method: 'put',
		})
	},
	// 核销作业票
	getCancelTicket(workPlanId) {
		return request({
			url: `/api/external/workTicketTwo/cancelReviewWorkTicket?workPlanId=${workPlanId}`,
			method: 'put',
		})
	},
	// 获取分组下拉框
	getGroupSelect(processCode) {
		return request({
			url: `/api/external/group/listGroupNo?processCode=${processCode}`,
			method: 'get',
		})
	},
	// 获取分组数据
	getGroupData(params) {
		return request({
			url: '/api/external/group/insertGroup',
			method: 'get',
			params,
		})
	},
	// 获取操作工班
	getDepts(data) {
		return request({
			url: '/api/external/workTicketTwo/getDepts?type=' + data.type,
			method: 'get',
		})
	},
	// 获取理货记录
	getTallyRecord(params) {
		return request({
			url: `/api/external/tally/getTallyRecord`,
			method: 'get',
			params,
		})
	},
	// 下拉框
	getDeptsTally() {
		return request({
			url: '/api/external/workTicketTwo/getDeptsTally',
			method: 'get',
		})
	},
	getProcessType(params) {
		return request({
			url: '/api/external/workTicketTwo/getProcessIsTally',
			method: 'get',
			params,
		})
	},
	getProcess(params) {
		return request({
			url: '/api/external/workTicketTwo/getProcess',
			method: 'get',
			params,
		})
	},
	getSelectData(params) {
		return request({
			url: '/api/external/tally/getProcessInfoList',
			method: 'get',
			params,
		})
	},
	// 获取件数吨数
	getWorkMeasure(params) {
		return request({
			url: '/api/external/workTicketTwo/getWorkMeasure',
			method: 'get',
			params,
		})
	},
	// 查询计划下票货
	getCargoInfoListByPlanId(params) {
		return request({
			url: '/api/external/workTicketTwo/getCargoInfoListByPlanId',
			method: 'get',
			params,
		})
	},
	// 查询二次配工信息
	getDispatchSecondList(params) {
		return request({
			url: '/api/external/workTicketTwo/getDispatchSecondList',
			method: 'get',
			params,
		})
	},
}
export default api
