<template>
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
		<Drawer v-model="versionVisiable" :title="title" size="60%">
			<versionDrawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="versionVisiable = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="version">
import versionDrawer from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/system/version'
import Drawer from '@/components/Drawer/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import { ref } from 'vue'
import publicApi from '@/api/public/index'
const versionVisiable = ref(false) //新增修改抽屉

const drawerRef = ref(null) // 明细组件ref
const { proxy } = getCurrentInstance()
const total = ref(0)
const title = ref('添加版本')
const clickRow = ref({}) //点击当前行

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 保存
/** 提交按钮 */
const save = async () => {
	if (await drawerRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.updateVersion(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					versionVisiable.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertVersion(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					versionVisiable.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
/** 更多操作 */
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '版本名称', prop: 'versionName' },
	{ label: '版本号', prop: 'versionCode' },
	{ label: '下载地址', prop: 'linkAddress' },
	{
		prop: 'versionType',
		label: '版本类型',
		render: row => {
		return [
				h(
				ElTag,
				{
					type: row.versionType=='10'?"success":row.versionType=='20'?"warning":"danger",
					link: true,
				},
				{
					default: () => row.versionType=='10'?"手持":row.versionType=='20'?"车载":"跑垛",
				}
				)
			]
		},
	},
	{
		label: '状态',
		prop: 'releaseState',
		align: 'center',
		config: 'releaseState',
		width: 'releaseState',
		align: 'center',
		render: row => {
			return [
				h(ElSwitch, {
					onClick: () => {
						handleStatusChange(row)
					},
					modelValue: row.releaseState,
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
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'system:version:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Operation',
						permission: 'system:version:delete', // 权限
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
		name: '版本名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'versionName', // 绑定字段
		span: 12, // 占位，共24
	},

	{
		name: '版本号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'versionCode', // 绑定字段
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
		permission: 'system:version:add', // 权限
	},
])
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
/** 版本状态修改 */
const handleStatusChange = row => {
	console.log('修改状态', row.releaseState)
	let text = row.releaseState == '1' ? '停用' : '启用'
	proxy.$modal
		.confirm('确定' + text + '"' + row.versionName + '"版本吗?')
		.then(function () {
			return api.updateVersionStatus({ id: row.id, releaseState: row.releaseState == '1' ? '0' : '1' })
		})
		.then(() => {
			proxy.$modal.msgSuccess(text + '成功')
			getList(queryParams.value)
		})
		.catch(function () {})
}
/** 修改按钮操作 */
function edit(row) {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	versionVisiable.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getById(editRow.id).then(res => {
			proxy.setFormData(drawerRef.value.formData, res.data)
		})
	})
}

/**点击查询的事件 */
const getList = e => {
	queryParams.value = e
	api.listVersion(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

/** 新增事件 */
const add = () => {
	versionVisiable.value = true
	title.value = '新增'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
	})
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
<style lang="less" scoped>
.head-container {
	padding: 5px;
}
</style>
