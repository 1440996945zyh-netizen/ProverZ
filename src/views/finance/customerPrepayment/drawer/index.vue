<template>
  <div>
    <BaseTable
      ref="baseTable"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'pageTableHeight'"
      :buttonList="buttonList"
      :cellClickEvent="cellClickEvent"
      :loading="loading"
      :total="total"
    />
  </div>
  <el-drawer v-model="drawerVisible" title="流水预缴" size="40%">
    <detail ref="detailRef" />
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from '@/views/finance/customerPrepayment/detail/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/finance/customerPrepayment/index.js'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import math from '../../../../utils/math'
import { getNowDate } from '@/utils'

const total = ref(0)
const drawerVisible = ref(false)
const loading = ref(false) // 是否加载中
const detailRef = ref() // 明细组件ref
const clickRow = ref({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '交易日', prop: 'transDate',width:100 },
  { label: '流水号', prop: 'transSequenceIdn',width:100  },
  { label: '交易时间', prop: 'transTime',width:100  },
  { label: '起息日', prop: 'valueDate',width:100 },
  { label: '借贷码', prop: 'loanCode',width:90 },
  { label: '交易金额', prop: 'transAmount',width:110 },
  { label: '币种', prop: 'currencyNbr',width:70 },
  { label: '交易类型', prop: 'textCode',width:90 },
  { label: '票据号', prop: 'billNumber',width:90 },
  { label: '你方摘要', prop: 'remarkTextClt',width:90 },
  { label: '冲帐标志', prop: 'reversalFlag',width:90 },
  { label: '余额', prop: 'acctOnlineBal',width:110 },
  { label: '扩展摘要', prop: 'extendedRemark',width:90 },
  { label: '收付方帐号', prop: 'ctpAcctNbr',width:180 },
  { label: '收付方名称', prop: 'ctpAcctName',width:220 },
  { label: '收付方开户行行名', prop: 'ctpBankName',width:220 },
  { label: '收付方开户行地址', prop: 'ctpBankAddress',width:110 },
  { label: '母子公司帐号', prop: 'fatOrSonAccount',width:90 },
  { label: '母子公司名称', prop: 'fatOrSonCompanyName',width:90 },
  { label: '母子公司开户行行名', prop: 'fatOrSonBankName',width:90 },
  { label: '母子公司开户行地址', prop: 'fatOrSonBankAddress',width:90 },
  { label: '信息标志', prop: 'infoFlag',width:90 },
  { label: '业务名称', prop: 'businessName',width:90 },
  { label: '网银业务摘要', prop: 'businessText',width:90 },
  { label: '网银流程实例号', prop: 'requestNbr',width:90 },
  { label: '网银业务参考号', prop: 'yurRef',width:90 },
  { label: '虚拟户编号', prop: 'virtualNbr',width:90 },
  { label: '商务支付订单号', prop: 'mchOrderNbr',width:90 },
  { label: '保留字', prop: 'reserve',width:90 },
])
const selectData = reactive([
  {
    name: '查询时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'beginDate', // 绑定字段
    span: 12, // 占位，共24
  },
])
const buttonList = reactive([
  {
    label: '流水预缴', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => addStatement, // 回调函数
    permission: 'finance:customerPrepayment:add', // 权限  addStatement
  },
])

const cellClickEvent = ({ row }) => {
  clickRow.value = row
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

const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data.records
}
// 单选
const checkboxChange = data => {
  checkboxList.value = data
}
const queryParams = ref({
  beginDate:getNowDate('YYYY-MM-DD'),
  flag:'',
  queryAcctNbr:'',
  y1List:[],
})
const checkData = ref([])
const getList = e => {
  queryParams.value =e
  api.getTradeList(queryParams.value).then(res => {
    tableData.value = res.Z2
    queryParams.value.y1List = res.Y1
    // if (res.Z1[0].ctnFlag === "Y") {
    //   proxy.$modal.msgSuccess('有未查询数据，请再次点击查询');
    //   queryParams.value.flag = "Y";
    //   queryParams.value.queryAcctNbr = res.Z1[0].queryAcctNbr;
    //   queryParams.value.y1List = ""
    //   let tempList = JSON.parse(JSON.stringify(res.Y1))
    //   console.log(tempList)
    //   queryParams.value.y1List = res.Y1
    //   console.log(queryParams.value.y1List, "queryParams.value.y1List");
    // }
  })
}

const setTableData = data => {
  tableData.value = data
}
const save = async () => {
  if (await detailRef.value.validate()) {
    const params = {
      ...detailRef.value.formData,
    }
    if(params.prepayModeCode == '20' && (params.busTrustId ==''||params.busTrustId ==null||params.busTrustId===undefined)){
      proxy.$message.error("请选择通知单！")
      return;
    }
    if(params.prepayModeCode == '20' && (params.prePayCode ==''||params.prePayCode ==null||params.prePayCode===undefined)){
      proxy.$message.error("请选择预缴编号！")
      return;
    }
    if(params.prepayModeCode == '10' && (params.paymentMethodCode ==''||params.paymentMethodCode ==null||params.paymentMethodCode===undefined)){
      proxy.$message.error("请选择付款方式！")
      return;
    }
    proxy.$modal.confirm('确定保存？').then(() => {
      api.insert(params).then(res => {
        proxy.$modal.msgSuccess('新增成功')
        drawerVisible.value = false
        getList(queryParams.value)
        editOrAdd.value = false;
      })

    })
  }
}
const getCheckboxList = () => {
  return checkboxList.value
}
const addStatement = () => {
  const addRow = clickRow.value
  if(addRow.transSequenceIdn == null){
    proxy.$message.error("请选择一条数据！")
    return
  }
  console.log(addRow)
  drawerVisible.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.editOrAdd = false
    detailRef.value.formData.id = ''  // 新建清空id
    detailRef.value.customerStatement = "流水预缴客户："+ addRow.ctpAcctName // 给客户赋值
    detailRef.value.formData.transSequenceIdn = addRow.transSequenceIdn  // 新建清空id
    detailRef.value.formData.prepaymentAmount = addRow.transAmount  // 新建清空id
    proxy.$bus.emit('resetFileList')
  })
}

const init = () => {
  nextTick(()=>{
    proxy.$bus.emit('setInitSearchData', {beginDate : getNowDate('YYYY-MM-DD')})
  })
}
init()

defineExpose({
  setTableData,
  getCheckboxList,
})

</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
  width: 100%;
  padding: 0 10px 0 0;
  justify-content: space-between;
  align-items: center;
}
</style>
