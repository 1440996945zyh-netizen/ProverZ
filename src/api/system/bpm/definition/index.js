import request from '@/utils/auth/request'

// 统一封装 BPM 流程定义 API 对象
const BpmProcessDefinitionApi = {
	/**
	 * 获得工作流的流程定义
	 * @param {*} id
	 * @param {*} key
	 * @returns
	 */
	getProcessDefinition: async (id, key) => {
		return request({
			url: '/bpm/processDefinition/get',
			method: 'get',
			params: { id, key },
		})
	},

	/**
	 * 查询流程定义分页
	 * @param {*} params
	 * @returns
	 */
	getProcessDefinitionPage: async params => {
		return request({
			url: '/bpm/processDefinition/page',
			method: 'get',
			params,
		})
	},

	/**
	 * 查询流程定义列表
	 * @param {*} params
	 * @returns
	 */
	getProcessDefinitionList: async params => {
		return request({
			url: '/bpm/processDefinition/list',
			method: 'get',
			params,
		})
	},

	/**
	 * 查询简单流程定义列表
	 * @returns
	 */
	getSimpleProcessDefinitionList: async () => {
		return request({
			url: '/bpm/processDefinition/simple-list',
			method: 'get',
		})
	},
}

// 默认导出统一的 API 对象，方便页面一次性导入
export default BpmProcessDefinitionApi
