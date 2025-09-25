<!--
 * @Author: zhangsd
 * @Date: 2025-09-25 14:07:02
 * @LastEditTime: 2025-09-25 15:11:27
 * @LastEditors: zhangsd
 * @Description: 高级查询表格列配置管理
 * @FilePath: \view\src\views\system\ColumnConfigManager\index.vue
-->
<template>
	<div class="app-container">
		<!-- 高级查询表格列配置管理 -->
		<!-- 表格 -->
		<div class="container-context">
			<BaseTable
				ref="columnConfigTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="processTable"
				:loading="tableLoading"
				:showPagination="true"
				:showToolBar="false"
				:showNum="5"
				defaultWidth="20"
				:total="total"
			/>
		</div>
		
	</div>
</template>
<script setup>
import { ref } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance() // 获取当前实例，用于访问组件的属性和方法
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value - 15) // 表格高度
// 表格实例
const columnConfigTableRef = ref(null)
// 表格列配置
const rowConfig = { keyField: 'id' } // 表格行配置，keyField为唯一标识字段
const tableLoading = ref(false) // 表格加载状态
const total = ref(0) // 总条数
// 表格列配置
const tableColumns = ref([
	{
		prop: 'id',
		label: '流程定义id',
		align: 'center',
		width: 250,
	},
	{
		prop: 'key',
		label: '流程标识Key',
		align: 'center',
		width: 250,
	},
	{
		prop: 'category',
		label: '流程分类',
		align: 'center',
		width: 250,
		render: row => {
			const option = categoryOptions.find(item => item.value === row.category)
			// 修复：给原生span添加props对象（即使为空）
			return [h('span', { props: {} }, option ? option.label : row.category)]
		},
	},
	{
		prop: 'name',
		label: '流程名称',
		align: 'center',
		showOverFlow: true,
		render: row => {
			return [
				h(
					ElButton,
					{
						type: 'link',
						class: 'link-button',
						onClick: () => handleProcessView(row.deploymentId),
						permission: undefined, // 明确添加permission属性（避免props为null）
					},
					{ default: () => row.name }
				),
			]
		},
	},

	{
		prop: 'version',
		label: '流程版本',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						size: 'medium',
						permission: undefined, // 明确添加permission属性
					},
					{ default: () => `v${row.version}` }
				),
			]
		},
	},
	{
		prop: 'suspensionState',
		label: '状态',
		align: 'center',
		render: row => {
			const statusMap = {
				1: { label: '激活', type: 'success' },
				2: { label: '挂起', type: 'warning' },
			}
			const status = statusMap[row.suspensionState] || { label: '未知', type: '' }
			return [
				h(
					ElTag,
					{
						type: status.type,
						permission: undefined, // 明确添加permission属性
					},
					{ default: () => status.label }
				),
			]
		},
	},
])
// 新增/编辑弹窗
const dialogVisible = ref(false) // 弹窗是否可见
// 查询条件
const selectData = reactive([
	{
		name: '字典类型名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'dictName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '字典类型编号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'dictType', // 绑定字段
		span: 12, // 占位，共24
	},
])
// 按钮列表
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:user:add', // 权限
	},
	{
		label: '高级查询', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => edit, // 回调函数
		permission: 'system:user:add', // 权限
	},
])
// 表格数据
const tableData = ref([
	{
		dictName: '字典类型名称',
		dictType: '字典类型编号',
	},
])

/**
 * 新增
 * @description: 新增
 */
const add = () => {
	dialogVisible.value = true
}
/**
 * 编辑
 * @description: 编辑
 */
const edit = () => {
	dialogVisible.value = true
}
/**
 * 高级查询
 * @description: 高级查询
 */
const queryForm = reactive({
	filterType: 'and', //过滤条件匹配
	fieldKey: '', // 字段key (前端)
	operator: '', // 运算符
	value: '', // 值
})
</script>

<style lang="scss" scoped>
.app-container {
	height: 100%;
}
</style>