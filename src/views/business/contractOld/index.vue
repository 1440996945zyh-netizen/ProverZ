<template>
	<div class="app-container">
		<BaseTable
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
      :checkbox-config="checkboxConfig"
      @checkbox-change="checkboxChangeEvent"
      :selectAllChangeEvent="selectAllChangeEvent"
			:total="total"
		/>
	</div>
</template>

<script setup name="contractOld">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import api from '@/api/business/contractOld/index'
import {ElTag} from "element-plus";
const { proxy } = getCurrentInstance()
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const trustOrderRef = ref(null)
//顶部 搜索表单
const selectData = reactive([
	{
		name: '合同编号',
		type: 'input', //远程下拉框
		modelValue: 'contractCode', //对应字段
		span: 8,
	},
  {
    name: '客户代码',
    type: 'input', //远程下拉框
    modelValue: 'customerCode', //对应字段
    span: 8,
  },
  {
    name: '客户名称',
    type: 'input', //远程下拉框
    modelValue: 'customerName', //对应字段
    span: 8,
  }
])
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const checkboxList = ref([])
// 全选事件
const selectAllChangeEvent = ({ checked }) => {
  checkboxList.value = checked ? tableData.value : []
}
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data
}
//数据总条数
const total = ref(0)
//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '同步数据', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => syncData, // 回调函数
		permission: 'produce:contractOld:syncData', // 权限
	},
  {
    label: '同步磅单', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
    click: () => syncWeightData, // 回调函数
    permission: 'produce:contractOld:syncWeightData', // 权限
  },
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '', type: 'checkbox', width: 80 },
	{ label: '合同编号', prop: 'contractCode' },
	{ label: 'SCN', prop: 'scn',width:100 },
	{ label: '客户代码', prop: 'customerCode',width:100 },
  { label: '客户名称', prop: 'customerName' },
  { label: '港口名称', prop: 'portName'},
  { label: '进出口', prop: 'impExp',width:90},
	{ label: '签订日期', prop: 'registerDate',width:130 },
	{ label: '船舶代码', prop: 'shipCode',width:100 },
	{ label: '船舶名称', prop: 'shipName' },
  {
    label: '同步状态',
    prop: 'syncFlag',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type:
              row.statusLabel == 'Y' ? 'success' : '',
          },
          {
            default: () =>
              row.statusLabel == 'Y' ? '已同步' : '未同步',
          }
        ),
      ]
    },
  }
])
//查询
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data
	})
}
//同步数据
const syncData = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择需要同步的数据')
    return
  }
  let ids = checkboxList.value.map(item => item.contractId)
  await api.syncData(ids).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    getList(queryParams.value)
  })
}
//同步磅单
const syncWeightData = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择需要同步的数据')
    return
  }
  if (checkboxList.value.length > 1) {
    proxy.$modal.msgError('只能选择一条数据')
    return
  }
  let ids = checkboxList.value.map(item => item.contractId)
  await api.syncWeightData(ids).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    getList(queryParams.value)
  })
}
</script>

<style scoped></style>
