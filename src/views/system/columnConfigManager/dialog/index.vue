<template>
	<div class="app-container">
		<el-form ref="form" :model="formData" :rules="rules" label-width="80px">
			<el-row>
				<el-col :span="12">
					<el-form-item label="菜单" prop="菜单">
						<el-tree-select
							v-model="formData.menuId"
							:data="menuOptions"
							:props="{ value: 'menuId', label: 'menuName', children: 'children' }"
							value-key="menuId"
							placeholder="选择上级菜单"
							check-strictly
						/>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="tableID" prop="tableID">
						<el-input v-model="formData.tableID" placeholder="请输入名称" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="备注" prop="name">
						<el-input v-model="formData.name" placeholder="请输入名称" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<EditTable
			ref="editTableRef"
			:tableHeight="300"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:editConfig="editConfig"
			:loading="false"
			:hasAdd="true"
		/>
	</div>
</template>

<script setup name="columnConfigManagerDialog">
import EditTable from '@/components/EditTable/index.vue'
import { reactive, ref } from 'vue'
import { ElButton } from 'element-plus'
import { listMenu } from '@/api/system/menu'
import publicApi from '@/api/public'
const menuOptions = ref([]) // 上级菜单下拉树数据

const { proxy } = getCurrentInstance()
const editConfig = reactive({ trigger: 'click', mode: 'cell' })
const formData = ref({})
const columnTypeOptions = ref([])

const tableColumns = reactive([
	{ prop: '序号', label: '序号', width: 100, type: 'seq', align: 'center' },
	{ prop: 'colLabel', label: '前端label', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'colKey', label: '后端key', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{
		prop: 'colType',
		label: '列类型',
		minWidth: 120,
		editType: 'select',
		selectData: columnTypeOptions,
		modelLabel: 'colType',
		editRender: {},
		align: 'left',
	},
	{ prop: '下拉框key', label: '下拉框key', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'conmment', label: '备注', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{
		prop: 'delete',
		label: '添加',
		align: 'center',
		fixed: 'right',
		width: 100,
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'system:parameter:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const tableData = ref([])
const editTableRef = ref()

/**
 * @description 查询菜单下拉数结构
 */
const getTreeselect = async () => {
	menuOptions.value = []
	listMenu().then(response => {
		const menu = { menuId: 0, menuName: '主类目', children: [] }
		menu.children = proxy.flattenToTree(response.data, 'menuId')
		menuOptions.value.push(menu)
	})
}

const getColumnTypeOptions = async () => {
	// 假设有一个获取列类型选项的接口
	publicApi.getLocalSelect({ type: 'CONSTANT', types: 'AD_SEARCH_COL_TYPE' }).then(res => {
		columnTypeOptions.value = res.data.map(item => ({
			value: item.value,
			label: item.label,
		}))
	})
}
onMounted(() => {
	getTreeselect()
	getColumnTypeOptions()
})
</script>
<style lang="less" scoped></style>
