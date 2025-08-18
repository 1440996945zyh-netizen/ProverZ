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
		<!-- 新增，修改抽屉组件 -->
	</div>
</template>

<script setup name="tTruckLog">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/tTruckLog/index'
import tableParamsStore from '@/store/modules/tableParams'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import {nextTick, ref} from 'vue'
import publicApi from '@/api/public/index'
import {parseDate} from '@/utils'

const { proxy } = getCurrentInstance()
const total = ref(0)
const clickRow = ref({}) //点击当前行

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  pointTimeStart:'',
  pointTimeEnd:''
})

/** 更多操作 */
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '车号', prop: 'truckNo',width: 100, align: 'center' },
	{ label: '节点', prop: 'pointName',width: 170, align: 'center' },
	{ label: '节点时间', prop: 'pointTime',width: 190, align: 'center' },
	{ label: '操作人', prop: 'operName',width: 110, align: 'center' },
	//{ label: '位置', prop: 'position',width: 100, align: 'center' },
	{ label: '计划号', prop: 'planNo',width: 150, align: 'center' },
	{ label: '身份证号', prop: 'idNumber',width: 200, align: 'center' },
	{ label: '标记位', prop: 'flag',width: 160, align: 'center' },
  // { label: '状态', prop: 'status',width: 90,align: 'center' },
  // { label: '过磅类型', prop: 'weightType',width: 160, align: 'center' },
	// { label: '计划类型', prop: 'planType',width: 160, align: 'center' },
	// { label: '过磅吨数', prop: 'ton',width: 160, align: 'center' },
	// { label: '备注', prop: 'remark',width: 160, align: 'center' },
])
// 搜索框数据
const selectData = reactive([
  {
    type: 'date', // 搜索框类型
    modelValue: 'pointTimeStart', // 绑定字段
    span: 8, // 占位，共24
    name: '节点时间起',
  },
  {
    type: 'date', // 搜索框类型
    modelValue: 'pointTimeEnd', // 绑定字段
    span: 8, // 占位，共24
    name: '节点时间止',
  },
  {
    name: '车号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'truckNo', // 绑定字段
    span: 8, // 占位，共24
  },
  // { name: '计划类型', // 搜索框name
  //   type: 'select', // 搜索框类型
  //   modelValue: 'planType', // 绑定字段
  //   span: 3, // 占位，共24
  //   selectData: [
  //     { label: '集疏港', value: '1' },
  //     { label: '内倒', value: '0' },
  //     { label: '杂货', value: '2' },
  //   ],
  // },
  // { name: '过磅类型', // 搜索框name
  //   type: 'select', // 搜索框类型
  //   modelValue: 'weightType', // 绑定字段
  //   span: 3, // 占位，共24
  //   selectData: [
  //     { label: '进港', value: '1' },
  //     { label: '出港', value: '0' },
  //   ],
  // },
])
/** 搜索按钮操作 */
function handleQuery() {
	getList(queryParams.value)
}

/**点击查询的事件 */
const getList = e => {
	//queryParams.value = e
  Object.assign(queryParams.value,e)
	api.listLog(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 获取默认时间
const getCurrentInfo = async () => {
  nextTick(() => {
    proxy.$bus.emit('setInitSearchData', {
      pointTimeStart:parseDate(new Date(), '{yyyy}-{mm}-{dd}'),
      pointTimeEnd: parseDate(new Date(), '{yyyy}-{mm}-{dd}')
    })
  })
  queryParams.value.pointTimeStart = parseDate(new Date(), '{yyyy}-{mm}-{dd}');
  queryParams.value.pointTimeEnd = parseDate(new Date(), '{yyyy}-{mm}-{dd}');
  getList(queryParams.value)
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getCurrentInfo()
//getList(queryParams.value)
</script>
<style lang="less" scoped>
.head-container {
	padding: 5px;
}
</style>
