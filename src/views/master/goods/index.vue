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

<script setup name="goods">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/goods/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton, ElSwitch} from 'element-plus'
const title = ref(null)
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const cargoVisible = ref(false)
const detailRef = ref(null) // 明细组件ref
// 检索框
const selectData = reactive([
	{
		name: '货类名称',
		type: 'select',
		modelValue: 'cargoTypeCode',
		span: 8,
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
		span: 8, // 占位，共24
	},
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
		console.log('货物管理', res)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:cargo:add', // 权限
	},
])
// 新增事件
const add = () => {
	cargoVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 新增清空id
		detailRef.value.formData.cargoCode = '' // 新增清空id
		detailRef.value.formData.floatTon = '3' // 新增清空id
		console.log('add')
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '货类名称', prop: 'cargoTypeName',align: "center",width: 120 },
	{ label: '货种名称', prop: 'cargoCategoryName',align: "center",width: 120 },
	{ label: '货物名称', prop: 'cargoName',align: "center",width: 200 },
	{ label: '助记码', prop: 'shorthandCode',align: "center",width: 90 },
  { label: '货物标识码', prop: 'sign',align: "center",width: 120 },
	{
		label: '作业模式',
		prop: 'workType',
    align: "center",
    width: 100,
		render: row => {
			return [h('div', {}, row.workType == '1' ? '件杂' : row.workType == '2' ? '散杂' : '')]
		},
	},
	{
		label: '理货方式',
		prop: 'tally',
    align: "center",
    width: 100,
		render: row => {
			return [h('div', {}, row.tally == '1' ? '件号' : row.tally == '2' ? '件数' : row.tally == '3' ? '箱号' :'')]
		},
	},
	{
		label: '场存节点',
		prop: 'updatePoint',
    align: "center",
    width: 100,
		render: row => {
			return [h('div', {}, row.updatePoint == '1' ? '理货' : row.updatePoint == '2' ? '签票' : '')]
		},
	},
	{
		label: '货物颜色',
		prop: 'cargoColor',
		align: 'center',
    width: 100,
		render: row => {
			return [
				h(
					'div',
					{
						style: `width: 16px;height: 16px;border-radius:3px;background:${row.cargoColor};margin-left: 50%;transform: translateX(-50%);`,
					},
					''
				),
			]
		},
	},
  { label: '浮动量(‰)', prop: 'floatTon',align: "center",width: 120 },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 150,
    render: row => {
      return [
        h(
          ElSwitch,
          {
            onClick: () => {
              const status = row.status === '1' ? '0' : '1'
              proxy.$modal.confirm(`确认${status === '1' ? '启用' : '停用'}?`).then(() => {
                api.updateStatus(row.id, status).then(res => {
                  proxy.$modal.msgSuccess(res.msg)
                  getList()
                })
              })
            },
            modelValue: row.status,
            'active-value': '1',
            'inactive-value': '0',
          },
        ),
      ]
    },
  },
  { label: '计件工资类型(库场)', prop: 'yardSalaryTypeName',align: "center",width: 165 },
  { label: '计件工资类型(调度)', prop: 'dispatchSalaryTypeName',align: "center",width: 165 },
  { label: '计件工资类型(流机)', prop: 'flowSalaryTypeName',align: "center",width: 165 },
  { label: '计件工资类型(固机)', prop: 'fixedSalaryTypeName',align: "center",width: 165 },
	{ label: '排序', prop: 'sortNum', sortable: true,align: "center",width: 80 },
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
		api.getCargoById(editRow.id).then(res => {
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
			api.deleteCargo(deleteRow.id).then(res => {
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
				api.updateCargo(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					cargoVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertCargo(params).then(res => {
					console.log('新增货物名称', res)
					proxy.$modal.msgSuccess(res.msg)
					cargoVisible.value = false
					getList(queryParams.value)
				})
			}
		})

		// console.log('保存', detailRef.value.formData)
	}
}
getList()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
