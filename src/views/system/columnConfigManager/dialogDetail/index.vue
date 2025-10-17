<!--
 * @Author: zhangsd
 * @Date: 2025-09-26 10:09:37
 * @LastEditTime: 2025-10-11 10:10:50
 * @LastEditors: zhangsd
 * @Description: 
 * @FilePath: \view\src\views\system\columnConfigManager\dialogDetail\index.vue
-->

<template>
	<div class="app-container">
		<!-- 表单区域 -->
		<el-form ref="columnConfigFormRef" :model="columnConfigForm" :rules="rules" label-width="80px" class="app-form">
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="菜单" prop="menuId">
						<el-tree-select
							v-model="columnConfigForm.menuId"
							:data="menuOptions"
							:props="{ value: 'menuId', label: 'menuName', children: 'children' }"
							value-key="menuId"
							placeholder="选择上级菜单"
							check-strictly
							style="width: 100%"
							:disabled="editRow"
							@change="handleMenuChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="tableId" prop="tableId">
						<el-input v-model="columnConfigForm.tableId" :disabled="editRow" placeholder="请输入名称" style="width: 100%" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="备注" prop="remark">
						<el-input
							type="textarea"
							:rows="2"
							v-model="columnConfigForm.remark"
							placeholder="请输入备注"
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>

		<!-- 表格区域 -->
		<div class="table-wrapper">
			<EditTable
				ref="editTableRef"
				:tableHeight="300"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:border="true"
				:rowConfig="rowConfig"
				:loading="false"
				:showFooter="true"
				:editRules="editRules"
				:hasAdd="true"
				:headerCellClickEvent="addTableData"
				:headerCellClassName="headerCellClassName"
				sync-resize
			/>
		</div>
	</div>
</template>

<script setup name="columnConfigManagerDialog">
import EditTable from '@/components/EditTable/index.vue'
import { reactive, ref, onMounted, getCurrentInstance, watch } from 'vue'
import { ElButton, ElInput, ElTreeSelect, ElRow, ElCol, ElForm, ElFormItem, ElSwitch } from 'element-plus'
import { getContentsMenu } from '@/api/system/menu'
import publicApi from '@/api/public'
import api from '@/api/system/columnConfigManager'

