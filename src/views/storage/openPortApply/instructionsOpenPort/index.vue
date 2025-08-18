<template>
  <el-drawer v-model="instructDrawerVisible" append-to-body title="作业指令" size="70%" :show-close="false">
    <template #header="{}">
      <div class="title">
        <div style="width: 200px"><span>作业指令</span></div>
        <div style="display: flex">
          <el-date-picker
            v-if="trustType == 1"
            style="margin-right: 10px !important"
            v-model="formData.workDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="日期"
          ></el-date-picker>
          <Select
            v-if="trustType == 1"
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

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const baseTableRef = ref(null)
const instructDrawerVisible = ref(false)
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
  { label: '', type: 'checkbox', width: 50 ,fixed: 'left',},
  { label: '通知单编号', prop: 'trustNo', align: 'left', width: 130 },
   // { label: '客户名称', prop: 'customerName', align: 'left', min_width: 100 },
  { label: '船名航次', prop: 'shipNameVoyages', align: 'left', width: 110 },
  { label: '已派场区', prop: 'massNamesTarget',align: 'left', width: 140 },
  // { label: '作业过程', prop: 'processName', align: 'left', min_width: 100 },
  { label: '通知单类型', prop: 'type', align: 'left', width: 90 },
  { label: '货主', prop: 'cargoOwnerName',width: 160 },
  // { label: '货代', prop: 'cargoAgentName' },
  { label: '货名', prop: 'cargoName',width: 140 },
  { label: '结算依据', prop: 'settlementBasisName',width: 140 },
  { label: '计划件数', prop: 'planQuantity', align: 'right', width: 120 },
  { label: '计划重量', prop: 'planTon', align: 'right', width: 120 },
  { label: '计划车数', prop: 'cars', align: 'right', width: 120 },
  { label: '作业要求', prop: 'remark', align: 'left', width: 140 },
  { label: '作业公司', prop: 'companyName', align: 'left', width: 160 },
])
const selectData = reactive([
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
    span: 8, // 占位，共24
    dataType: 'VOYAGE',
  },
  {
    name: '客户名称', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'customerName', // 绑定字段
    span: 8, // 占位，共24
  },
])
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: false, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
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
// 导入事件
const add = () => {

  checkDate.value = baseTableRef.value.getSelectEvent()
  // console.log('导入已选中指令', checkDate.value)
  // console.log('导入具体数据', importDate.value)
  if (props.trustType == '2' && (!formData.value.workDate || !formData.value.classCode)) {
    proxy.$message.warning('请填写日期和班次！')
    return
  }
  if (props.trustType == '2' && checkDate.value.length == 0) {
    //船舶计划可以导入多条指令
    return proxy.$message.warning('请至少勾选一条数据！')
  }
  if (props.trustType == '2') {
    // console.log('选中数据默认', formData.value)
    let voyages = checkDate.value.map(item => item.voyage) //船名航次
    let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

    let processNames = checkDate.value.map(item => item.processNames) //作业过程
    let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
    if (voyagesNum !== 1 || processNamesNum !== 1) {
      return proxy.$message.warning('只能导入相同船名航次及作业过程的数据！')
    }
    importDate.value.trustIds = checkDate.value.map(item => item.id)
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
const init = () => {
  // nextTick(() => {
  // console.log('表格ref', baseTableRef.value)
  // 清空查询条件
  // baseTableRef.value.resetSearch()
  // }, 1000)
  if (props.trustType) {
    if (instructDrawerVisible.value) {
      getList(queryParams.value)
    }
  } else {
    return proxy.$message.warning('参数trustType未传！')
  }
}
// 选中回调 只可选中一条
const checkboxChangeEvent = data => {
  // 不需要 开启多选时备注下面代码就可以
  // if (data.length >= 1) {
  // 	tableData.value.forEach(item => {
  // 		if (data[0].id == item.id) {
  // 			item.isDisable = false
  // 		} else {
  // 			item.isDisable = true
  // 		}
  // 	})
  // } else {
  // 	// 取消选中 解除所有选中框禁用
  // 	tableData.value.forEach(item => {
  // 		item.isDisable = false
  // 	})
  // }
  // 结束
}
const getList = e => {
  if (props.trustType == '2' && (!formData.value.workDate || !formData.value.classCode)) {
    proxy.$message.warning('请填写完整查询条件！')
    return
  }
  queryParams.value = e
  queryParams.value.trustType = props.trustType
  publicApi.getPopupTrust(queryParams.value).then(res => {
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
})
</script>

<style scoped>
.title {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
</style>
