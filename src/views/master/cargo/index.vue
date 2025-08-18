<template>
	<!-- 货物信息 -->
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
	<el-drawer v-model="cargoCategoryVisible" :title="title" size="30%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="cargoCategoryVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
	<el-drawer v-model="cargoNameVisible" title="货名列表" size="70%">
		<cargoNameList ref="cargoNameListRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="cargoNameVisible = false">关闭</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="cargo">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import cargoNameList from './cargoNameList/index.vue'
import api from '@/api/master/cargo/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import bus from '@/utils/bus.js'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const title = ref(null)
const baseTable = ref() // table的ref
const cargoCategoryVisible = ref(false)
const detailRef = ref(null) // 明细组件ref
const cargoNameListRef = ref(null) // 明细组件ref
const cargoNameVisible = ref(false)
const total = ref(0) // 数据总数
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '货类名称', prop: 'cargoTypeName' },
	{ label: '货种名称', prop: 'cargoCategoryName' },
	{ label: '主要负责人', prop: 'mainName' },
	{ label: '主要负责人电话', prop: 'mainMobile' },
	{ label: '次要负责人', prop: 'minorName' },
	{ label: '次要负责人电话', prop: 'minorMobile' },
	{ label: '排序', prop: 'sortNum', sortable: true, align: 'right', width: 100 },
	{
		prop: '',
		label: '操作',
		width: 200,
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
						permission: 'master:cargo:update',
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
							getCargoNameList(row)
						},
						type: 'primary',
						link: true,
						icon: 'Operation',
						permission: 'master:cargo:query',
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
						permission: 'master:cargo:delete',
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
		name: '货类名称',
		type: 'select',
		modelValue: 'cargoTypeCode',
		span: 12,
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
		span: 12, // 占位，共24
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:cargo:add', // 权限
	},
])

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getCargoCategoryList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}
// 新增事件
const add = () => {
	cargoCategoryVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	cargoCategoryVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getCargoCategoryById(editRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData, res.data)
		})
		console.log(editRow, 'edit')
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deleteCargoCategory(deleteRow.id)
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
				api.updateCargoCategory(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					cargoCategoryVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertCargoCategory(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					cargoCategoryVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
// 打开列表抽屉
const getCargoNameList = row => {
	cargoNameVisible.value = true
	nextTick(() => {
		cargoNameListRef.value.queryParams.cargoCategoryCode = row.cargoCategoryCode // 给子组件的queryParams赋值
		cargoNameListRef.value.getList(cargoNameListRef.value.queryParams)
		cargoNameListRef.value.resetSearch()
	})
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
