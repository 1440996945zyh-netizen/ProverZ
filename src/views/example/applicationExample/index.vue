<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:11:56
 * @LastEditTime: 2026-02-27 14:10:09
 * @LastEditors: zhangsd
 * @Description: 业务流程示例
 * @FilePath: \view\src\views\example\applicationExample\index.vue
-->

<template>
	<div>
		<div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:total="total"
				:showNum="6"
				:tableHeight="tableHeight"
				:defaultWidth="50"
			/>
		</div>
		<Drawer v-model="drawerVisible" :title="title" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<!-- <el-button type="primary" @click="handleSubmit">提交</el-button> -->
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="bpmApplicationExample">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/example/applicationExample/index.js'
import detail from './detail/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import dayjs from 'dayjs'
import DropDown from '@/components/DropDown/newIndex.vue' // 补充Dropdown组件导入
import tableParamsStore from '@/store/modules/tableParams'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
import { useRoute, useRouter } from 'vue-router'
// 引入流程启动器
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'
// 引入流程启动器
const { startProcess, loading } = useProcessStarter()
const { proxy } = getCurrentInstance()
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const drawerVisible = ref(false)
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const clickRow = ref({})
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value - 20) //表格高度
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		label: '申请日期',
		prop: 'applyTime',
		align: 'center',
		width: 160,
	},
	{
		label: '期望付款时间',
		prop: 'expectedPaymentTime',
		align: 'center',
		width: 160,
		render: row => {
			return [h('span', {}, row.expectedPaymentTime ? dayjs(row.expectedPaymentTime).format('YYYY-MM-DD') : '-')]
		},
	},
	{
		label: '收款方名称',
		prop: 'payeeName',
		align: 'left',
		minWidth: 150,
		showOverflowTooltip: true,
	},

	{
		label: '付款金额',
		prop: 'paymentAmount',
		align: 'right',
		width: 120,
		render: row => {
			return [
				h(
					'span',
					{
						style: { color: '#f56c6c', fontWeight: 'bold' },
					},
					`¥ ${row.paymentAmount}`
				),
			]
		},
	},
	{
		label: '付款类型',
		prop: 'paymentType',
		align: 'center',
		width: 100,
		render: row => {
			let type = ''
			let text = ''
			switch (row.paymentType) {
				case 'commercialpayment':
					type = 'primary'
					text = '商用付款'
					break
				case 'consumablespayment':
					type = 'warning'
					text = '耗材付款'
					break
				default:
					type = 'info'
					text = '--'
			}
			return [
				h(
					ElTag,
					{
						type: type,
					},
					{
						default: () => text,
					}
				),
			]
		},
	},
	{
		label: '申请人',
		prop: 'applicantName',
		align: 'left',
		width: 100,
	},
	{
		label: '付款事由',
		prop: 'paymentTitle',
		align: 'left',
		minWidth: 180,
		showOverflowTooltip: true,
	},
	{
		label: '审批节点',
		prop: 'currentNodeName',
		align: 'center',
		width: 180,
	},
	{
		label: '待办人',
		prop: 'approverNames',
		align: 'center',
		width: 180,
	},
	{
		label: '审批状态',
		prop: 'approvalStatus',
		align: 'center',
		width: 100,
		render: row => {
			let type = ''
			switch (row.approvalStatus) {
				case '0':
					type = ''
					break
				case '1':
					type = 'warning'
					break
				case '2':
					type = 'success'
					break
				case '3':
					type = 'danger'
					break
				case '4':
					type = 'info'

					break
				default:
					type = 'info'
			}
			return [
				h(
					ElTag,
					{
						type: type,
					},
					{
						default: () => row.approvalStatusLabel,
					}
				),
			]
		},
	},
	{
		label: '操作',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			// 1. 定义锁定状态：审批中(1) 和 审批通过(2) 锁定操作
			const isLocked = row.approvalStatus == '1' || row.approvalStatus == '2'

			// 2. 构造下拉菜单列表
			const dropDownList = [
				{
					name: '编辑',
					command: '编辑',
					click: () => edit(row),
					icon: 'Edit',
					disabled: isLocked,
				},
				{
					name: '申请',
					command: '申请',
					click: () => handleSubmitPayment(row, 'bpm:application:example:unificationpayment'),
					icon: 'Finished',
					disabled: isLocked,
				},
				{
					name: '删除',
					command: '删除',
					click: () => handleDelete(row),
					icon: 'Delete',
					type: 'danger',
					disabled: isLocked,
				},
				{
					name: '履历',
					command: '履历',
					click: () => handleHistory(row),
					icon: 'Histogram',
					type: 'primary',
				},
			]

			// --- 动态审批按钮逻辑 ---
			if (row.paymentType == 'commercialpayment' || row.paymentType == 'consumablespayment') {
				dropDownList.push({
					name: '发起',
					command: '发起',
					click: () => handleSubmitPayment(row, 'bpm:application:example:' + row.paymentType),
					icon: 'Finished',
					disabled: isLocked,
					type: 'primary',
				})
			}

			// 3. 返回 DropDown 组件
			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						// 如果 DropDown 内部处理了权限，这里传入对应的 key，否则传空
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }), // 下拉按钮显示更多图标
					}
				),
			]
		},
	},
])

