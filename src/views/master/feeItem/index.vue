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
		<el-drawer v-model="detailVisible" :title="title" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="feeItem">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/feeItem/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref
// header检索参数
const selectData = reactive([
	{
		name: '费目名称', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'itemNm', // 绑定字段
		span: 8, // 占位，共24
		dataConfig: { params: { type: 'FEE_ITEM' } },
	},
	{
		name: '费目类型',
		type: 'select',
		modelValue: 'itemTypeCd',
		span: 8,
		dataConfig: { url: '/api/internal/public/getDictList?types=FEE_ITEM_TYPE', dictType: 'FEE_ITEM_TYPE' },
	},
	{
		name: '费用类型',
		type: 'select',
		modelValue: 'rateTypeCd',
		span: 8,
		dataConfig: { url: '/api/internal/public/getDictList?types=RATE_TYPE', dictType: 'RATE_TYPE' },
	},
])
const queryParams = ref({
	// 检索参数
	startPage: 1,
	pageSize: 10,
})

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getlist(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}
// header按钮参数
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:feeItem:add', // 权限
	},
])
const title = ref('')
// 新增事件
const add = () => {
	title.value = '新增'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
const total = ref(0) // 数据总数
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = reactive([
	{
		prop: 'itemCd',
		label: '费目编号',
	},
	{
		prop: 'itemNm',
		label: '费目名称',
	},
	{
		prop: 'itemTypeNm',
		label: '费目类型',
	},
	{
		prop: 'rateTypeNm',
		label: '费用类型',
	},
	{
		prop: '',
		label: '是否主营收入',
		align: 'center',
		render: row => {
			console.log(row, 'rowww')
			return [
				h(
					ElTag,
					{
						type: row.isMainIncome == '1' ? '' : 'info',
					},
					{
						default: () => (row.isMainIncome === '1' ? '是' : '否'),
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
						permission: 'master:feeItem:update', // 权限
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
						permission: 'master:feeItem:delete', // 权限
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
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getbyid(editRow.id).then(res => {
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
			return api.deletebyid(deleteRow.id)
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
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
// 默认查询
getList(queryParams.value)
</script>
