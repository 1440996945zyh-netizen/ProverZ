<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:21:33
 * @LastEditTime: 2026-02-10 15:57:44
 * @LastEditors: zhangsd
 * @Description:  流程监听器
 * @FilePath: \view\src\views\bpmModel\processListener\index.vue
-->
<template>
	<div class="app-container">
		<BaseTable
			ref="listenerTableRef"
			:showSearchHeader="true"
			:tableColumns="tableColumns"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableData="tableData"
			:rowConfig="rowConfig"
			:tableHeight="tableHeight"
			name="processListenerTable"
			:loading="tableLoading"
			:showPagination="true"
			:showToolBar="false"
			:total="total"
			v-model:page="queryParams.pageNo"
			v-model:limit="queryParams.pageSize"
			@pagination="getList"
		/>
		<ProcessListenerForm ref="formRef" @success="getList" />
		<ModelList ref="modelListRef" />
	</div>
</template>

<script setup>
defineOptions({ name: 'BpmProcessListener' })
import ProcessListenerForm from './ProcessListenerForm.vue'
import ModelList from './modelList.vue'
// 1. 基础依赖导入
import { formatDate } from '@/utils/common/date'
import {
	CommonStatusEnum,
	CommonStatusEnumLabel,
	BPM_PROCESS_LISTENER_TYPE,
	BPM_PROCESS_LISTENER_VALUE_TYPE,
} from '@/utils/bpm/constantEnumeration'
// 2. 组件导入
import BaseTable from '@/components/BaseTable/index.vue'
// 3. 接口与状态管理导入
import { ProcessListenerApi } from '@/api/system/bpm/processListener'
import tableParamsStore from '@/store/modules/tableParams'
import { nextTick, ref } from 'vue'

// 4. 组件实例与基础配置
const { proxy } = getCurrentInstance()
const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const listenerTableRef = ref(null)
const formRef = ref(null)
const modelListRef = ref(null)

// 5. 核心响应式数据
const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 10,
		name: undefined,
		type: undefined,
	},
	tableData: [],
	total: 0,
	tableLoading: false,
})

const { queryParams, tableData, total, tableLoading } = toRefs(data)

// 6. 页面状态变量
const tableHeight = computed(() => storeHeight.value - 15)
const rowConfig = { keyField: 'id' }

// 7. 搜索条件配置
const selectData = reactive([
	{
		name: '名称',
		type: 'input',
		modelValue: 'listenerName',
		span: 12,
	},
	{
		name: '类型',
		type: 'select',
		modelLabel: 'listenerTypeName',
		modelValue: 'listenerTypeCode',
		span: 12,
		placeholder: '请选择类型',
		selectData: BPM_PROCESS_LISTENER_TYPE,
		selectLabel: 'label',
		selectValue: 'value',
	},
])

// 8. 顶部按钮配置
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => {
			openForm('create', undefined)
		},
		permission: 'bpm:processListener:create',
	},
])

// 9. 表格列配置
const tableColumns = ref([
	{
		prop: '',
		label: '编号',
		align: 'center',
		width: 80,
		type: 'seq',
	},
	{
		prop: 'listenerName',
		label: '名称',
		align: 'left',
		minWidth: 150,
	},
	{
		prop: 'listenerTypeName',
		label: '类型',
		align: 'center',
		width: 120,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.listenerTypeCode == 'task' ? '' : 'success',
					},
					{
						default: () => row.listenerTypeName || '',
					}
				),
			]
		},
	},
	{
		prop: 'listenerStatus',
		label: '状态',
		align: 'center',
		width: 100,
		render: row => {
			const statusItem = CommonStatusEnumLabel.find(item => item.value == row.listenerStatus)
			return h(
				ElTag,
				{
					type: statusItem?.type || 'info',
				},
				{
					default: () => statusItem?.label || '未知状态',
				}
			)
		},
	},
	{
		prop: 'listenerEventName',
		label: '事件',
		align: 'center',
		width: 120,
	},
	{
		prop: 'listenerValueTypeName',
		label: '值类型',
		align: 'center',
		width: 120,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.listenerValueTypeCode == 'class' ? '' : row.listenerValueTypeCode == 'expression' ? 'success' : 'warning',
					},
					{
						default: () => row.listenerValueTypeName || '',
					}
				),
			]
		},
	},
	{
		prop: 'listenerValue',
		label: '值',
		align: 'left',
		showOverFlow: true,
		minWidth: 200,
	},
	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
		width: 180,
		render: row => [h('span', {}, formatDate(row.createTime))],
	},
	{
		label: '操作',
		align: 'center',
		width: 240,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							openForm('update', row.id)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						style: 'margin-right: 8px',
						permission: 'bpm:processListener:update',
					},
					{ default: () => '编辑' }
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row.id)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'bpm:processListener:delete',
					},
					{ default: () => '删除' }
				),
				h(
					ElButton,
					{
						onClick: () => {
							listenerModel(row.id)
						},
						type: 'primary',
						link: true,
						permission: 'bpm:processListener:query',
					},
					{ default: () => '监听模型' }
				),
			]
		},
	},
])

// 10. 核心业务方法
/** 查询列表 */
const getList = async e => {
	let params = {
		...queryParams.value,
		...e,
	}
	tableLoading.value = true
	try {
		const res = await ProcessListenerApi.getList(params)
		tableData.value = res.data.pages || []
		total.value = res.data.totalNum
	} catch (error) {
		proxy.$modal.msgError('获取列表失败')
	} finally {
		tableLoading.value = false
	}
}

/** 搜索操作 */
const handleQuery = () => {
	queryParams.value.pageNo = 1
	getList()
}
/**查询监听模型 */
const listenerModel = id => {
	nextTick(() => {
		modelListRef.value.open(id)
	})
}

/** 表单打开 */
const openForm = (type, id) => {
	console.log('type,id =>', type, id)
	console.log('formRef 实例:', formRef.value)
	nextTick(() => {
		formRef.value.open(type, id)
	})
}

/** 删除操作 */
const handleDelete = async id => {
	try {
		await proxy.$modal.confirm('确定要删除该监听器吗？')
		await ProcessListenerApi.deleteProcessListener(id)
		proxy.$modal.msgSuccess('删除成功')
		getList()
	} catch (error) {
		if (error !== 'cancel') {
			// 排除取消确认的情况
			proxy.$modal.msgError('删除失败')
			console.log('删除失败：', error)
		} else {
			console.log('取消删除')
		}
	}
}
// 11. 初始化
onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
.app-container {
	margin: 0 auto;
	height: 100% !important;
	box-sizing: border-box;
}
</style>
