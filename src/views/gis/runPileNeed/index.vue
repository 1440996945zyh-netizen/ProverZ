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
		/>
	</div>
</template>

<script setup name="operLog">
import { getRunPileNeedList } from '@/api/gis/runPileNeed/index'
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, toRefs } from 'vue'
import { ElButton,ElTag } from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'
const { proxy } = getCurrentInstance()
let storeHight = computed(() => tableParamsStore().pageTableHeight)
const queryParams = ref({
	storehouseId: '', //库场id
	regionId: '', //区域id
	massId: '', //垛位id
	startWorkDate: '',
	endWorkDate: '',
	runPileState: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '库场', prop: 'storehouseName', align: 'left' },
  	{ label: '区域', prop: 'regionName', align: 'left' },
	{ label: '垛位', prop: 'massName', align: 'left' },
	{ label: '上次跑垛时间', prop: 'positionTime', align: 'left' },
	{ label: '港存更新时间', prop: 'lastRefreshTime', align: 'left' },
	{ label: '变化量(吨)', prop: 'changeTon', align: 'left' },
	{
        label: '状态',
        prop: 'runPileState',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.runPileState == '10' ? 'success' : row.runPileState == '20' ? 'danger' : 'warning',
					},
					{
						default: () => (row.runPileState == '10' ? '正常' : row.runPileState == '20' ? '需跑垛' : '未跑垛'),
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
		modelValue: 'massId',
		span: 6,
		dataType: 'ALL_STORAGE_MASS',
		change: e => {
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
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'runPileState', // 绑定字段
		span: 6, // 占位，共24
		selectData: [
			{ label: '正常', value: '10' },
			{ label: '未跑垛', value: '30' },
			{ label: '需跑垛', value: '20' },
		],
	},
])
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	getRunPileNeedList(proxy.addDateRange(queryParams.value))
		.then(response => {
			tableData.value = response.data
		})
		.catch(res => {})
}
/** 搜索按钮操作 */
function handleQuery() {
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
