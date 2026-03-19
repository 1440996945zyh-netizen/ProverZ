import request from '@/utils/auth/request'

const api = {
	getWorkbenchData() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: '0000',
					data: {
						taskCount: {
							todo: 12,
							created: 2048,
							handled: 12,
							copied: 2408
						},
						todayWorkOrder: {
							total: 239,
							internal: 197,
							business: 42
						},
						todaySpecialWork: {
							hoisting: 4,
							fire: 40
						},
						maintenancePool: {
							total: 165173,
							overdue: 76
						},
						userInfo: {
							name: '测试账号一',
							company: '日照港集团有限公司'
						},
						announcementList: [
							{
								date: '2024年12月20日',
								content: '智慧设备管理基础平台升级通知'
							},
							{
								date: '2024年11月20日',
								content: '智慧设备管理基础平台升级通知'
							},
							{
								date: '2024年11月18日',
								content: '智慧设备管理基础平台升级通知'
							},
							{
								date: '2024年11月12日',
								content: '智慧设备管理基础平台升级通知'
							}
						],
						relatedSystemList: [
							{ name: '山东日照集装管网' },
							{ name: '日照港物资管理系统' },
							{ name: '"智联"创新空间' },
							{ name: '车位置管理系统' }
						]
					}
				})
			}, 300)
		})
	},

	getMyTaskCount() {
		return request({
			url: '/api/v1/internal/workbench/getMyTaskCount',
			method: 'get'
		})
	},

	getMyTaskList(params) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: '0000',
					data: [
						{
							workOrderType: '维修委托',
							equipmentName: 'LW197',
							taskNumber: 'WXWT-20220614-007',
							content: '服务站保修申请'
						},
						{
							workOrderType: '维修委托',
							equipmentName: 'TQ125',
							taskNumber: 'WXWT-20220626-015',
							content: '测试'
						},
						{
							workOrderType: '维修服务申请',
							equipmentName: 'CC-8X8',
							taskNumber: 'XSSQ-20220621-001',
							content: '36叉车叉车门架焊接变形，需汽车车驾配合检测并组织外委及工艺'
						},
						{
							workOrderType: '维修服务申请',
							equipmentName: 'CC-8X8',
							taskNumber: 'XSSQ-20220621-002',
							content: '36叉车叉车门架焊接变形，需汽车车驾配合检测并组织外委及工艺'
						},
						{
							workOrderType: '维修服务申请',
							equipmentName: '单位负责人: 李位全',
							taskNumber: '',
							content: '单位类型: 车管服务站,进站单位名称: 日照运发汽车服务有限公司'
						}
					]
				})
			}, 300)
		})
	},

	getTodayWorkOrder() {
		return request({
			url: '/api/v1/internal/workbench/getTodayWorkOrder',
			method: 'get'
		})
	},

	getTodaySpecialWork() {
		return request({
			url: '/api/v1/internal/workbench/getTodaySpecialWork',
			method: 'get'
		})
	},

	getMaintenancePool() {
		return request({
			url: '/api/v1/internal/workbench/getMaintenancePool',
			method: 'get'
		})
	},

	getAnnouncementList(params) {
		return request({
			url: '/api/v1/internal/workbench/getAnnouncementList',
			method: 'get',
			params: params
		})
	},

	getRelatedSystemList() {
		return request({
			url: '/api/v1/internal/workbench/getRelatedSystemList',
			method: 'get'
		})
	}
}

export default api
