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
		<el-drawer v-model="customerVisible" :title="title" size="70%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="customerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="Custom">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/custom/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '客户代码', prop: 'customerCode' },
	{ label: '客户名称', prop: 'customerName' },
	{ label: '英文名称', prop: 'enCustomerName' },
	{ label: '简称', prop: 'customerShort' },
	{
		label: '状态',
		prop: 'stauts',
		render: row => {
			return h('div', {}, row.stauts == '1' ? '在用' : row.stauts == '0' ? '停用' : '')
		},
	}, //1在用 0停用
	{ label: '备注', prop: 'remark' },
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
		name: '客户代码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'customerCode', // 绑定字段
		span: 4, // 占位，共24
	},
	{
		name: '客户名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'customerName', // 绑定字段
		span: 4, // 占位，共24
	},
	{
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 4, // 占位，共24
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
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:dict:insert', // 权限
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
		detailRef.value.typeList = []
		detailRef.value.formData.invoceList = []
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	customerVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.typeList = []
		api.getDataById(editRow.id).then(res => {
			if (res.code == '0000') {
				let msg = res.data
				detailRef.value.formData.id = msg.id
				detailRef.value.formData.customerCode = msg.customerCode
				detailRef.value.formData.customerName = msg.customerName
				detailRef.value.formData.enCustomerName = msg.enCustomerName
				detailRef.value.formData.customerShort = msg.customerShort
				detailRef.value.formData.stauts = msg.stauts
				detailRef.value.formData.remark = msg.remark
				detailRef.value.formData.invoceList = msg.invoceList
				detailRef.value.formData.typeList = msg.typeList
				msg.typeList.forEach(item => {
					console.log(item)
					detailRef.value.typeList.push(item.customerTypeCode)
				})
			} else {
				proxy.$modal.msgError(res.msg)
			}
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确认删除?')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$modal.msgSuccess(res.msg)
					getList(queryParams.value)
					customerVisible.value = false
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
				api.update(detailRef.value.formData).then(res => {
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						getList(queryParams.value)
						customerVisible.value = false
					} else {
						proxy.$modal.msgError(res.msg)
					}
				})
			} else {
				delete detailRef.value.formData.id
				api.insert(detailRef.value.formData).then(res => {
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
