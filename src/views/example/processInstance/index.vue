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
				:id="tableId"
				:isShowAdvancedQuery="true"
			/>
		</div>
		<Drawer v-model="drawerVisible" :title="title" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
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

const { proxy } = getCurrentInstance()
const advancedQuery = ref([])
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const drawerVisible = ref(false)
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const clickRow = ref({})
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const tableId = ref('bpm_application_example_1760148546265')

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
		label: '付款事由',
		prop: 'paymentTitle',
		align: 'left',
		minWidth: 180,
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
					`¥ ${row.paymentAmount}`,
				),
			]
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
		label: '申请人',
		prop: 'applicantName',
		align: 'left',
		width: 100,
	},
	{
		label: '审批状态',
		prop: 'approvalStatus',
		align: 'center',
		width: 100,
		render: row => {
			let type = ''
			let text = ''
			switch (row.approvalStatus) {
				case '0':
					type = 'warning'
					text = '待审批'
					break
				case '1':
					type = 'warning'
					text = '审批种'
					break
				case '2':
					type = 'success'
					text = '已审批'
					break
				case '3':
					type = 'danger'
					text = '已拒绝'
					break
				default:
					type = 'info'
					text = row.approvalStatus
			}
			return [
				h(
					ElTag,
					{
						type: type,
					},
					{
						default: () => text,
					},
				),
			]
		},
	},

	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
					},
					{
						default: () => '编辑',
					},
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: row.approvalStatus === 'approved', // 已批准的不能删除
					},
					{
						default: () => '删除',
					},
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
		span: 8,
		placeholder: '请输入付款事由',
	},
	{
		name: '收款方名称',
		type: 'input',
		modelValue: 'payeeName',
		span: 8,
		placeholder: '请输入收款方名称',
	},
	{
		name: '申请人',
		type: 'input',
		modelValue: 'applicantName',
		span: 8,
		placeholder: '请输入申请人姓名',
	},
	{
		name: '审批状态',
		type: 'select',
		modelValue: 'approvalStatus',
		span: 2,
		options: [
			{ label: '待审批', value: '0' },
			{ label: '审批种', value: '1' },
			{ label: '已审批', value: '2' },
			{ label: '已拒绝', value: '3' },
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
		click: () => add(),
		permission: 'bpm:application:example:insert',
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 接收高级查询数据
provide('onQuery', data => {
	console.log('父组件收到高级查询数据：', data)
	advancedQuery.value = JSON.parse(JSON.stringify(data))
	getList()
})

/** 查询列表 */
const getList = e => {
	queryParams.value = e || queryParams.value
	let params = {
		...queryParams.value,
		advancedQuery: JSON.stringify(advancedQuery.value),
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
		detailRef.value.formData.approvalStatus = 'pending'
		detailRef.value.formData.applicantId = proxy.$store.getters.userInfo?.userId || ''
		detailRef.value.formData.applicantName = proxy.$store.getters.userInfo?.userName || ''
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

/** 查看详情 */
const viewDetail = row => {
	const viewRow = row || clickRow.value
	drawerVisible.value = true
	title.value = '报销申请详情'
	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.isViewMode = true
		api.getDetail(viewRow.id)
			.then(res => {
				if (res && res.data) {
					proxy.setFormData(detailRef.value.formData, res.data)

					// 格式化日期
					if (res.data.applyTime) {
						detailRef.value.formData.applyTime = dayjs(res.data.applyTime).format('YYYY-MM-DD HH:mm:ss')
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
