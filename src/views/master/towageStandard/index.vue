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
	<el-drawer v-model="customerVisible" :title="title" size="30%">
		<drawer ref="drawerRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="customerVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="tug">
import BaseTable from '@/components/BaseTable/index.vue'
import drawer from './drawer/index.vue'
import api from '@/api/master/towageStandard/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const drawerRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
//查询条件
const queryParams = ref({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '费目', prop: 'itemNm' },
	{ label: '内外贸', prop: 'tradeType', align: 'center' },
	{ label: '船型', prop: 'shipTypeLabel' },
	{ label: '船长', prop: 'shipLength', align: 'right' },
	{ label: '费率', prop: 'rate', align: 'right' },
	{ label: '税率', prop: 'taxRate', align: 'right' },
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
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'master:tug:update', // 权限
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
						permission: 'master:tug:delete', // 权限
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
		name: '船型', // 搜索框code
		type: 'select', // 搜索框类型
		modelValue: 'shipTypeCode', // 绑定字段
		span: 12, // 占位，共24
		dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/SHIP_TYPE',
			method: 'get',
		},
	},
	{
		name: '内外贸', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'tradeType', // 绑定字段
		span: 12, // 占位，共24
		selectData: [
			{ label: '内贸', value: '内贸' },
			{ label: '外贸', value: '外贸' },
		],
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:tug:add', // 权限
	},
])
const customerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		console.log('拖轮费用列表', res)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 新增事件
const add = () => {
	customerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		drawerRef.value.formData.tradeType = '内贸' // 清空事件
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	customerVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		drawerRef.value.formData.tradeType = '内贸'
		proxy.setFormData(drawerRef.value.formData, editRow)
		// console.log('单条数据', editRow)
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
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
	if (await drawerRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(res => {
			if (title.value == '编辑') {
				api.update(drawerRef.value.formData).then(res => {
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						getList(queryParams.value)
						customerVisible.value = false
					} else {
						proxy.$modal.msgError(res.msg)
					}
				})
			} else {
				// delete drawerRef.value.formData.id
				console.log('保存数据', drawerRef.value.formData)
				api.insert(drawerRef.value.formData).then(res => {
					console.log('拖轮费用保存', res)
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						getList(queryParams.value)
						customerVisible.value = false
					} else {
						proxy.$modal.msgError(res.msg)
					}
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
