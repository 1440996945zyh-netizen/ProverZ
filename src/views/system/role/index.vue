<template>
	<!-- 角色管理 -->
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
		/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="roleVisible" :title="drawerTitle" size="55%">
			<Drawer ref="roleRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="roleVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<!-- 分配角色数据权限对话框 -->
		<el-dialog v-model="dialogVisible" title="人员分配" width="60%" :before-close="handleClose">
			<Dialog ref="dialogRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="closeDialog">关闭</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="role">
import BaseTable from '@/components/BaseTable/index.vue'
import { addRole, changeRoleStatus, delRole, getRole, listRole, updateRole } from '@/api/system/role'
import { ref, reactive } from 'vue'
import Drawer from './drawer/index.vue'
import Dialog from './dialog/index.vue'
import { ElButton, ElSwitch } from 'element-plus'
const { proxy } = getCurrentInstance()
const ids = ref([])
const clickRow = ref({}) //点击当前行
const total = ref(0)
const drawerTitle = ref('新增')
const roleRef = ref(null) //抽屉组件ref
const dialogRef = ref(null) //弹出框ref
const roleVisible = ref(false) //抽屉组件显示隐藏
const dialogVisible = ref(false) //弹出框组件显示隐藏
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '角色编号', prop: 'roleCode' },
	{ label: '角色名称', prop: 'roleName' },
	{ label: '显示顺序', prop: 'roleSort', align: 'right' },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'center',
		width: 'status',
		config: 'status',
		render: row => {
			return [
				h(
					ElSwitch,
					{
						onClick: () => {
							handleStatusChange(row)
						},
						modelValue: row.status,
						'active-value': '1',
						'inactive-value': '0',
					},

					{
						// default: () => row.status,
					}
				),
			]
		},
	},
	{ label: '备注', prop: 'remark' },
	{ label: '修改人', prop: 'updateName' },
	{ label: '修改时间', prop: 'updateTime', align: 'center', width: 'time' },
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
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'system:role:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'system:role:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '角色编号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'roleCode', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '角色名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'roleName', // 绑定字段
		span: 8, // 占位，共24
	},

	{
		name: '角色状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ label: '停用', value: '0' },
			{ label: '在用', value: '1' },
		],
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:role:insert', // 权限
	},
	{
		label: '分配用户', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'User', // 按钮图标，支持element-Plus中所有图标
		disabled: true,
		click: () => handleAuthUser, // 回调函数
		permission: 'system:role:dispatchUser', // 权限
	},
])

// 点击查询的事件
const getList = e => {
	buttonList[1].disabled = true
	queryParams.value = e
	listRole(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 提交按钮 */
const save = async () => {
	if (await roleRef.value.validate()) {
		console.log('保存', roleRef.value.form)
		roleRef.value.form.menuIds = roleRef.value.getMenuAllCheckedKeys()
		roleRef.value.form.deptIds = roleRef.value.getDeptAllCheckedKeys()
		const params = JSON.parse(JSON.stringify(roleRef.value.form)) // 取到子组件的form
		proxy.$modal.confirm('确定保存？').then(() => {
			console.log('点击保存', params)
			if (params.id) {
				updateRole(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					roleVisible.value = false
					getList(queryParams.value)
				})
			} else {
				addRole(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					roleVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
/** 删除按钮操作 */
function handleDelete(row) {
	console.log(ids.value)
	const idList = row.id || ids.value
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return delRole(idList)
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[1].disabled = false
}

/** 角色状态修改 */
function handleStatusChange(row) {
	let text = row.status == '1' ? '停用' : '启用'
	proxy.$modal
		.confirm('确定"' + text + '""' + row.roleName + '"角色?')
		.then(function () {
			return changeRoleStatus(row.id, row.status == '1' ? '0' : '1')
		})
		.then(() => {
			proxy.$modal.msgSuccess(text + '成功')
			getList(queryParams.value)
		})
		.catch(function () {})
}
/** 关闭授权弹窗 */
function closeDialog() {
	dialogVisible.value = false
	dialogRef.value.clearSearchData()
}
/** 分配用户 */
function handleAuthUser(row) {
	if (clickRow.value && clickRow.value.id) {
		console.log('分配用户', clickRow.value)
		dialogVisible.value = true
		nextTick(() => {
			dialogRef.value.getCatedList(clickRow.value.id)
		})
	} else {
		proxy.$message.error('请选择角色！')
	}
}

/** 添加角色 */
const add = () => {
	roleVisible.value = true
	drawerTitle.value = '新增'
	nextTick(() => {
		roleRef.value.resetForm() // 清空事件
		roleRef.value.getUpdate()
	})
}
/** 修改角色 */
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerTitle.value = '编辑'
	roleVisible.value = true
	nextTick(() => {
		roleRef.value.resetForm() // 清空事件
		getRole(editRow.id).then(res => {
			proxy.setFormData(roleRef.value.form, res.data)
      roleRef.value.form.roleClass = res.data.roleClass
      roleRef.value.form.deptName = res.data.deptName
		})
		roleRef.value.getUpdate(editRow.id)
	})
}

getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
