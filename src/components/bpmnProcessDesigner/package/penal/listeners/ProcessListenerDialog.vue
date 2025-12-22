<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-19 09:21:28
 * @LastEditors: zhangsd
 * @Description: 流程监听器选择器
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\listeners\ProcessListenerDialog.vue
-->

<!-- 执行器选择 -->
<template>
	<Dialog title="请选择监听器" v-model:visible="dialogVisible" width="1024px" :showFooter="false">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="false"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:tableHeight="200"
			:maxHeight="400"
			:cellClickEvent="cellClickEvent"
			:total="total"
			:loading="loading"
		/>
	</Dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, defineExpose, h } from 'vue'
// import { ProcessListenerApi } from '@/api/bpm/processListener'
import { CommonStatusEnum, BPM_PROCESS_LISTENER_TYPE, BPM_PROCESS_LISTENER_VALUE_TYPE } from '@/utils/bpm/constantEnumeration'
import BaseTable from '@/components/BaseTable/index.vue'
import { ElButton, ElTag } from 'element-plus'
import Dialog from '@/components/Dialog/index.vue'
/** BPM 流程 表单 */
defineOptions({ name: 'ProcessListenerDialog' })

// 响应式变量定义
const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(true) // 列表的加载中
const tableData = ref([]) // 列表的数据（适配 BaseTable）
const total = ref(0) // 列表的总页数
const clickRow = ref({}) // 点击的当前行数据

// 分页查询参数（适配 BaseTable）
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	type: '',
	status: CommonStatusEnum.ENABLE,
})

// 搜索条件配置（适配 BaseTable）
const selectData = reactive([])

// 按钮配置（适配 BaseTable）
const buttonList = reactive([
	// 这里不需要新增/删除按钮，仅保留空数组或按需添加
])

// 表格列配置（适配 BaseTable）
const tableColumns = ref([
	{ label: '名字', prop: 'name', align: 'center' },
	{
		label: '类型',
		prop: 'type',
		align: 'center',
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
	{ label: '事件', prop: 'event', align: 'center' },
	{
		label: '值类型',
		prop: 'valueType',
		align: 'center',
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
	{ label: '值', prop: 'value', align: 'center' },
  	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							select(row)
						},
						type: 'primary',
						link: true,
						icon: 'Select',
					},
					{
						default: () => '选择',
					}
				),
			
			]
		},
	},

])

/** 打开弹窗 */
const open = async type => {
	console.log('processListenerDialog 执行打开 type', type)
	queryParams.value.startPage = 1
	queryParams.value.type = type
	getList(queryParams.value) // 初始化查询
	dialogVisible.value = true
}

/** 查询列表 */
const getList = async params => {
	loading.value = true
	try {
		// 适配参数格式：BaseTable 传入的 params 包含 startPage/pageSize，转换为接口所需参数
		const query = {
			pageNo: params.startPage || 1,
			pageSize: params.pageSize || 10,
			type: params.type || queryParams.value.type,
			status: params.status || CommonStatusEnum.ENABLE,
			// 透传其他搜索条件
			name: params.name || '',
			event: params.event || '',
		}
		// const data = await ProcessListenerApi.getProcessListenerPage(query)
		// tableData.value = data.list
		// total.value = data.total
		loading.value = false

	
	} finally {
		loading.value = false
	}
}

/** 表格行点击事件 */
const cellClickEvent = ({ row }) => {
	clickRow.value = row // 记录点击的行
}

/** 定义事件 - 用于选择后的回调 */
const emit = defineEmits(['select'])

/** 选择监听器 */
const select = async row => {
	dialogVisible.value = false
	// 发送选择成功的事件
	emit('select', row)
}
// 提供 open 方法，用于打开弹窗
defineExpose({ open })
</script>