<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:total="total"
			:rowStyle="getRowStyle"
		/>
	</div>
</template>

<script setup name="specialEquipment">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/specialEquipment/index'
import { ref, reactive, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref('')
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const loading = ref(false)
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '部门', prop: 'useOrgName', align: 'left', width: 120 },
	{ label: '设备小类', prop: 'equipSmallCategoryName', align: 'left', width: 120 },
	{ label: '设备名称', prop: 'equipName', align: 'left', },
	{ label: '设备编号', prop: 'equipCode', align: 'left',  },
	{ label: '规格', prop: 'specificCode', align: 'left', width: 120 },
	{ label: '型号', prop: 'modelNumber', align: 'left', width: 120 },
  { label: '计量单位', prop: 'unitName', align: 'left', width: 100 },
	{ label: '注册登记代码', prop: 'particularRegistrationCode', align: 'left',  },
	{ label: '检验时间', prop: 'releaseDate', align: 'center', width: 120 },
	{ label: '到期时间', prop: 'expireDate', align: 'center', width: 120 },
	{ label: '有效期(月)', prop: 'validDate', align: 'right', width: 120 },
])

const selectData = reactive([
	{
		name: '设备编号',
		type: 'input',
		modelValue: 'equipCode',
		span: 8,
	},
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 8,
	},
	{
		name: '注册登记代码',
		type: 'input',
		modelValue: 'particularRegistrationCode',
		span: 8,
	},
])

// 点击查询的事件
const getList = e => {
	loading.value = true
	queryParams.value = e
	api.getList(e).then(res => {
		loading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

// 获取行样式，如果到期时间已过期则显示红色背景
const getRowStyle = ({ row }) => {
	if (row.expireDate) {
		const expireDate = new Date(row.expireDate)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		expireDate.setHours(0, 0, 0, 0)
		
		// 如果到期时间小于今天，则显示红色背景
		if (expireDate < today) {
			return {
				backgroundColor: '#ffebee'
			}
		}
	}
	return {}
}

getList(queryParams.value)
</script>