// 查询条件
const selectData = reactive([
	{
		name: '付款事由',
		type: 'input',
		modelValue: 'paymentTitle',
		span: 5,
		placeholder: '请输入付款事由',
	},
	{
		name: '收款方名称',
		type: 'input',
		modelValue: 'payeeName',
		span: 5,
		placeholder: '请输入收款方名称',
	},
	{
		name: '付款类型',
		type: 'select',
		modelValue: 'paymentType',
		span: 5,
		placeholder: '请选择付款类型',
		selectData: [
			{ label: '商用付款', value: 'commercialpayment' },
			{ label: '耗材付款', value: 'consumablespayment' },
		],
		selectLabel: 'label',
		selectValue: 'value',
	},
	{
		name: '申请人',
		type: 'input',
		modelValue: 'applicantName',
		span: 5,
		placeholder: '请输入申请人姓名',
	},
	{
		name: '审批状态',
		type: 'select',
		modelValue: 'approvalStatus',
		span: 4,
		selectData: [
			{ label: '未开始', value: '-1' },
			{ label: '审批中', value: '1' },
			{ label: '审批通过', value: '2' },
			{ label: '审批不通过', value: '3' },
			{ label: '已办结', value: '4' },
		],
		placeholder: '请选择审批状态',
	},
])

