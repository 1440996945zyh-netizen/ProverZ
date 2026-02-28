<template>
	<div class="app-container">
		<el-row :gutter="20">
			<!--部门数据-->
			<el-col :span="5" style="padding-right: 0px !important">
				<div class="head-container">
					<el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search" style="margin-bottom: 20px" />
				</div>
				<div class="head" :style="{ height: heightDiv + 'px' }">
					<el-tree
						:data="deptOptions"
						:props="{ label: 'deptName', children: 'children' }"
						:expand-on-click-node="false"
						:filter-node-method="filterNode"
						ref="deptTreeRef"
						node-key="id"
						highlight-current
						default-expand-all
						@node-click="handleNodeClick"
					/>
				</div>
			</el-col>
			<el-col :span="19" style="padding-left: 0px !important">
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
			</el-col>
		</el-row>
		<!-- 新增，修改抽屉组件 -->
		<Drawer v-model="userVisible" :title="title" size="60%">
			<userDrawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="userVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="user">
import userDrawer from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/system/user'
import Drawer from '@/components/Drawer/index.vue'

import tableParamsStore from '@/store/modules/tableParams'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import { ref } from 'vue'
import publicApi from '@/api/public/index'
const heightDiv = ref(window.innerHeight - 150)
const userVisible = ref(false) //新增修改抽屉

const drawerRef = ref(null) // 明细组件ref
const { proxy } = getCurrentInstance()
const total = ref(0)
const title = ref('添加用户')
const deptName = ref('')
const deptOptions = ref(undefined)
const clickRow = ref({}) //点击当前行

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	deptId: '',
})
// 保存
/** 提交按钮 */
const save = async () => {
	if (await drawerRef.value.validate()) {
		// console.log('保存', drawerRef.value.formData)
		const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
		params.fileIds = drawerRef.value.fileIds
		proxy.$modal.confirm('确定保存？').then(() => {
			console.log('用户点击保存', params)
			if (params.id) {
				api.updateUser(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					userVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertUser(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					userVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
	if (!value) return true
	return data.deptName.indexOf(value) !== -1
}
/** 根据名称筛选部门树 */
watch(deptName, val => {
	proxy.$refs['deptTreeRef'].filter(val)
})
/** 查询部门下拉树结构 */
function getDeptTree() {
	console.log(window.innerHeight)
	publicApi.getDeptList().then(response => {
		deptOptions.value = proxy.flattenToTree(response.data)
	})
}
/** 节点单击事件 */
function handleNodeClick(data) {
	queryParams.value.deptId = data.id
	console.log(data.id)
	handleQuery()
}
/** 更多操作 */
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '用户姓名', prop: 'userName' },
	{ label: '用户账号', prop: 'userAccount' },
	{ label: '所属部门', prop: 'deptName' },
	{
		label: '是否管理员',
		prop: 'isSuperadminLabel',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSuperadminLabel == '是' ? '' : 'info',
					},
					{
						default: () => (row.isSuperadminLabel === '是' ? '是' : '否'),
					}
				),
			]
		},
	},
	{ label: '手机号码', prop: 'mobile', align: 'center', width: 'phoneNumber' },
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		config: 'status',
		width: 'status',
		align: 'center',
		render: row => {
			return [
				h(ElSwitch, {
					onClick: () => {
						handleStatusChange(row)
					},
					modelValue: row.status,
					'active-value': '1',
					'inactive-value': '0',
				}),
			]
		},
	},
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
							// console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'system:user:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							// console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Operation',
						permission: 'system:user:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 搜索框数据
const selectData = reactive([
	{
		name: '用户姓名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'userName', // 绑定字段
		span: 12, // 占位，共24
	},

	{
		name: '用户账号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'userAccount', // 绑定字段
		span: 12, // 占位，共24
	},
])
// 新增按钮
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:user:add', // 权限
	},
	{
		label: '重置密码', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => handleResetPwd, // 回调函数
		permission: 'system:user:resetPsd', // 权限
	},
])

/** 根据名称筛选部门树 */
watch(deptName, val => {
	proxy.$refs['deptTreeRef'].filter(val)
})
/** 搜索按钮操作 */
function handleQuery() {
	getList(queryParams.value)
}
/** 删除按钮操作 */
function handleDelete(row) {
	// const editRow = row || clickRow.value // 拿到所编辑行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deletebyid([row.id])
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

/** 用户状态修改 */
const handleStatusChange = row => {
	console.log('修改状态', row.status)
	let text = row.status == '1' ? '停用' : '启用'
	proxy.$modal
		.confirm('确定' + text + '"' + row.userName + '"账户吗?')
		.then(function () {
			return api.updateUserStatus({ id: row.id, status: row.status == '1' ? '0' : '1' })
		})
		.then(() => {
			proxy.$modal.msgSuccess(text + '成功')
			getList(queryParams.value)
		})
		.catch(function () {})
}
/** 重置密码按钮操作 */
const handleResetPwd = () => {
	if (clickRow.value && clickRow.value.id) {
		console.log('重置密码', clickRow.value)
		proxy.$modal
			.confirm('确定重置"' + clickRow.value.userName + '"的密码吗？')
			.then(function () {
				api.resetUserPwd(clickRow.value.id).then(response => {
					proxy.$modal.msgSuccess('密码重置成功')
				})
			})
			.catch(() => {})
	} else {
		proxy.$message.error('请选择用户！')
	}
}
/** 修改按钮操作 */
function edit(row) {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	userVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getById(editRow.id).then(res => {
			console.log('编辑')
			proxy.setFormData(drawerRef.value.formData, res.data)
			drawerRef.value.formData.roleIds = res.data.roleIds
			console.log('编辑回显数据', drawerRef.value.formData)
		})
	})
}

/**点击查询的事件 */
const getList = e => {
	buttonList[1].disabled = true //控制重置密码按钮
	queryParams.value = Object.assign(queryParams.value, e)
	api.listUser(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	// console.log('查询拉查询拉', e)
}

/** 新增事件 */
const add = () => {
	userVisible.value = true
	title.value = '新增'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
	})
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[1].disabled = false
}
getDeptTree()
getList(queryParams.value)
</script>
<style lang="less" scoped>
.head-container {
	padding: 5px;
}
.head {
	overflow-y: auto;
}
</style>
