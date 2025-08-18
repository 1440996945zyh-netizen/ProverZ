<template>
  <div class="app-container">
    <SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

    <el-tabs v-model="mainTab" type="card" class="demo-tabs" @tab-click="handleMainClick">
      <el-tab-pane label="船使费汇总" name="1">
        <BaseTable
          class="tab_table"
          :tableColumns="tableColumns"
          :tableData="tableData"
          :border="true"
          :tableHeight="'tabTableHeight'"
        />
      </el-tab-pane>
      <el-tab-pane label="港口货物收入" name="2">
        <BaseTable
          class="tab_table"
          :tableColumns="tableColumnsYard"
          :tableData="tableDataRate"
          :border="true"
          :tableHeight="'tabTableHeight'"
        />
      </el-tab-pane>
      <el-tab-pane label="港口客户收入" name="3">
        <BaseTable
          class="tab_table"
          :tableColumns="tableColumnsCustomer"
          :tableData="tableDataCustomer"
          :border="true"
          :tableHeight="'tabTableHeight'"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="portIncomeDetail">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/report/portIncomeDetail/index.js'
import { ElTag } from 'element-plus'
import { reactive, ref, toRaw, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { formatMoney } from '@/utils/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

// 表格数据
const SearchHeaderRef = ref(null)

const selectData = reactive([
  {
		name: '客户', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'customerId', // 绑定字段
		span: 8, // 占位，共24
		dataType: 'CUSTOMER_ALL',
	},
  {
		name: '货名', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoCode', // 绑定字段
		span: 8, // 占位，共24
		dataType: 'CARGO_INFO',
	},
  {
		name: '船名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'shipName', // 绑定字段
		span: 8, // 占位，共24
	},
  {
		name: '票货号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoInfoNo', // 绑定字段
		span: 2, // 占位，共24
	},
  {
  	type: 'daterange',
  	modelValue: 'dateTime',
  	span: 6,
  	name: '选择日期',
    shortcuts: []
  },
])

//主列表查询条件
const queryParams = ref({
  planType: '1',
  customerId: '',
  dateTime: [],
  shipName: '',
  cargoCode: '',
})
// 列表数据
const getList = async e => {
	queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value.startTime = queryParams.value.dateTime[0]
  queryParams.value.endTime = queryParams.value.dateTime[1]

  if(queryParams.value.planType == '1'){
    await api.getListShip(queryParams.value).then(res => {
      tableData.value = res.data
      tableData.value.forEach((v,index) => {
        if (v.seqNo != '合计')
          v.seqNo = index+1
      })
    })
  } else if(queryParams.value.planType == '2'){
    await api.getListCargo(queryParams.value).then(res => {
      tableDataRate.value = res.data
      tableDataRate.value.forEach((v,index) => {
        if (v.seqNo != '合计')
          v.seqNo = index+1
      })
    })
  } else {
    await api.getListCustomer(queryParams.value).then(res => {
      tableDataCustomer.value = res.data
      tableDataCustomer.value.forEach((v,index) => {
        if (v.seqNo != '合计')
          v.seqNo = index+1
      })
    })
  }

}
// header按钮参数
const buttonList = reactive([
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'report:portIncomeDetail:export', // 权限
  },
])

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
const exportExcel =()=>{
  queryParams.value.startTime = queryParams.value.dateTime[0]
  queryParams.value.endTime = queryParams.value.dateTime[1]
  if(queryParams.value.planType == '1') {
    api.exportExcelShip(queryParams.value).then(res => {
      downLoadBlob(res, '港口月度船使费汇总表')
    })
  } else if(queryParams.value.planType == '2'){
    api.exportExcelCargo(queryParams.value).then(res => {
      downLoadBlob(res, '港口月度收入明细表')
    })
  } else {
    api.exportExcelCustomer(queryParams.value).then(res => {
      downLoadBlob(res, '港口月度收入汇总表')
    })
  }

}
//工班计划tab页
const mainTab = ref('1') //默认第一个
const tableDataCustomer = ref([])
const tableDataRate = ref([])
const tableData = ref([])
//船舶表格数据
const tableColumns = ref([
  { prop: 'seqNo', label: '序号', width: 100, align: 'center' },
  { prop: 'scn', label: '到验号', width: 160, align: 'center' },
  { prop: 'shipName', label: '船名', width: 100, },
  { prop: 'tradeType', label: '贸易类型', width: 100, },
  { prop: 'berthTime', label: '靠泊日期', width: 140, },
  { prop: 'cargoName', label: '货物名称', width: 100, },
  { prop: 'ton', label: '来货数量', width: 100, },
  { prop: 'amount1', label: '停泊费', width: 100,isThousandth:true },
  { prop: 'amount2', label: '供水费', width: 100,isThousandth:true },
  { prop: 'amount3', label: '供电费', width: 100,isThousandth:true },
  { prop: 'amount6', label: '其他', width: 100,isThousandth:true },
  { prop: 'amount', label: '合计', width: 100,isThousandth:true },
])
const tableColumnsYard = ref([
  { prop: 'seqNo', label: '序号', minWidth: 80 },
  { prop: 'cargoInfoNo', label: '票货号', minWidth: 130 },
  { prop: 'shipName', label: '船名', minWidth: 100 },
  { prop: 'loadDate', label: '装卸日期', minWidth: 140 },
  { prop: 'cargoName', label: '货物名称', minWidth: 130 },
  { prop: 'customerName', label: '结算单位', minWidth: 160 },
  { prop: 'amount1', label: '货物装卸包干费', minWidth: 120, isThousandth:true},
  { prop: 'amount2', label: '货物堆存费', minWidth: 120, isThousandth:true},
  { prop: 'amount4', label: '货物代理费', minWidth: 120, isThousandth:true},
  { prop: 'amount5', label: '货物控货费', minWidth: 120, isThousandth:true},
  { prop: 'amount6', label: '其他', minWidth: 120, isThousandth:true},
  { prop: 'amount', label: '合计', minWidth: 120, isThousandth:true},
])
const tableColumnsCustomer = ref([
  { prop: 'seqNo', label: '序号', minWidth: 80 },
  { prop: 'customerName', label: '结算单位', minWidth: 160 },
  { prop: 'cargoName', label: '货物类型', minWidth: 130 },
  { prop: 'amount1', label: '货物装卸包干费', minWidth: 140, isThousandth:true},
  { prop: 'amount2', label: '货物堆存费', minWidth: 120, isThousandth:true},
  { prop: 'amount5', label: '船使费', minWidth: 120, isThousandth:true},
  { prop: 'amount7', label: '杂项费', minWidth: 120, isThousandth:true},
  { prop: 'amount', label: '合计', minWidth: 120, isThousandth:true},
])
// 主页面页签更变
const handleMainClick = tab => {
  if (tab.index === '0') {
    //更改对应的参数  进行查询
    queryParams.value.planType = '1'
  } else if (tab.index === '1') {
    queryParams.value.planType = '2'
  } else if (tab.index === '2') {
    queryParams.value.planType = '3'
  }
  getList(queryParams.value)
}
// 获取默认当前时间班次
const init = async () => {
  const now = new Date()
  const nowMonth = (now.getMonth()+1) < 10 ? ('0'+(now.getMonth()+1)) : now.getMonth()+1
  const nowDay = (now.getDate()) < 10 ? ('0'+(now.getDate())) : now.getDate()
  const nowDate = now.getFullYear() + '-' + nowMonth + '-' + nowDay
  const nowDate1 = now.getFullYear() + '-' + nowMonth + '-' + '01'
  queryParams.value.dateTime = [nowDate1,nowDate]
  nextTick(() => {
    /*proxy.$bus.emit('setInitSearchData', {
      dateTime: [nowDate1,nowDate]
    })*/
    SearchHeaderRef.value.searchData.dateTime=[nowDate1,nowDate]
  })
  getList(queryParams.value)
}

init()

</script>

<style lang="scss" scoped>
.done {
  margin-top: 10px;
}
</style>
