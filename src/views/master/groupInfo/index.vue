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
	<el-drawer v-model="customerVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="customerVisible = false">取消</el-button>
				<el-button type="primary" @click="save" v-hasPermi="['master:groupInfo:add', 'master:groupInfo:update']">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="groupInfo">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/groupInfo/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const queryParams = ref({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '分组名称', prop: 'groupName' },
	{ label: '计划类型', prop: 'planTypeName' },
	{ label: '主作业过程', prop: 'processName' },
	{ label: '计件工资类型', prop: 'salaryTypeName' },
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
						hasPermi: 'master:groupInfo:delete',
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
const selectData = reactive([
	{
		name: '分组名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'groupName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '计划类型',
		type: 'select',
		modelValue: 'planTypeCd',
		span: 12,
		selectData: [
			{ value: '1', label: '船舶计划' },
			{ value: '2', label: '集疏港计划' },
			{ value: '3', label: '转运计划' },
			{ value: '4', label: '杂项计划' },
		],
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:groupInfo:add', // 权限
	},
])
const customerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 新增事件
const add = () => {
	customerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	customerVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getDataById(editRow.id).then(res => {
			if (res.code == '0000') {
				let msg = res.data
				proxy.setFormData(detailRef.value.formData, msg)
				detailRef.value.formData.detailPOList = msg.detailPOList
				if (detailRef.value.formData.detailPOList.length > 0) {
					detailRef.value.formData.detailPOList.forEach(item => {
						if (item.deptId) {
							item.deptId = item.deptId.split(',')
						} else {
							item.deptId = []
						}
					})
				}
				detailRef.value.getProcess()
				detailRef.value.getziProcess()
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(err => {})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(res => {
			if (detailRef.value.formData.detailPOList.length > 0) {
				detailRef.value.formData.detailPOList.forEach(item => {
					console.log(item.deptId)
					if (item.deptId.length > 0) {
						item.deptId = item.deptId.join(',')
					} else {
						item.deptId = ''
					}
				})
			}
			api.insert(detailRef.value.formData).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					customerVisible.value = false
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
