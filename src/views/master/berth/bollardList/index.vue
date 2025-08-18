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
			:tableHeight="'drawerHeaderPageTableHeight'"
		/>
	</div>
	<el-drawer v-model="berthVisible" :title="title" size="30%">
		<detail ref="formDataRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="berthVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="bollardList">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/berth/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const formDataRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const queryParams = ref({})
const id = ref('')
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '缆桩代码', prop: 'bollardCode' },
	{ label: '缆桩名称', prop: 'bollardName' },
	{ label: '经度', prop: 'lon', align: 'right' },
	{ label: '纬度', prop: 'lat', align: 'right' },
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
						permission: 'master:berth:update',
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
		name: '缆桩名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'bollardName', // 绑定字段
		span: 24, // 占位，共24
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

const clickRow = ref({})

// 点击查询的事件
const getList = e => {
	let params = {
		berthId: id.value,
		bollardName: e.bollardName ? e.bollardName : '',
	}
	api.getBollardList(params).then(res => {
		if (res.code == '0000') {
			tableData.value = res.data
		} else {
			proxy.$modal.msgError(res.msg)
		}
	})
}
const getData = e => {
	id.value = e
	nextTick(() => {
		getList(queryParams.value)
	})
}
// 新增事件
const add = () => {
	berthVisible.value = true
	title.value = '新增'
	nextTick(() => {
		formDataRef.value.resetForm() // 清空事件
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	berthVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		formDataRef.value.resetForm() // 清空事件
		api.getBollardById(editRow.id).then(res => {
			if (res.code == '0000') {
				let msg = res.data
				formDataRef.value.formData.id = msg.id
				formDataRef.value.formData.bollardCode = msg.bollardCode
				formDataRef.value.formData.bollardName = msg.bollardName
				formDataRef.value.formData.lon = msg.lon
				formDataRef.value.formData.lat = msg.lat
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
		.confirm('确定删除缆桩名称为"' + row.bollardName + '"的数据项?')
		.then(res => {
			api.deleteBollard(deleteRow.id).then(res => {
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
	if (await formDataRef.value.validate()) {
		formDataRef.value.formData.berthId = ''
		formDataRef.value.formData.berthId = id.value
		proxy.$modal.confirm('确认保存?').then(res => {
			if (title.value == '编辑') {
				api.updateBollard(formDataRef.value.formData).then(res => {
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						getList(queryParams.value)
						berthVisible.value = false
					} else {
						proxy.$modal.msgError(res.msg)
					}
				})
			} else {
				api.insertBollard(formDataRef.value.formData).then(res => {
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						getList(queryParams.value)
						berthVisible.value = false
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
defineExpose({
	getData,
})
</script>
