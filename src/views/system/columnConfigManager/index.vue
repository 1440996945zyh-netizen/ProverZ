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
		<Dialog title="新增" v-model:visible="dialogVisible" isFullscreen>
			<columnConfigManagerDialog ref="dialogRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">关闭</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>
<script setup>
import { ref } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ElTag } from 'element-plus'
import columnConfigManagerDialog from './dialog/index.vue'
const { proxy } = getCurrentInstance() // 获取当前实例，用于访问组件的属性和方法
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value - 15) // 表格高度
// 表格实例
const columnConfigTableRef = ref(null)
// 表格列配置
const rowConfig = { keyField: 'id' } // 表格行配置，keyField为唯一标识字段
const tableLoading = ref(false) // 表格加载状态
const total = ref(0) // 总条数

const dialogRef = ref(null)
// 表格列配置
const tableColumns = ref([
	{
		prop: 'tebleId',
		label: '前端table的ID',
		align: 'center',
		width: 250,
	},
	{
		prop: 'colKey',
		label: '后端TABLE对应标识Key',
		align: 'center',
		width: 250,
	},
	{
		prop: 'colLabel',
		label: '前端TABLE的列对应的label',
		align: 'center',
		width: 250,
	},
	{
		prop: 'colType',
		label: '列类型',
		align: 'center',
		width: 250,
	},

	{
		prop: 'status',
		label: '状态',
		align: 'center',
		render: row => {
			const statusMap = {
				1: { label: '启用', type: 'success' },
				2: { label: '停用', type: 'warning' },
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
