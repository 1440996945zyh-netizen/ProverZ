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
		/>
	</div>
</template>

<script setup name="operLog">
import { getRunPileHistoryList } from '@/api/gis/runPileHistory/index'
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, toRefs } from 'vue'
import { ElButton,ElTag } from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'
const { proxy } = getCurrentInstance()
const total = ref(0)
let storeHight = computed(() => tableParamsStore().pageTableHeight)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	storehouseId: '', //库场id
	regionId: '', //区域id
	massId: '', //垛位id
	startWorkDate: '',
	endWorkDate: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '垛位名称', prop: 'stackName', align: 'left' },
  	{ label: '跑垛人', prop: 'createByName', align: 'left' },
	{ label: '跑垛时间', prop: 'createTime', align: 'left' },
	{
        label: '是否删除',
        prop: 'delFlag',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.delFlag == '1' ? '' : 'info',
					},
					{
						default: () => (row.delFlag === '1' ? '删除' : '在用'),
					}
				),
			]
		},

    },
])
// 搜索框数据
const selectData = reactive([
	{
		name: '垛位',
		type: 'remoteSelect',
		modelValue: 'value',
		span: 6,
		dataType: 'ALL_STORAGE_MASS',
		change: e => {
			console.log(e)
			if(e){
				queryParams.value.massId = e.massId //垛位
				queryParams.value.storehouseId = e.storehouseId //库场
				queryParams.value.regionId = e.regionId //区域
			} else {
				queryParams.value.massId = '' //垛位
				queryParams.value.storehouseId = '' //库场
				queryParams.value.regionId = '' //区域
			}
		},
	},
	{
		type: 'date',
		modelValue: 'startWorkDate',
		span: 6,
		name: '开始日期',
	},
	{
		type: 'date',
		modelValue: 'endWorkDate',
		span: 6,
		name: '结束日期',
	},
])
// 点击查询的事件
const getList = e => {
	queryParams.value = e

	getRunPileHistoryList(proxy.addDateRange(queryParams.value))
		.then(response => {
			tableData.value = response.data.pages
			total.value = response.data.totalNum
		})
		.catch(res => {})
}
/** 搜索按钮操作 */
function handleQuery() {
	queryParams.value.startPage = 1

	getList(queryParams.value)
}

getList(queryParams.value)
</script>
<style lang="less" scoped>
.my-label {
	background: var(--el-color-success-light-9);
}
.my-content {
	background: var(--el-color-danger-light-9);
}
</style>
