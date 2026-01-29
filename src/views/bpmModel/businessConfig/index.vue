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
				:isShowAdvancedQuery="true"
			/>
		</div>
		<Dialog v-model:visible="dialogVisible" :title="title" width="600px">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="bpmBusinessConfig">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, getCurrentInstance, h, provide } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/system/bpm/businessConfig/index.js'
import detail from './detail/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import dayjs from 'dayjs'

const { proxy } = getCurrentInstance()
const advancedQuery = ref([])
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const dialogVisible = ref(false)
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const clickRow = ref({})
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		label: '业务ID',
		prop: 'businessId',
		align: 'center',
		width: 100,
	},
	{
		label: '业务名称',
		prop: 'businessName',
		align: 'left',
		minWidth: 180,
		showOverflowTooltip: true,
	},
	{
		label: '业务类型',
		prop: 'businessTypeName',
		align: 'left',
		minWidth: 150,
	},
	{
		label: '流程模型',
		prop: 'procModelName',
		align: 'left',
		minWidth: 180,
		showOverflowTooltip: true,
	},
	{
		label: '流程定义ID',
		prop: 'procDefId',
		align: 'left',
		minWidth: 150,
	},
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 100,
		render: row => {
			return h(ElSwitch, {
				modelValue: row.status === '1',
				activeValue: '1',
				inactiveValue: '0',
				activeColor: '#13ce66',
				inactiveColor: '#ff4949',
				disabled: row.isSystem === 1, // 可选：系统内置配置不可修改
			})
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
						style: 'margin-right: 8px',
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
		name: '业务名称',
		type: 'input',
		modelValue: 'businessName',
		span: 8,
		placeholder: '请输入业务名称',
	},
	{
		name: '业务类型',
		type: 'input',
		modelValue: 'businessTypeName',
		span: 8,
		placeholder: '请输入业务类型',
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		options: [
			{ label: '启用', value: '1' },
			{ label: '禁用', value: '0' },
		],
		placeholder: '请选择状态',
	},
])

// 按钮列表
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'bpm:businessConfig:insert',
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
	dialogVisible.value = true
	title.value = '新增业务配置'
	// nextTick(() => {
	// 	detailRef.value.resetForm()
	// })
}

/** 编辑 */
const edit = row => {
	const editRow = row || clickRow.value
	dialogVisible.value = true
	title.value = '编辑业务配置'
	nextTick(() => {
		detailRef.value.resetForm()
		api.getDetail(editRow.id)
			.then(res => {
				if (res && res.data) {
					proxy.setFormData(detailRef.value.formData, res.data)
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
						dialogVisible.value = false
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
						dialogVisible.value = false
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
		.confirm('确定删除该业务配置？')
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
		.status-cell {
			.el-tag {
				margin-right: 5px;
			}
		}
	}
}
</style>