// 按钮列表
const buttonList = reactive([
	{
		label: '新增申请',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'bpm:application:example:insert',
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

/** 查询列表 */
const getList = e => {
	queryParams.value = e || queryParams.value
		let params = {
		...queryParams.value,
		...e,
	}

	// 处理日期范围
	if (params.applyTimeRange && params.applyTimeRange.length === 2) {
		params.startApplyTime = params.applyTimeRange[0]
		params.endApplyTime = params.applyTimeRange[1]
		delete params.applyTimeRange
	}

	api.getList(params)
		.then(response => {
			if (response && response.data) {
				tableData.value = response.data.pages || []
				total.value = response.data.totalNum || 0
			} else {
				tableData.value = []
				total.value = 0
			}
		})
		.catch(error => {
			console.error('获取列表失败:', error)
			tableData.value = []
			total.value = 0
		})
}

/** 新增 */
const add = () => {
	drawerVisible.value = true
	title.value = '新增报销申请'
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

/** 编辑 */
const edit = row => {
	const editRow = row || clickRow.value
	drawerVisible.value = true
	title.value = '编辑报销申请'
	nextTick(() => {
		detailRef.value.resetForm()
		api.getDetail(editRow.id)
			.then(res => {
				if (res && res.data) {
					proxy.setFormData(detailRef.value.formData, res.data)

					// 格式化日期
					if (res.data.applyTime) {
						detailRef.value.formData.applyTime = dayjs(res.data.applyTime).format('YYYY-MM-DD ')
					}
					if (res.data.expectedPaymentTime) {
						detailRef.value.formData.expectedPaymentTime = dayjs(res.data.expectedPaymentTime).format('YYYY-MM-DD')
					}
				}
			})
			.catch(error => {
				console.error('获取详情失败:', error)
				proxy.$modal.msgError('获取详情失败')
			})
	})
}
// 初始化全局实例
const route = useRoute()
const router = useRouter()
/**
 * 提交商用付款流程
 * @param param0.processDefinitionId 流程定义ID
 * @param param0.variables 流程变量
 */
const submitCommercialPayment = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitCommercialPayment:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return api.submitCommercialPayment(params)
}
/**
 * 提交耗材付款申请
 * @param param0.processDefinitionId 流程定义ID
 * @param param0.variables 流程变量
 * @param param0.startUserSelectAssignees 启动用户选择审批人
 * @param param0.businessId 业务ID
 * @param param0.rowData 点击行数据
 * @param param0.processDefinitionId 流程定义ID
 */
const submitConsumablesPayment = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitConsumablesPayment:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return api.submitConsumablesPayment(params)
}
/**
 * 提交综合付款申请
 * @param param0.rowData 点击行数据
 * @param param0.processDefinitionId 流程定义ID
 * @param param0.variables 流程变量
 * @param param0.startUserSelectAssignees 启动用户选择审批人
 * @param param0.businessId 业务ID
 */
const submitUnificationPayment = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitUnificationPayment:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return api.submitUnificationPayment(params)
}
/**
 * 处理付款提交
 * @param row 点击行数据
 * @param paymentType 付款类型
 */
const handleSubmitPayment = (row, paymentType) => {
	api.getDetail(row.id)
		.then(res => {
			if (res && res.data) {
				// proxy.setFormData(detailRef.value.formData, res.data)
				startProcess({
					rowData: res.data, // 点击行数据
					businessId: route.meta?.menuId, // 业务ID 业务菜单id
					businessTypeCode: paymentType, // 业务类型编码 按钮权限标识
					businessSubmit:
						paymentType == 'bpm:application:example:commercialpayment'
							? submitCommercialPayment
							: paymentType == 'bpm:application:example:unificationpayment'
							? submitUnificationPayment
							: submitConsumablesPayment, // 业务提交函数
					onSuccess() {
						ElMessage.success('提交成功')
						getList(queryParams.value)
					},
					onError(err) {
						ElMessage.error(err.message)
						getList(queryParams.value)
					},
				})
			}
		})
		.catch(error => {
			console.error('获取详情失败:', error)
			proxy.$modal.msgError('获取详情失败')
		})
}

/** 保存 */
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData))
		const isEdit = !!params.id

		proxy.$modal.confirm(`确定${isEdit ? '修改' : '新增'}？`).then(() => {
			if (isEdit) {
				api.update(params)
					.then(res => {
						proxy.$modal.msgSuccess(res.msg || '修改成功')
						drawerVisible.value = false
						getList(queryParams.value)
					})
					.catch(error => {
						console.error('修改失败:', error)
						proxy.$modal.msgError('修改失败')
					})
			} else {
				api.insert(params)
					.then(res => {
						proxy.$modal.msgSuccess(res.msg || '新增成功')
						drawerVisible.value = false
						getList(queryParams.value)
					})
					.catch(error => {
						console.error('新增失败:', error)
						proxy.$modal.msgError('新增失败')
					})
			}
		})
	}
}

/** 删除 */
const handleDelete = row => {
	const deleteRow = row || clickRow.value
	proxy.$modal
		.confirm('确定删除该条报销申请？')
		.then(() => {
			api.deleteById(deleteRow.id)
				.then(res => {
					getList(queryParams.value)
					proxy.$modal.msgSuccess(res.msg || '删除成功')
				})
				.catch(error => {
					console.error('删除失败:', error)
					proxy.$modal.msgError('删除失败')
				})
		})
		.catch(() => {})
}

/**
 * 查看流程履历
 * @param row 点击行数据
 */
const handleHistory = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}
// 初始化加载列表
getList(queryParams.value)
</script>

<style lang="less" scoped>
.app-container {
	padding: 20px;

	:deep(.el-table) {
		.amount-cell {
			font-weight: bold;
			color: #f56c6c;
		}

		.status-cell {
			.el-tag {
				margin-right: 5px;
			}
		}
	}
}
</style>
