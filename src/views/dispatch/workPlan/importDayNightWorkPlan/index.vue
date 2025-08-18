<template>
  <el-drawer v-model="instructDrawerVisible" append-to-body title="作业指令" size="70%" :show-close="false">
    <template #header="{}">
      <div class="title">
        <div style="width: 200px"><span>作业指令</span></div>
        <div style="display: flex">
          <el-date-picker
            v-if=" trustType == 2"
            style="margin-right: 10px !important"
            v-model="formData.workDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="日期"
          ></el-date-picker>
          <Select
            v-if=" trustType == 2"
            v-model:value="formData.classCode"
            v-model:label="formData.className"
            placeholder="班次"
            :dataConfig="{
							url: '/api/internal/public/getDictListByType/WORK_SCHEDULE',
						}"
          />
          <el-button style="margin-left: 10px" type="primary" icon="Plus" @click="add">导入</el-button>
        </div>
      </div>
    </template>
    <BaseTable
      ref="baseTableRef"
      :showSearchHeader="true"
      :showNum = '3'
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :cellClickEvent="cellClickEvent"
      :tableHeight="'pageTableHeight'"
      :checkbox-config="checkboxConfig"
      :selectAllChangeEvent="checkboxChangeEvent"
      @checkbox-change="checkboxChangeEvent"
    />
  </el-drawer>

</template>

