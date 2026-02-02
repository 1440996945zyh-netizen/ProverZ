<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:21:33
 * @LastEditTime: 2026-02-02 17:54:18
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
	</div>
</template>

<script setup>
defineOptions({ name: 'BpmProcessListener' })
import { Edit, Setting, Promotion, VideoPause, VideoPlay, Delete, Finished, Check } from '@element-plus/icons-vue'
import ProcessListenerForm from './ProcessListenerForm.vue'
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
import DropDown from '@/components/DropDown/newIndex.vue'
// 3. 接口与状态管理导入
import { ProcessListenerApi } from '@/api/system/bpm/processListener'
import tableParamsStore from '@/store/modules/tableParams'
import { nextTick, ref } from 'vue'

// 4. 组件实例与基础配置
const { proxy } = getCurrentInstance()
const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const listenerTableRef = ref(null)
const formRef = ref(null)
const dialogTitle = ref('')
const dialogVisible = ref(false)
// 5. 核心响应式数据
const data = reactive({
	queryParams: {
		pageNo: 1,
		pageSize: 20,
		name: undefined,
		type: undefined,
	},
	tableData: [
		{
			id: 1,
			name: '员工请假流程',
			type: 'execution',
			status: 0,
			event: '开始',
			valueType: 'expression',
			value: '${bpmTaskAssignStartUserExpression.calculateUsers(execution)}',
			createTime: 1770022075000,
		},
	],
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
		name: '名字',
		type: 'input',
		modelValue: 'name',
		span: 12,
	},
	{
		name: '类型',
		type: 'select',
		modelValue: 'type',
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
		prop: 'id',
		label: '编号',
		align: 'center',
		width: 80,
	},
	{
		prop: 'name',
		label: '名字',
		align: 'center',
		minWidth: 150,
	},
	{
		prop: 'type',
		label: '类型',
		align: 'center',
		width: 120,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: BPM_PROCESS_LISTENER_TYPE.find(item => item.value === row.type)?.label === '执行监听器' ? '' : 'info',
					},
					{
						default: () =>
							BPM_PROCESS_LISTENER_TYPE.find(item => item.value === row.type)?.label === '执行监听器'
								? '执行监听器'
								: '任务监听器',
					}
				),
			]
		},
	},
	{
		prop: 'status',
		label: '状态',
		align: 'center',
		width: 100,

		render: row => {
			const statusItem = CommonStatusEnumLabel.find(item => item.value == row.status)
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
		prop: 'event',
		label: '事件',
		align: 'center',
		width: 120,
	},
	{
		prop: 'valueType',
		label: '值类型',
		align: 'center',
		width: 120,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: BPM_PROCESS_LISTENER_VALUE_TYPE.find(item => item.value === row.valueType)?.label === 'JAVA类' ? '' : 'info',
					},
					{
						default: () =>
							BPM_PROCESS_LISTENER_VALUE_TYPE.find(item => item.value === row.valueType)?.label === 'JAVA类'
								? 'JAVA类'
								: BPM_PROCESS_LISTENER_VALUE_TYPE.find(item => item.value === row.valueType)?.label === '表达式'
								? '表达式'
								: '代理表达式',
					}
				),
			]
		},
	},
	{
		prop: 'value',
		label: '值',
		align: 'center',
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
		width: 120,
		fixed: 'right',
		render: row => {
			const dropDownList = [
				{
					name: '编辑',
					command: '编辑',
					click: () => {
						openForm('update', row.id)
					},
					permission: 'bpm:processListener:update',
					icon: Edit,
				},
				{
					name: '删除',
					command: '删除',
					click: () => handleDelete(row.id),
					type: 'danger',
					permission: 'bpm:processListener:delete',
					icon: Delete,
				},
			]
			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
					}
				),
			]
		},
	},
])

// 10. 核心业务方法
/** 查询列表 */
const getList = async () => {
	tableLoading.value = true
	try {
		const data = await ProcessListenerApi.getProcessListenerPage(queryParams.value)
		tableData.value = data.list || []
		total.value = data.total
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

/** 表单打开 */
const openForm = (type, id) => {
	console.log('type,id =>', type, id)
	console.log('formRef 实例:', formRef.value)
	nextTick( () => {
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