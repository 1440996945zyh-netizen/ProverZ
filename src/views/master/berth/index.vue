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
	</div>
	<el-drawer v-model="berthVisible" :title="title" size="30%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="berthVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
	<el-drawer v-model="drawerVisible" title="列表" size="60%">
		<bollardList ref="drawerRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="drawerVisible = false">关闭</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="berth">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import bollardList from './bollardList/index.vue'

import api from '@/api/master/berth/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const drawerRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('') // 数据总数
const queryParams = ref({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '主泊位名称', prop: 'parentName',align: "center" },
	{ label: '泊位代码', prop: 'berthCode' ,align: "center"},
	{ label: '泊位名称', prop: 'berthName' ,align: "center"},
	{ label: '长度（米）', prop: 'berthLong', align: 'right' },
	{ label: '工作区域', prop: 'workAreaCdName',align: "center"},
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 'status',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '1' ? '' : 'info',
					},
					{
						default: () => (row.status === '1' ? '在用' : '停用'),
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		fixed: 'right',
		width: 200,
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
						permission: 'master:berth:update',
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							clickList(row)
							console.log(row)
						},
						type: 'primary',
						link: true,
						icon: 'Operation',
					},
					{
						default: () => '列表',
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
						disabled: row.childCount == '0' ? false : true,
						permission: 'master:berth:delete',
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
		name: '泊位代码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'berthCode', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '泊位名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'berthName', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 8, // 占位，共24
		selectData: [
			{
				value: '1',
				label: '在用',
			},
			{
				value: '0',
				label: '停用',
			},
		],
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:berth:add', // 权限
	},
])
const berthVisible = ref(false)
const drawerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getBerthList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 新增事件
const add = () => {
	berthVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	berthVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getBerthById(editRow.id).then(res => {
			if (res.code == '0000') {
				let msg = res.data
				detailRef.value.formData.id = msg.id
				detailRef.value.formData.parentCode = msg.parentCode
				detailRef.value.formData.berthCode = msg.berthCode
				detailRef.value.formData.berthName = msg.berthName
				detailRef.value.formData.berthLong = msg.berthLong
				detailRef.value.formData.status = msg.status
				detailRef.value.formData.workAreaCd = msg.workAreaCd
			} else {
				proxy.$modal.msgError(res.msg)
			}
		})
	})
}
// 列表事件
const clickList = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		drawerRef.value.getData(editRow.id)
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.deleteBerth(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$modal.msgSuccess(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$modal.msgError(res.msg)
				}
			})
		})
		.catch(err => {})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确认保存?').then(res => {
			if (title.value == '编辑') {
				api.updateBerth(detailRef.value.formData)
					.then(res => {
						if (res.code == '0000') {
							proxy.$modal.msgSuccess(res.msg)
							berthVisible.value = false
							getList(queryParams.value)
						} else {
							proxy.$modal.msgError(res.msg)
						}
					})
					.catch(err => {})
			} else {
				api.insertBerth(detailRef.value.formData)
					.then(res => {
						if (res.code == '0000') {
							proxy.$modal.msgSuccess(res.msg)
							berthVisible.value = false
							getList(queryParams.value)
						} else {
							proxy.$modal.msgError(res.msg)
						}
					})
					.catch(err => {})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
