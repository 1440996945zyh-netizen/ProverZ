<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:11:56
 * @LastEditTime: 2026-02-11 10:54:03
 * @LastEditors: zhangsd
 * @Description: 业务配置 流程关联业务
 * @FilePath: \view\src\views\bpmModel\businessConfig\index.vue
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
				:tableHeight="tableHeight"
			/>
		</div>
		<!-- 新增/编辑业务关联  -->
		<Dialog v-model:visible="dialogVisible" :title="title" width="600px">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Dialog>

		<!-- 流程模型预览  -->
		<Dialog v-model:visible="previewDialogVisible" title="流程模型预览" width="60%" :showFooter="false">
			<BpmPreviewDialog :loading="previewLoading" :modelId="previewProcModelId" @close="previewDialogVisible = false" />
		</Dialog>
	</div>
</template>

<script setup name="bpmBusinessConfig">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, getCurrentInstance, h, provide } from 'vue'
import { ElButton, ElTag, ElSwitch } from 'element-plus' // 显式引入ElSwitch
import api from '@/api/system/bpm/businessConfig/index.js'
import detail from './detail/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import dayjs from 'dayjs'
import tableParamsStore from '@/store/modules/tableParams'
import { CommonStatusEnum, CommonStatusEnumLabel } from '@/utils/bpm/constantEnumeration'
import BpmPreviewDialog from './detail/bpmPreviewDialog.vue'
const { proxy } = getCurrentInstance()
const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHeight.value - 25)
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const dialogVisible = ref(false)
const total = ref('') // 数据总数
const title = ref(null) // 弹窗标题
const clickRow = ref({})
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 预览流程模型
const previewDialogVisible = ref(false)
const previewLoading = ref(false)
// 表格数据
const tableData = ref([])
/**
 * 表格列配置
 */
const tableColumns = ref([
	{
		prop: '',
		label: '序号',
		type: 'seq',
		align: 'center',
	},
	{
		label: '主业务',
		prop: 'businessName',
		align: 'left',
		minWidth: 180,
		showOverflowTooltip: true,
	},

	{
		label: '子业务',
		prop: 'businessTypeName',
		align: 'left',
		minWidth: 150,
		render: row => {
			return h(ElTag, { type: 'primary' }, { default: () => row.businessTypeName })
		},
	},
	{
		label: '关联流程模型',
		prop: 'procModelName',
		align: 'left',
		minWidth: 180,
		showOverflowTooltip: true,
		render: row => {
			return h(ElButton, { type: 'primary', link: true, onClick: () => handlePreview(row) }, { default: () => row.procModelName })
		},
	},
	{
		label: '备注',
		prop: 'remark',
		align: 'left',
		minWidth: 180,
	},
	{
		label: '创建时间',
		prop: 'createTime',
		align: 'center',
		minWidth: 180,
	},
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 100,
		render: row => {
			return h(ElSwitch, {
				modelValue: row.status,
				activeValue: '1',
				inactiveValue: '0',
				activeColor: '#13ce66',
				inactiveColor: '#ff4949',

				disabled: row.isSystem == 1, // 可选：系统内置配置不可修改
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
					{ default: () => '编辑' }
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
					{ default: () => '删除' }
				),
			]
		},
	},
])

// 查询条件
const selectData = reactive([
	{
		name: '业务模块',
		type: 'input',
		modelValue: 'businessName',
		span: 12,
		placeholder: '请输入业务模块名称',
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 12,
		placeholder: '请选择状态',
		selectData: [
			{
				label: '开启',
				value: '1',
			},
			{
				label: '禁用',
				value: '0',
			},
		],
		selectLabel: 'label', // 下拉选项的文本字段
		selectValue: 'value', // 下拉选项的value字段
	},
])

// 按钮列表
const buttonList = reactive([
	{
		label: '新增关联',
		type: 'primary',
		icon: 'Plus',
		click: () => add, // 修复：原有为()=>add，改为直接绑定方法
		permission: 'bpm:businessConfig:insert',
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

/** 新增（补全：表单重置） */
const add = () => {
	dialogVisible.value = true
	title.value = '业务关联'
	nextTick(() => {
		detailRef.value.resetForm() // 修复：取消注释，新增时重置表单
	})
}

/** 编辑 */
const edit = row => {
	const editRow = row || clickRow.value
	dialogVisible.value = true
	title.value = '业务关联'
	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.setFormData(row)
	})
}

/** 保存（新增/编辑通用） */
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData))
		const isEdit = !!params.id
		console.log('saveparams', params)
		proxy.$modal.confirm(`确定${isEdit ? '修改' : '新增'}${params.businessName}-${params.procModelName}配置？`).then(() => {
			// 区分新增/编辑接口
			const request = isEdit ? api.update(params) : api.insert(params)
			request
				.then(res => {
					proxy.$modal.msgSuccess(res.msg || (isEdit ? '修改成功' : '新增成功'))
					dialogVisible.value = false
					getList(queryParams.value) // 刷新列表
				})
				.catch(error => {
					console.error(`${isEdit ? '修改' : '新增'}失败:`, error)
					proxy.$modal.msgError(`${isEdit ? '修改' : '新增'}失败`)
				})
		})
	}
}

/** 删除 */
const handleDelete = row => {
	const deleteRow = row || clickRow.value
	proxy.$modal
		.confirm('确定删除该流程-业务关联配置？删除后不可恢复！', '提示', { type: 'warning' })
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
const previewProcModelId = ref(null)
/**
 * 预览流程模型
 */
const handlePreview = async (row) => {
	previewLoading.value = true
	try {
		previewDialogVisible.value = true
		previewProcModelId.value = row.procModelId
	} catch (err) {
		console.error('预览流程模型失败：', err)
		previewProcModelId.value = null
		proxy.$modal.msgError('预览流程模型失败，请稍后重试')
	} finally {
		previewLoading.value = false

	}
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