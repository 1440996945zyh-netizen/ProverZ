<template>
	<BaseTable
		size="65%"
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
	<el-drawer v-model="cargoVisible" :title="title" size="30%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="cargoVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="hqCargo">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/hqStorageStack/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton, ElSwitch, ElTag} from 'element-plus'
const title = ref(null)
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const cargoVisible = ref(false)
const detailRef = ref(null) // 明细组件ref
// 检索框
const selectData = reactive([
	{
		name: '货物名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoName', // 绑定字段
		span: 8, // 占位，共24
	},
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	// cargoCategoryCode: '03000003',
})
const total = ref(0) // 数据总数
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:hqStorageStack:add', // 权限
	},
])
// 新增事件
const add = () => {
	cargoVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 新增清空id
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '库场名称', prop: 'storageYardNm',align: "center" },
	{ label: '助记码', prop: 'shortCd',align: "center" },
	{ label: '库场面积(m²)', prop: 'area',align: "center" },
	{ label: '工作区域', prop: 'workAreaCd',align: "center" },
  {
    label: '工作区域',
    prop: 'workAreaCd',
    align: 'center',
    fixed:'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.workAreaCd == '01' ? 'success' : row.workAreaCd == '02' ? 'primary' : 'info'
          },
          {
            default: () => (row.workAreaCd == '01' ? '东作业区' : row.workAreaCd == '02' ? '中作业区' : row.workAreaCd == '03' ? '西作业区' : '')
          }
        )
      ]
    }
  },
	{
		prop: '',
		label: '操作',
		width: 'operate',
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

const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	cargoVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getStorageStackById(editRow.id).then(res => {
			console.log(res.data)
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
		.then(() => {
			api.deleteStorageStack(deleteRow.id).then(res => {
				getList(queryParams.value)
				proxy.$modal.msgSuccess(res.msg)
			})
		})
		.catch(() => {})
	console.log('delete', deleteRow)
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData))
		proxy.$modal.confirm('确定保存？').then(() => {
			console.log('货物数据保存', params)
			if (params.id) {
				api.updateStorageStack(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					cargoVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertStorageStack(params).then(res => {
					console.log('新增货物名称', res)
					proxy.$modal.msgSuccess(res.msg)
					cargoVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
getList()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