const props = defineProps({
	editRow: {
		type: Object,
		default: () => {},
	},
})
// 上级菜单下拉树数据
const menuOptions = ref([])
// 保存原始的菜单数据方便遍历
const menuDataList = ref([])
const { proxy } = getCurrentInstance()
const columnConfigFormRef = ref(null) //表格实例
// 表单数据
const columnConfigForm = ref({
	menuId: '', // 上级菜单ID
	tableId: '', // tableID
	remark: '', // 备注
})
const statusOptions = ref([
	{
		value: '1',
		label: '启用',
	},
	{
		value: '0',
		label: '停用',
	},
]) // 状态下拉选项
// 表单验证规则
const rules = reactive({
	menuId: [{ required: true, message: '请选择上级菜单', trigger: 'blur' }],
	tableId: [{ required: true, message: '请输入tableId', trigger: 'blur' }],
})
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }
const editRules = reactive({
	colLabel: [{ required: true, message: '请输入前端label', trigger: 'blur' }],
	colKey: [{ required: true, message: '请输入后端key', trigger: 'blur' }],
	colType: [{ required: true, message: '请选择列类型', trigger: 'blur' }],
	status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
})
//表格列
const tableColumns = reactive([
	{ prop: 'sortNum', label: '序号', width: 100, type: 'seq', align: 'center' },
	{ prop: 'colLabel', label: '前端label', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'colKey', label: '后端key', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{
		prop: 'colType',
		label: '列类型',
		minWidth: 120,
		editType: 'select',
		selectData: [],
		modelLabel: 'label',
		modelValue: 'value',
		editRender: {},
		align: 'left',
	},
	{ prop: 'colSelectKey', label: '下拉框key', minWidth: 120, editType: 'input', editRender: {}, align: 'left' },
	{
		prop: 'status',
		label: '状态',
		minWidth: 120,
		align: 'left',
		render: row => {
			return [
				h(ElSwitch, {
					onClick: () => {
						changeStatus(row)
					},
					modelValue: row.status,
					'active-text': '启用',
					'inactive-text': '停用',
					'active-value': '1',
					'inactive-value': '0',
				}),
			]
		},
	},
	{
		prop: '',
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
//点击新增表头新增
const addTableData = e => {
	if (e.column.title == '添加') {
		tableData.value.push({
			row_id: Date.now(), // 添加唯一标识
			colLabel: '',
			colKey: '',
			colType: '',
			colSelectKey: '',
			status: '1',
			sortNum: tableData.value.length + 1,
		})
	}
}
const changeStatus = row => {
	row.status = row.status === '0' ? '1' : '0'
}

//鼠标掠过新增表头变手
const headerCellClassName = ({ column }) => {
	if (column.field === tableColumns[tableColumns.length - 1].prop) {
		// 最后一列添加事件
		return 'add'
	}
}
/**
 * @description 查询菜单下拉数结构
 */
const getTreeselect = async () => {
	try {
		menuOptions.value = []
		const response = await getContentsMenu()
		menuDataList.value = response.data
		const menu = { menuId: 0, menuName: '主类目', children: [] }
		menu.children = proxy.flattenToTree(response.data, 'menuId')
		menuOptions.value.push(menu)
	} catch (error) {
		console.error('获取菜单失败', error)
		proxy.$modal.msgError('获取菜单失败，请稍后重试')
	}
}

const getColumnTypeOptions = async () => {
	try {
		const res = await publicApi.getLocalSelect({ type: 'CONSTANT', types: 'AD_SEARCH_COL_TYPE' })
		proxy.setEditTableOptions(tableColumns, {
			colType: res.data.map(item => ({
				value: item.value,
				label: item.label,
			})),
		})
	} catch (error) {
		console.error('获取列类型失败', error)
		proxy.$modal.msgError('获取列类型失败，请稍后重试')
	}
}

/**
 * @description 删除表格行
 * @param row 要删除的行数据
 */
const handleDelete = row => {
	const index = tableData.value.findIndex(item => item.row_id === row.row_id)
	if (index !== -1) {
		tableData.value.splice(index, 1)
		// 重新计算序号
		tableData.value.forEach((row, i) => {
			row.sortNum = i + 1
		})
	}
}
/**
 * @description 上级菜单下拉树选择变化时触发
 * @description 当上级菜单下拉树选择变化时，清空tableId
 * @param val 上级菜单ID
 */
const handleMenuChange = val => {
	if (!val) {
		columnConfigForm.value.tableId = ''
		return
	}

	// 从原始菜单数据中递归查找
	const menu = findMenuById(val, menuDataList.value)
	if (menu && menu.path) {
		columnConfigForm.value.tableId = `${menu.path}_${Date.now()}`
	}
}
/**
 * @description 验证表单和表格数据
 * @returns 验证结果
 */
const validate = async () => {
	let flag = false
	await columnConfigFormRef.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})

	// 新增表格数据验证
	if (flag && tableData.value.length === 0) {
		flag = false
		proxy.$modal.msgWarning('请至少添加一条列配置！')
	}

	return flag
}
/**
 *
 * @param menuId 菜单ID
 * @param menus 菜单列表
 * @description 递归查找菜单
 * @returns 菜单对象
 */
const findMenuById = (menuId, menus) => {
	for (const menu of menus) {
		if (menu.menuId === menuId) return menu
		if (menu.children && menu.children.length) {
			const found = findMenuById(menuId, menu.children)
			if (found) return found
		}
	}
	return null
}
const init = () => {
	if (props.editRow) {
		// proxy.setFormData(columnConfigForm.value, props.editRow)
		api.getDetail({
			menuId: props.editRow.menuId,
			tableId: props.editRow.tableId,
		})
			.then(res => {
				const formData = res.data[0]
				const tableList = res.data.filter(item => item.colKey)
				proxy.setFormData(columnConfigForm.value, formData)
				tableData.value = tableList
				// 为表格行添加唯一标识
				tableData.value.forEach((row, index) => {
					row.row_id = row.row_id || Date.now() + index
					row.sortNum = row.sortNum || index + 1
				})
			})
			.catch(error => {
				console.error('获取列配置失败', error)
				proxy.$modal.msgError('获取列配置失败，请稍后重试')
			})
	}
}
watch(
	() => props.editRow,
	(newVal, oldVal) => {
		if (newVal) {
			init()
		}
	}
)

onMounted(() => {
	init()
	getTreeselect()
	getColumnTypeOptions()
	// 如果是新增，默认添加一行
	if (!props.editRow || Object.keys(props.editRow).length === 0) {
		tableData.value.push({
			row_id: Date.now(),
			colLabel: '',
			colKey: '',
			colType: '',
			colSelectKey: '',
			status: '1',
			sortNum: 1,
		})
	}
})
defineExpose({
	tableData,
	columnConfigForm,
	validate,
})
</script>

<style lang="scss" scoped>
.app-container {
	border: none;
	display: flex;
	flex-direction: column;
	gap: 16px;
	//padding: 16px;
	background-color: #fff;
	border-radius: 8px;
}

.app-form {
	border: 1px solid #e8e8e8;
	border-radius: 6px;
	padding: 16px;
	background-color: #fafafa;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-wrapper {
	border: 1px solid #e8e8e8;
	border-radius: 6px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}
}

// 确保所有表单控件宽度为100%
:deep(.el-input__wrapper),
:deep(.el-tree-select__wrapper) {
	width: 100%;
}

// 表单验证错误提示样式优化
:deep(.el-form-item__error) {
	padding-top: 4px;
	font-size: 12px;
}

// 为可编辑表格的单元格添加悬停效果
:deep(.el-table__row) {
	transition: background-color 0.2s ease;
}

:deep(.el-table__row:hover > td) {
	background-color: #f5f7fa !important;
}
</style>