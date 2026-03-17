<template>
	<div>
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:checkbox-config="checkboxConfig"
			@checkbox-change="checkboxChange"
			@selectAllChangeEvent="checkboxChange"
			:tableHeight="tableHeight"
		/>
	</div>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance, onMounted, toRefs, nextTick } from 'vue'
import api from '@/api/equipment/inspectionStandard/index'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'
import BaseTable from '@/components/BaseTable/index.vue'
import tableParamsStore from '@/store/modules/tableParams'

const storeHeight = computed(() => tableParamsStore().drawerNormalTableHeight)
const tableHeight = computed(() => storeHeight.value - 10)
const total = ref(0)
const selectData = reactive([
	{
		name: '设备机构',
		type: 'select',
		modelValue: 'equipInstitutionId',
		selectData: [],
		span: 12,
		change: e => {
			equipInstitutionChange(e)
		},
	},
	{
		name: '设备部件',
		type: 'select',
		modelValue: 'equipUnitId',
		selectData: [],
		span: 12,
	},
])
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	equipInstitutionId: '',
	equipSmallCategoryId: '',
	equipUnitId: '',
})
const tableData = ref([])
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 50, fixed: 'left' },
	{ label: '序号', type: 'seq', width: 60, align: 'center' },
	{
		label: '类型',
		prop: 'equipType',
		width: 80,
		render: row => {
			return [
				h(
					'span',
					{},
					{
						default: () => equipTypeChange(row),
					},
				),
			]
		},
	},
	{ label: '设备小类', prop: 'equipSmallCategoryName', width: 110 },
	{ label: '设备机构', prop: 'equipInstitutionName', width: 110 },
	{ label: '设备部件', prop: 'equipUnitName', width: 140 },
	{ label: '点检内容', prop: 'content' },
	{ label: '点检标准', prop: 'standard' },
])
const equipPlanId = ref(null)
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: false, // 开启复选框范围选择功能
}
const formData = ref({
	id: '',
	equipSmallCategoryId: '',
	equipSmallCategoryName: '',
	equipId: '',
	equipName: '',
	planType: '',
	equipType: '',
	setDate: [],
	initialDate: '',
	isSingle: '2',
	cycle: '',
	inspectorId: '',
	inspectorName: '',
	standardId: '',
	timeLimit: '',
})
// 获取标准信息
const checkboxSelection = ref([])
// 复选框改变事件
const checkboxChange = data => {
	checkboxSelection.value = data
}
// 类型change事件
const equipTypeChange = e => {
	if (e) {
		switch (e.equipType) {
			case '1':
				return '日'
				break
			case '2':
				return '周'
				break
			case '3':
				return '月'
				break
			case '4':
				return '年'
				break
			case '5':
				return '运行台时'
				break
			case '6':
				return '里程'
				break
			default:
				'日'
		}
	} else {
		return '日'
	}
}
const baseTable = ref(null)
const resetForm = () => {
	// 逐个属性重置，保持响应式
	tableData.value = []
	if (baseTable.value) baseTable.value.clearCheckboxRow()
	baseTable.value.SearchHeaderRef.searchData.equipInstitutionId = ''
	baseTable.value.SearchHeaderRef.searchData.equipUnitId = ''
	queryParams.value.equipInstitutionId = ''
	queryParams.value.equipUnitId = ''
}
// 查询主列表
const getList = e => {
	queryParams.value.equipSmallCategoryId = formData.value.equipSmallCategoryId
	queryParams.value.equipType = formData.value.equipType
	queryParams.value = Object.assign({}, queryParams.value, e)
	api.queryAll(queryParams.value).then(res => {
		tableData.value = res.data.pages
		tableData.value.forEach((v, index) => {
			v.seq = index + 1
		})
		total.value = res.data.totalNum
		equipSmallCategoryChange(formData.value.equipSmallCategoryId)
	})
}

// 查询条件相关
const equipSmallCategoryChange = e => {
	if (e) {
		publicApi.getLocalSelect({ type: 'EQUIP_TYPE', categoryLevel: '4', parentId: e.value }).then(res => {
			selectData[0].selectData = res.data
		})
	} else {
		baseTable.value.SearchHeaderRef.searchData.equipInstitutionId = ''
		baseTable.value.SearchHeaderRef.searchData.equipUnitId = ''
		queryParams.value.equipInstitutionId = ''
		queryParams.value.equipUnitId = ''
		selectData[0].selectData = []
	}
}
const equipInstitutionChange = e => {
	if (e) {
		publicApi.getLocalSelect({ type: 'EQUIP_TYPE', categoryLevel: '5', parentId: e.value }).then(res => {
			selectData[1].selectData = res.data
		})
	} else {
		baseTable.value.SearchHeaderRef.searchData.equipUnitId = ''
		queryParams.value.equipUnitId = ''
		selectData[1].selectData = []
	}
}
defineExpose({
	formData,
	checkboxSelection,
	resetForm,
	getList,
})
</script>

<style></style>