<script setup name="instructions">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import publicApi from '@/api/public/index.js'
import Select from '@/components/Select'
import api from '@/api/dispatch/workPlan/index.js'
import { getBeforeAfter } from '@/utils/index'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const tmpDialogInfo = ref("");
const dialogVisible = ref(false)
const baseTableRef = ref(null)
const instructDrawerVisible = ref(false)
const isHidden = ref(true)
const emit = defineEmits(['change'])
const checkDate = ref([]) // 选中数据
const importDate = ref({}) // 导入数据 2.集疏港3.倒运4.杂项/辅助返回一条数据（对象），1.装卸船返回一个对象（list（多条）、和日期班次字段）
// const trustNo=ref('')//作业指令
const props = defineProps({
  //指令类型1.装卸船2.集疏港3.倒运4.杂项/辅助
  trustType: {
    type: String,
  },
  value: {
    type: String,
  },
  permission: {
    type: String,
  },
})
const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emit('update:value', val)
  },
})
const formData = ref({
  workDate: '',
  classCode: '',
  className: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '', type: 'checkbox', width: 50 },
  { prop: 'trustNo', label: '通知单编号', width: 160, align: 'center' },
  { prop: 'voyage', label: '船名航次', width: 120, align: 'center',sortable:true },
  { label: '通知单类型', prop: 'type', align: 'left', width: 100 },
  { prop: 'planTon', label: '昼夜计划量', width: 140, align: 'left' },
  { label: '作业公司', prop: 'companyName', align: 'left', width: 180 },
  { prop: 'cargoOwnerName', label: '货主', width: 180, align: 'center' },
  { prop: 'cargoName', label: '货名', width: 120, align: 'center' },
  { prop: 'settlementBasisName', label: '结算依据', width: 120, align: 'center' },
  { prop: 'shipStatusName', label: '船舶状态', width: 120, align: 'center' },
  { prop: 'packingName', label: '件/散', width: 90, align: 'center' },
  { label: '作业要求', prop: 'remark', align: 'left', width: 100 },
])
const selectData = reactive([
  {
    name: '日期', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'workDate', //绑定字段
    span: 8, //占位多少，总共24
  },
  {
    name: '班次',
    type: 'select',
    modelValue: 'classCode',
    span: 8,
    dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
  },
  {
    name: '通知单编号',
    type: 'input', //远程下拉框
    modelValue: 'trustNo', //对应字段
    span: 8,
  },
  {
    name: '船名航次', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'shipvoyageItemId', // 绑定字段
    span: 3, // 占位，共24
    dataType: 'VOYAGE',
  },
  {
    name: '包装',
    type: 'select',
    modelValue: 'packingCode',
    span: 3,
    selectData: [{value: '1', label: '散'}, {value: '2', label: '件'}],
  },

])
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: false, // 	开启复选框范围选择功能
  visibleMethod: ({}) => {
    // 返回显示的单选框
    return true
  },
  checkMethod: ({ row }) => {
    // 返回可选的单选框
    return row.isDisable ? false : true
  },
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const cellClickEvent = (e)=>{
  tmpDialogInfo.value = ''
  if(e.columnIndex==10 &&  (e.row.remark != null)){
    nextTick(()=>{
      tmpDialogInfo.value = e.row.remark
      dialogVisible.value = true
    })
  }

}
// 导入事件
const add = () => {
  checkDate.value = baseTableRef.value.getSelectEvent()
  console.log('导入已选中指令', checkDate.value)
  // console.log('导入具体数据', importDate.value)
  if (props.trustType == '1' && (!formData.value.workDate || !formData.value.classCode)) {
    proxy.$message.warning('请填写日期和班次！')
    return
  }
  if (props.trustType != '1' && props.trustType != '2' && checkDate.value.length != 1) {
    //零工、集疏港、转运只能导入一条指令
    return proxy.$message.warning('请勾选一条数据！')
  }
  if (props.trustType == '1' && checkDate.value.length == 0) {
    //船舶计划可以导入多条指令
    return proxy.$message.warning('请至少勾选一条数据！')
  }
  if (props.trustType == '1') {
    // console.log('选中数据默认', formData.value)
    let voyages = checkDate.value.map(item => item.voyage) //船名航次
    let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

    let processNames = checkDate.value.map(item => item.processNames) //作业过程
    let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
    if (voyagesNum !== 1 || processNamesNum !== 1) {
      return proxy.$message.warning('只能导入相同船名航次及作业过程的数据！')
    }
    importDate.value.trustType = props.trustType
    importDate.value.trustIds = checkDate.value.map(item => item.id)
    importDate.value.workDate = formData.value.workDate
    importDate.value.classCode = formData.value.classCode
    importDate.value.className = formData.value.className
  } else if (props.trustType == '2') {
    let voyages = checkDate.value.map(item => item.voyage) //船名航次
    let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

    let processNames = checkDate.value.map(item => item.processNames) //作业过程
    let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
    if (voyagesNum !== 1 || processNamesNum !== 1) {
      return proxy.$message.warning('只能导入相同船名航次及作业过程的数据！')
    }
    importDate.value.trustType = props.trustType
    importDate.value.trustIds = checkDate.value.map(item => item.id)
    importDate.value.workDate = formData.value.workDate
    importDate.value.classCode = formData.value.classCode
    importDate.value.className = formData.value.className
  } else {
    importDate.value = checkDate.value[0]
    importDate.value.workDate = formData.value.workDate
    importDate.value.classCode = formData.value.classCode
    importDate.value.className = formData.value.className
  }
  value.value = importDate.value.trustNo
  instructDrawerVisible.value = false
  emit('change', importDate.value)
  // console.log('导入作业指令', importDate.value)
}
watch(
  () => instructDrawerVisible.value,
  newV => {
    if (newV) {
      init()
    }
  },
  { deep: true }
)
const init = async () => {

  await api.getNowDate().then(res => {
    nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {
        workDate: res.data.workDate,
        classCode: res.data.classCode,
        className: res.data.className,
      })
      queryParams.value.workDate = res.data.workDate
      queryParams.value.classCode = res.data.classCode
      queryParams.value.className = res.data.className
    })
  })

  if (props.trustType) {
    if (instructDrawerVisible.value) {
      /*if(props.trustType == '2'){
        proxy.$bus.emit('setInitSearchData', {isClear : '0' })
        queryParams.value.isClear = '0'
      }*/
      getList(queryParams.value)
    }
  } else {
    return proxy.$message.warning('参数trustType未传！')
  }
}

const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
  if (!queryParams.value.workDate || !queryParams.value.classCode) {
    proxy.$message.warning('请填写班次和时间！')
    return
  }
  queryParams.value.trustType = props.trustType
  api.reqGetJSGDayNightPlanList(queryParams.value).then(res => {
    tableData.value = res.data
  })
}

init()
defineExpose({
  importDate,
  value,
  instructDrawerVisible,
  formData,
  baseTableRef,
  isHidden
})
</script>

<style scoped>
.title {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
</style>
