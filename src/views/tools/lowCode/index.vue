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
				:loading="loading"
				:total="total"
			/>
		</div>
		<el-drawer v-model="cargoCategoryVisible" title="新建货种" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="cargoCategoryVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="Demo">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/cargo/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const cargoCategoryVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref
const cargoNameListRef = ref(null) // 货名列表组件ref
const cargoNameVisible = ref(false) // 货名列表抽屉
const loading = ref(false) // 是否加载中
const total = ref(0) // 数据总数
// 检索参数
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = ref([
	{ label: '货类名称', prop: 'cargoTypeName' },
	{ label: '货种名称', prop: 'cargoCategoryName' },
	{ label: '排序', prop: 'sortNum', sortable: true },
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
// header检索参数
const selectData = reactive([
	{
		name: '货类名称',
		type: 'select',
		modelValue: 'cargoTypeCode',
		span: 4,
		selectLabel: 'dictLabel',
		selectValue: 'dictValue',
		dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/CARGO_CATEGORY',
			method: 'get',
		},
	},
	{
		name: '货种名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoCategoryName', // 绑定字段
		span: 4, // 占位，共24
	},
])
// header按钮参数
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:cargo:insert', // 权限
	},
])
// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	loading.value = true
	api.getCargoCategoryList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		loading.value = false
	})
	console.log('查询拉查询拉', e)
}
// 新增事件
const add = () => {
	cargoCategoryVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 新建清空id
		detailRef.value.formData.cargoCategoryCode = '' // 新建清空cargoCategoryCode
		console.log('add')
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	cargoCategoryVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getCargoCategoryById(editRow.id).then(res => {
			detailRef.value.formData.cargoCategoryName = res.data.cargoCategoryName
			detailRef.value.formData.cargoTypeCode = res.data.cargoTypeCode
			detailRef.value.formData.cargoTypeName = res.data.cargoTypeName
			detailRef.value.formData.updatePoint = res.data.updatePoint
			detailRef.value.formData.sortNum = res.data.sortNum
			detailRef.value.formData.id = res.data.id
			detailRef.value.formData.cargoCategoryCode = res.data.cargoCategoryCode
		})
		console.log(editRow, 'edit')
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('是否确认删除货种名称为" ' + deleteRow.cargoCategoryName + ' "的数据项?')
		.then(function () {
			return api.deleteCargoCategory(deleteRow.id)
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
	console.log('delete', deleteRow)
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		console.log('保存', detailRef.value.formData)
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm('是否保存？').then(() => {
			if (params.id) {
				api.updateCargoCategory(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('修改成功')
						cargoCategoryVisible.value = false
						getList(queryParams.value)
					}
				})
			} else {
				api.insertCargoCategory(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						cargoCategoryVisible.value = false
						getList(queryParams.value)
					}
				})
			}
		})
	}
}

// 默认查询
getList(queryParams.value)
</script>
