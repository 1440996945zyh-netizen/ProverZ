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

<script setup name="lumpSum">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/business/lumpSum/index'
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
	{ label: '货物名称', prop: 'cargoName', align: 'left' },
	{ label: '货种名称', prop: 'cargoCategoryName', align: 'left' },
	{ label: '货类名称', prop: 'cargoTypeName', align: 'left' },
  { label: '货物标识码', prop: 'sign', align: 'left' },
	{
		label: '状态',
		prop: 'status',
		align: 'left',
		width: 'status',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '10' ? 'success' : 'danger',
					},
					{
						default: () => (row.status == '10' ? '已审核' : '未审核 '),
					}
				),
			]
		},
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
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:lumpSum:update', // 权限
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
						disabled: row.status == '10' ? true : false,
						permission: 'business:lumpSum:delete', // 权限
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
		name: '货物名称',
    type: 'input', // 搜索框类型
    modelValue: 'cargoName',
		span: 12,
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 12,
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
		permission: 'business:lumpSum:add', // 权限
	},
	{
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Open', // 按钮图标，支持element-Plus中所有图标
		click: () => auditStstus, // 回调函数
		permission: 'business:lumpSum:pass', // 权限
	},
	{
		label: '撤销', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Switch', // 按钮图标，支持element-Plus中所有图标
		click: () => revoke, // 回调函数
		permission: 'business:lumpSum:revoke', // 权限
	},
])
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 添加费率 */
const add = () => {
	title.value = '新增'
	rateVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		drawerRef.value.formData.id = '' // 清空id
		api.getListService().then(res => {
			drawerRef.value.tableList = res.data
		})
	})
}
// 审核
const auditStstus = () => {
	proxy.$modal.confirm('确认审核通过吗？').then(() => {
		api.auditStatus(clickRow.value).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('审核通过')
				getList(queryParams.value)
			}
		})
	})
}
// 撤销
const revoke = () => {
	proxy.$modal.confirm('确认撤销审核吗？').then(() => {
		api.revoke(clickRow.value).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('撤销成功')
				getList(queryParams.value)
			}
		})
	})
}
const clickRow = ref([])
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	if (clickRow.value.status == '10') {
		buttonList[1].disabled = true //控制生效按钮
		buttonList[2].disabled = false
	} else {
		buttonList[1].disabled = false
		buttonList[2].disabled = true
	}
}
const editObj = ref()
/** 编辑 */
const edit = row => {
	const editRow = row // 拿到所编辑行的数据
	editObj.value = row
	console.log(editObj.value.status)
	title.value = '编辑'
	rateVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		let editList = []
		api.getListService().then(res => {
			editList = res.data
			api.getDataById(editRow).then(data => {
				editList.forEach(item => {
					data.data.forEach(data => {
						if (data.serviceContentId && item.serviceContentId == data.serviceContentId && item.inteFore == data.inteFore) {
							item.rate = data.rate
              item.id = data.id
						}
					})
				})

				drawerRef.value.tableList = editList
				proxy.setFormData(drawerRef.value.formData, data.data[0])
			})
		})
	})
}
// 费率保存
const save = async () => {
	if (drawerRef.value.formData.id && editObj.value.status == '10') {
		proxy.$modal.msgError('已审核的不能修改')
		return
	}
	if (await drawerRef.value.validate()) {
		const params = drawerRef.value.tableList
    console.log(123)
    console.log(params)
		const obj = JSON.parse(JSON.stringify(drawerRef.value.formData))
		params.map(item => {
			item.cargoCode = obj.cargoCode
			item.cargoName = obj.cargoName
			item.rateItemCode = obj.rateItemCode
			item.rateItemName = obj.rateItemName
			item.taxRate = obj.taxRate
			item.measurementUnitCode1 = obj.measurementUnitCode1
			item.startDate = obj.startDate
			item.endDate = obj.endDate
			item.remark = obj.remark
		})

		let list = []
		list = params.filter(item => item.rate)
		const param = {
			rows: clickRow.value,
			list: params,
		}
		proxy.$modal.confirm(`确定保存？`).then(() => {
			if (obj.id) {
				api.update(param).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					rateVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(list).then(res => {
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
			api.delete(deleteRow).then(res => {
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
