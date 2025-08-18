<template>
	<div>
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
		<el-drawer v-model="drawerVisible" :title="title" size="40%">
			<detail ref="detailRef" />
			<machineTypeList ref="machineTypeRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save" v-hasPermi="['master:machineType:add', 'master:machineType:update']">
						保存
					</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="machineType">
import BaseTable from '@/components/BaseTable/index.vue'
import machineTypeList from './machineTypeList/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/machineType/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const machineTypeRef = ref() //机械类型表格ref
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '机械类型名称', prop: 'macTypeName' },
	{ label: '机械型号名称', prop: 'modelName' },
	{ label: '创建时间', prop: 'createTime', align: 'center' },
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
						permission: 'master:machineType:update', // 权限
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
						icon: 'Delete',
						// hasPermi: 'master:machine:delete'
						permission: 'master:machineType:delete', // 权限
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
		name: '机械类型名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'name', // 绑定字段
		span: 24, // 占位，共24
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:machineType:add', // 权限
	},
])
const drawerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.listbMachineType(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	queryParams.value = {
		startPage: 1,
		pageSize: 10,
	}
	// console.log('查询拉查询拉', e)
}
// 新增事件
const add = () => {
	title.value = '新增'
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		machineTypeRef.value.tableData = []
	})
}

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		machineTypeRef.value.tableData = []
		api.selectbMachineTypeById(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.macTypeCode = resData.macTypeCode
			detailRef.value.formData.macTypeName = resData.macTypeName
			machineTypeRef.value.tableData = resData.list
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	// console.log('点击删除',deleteRow.id);
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deleteMachineType(deleteRow.id)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
		.catch(() => {})
}
// 保存事件
const save = async () => {
	if ((await detailRef.value.validate()) && (await machineTypeRef.value.validate())) {
		const params = {
			...detailRef.value.formData,
			list: JSON.parse(JSON.stringify(machineTypeRef.value.tableData)),
		}
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.updatebMachineType(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					drawerVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertbMachineType(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					drawerVisible.value = false
					getList(queryParams.value)
				})
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
