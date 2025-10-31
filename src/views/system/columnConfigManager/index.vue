<!--
 * @Author: zhangsd
 * @Date: 2025-09-25 14:07:02
 * @LastEditTime: 2025-10-31 16:34:55
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
				:id="tableId"
				:isShowAdvancedQuery="true"
			/>
		</div>
		<!-- 新增/编辑弹窗 -->
		<Dialog :title="dialogTitle" v-model:visible="dialogVisible" isFullscreen>
			<DialogDetail ref="columnConfigManagerDialogRef" :editRow="editRow" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">关 闭</el-button>
					<el-button type="primary" @click="saveTableColumns">保 存</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ElTag, ElButton } from 'element-plus'
import DialogDetail from '../columnConfigManager/dialogDetail/index'
import api from '@/api/system/columnConfigManager'
import { getContentsMenu } from '@/api/system/menu'
import { useRoute } from 'vue-router'
import usePermissionStore from '@/store/modules/permission'
import { provide } from 'vue'
const permissionStore = usePermissionStore()
const { proxy } = getCurrentInstance() // 获取当前实例，用于访问组件的属性和方法
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value - 15) // 表格高度
const tableId = ref('columnConfigManager_1758870615101')

// 表格实例
const columnConfigTableRef = ref(null)
// 表格列配置
const rowConfig = { keyField: 'id' } // 表格行配置，keyField为唯一标识字段
const tableLoading = ref(false) // 表格加载状态
const total = ref(0) // 总条数
// 表格列配置弹窗实例
const columnConfigManagerDialogRef = ref(null)
const route = useRoute()

// 表格列配置
const tableColumns = ref([
	{
		prop: 'menuName',
		label: '菜单名称',
		align: 'center',
	},
	{
		prop: 'tableId',
		label: '前端table的ID',
		align: 'center',
	},
	{
		prop: 'remark',
		label: '备注',
		align: 'center',
	},
	{
		prop: 'createByName',
		label: '创建人',
		align: 'center',
	},
	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
	},
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
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
					}
				),
			]
		},
	},
])
// 新增/编辑弹窗
const dialogVisible = ref(false) // 弹窗是否可见
const dialogTitle = ref('新增')
// 查询条件
const selectData = reactive([
	{
		name: '前端ID', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'tableId', // 绑定字段
		span: 24, // 占位，共24
	},

])
const editRow = ref({})
// 按钮列表
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:user:add', // 权限
	},
])
// 表格数据
const tableData = ref([])
const menuDataList = ref([])
const  advancedQuery = ref([])
provide('onQuery', (data) => {
  console.log('父组件收到数据：', data)
  advancedQuery.value  = JSON.parse(JSON.stringify(data))
  // 处理数据...
  getList()
})
/**
 * 新增
 * @description: 新增
 */
const add = () => {
	editRow.value = null
	dialogVisible.value = true
}
/**
 * 编辑
 * @description: 编辑
 */
const edit = row => {
	editRow.value = JSON.parse(JSON.stringify(row))
	dialogVisible.value = true
}

/**
 * 保存表格列配置
 * @description: 保存表格列配置
 */
const saveTableColumns = () => {
	columnConfigManagerDialogRef.value.validate().then(() => {
		const settingAdSearchList = columnConfigManagerDialogRef.value.tableData.map(item => ({
			tebleId: columnConfigManagerDialogRef.value.columnConfigForm.tebleId,
			colKey: item.colKey,
			colLabel: item.colLabel,
			colType: item.colType,
			status: item.status,
			colSelectKey: item.colSelectKey,
			sortNum: item.sortNum,
			dateFormat: item.dateFormat,
			colSelectSource: item.colSelectSource,
			remark: columnConfigManagerDialogRef.value.columnConfigForm.remark,
		}))
		const param = {
			tableId: columnConfigManagerDialogRef.value.columnConfigForm.tableId,
			menuId: columnConfigManagerDialogRef.value.columnConfigForm.menuId,
			remark: columnConfigManagerDialogRef.value.columnConfigForm.remark,
			settingAdSearchList: settingAdSearchList,
		}
		const action = editRow.value ? 'update' : 'insert'

		api[action](param).then(res => {
			console.log(res)
			if (res.code === '0000') {
				proxy.$message({
					message: action === 'insert' ? '新增成功' : '更新成功',
					type: 'success',
				})
				dialogVisible.value = false
				getList()
			}
		})
	})
}

const getList = e => {
	// tableLoading.value = true
	let params = {
		advancedQuery:JSON.stringify(advancedQuery.value),
		...e
	}
	api.getList(params)
		.then(response => {
			tableData.value = response.data.pages
			total.value = response.data.totalNum
			tableData.value.forEach(item => {
				const currentMenu = permissionStore.getFlatMenuList().find(menu => menu.id === item.menuId)
				item.menuName = currentMenu?.meta?.title || ''
			})
		})
		.catch(() => {
			// tableLoading.value = false
		})
}

onMounted(() => {
	// getTreeselect()
	getList()
})
</script>

<style lang="scss" scoped>
.app-container {
	height: 100%;
}
</style>
