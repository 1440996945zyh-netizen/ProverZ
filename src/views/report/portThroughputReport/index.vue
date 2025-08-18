<template>
  <div class="app-container">
    <BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableData="tableData"
			:autoResize="true"
			:total="total"
      :html-content="collectHtml"
    />
  </div>
</template>
<script setup name="portThroughputReport">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted,h,getCurrentInstance, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/report/portThroughputReport/index'
import publicapi from '@/api/public/index'
import { ElButton, ElTag,ElMessage, ElMessageBox,ElLink } from 'element-plus'
import math from '@/utils/math.js'
const { proxy } = getCurrentInstance()
const total = ref(0)
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const baseTable = ref() // table的ref
// 搜索框
const selectData = reactive([
  {
		name: '船名',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span: 8,
	},
  {
		name: '航次',
		type: 'input', //远程下拉框
		modelValue: 'voyage', //对应字段
		span: 8,
	},
  {
    name: '收货人',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
  {
  	type: 'daterange',
  	modelValue: 'dateTime',
  	span: 6,
  	name: '选择日期',
    shortcuts: []
  },
  {
    name: '靠泊泊位',
    type: 'input', //远程下拉框
    modelValue: 'berthName', //对应字段
    span: 2,
  },
  {
    name: '货名',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'cargoCode', //对应字段
    span: 2,
    dataType: 'CARGO_INFO'
  },
  {
    name: '贸别',
    type: 'select',
    modelValue: 'tradeType', //对应字段
    span: 2,
    dataConfig: {params: {type: 'DICT',dictType: 'TRADE_TYPE'}}
  },
  {
    name: '装卸',
    type: 'select',
    modelValue: 'loadUnload', //对应字段
    span: 2,
    selectData: [
			{ label: '装', value: '装' },
			{ label: '卸', value: '卸' },
			{ label: '装卸', value: '装卸' },
		],
  },
])
// 按钮组
const buttonList = reactive([
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'report:portThroughputReport:export', // 权限
  },
])
// 列表
const tableData = ref([])
const tableColumns = reactive([
  {
    prop: 'seqNo',
    label: '序号',
    minWidth: 100
  },
  {
    prop: 'berthName',
    label: '泊位',
    minWidth: 120
  },
  {
    prop: 'shipName',
    label: '船名',
    minWidth: 100
  },
  {
    prop: 'voyage',
    label: '航次',
    minWidth: 100
  },
  {
    prop: 'cargoInfoNo',
    label: '票货号',
    minWidth: 110
  },
  {
    prop: 'cargoName',
    label: '货物名称',
    minWidth: 110
  },
  {
    prop: 'netWeight',
    label: '船舶净吨',
    minWidth: 100
  },
  {
    prop: 'ton',
    label: '来货量',
    minWidth: 100
  },
  {
    prop: 'workTon',
    label: '作业量',
    minWidth: 120
  },
  {
    prop: 'tradeType',
    label: '贸别',
    minWidth: 100
  },
  {
    prop: 'loadUnload',
    label: '装卸',
    minWidth: 100
  },
  {
    prop: 'cargoOwnerName',
    label: '收货人',
    minWidth: 200
  },
  {
    prop: 'berthTime',
    label: '靠泊时间',
    minWidth: 120
  },
  {
    prop: 'startWorkTime',
    label: '开工时间',
    minWidth: 140
  },
  {
    prop: 'endWorkTime',
    label: '完工时间',
    minWidth: 140
  },
  {
    prop: 'leaveBerthTime',
    label: '离泊时间',
    minWidth: 140
  },
  {
    prop: 'workTime',
    label: '作业时间',
    minWidth: 100
  },
  {
    prop: 'berthLeaveTime',
    label: '靠离时间',
    minWidth: 100
  },
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  startTime: '',
  endTime: '',
  shipName: '',
  voyage: '',
  cargoCode: '',
  berthName: '',
  customerId: '',
  tugServiceType: '',
  tradeType: '',
  loadUnload: '',
})

const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '港口吞吐量汇总表')
  })
}
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
  if (queryParams.value.dateTime){
    queryParams.value.startTime = queryParams.value.dateTime[0]
    queryParams.value.endTime = queryParams.value.dateTime[1]
  } else {
    queryParams.value.startTime = ''
    queryParams.value.endTime = ''
  }
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
    tableData.value.forEach((v,index) => {
      v.seqNo = index+1
    })
    if(res.data.extraData){
      var sumObj=JSON.parse(res.data.extraData)
      collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：来货量：${sumObj.ton} 吨; 作业量：${sumObj.workTon} 吨</p>`
    }else{
      collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：来货量：0 吨 作业量：0 吨</p>`
    }
	})
}
const init = () => {
  const now = new Date()
  const nowMonth = (now.getMonth()+1) < 10 ? ('0'+(now.getMonth()+1)) : now.getMonth()+1
  const nowDay = (now.getDate()) < 10 ? ('0'+(now.getDate())) : now.getDate()
  const nowDate = now.getFullYear() + '-' + nowMonth + '-' + nowDay
  const nowDate1 = now.getFullYear() + '-' + nowMonth + '-' + '01'
  queryParams.value.dateTime = [nowDate1,nowDate]
  nextTick(() => {
    /*proxy.$bus.emit('setInitSearchData', {
      dateTime: [nowDate1,nowDate],
    })*/
    baseTable.value.SearchHeaderRef.searchData.dateTime=[nowDate1,nowDate]
  })
  getList(queryParams.value)
}
init()
</script>
<style  lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.app-container {
	height: auto !important;
}
</style>
