<!-- 导入结算表格 -->
<template>
	<BaseTable
    ref = 'baseTableRef'
    :showSearchHeader="true"
    :selectData="selectData"
		:searchClick="getList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:tableHeight="'drawerHeaderPageTableHeight'"
		:syncResize="true"
		:total="total"
		:checkbox-config="checkboxConfig"
		@checkbox-change="checkboxChange"
		:selectAllChangeEvent="selectAllChangeEvent"
	/>
</template>

<script setup name="tickTable">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/finance/invoice/index'
import { ElTag } from 'element-plus'
//查询
const total = ref()
const baseTableRef = ref()
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
  companyId: null,
  customerId: null,
  invoiceTypeCode: null,
})

const searchData =  ref({})

//结算单详情搜索框
const selectData = reactive([
  {
    name: '付款人',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
  {
    name: '结算号',
    type: 'input', //远程下拉框
    modelValue: 'statementNo', //对应字段
    span: 8,
  },
  {
    name: 'SCN',
    type: 'input', //远程下拉框
    modelValue: 'scn', //对应字段
    span: 8,
  }
])
//结算单详情搜索事件
const getList = e => {
  const params = {
		...queryParams.value,
		...e,
	}
	api.getStatementList(params).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const tableData = ref([])
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 50,fixed:'left' },
	{prop: 'statementNo',label: '结算单编号',width: 150,},
	{prop: 'scn',label: 'SCN',width: 150,},
	{prop: 'shipName',label: '船名',width: 150,},
	{prop: 'voyage',label: '航次',width: 150,},
	{prop: 'customerName',label: '付款人',width: 150,},
	{prop: 'impExp',label: '进出口',width: 150,},
	{prop: 'type',label: '费用类型',width: 150,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.type == '10' ? 'info' : 'info',
          },
          {
            default: () => (row.type == '10' ? '货方结算单' : row.type == '20' ? '陆集陆疏' : row.type == '30' ? '船方计费' : row.type == '40' ? '杂项计费' : row.type == '50' ? '堆存费' : ''),
          }
        ),
      ]
    },
	},
	{prop: 'rateItemName',label: '费目名称',width: 150,},
	{prop: 'numberCount', label: '数量1',	width: 150,align:'right'	},
	{prop: 'numberCount2', label: '数量2',	width: 150,	},
	{		prop: 'pieceAmount',		label: '单价',		width: 150,	},
	{		prop: 'amount',		label: '金额',		width: 150,align:'right',isThousandth:'true'	},
	{		prop: 'tax',		label: '税率',		width: 150,	},
	{		prop: 'taxAmount',		label: '税额',		width: 150,	},
  {prop: 'taxInvoiceName', label: '发票类型',	width: 150,	},
  {prop: 'receiptRemark', label: '备注',	width: 150,	},
])

const resetForm = () =>{
  baseTableRef.value.resetSearch(searchData.value)
}

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 复选框选中
const checkData = ref([])
const checkboxChange = res => {
	checkData.value = res
}
const selectAllChangeEvent = res => {
	checkData.value = res.records
}

defineExpose({
	getList,
	checkData,
	queryParams,
  resetForm
})
</script>
