<template>
  <div class="app-container">
    <SearchHeader ref="SearchHeaderRef" class="tab_header"  :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

    <el-tabs v-model="mainTab" type="card" class="demo-tabs" @tab-click="handleMainClick">
      <el-tab-pane label="客户单位" name="1">
        <BaseTable
          class="tab_table"
          :tableColumns="tableColumns"
          :tableData="tableDataCustomer"
          :border="true"
          :tableHeight="'tabTableHeight'"
        />
      </el-tab-pane>
      <el-tab-pane label="收入类别" name="2">
        <BaseTable
          class="tab_table"
          :tableColumns="tableColumnsYard"
          :tableData="tableDataRate"
          :border="true"
          :tableHeight="'tabTableHeight'"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="portIncomeYear">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/report/portIncomeYear/index.js'
import { ElTag } from 'element-plus'
import { reactive, ref, toRaw, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { formatMoney } from '@/utils/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

// 表格数据
const SearchHeaderRef = ref(null)

const selectData = reactive([
  {
  	type: 'year',
  	modelValue: 'workDate',
  	span: 8,
  	name: '选择年份',
  },
  {
    name: '公司名称',
    type: 'select',
    modelValue: 'companyId',
    modelLabel: 'companyName',
    span: 8,
    dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  },
  {
    name: '客户',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
  {
    name: '结算单类型',
    type: 'select', //远程下拉框
    modelValue: 'type', //对应字段
    span: 2,
    dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/HANDOVERLIST_TYPE',
			method: 'get',
		},
  },
])

//主列表查询条件
const queryParams = ref({
  planType: '1',
  customerId: '',
  workDate: '',
  type: '',
})
// 列表数据
const getList = async e => {
	queryParams.value = Object.assign(queryParams.value, e)
	if (!queryParams.value.workDate) {
		proxy.$modal.msgError('请选择年份')
		return
	}
  if(queryParams.value.planType == '1'){
    await api.getListCustomer(queryParams.value).then(res => {
      tableDataCustomer.value = res.data
    })
  }else{
    await api.getListRate(queryParams.value).then(res => {
      tableDataRate.value = res.data
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
    permission: 'report:portIncomeYear:export', // 权限
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
  if (!queryParams.value.workDate) {
    proxy.$modal.msgError('请选择年份')
    return
  }
  if(queryParams.value.planType == '1'){
    api.exportExcelCustomer(queryParams.value).then(res => {
      downLoadBlob(res, '港口年度收入汇总（按客户单位统计）')
    })
  }else{
    api.exportExcelType(queryParams.value).then(res => {
      downLoadBlob(res, '港口年度收入汇总（按收入类别统计）')
    })
  }

}
//工班计划tab页
const mainTab = ref('1') //默认第一个
const tableDataCustomer = ref([])
const tableDataRate = ref([])
//船舶表格数据
const tableColumns = ref([
  { prop: 'customerName', label: '客户/月份', width: 160, align: 'center' },
  { prop: 'amount1', label: '1', width: 100,isThousandth:true },
  { prop: 'amount2', label: '2', width: 100,isThousandth:true },
  { prop: 'amount3', label: '3', width: 100,isThousandth:true },
  { prop: 'amount4', label: '4', width: 100,isThousandth:true },
  { prop: 'amount5', label: '5', width: 100,isThousandth:true },
  { prop: 'amount6', label: '6', width: 100,isThousandth:true },
  { prop: 'amount7', label: '7', width: 100,isThousandth:true },
  { prop: 'amount8', label: '8', width: 100,isThousandth:true },
  { prop: 'amount9', label: '9', width: 100,isThousandth:true },
  { prop: 'amount10', label: '10', width: 100,isThousandth:true },
  { prop: 'amount11', label: '11', width: 100,isThousandth:true },
  { prop: 'amount12', label: '12', width: 100,isThousandth:true },
  { prop: 'amount', label: '合计', width: 100,isThousandth:true },
  { prop: 'rate', label: '占有率%', width: 100, },
])
const tableColumnsYard = ref([
  { prop: 'settlementDate', label: '月份', mainWidth: 100 },
  { prop: 'amount1', label: '装卸包干费收入', mainWidth: 120, isThousandth:true},
  { prop: 'amount2', label: '堆存费收入', mainWidth: 120, isThousandth:true},
  { prop: 'amount4', label: '杂项作业收入', mainWidth: 120, isThousandth:true},
  { prop: 'amount6', label: '船使费收入', mainWidth: 120, isThousandth:true},
  { prop: 'amount', label: '收入合计', mainWidth: 120, isThousandth:true},
])

// 主页面页签更变
const handleMainClick = tab => {
  if (tab.index === '0') {
    //更改对应的参数  进行查询
    queryParams.value.planType = '1'
  } else if (tab.index === '1') {
    queryParams.value.planType = '2'
  }
  getList(queryParams.value)
}
// 获取默认当前时间班次
const init = async () => {
  const now = new Date()
  const nowDate = now.getFullYear()
  queryParams.value.workDate = nowDate
  nextTick(() => {
    /*proxy.$bus.emit('setInitSearchData', {
      workDate: nowDate.toString(),
    })*/
    SearchHeaderRef.value.searchData.workDate=nowDate.toString()
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
