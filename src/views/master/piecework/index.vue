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

		<el-drawer v-model="pieceworkVisible" :title="title" size="35%">
			<detail ref="detailRef" />
			<PieceworkList ref="pieceworkListRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="pieceworkVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="piecework">
import Detail from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { getCurrentInstance, h, nextTick, reactive, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/produce/piecework/index'
import publicApi from '@/api/public/index' //字典

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const title = ref(null)
const baseTable = ref() // table的ref
const pieceworkVisible = ref(false)
const pieceworkListRef = ref() //表格ref
const detailRef = ref(null) // 明细组件ref
const total = ref(0) // 数据总数
const emit = defineEmits(['editEmit'])
const tableData = ref([])
const selectData = reactive([
	{
		name: '作业公司',
		type: 'select',
		modelValue: 'companyId',
		modelLabel: 'companyName',
		span: 8,
		dataConfig: {
			params: { type: 'DEPT_LEVEL', deptLevel: '1' },
			method: 'get',
		},
		change: row => {
			console.log(row, 'rorrroororooror')
			publicApi.getLocalSelect({ type: 'DEPT_LEVEL', deptLevel: '4', parentDeptGid: row.value }).then(res => {
				console.log(res, 'resssssssssss')
				proxy.setEditTableOptions(selectData, { deptId: res.data })
			})
		},
	},
	{
		name: '部门',
		type: 'select',
		prop: 'deptId', // 便于赋值
		modelValue: 'deptId',
		modelLabel: 'deptName',
		span: 8,
	},
	{
		name: '计件工资项目名称',
		type: 'select',
		modelValue: 'pieceProjectId',
		modelLabel: 'pieceProjectName',
		span: 8,
		dataConfig: {
			url: '/api/internal/public/getDictList?types=PIECE_PROJECT',
			dictType: 'PIECE_PROJECT',
		},
	},
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const getList = e => {
	queryParams.value = e
	api.getPieceworkList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:feeItem:add', // 权限
	},
])
const add = () => {
	title.value = '新增'
	pieceworkVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.isUpdateStorage = '1'
	})
}
// 表格表头参数
const tableColumns = reactive([
	{
		prop: 'companyName',
		label: '作业公司',
	},
	{
		prop: 'deptName',
		label: '部门',
	},
	{
		prop: 'pieceProjectName',
		label: '计件工资项目名称',
	},
	{
		prop: 'isUpdateStorage',
		label: '是否更新港存',
		align: 'center',
		render: row => {
			console.log(row, 'rowww')
			return [
				h(
					ElTag,
					{
						type: row.isUpdateStorage == '1' ? '' : 'info',
					},
					{
						default: () => (row.isUpdateStorage === '1' ? '是' : '否'),
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		fixed: 'right',
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
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row // 拿到所编辑行的数据
	console.log(editRow, 'eddddeeeeddddd')
	pieceworkVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		proxy.setFormData(detailRef.value.formData, row)
		detailRef.value.changeCompany()
		console.log('编辑')
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deletePiecework(deleteRow.id)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
		.catch(() => {})
	console.log('delete', deleteRow)
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		console.log('保存', detailRef.value.formData)
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.updatePiecework(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					pieceworkVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertPiecework(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					pieceworkVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
// 默认查询
getList(queryParams.value)
</script>
