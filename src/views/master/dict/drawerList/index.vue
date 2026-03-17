<template>
	<div  class="container">
		<div>
			<BaseTable
				ref="drawerTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:total="total"
				:tableHeight="storeHeight"
			/>
		</div>
		<Drawer v-model="drawerVisible" :title="title" size="30%">
			<detail ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="Dict">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/dict/index'
import { ref, reactive, nextTick } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'
import Drawer from '@/components/Drawer/index.vue'
const storeHeight = computed(() => tableParamsStore().drawerPageTableHeight)
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const drawerRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const dictType = ref('') //字典类型
const dictName = ref('') //字典类型名称
const drawerVisible = ref(false)
const clickRow = ref({})
const queryParams = ref({
	startPage: 1,
 pageSize: 20, 
})
const drawerTableRef = ref(null)
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '字典名称', prop: 'dictLabel', align: 'left' },
	{ label: '字典编号', prop: 'dictValue', align: 'left' },
	{ label: '备注', prop: 'remark', align: 'left' },
	{ label: '排序号', prop: 'sortNum', align: 'left' },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'center',
		width: 'status',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.statusLabel == '在用' ? '' : 'info',
					},
					{
						default: () => (row.statusLabel === '在用' ? '在用' : '停用'),
					}
				),
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
const selectData = reactive([
	{
		name: '字典名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'dictLabel', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '字典编号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'dictValue', // 绑定字段
		span: 12, // 占位，共24
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:user:add', // 权限
	},
])

// 点击查询的事件
const getList = e => {
	let pagination = drawerTableRef.value?.buildQueryParams()
	let params = {
		...e,
		...pagination,
	}
	params.dictType = dictType.value
	api.getDictList(params).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const getData = row => {
	console.log(row)
	dictType.value = row.dictType
	dictName.value = row.dictName
	queryParams.value.dictType = row.dictType
	nextTick(() => {
		getList()
	})
}
// 新增事件
const add = () => {
	drawerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		drawerRef.value.formData.id = ''
		drawerRef.value.formData.status = '1'
		drawerRef.value.formData.dictType = dictType.value
		drawerRef.value.formData.dictName = dictName.value
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getDictById(editRow.id).then(res => {
			proxy.setFormData(drawerRef.value.formData, res.data)
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.deleteDictById(deleteRow.id).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getList()
				drawerVisible.value = false
			})
		})
		.catch(err => {})
}
// 保存事件
const save = async () => {
	if (await drawerRef.value.validate()) {
		proxy.$modal.confirm('确认保存?').then(res => {
			const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
			if (params.id) {
				api.updateDict(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					getList()
					drawerVisible.value = false
				})
			} else {
				api.insertDict(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					getList()
					drawerVisible.value = false
				})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
defineExpose({
	getData,
})
</script>
