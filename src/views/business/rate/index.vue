<template>
	<!-- 标准费率 -->
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:cellClickEvent="cellClickEvent"
			:tableData="tableData"
			:total="total"
			:auto-resize="true"
		/>
		<!-- 新增、修改抽屉组件 -->
		<el-drawer v-model="rateVisible" :title="title" size="60%">
			<Drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="rateVisible = false">取 消</el-button>
					<el-button type="primary" @click="save">保 存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="rate">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/business/rate/index'

import { ref, reactive } from 'vue'
import Drawer from './drawer/index.vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const total = ref(0)
const title = ref('新增')
const ids = ref([])
const drawerRef = ref(null)
const rateVisible = ref(false) //新增修改抽屉
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '费目名称', prop: 'rateItemName', align: 'left', width: 150 },
	{ label: '服务内容名称', prop: 'serviceContentName', align: 'left', width: 130 },
	{ label: '作业过程', prop: 'processName', align: 'left', width: 100 },
	{ label: '货物名称', prop: 'cargoName', align: 'left', width: 100 },
	{ label: '内外贸', prop: 'inteFore', align: 'center', width: 100 },
	{
		label: '作业模式',
		prop: 'workType',
		align: 'center',
		width: 100,
		render: row => {
			return [h('div', {}, row.workType == '1' ? '件杂' : row.workType == '2' ? '散杂' : '')]
		},
	},
	{ label: '费率', prop: 'rate', align: 'right', width: 100 },
	{ label: '税率(%)', prop: 'taxRate', align: 'right', width: 100 },
	{ label: '计量单位', prop: 'measurementUnitName1', align: 'left', width: 100 },
	// { label: '计量单位', prop: 'measurementUnitName2' ,align: 'left',},
	{ label: '有效期起', prop: 'startDate', align: 'center', width: 100 },
	{ label: '有效期止', prop: 'endDate', align: 'center', width: 100 },
	{ label: '免堆存期', prop: 'freeStorageDays', align: 'right', width: 100 },
	{ label: '备注', prop: 'remark', align: 'left', width: 150 },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'left',
		width: 'status',
		width: 150,
		render: row => {
			return [
				h(
					ElTag,
					{
						type:
							row.statusLabel == '审核通过'
								? 'success'
								: row.statusLabel == '审核中'
								? ''
								: row.statusLabel == '未通过'
								? 'danger '
								: row.statusLabel == '停用'
								? 'info'
								: '',
					},
					{
						default: () =>
							row.statusLabel == '审核通过'
								? '审核通过'
								: row.statusLabel == '审核中'
								? '审核中'
								: row.statusLabel == '未通过'
								? '未通过 '
								: row.statusLabel == '停用'
								? '停用'
								: '',
					}
				),
			]
		},
	},
	{ label: '审核人姓名', prop: 'examineByName', align: 'left', width: 120 },
	{ label: '审核时间', prop: 'examineTime', align: 'left', width: 150 },
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
						permission: 'business:rate:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: row.statusLabel == '审核通过' ? true : false,
						permission: 'business:rate:delete', // 权限
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
	// {
	// 	name: '费目名称', // 搜索框name
	// 	type: 'select', // 搜索框类型
	// 	modelValue: 'rateItemCode', // 绑定字段
	// 	span: 8, // 占位，共24
	// 	dataConfig: {
	// 		// 本地需要dataConfig获取数据，包括url、method，method默认get
	// 		url: '/api/internal/public/getLocalSelect?type=FEE_ITEM',
	// 		method: 'get',
	// 	},
	// },
  {
		name: '费目名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'rateItemName', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '货物名称',
		type: 'remoteSelect',
		modelValue: 'cargoCode',
		span: 8,
		dataType: 'CARGO_INFO',
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ label: '审核通过', value: '10' },
			{ label: '审核中', value: '1' },
			{ label: '未通过', value: '9' },
			{ label: '停用', value: '0' },
		],
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'business:rate:add', // 权限
	},
	{
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Open', // 按钮图标，支持element-Plus中所有图标
		click: () => auditStstus, // 回调函数
		permission: 'business:rate:pass', // 权限
	},
])

// 点击查询的事件
const getList = e => {
	editObj.value = {}
	queryParams.value = e
	api.getList(queryParams.value).then(res => {
		console.log('列表', res)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 添加费率 */
const add = () => {
	rateVisible.value = true
	title.value = '新增'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		drawerRef.value.formData.id = '' // 清空id
		// drawerRef.value.formData.dateArr = []
		// console.log('add')
	})
}

const auditStstus = () => {
	if (clickRow.value.status == '10') {
		proxy.$modal.confirm('确认销审吗？').then(() => {
			api.auditStatusCancle(clickRow.value.id).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('销审成功')
					getList(queryParams.value)
				}
			})
		})
	} else if (clickRow.value.status == '1') {
		proxy.$modal.confirm('确认审核通过吗？').then(() => {
			api.auditStatus(clickRow.value.id).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('审核通过')
					getList(queryParams.value)
				}
			})
		})
	}
}
const clickRow = ref([])
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	console.log('status::::', clickRow.value.status)
	if (clickRow.value.status == '10') {
		buttonList[1].label = '销审'
	} else if (clickRow.value.status == '1') {
		buttonList[1].label = '审核'
	}
}
const editObj = ref()
/** 编辑 */
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	editObj.value = row
	title.value = '编辑'
	rateVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getDataById(editRow.id).then(res => {
			console.log('修改数据', res)
			proxy.setFormData(drawerRef.value.formData, res.data)
			// drawerRef.value.formData.dateArr = [res.data.startDate,res.data.endDate];
			// drawerRef.value.formData.customerProperty = res.data.propertyList.map(item => item.customerPropertyName)
		})
	})
}

// 费率保存
const save = async () => {
	if (drawerRef.value.formData.id && editObj.value.statusLabel == '审核通过') {
		proxy.$modal.msgError('已审核的不能修改')
		return
	}
	if (await drawerRef.value.validate()) {
		// drawerRef.value.formData.startDate = drawerRef.value.formData.dateArr[0]
		// drawerRef.value.formData.endDate = drawerRef.value.formData.dateArr[1]
		const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm(`确定保存？`).then(() => {
			console.log('点击保存', params)
			if (params.id) {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					rateVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					rateVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
/* 删除费率 */
const handleDelete = row => {
	const deleteRow = row || ids.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}

getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
