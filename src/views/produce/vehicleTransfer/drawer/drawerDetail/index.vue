<template>
  <div>
    <el-row>
      <el-col :span="24">
        <SearchHeader
          ref="SearchHeaderRef"
          :showReset="false"
          :selectData="selectData"
          @searchClick="selectMachineList"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <BaseTable
          ref="baseTableRef"
          :tableColumns="tableColumns"
          :tableData="machineTableData"
          :checkbox-config="checkboxConfig"
          @checkbox-change="checkboxChange"
          :selectAllChangeEvent="selectAllChangeEvent"
          :tableHeight="'drawerHeaderPageTableHeight'"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="machineDetail">
import { ref, reactive, getCurrentInstance,h} from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/vehicleTransfer/index.js'
import publicApi from '@/api/public/index'
import config from '@/config/index.js'
import SearchHeader from '@/components/SearchHeader/index.vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const editTableRef = ref()
const baseTableRef = ref()
const SearchHeaderRef = ref()
//表格数据
const machineTableData = ref([])
const initTableData = ref([])

//机械列
const tableColumns = ref([
  { label: '', type: 'checkbox', width: 50 },
  {
    prop: 'equipmentTypeName',
    label: '机械类型',
  },
  {
    prop: 'equipmentNo',
    label: '机械编号',
  },
  {
    prop: 'deptName',
    label: '部门名称',
  },
])
const dispatchedQueryParams = ref({
  trustId: '',
  trustCargoId: '',
})
//表单校验
const editRules = reactive({
  workPositionCode: proxy.getRules({
    required: true,
  }),
  subProcessCode: proxy.getRules({
    required: true,
  }),
})

//机械搜索框
const selectData = reactive([
  {
    prop: 'equipmentTypeCode',
    name: '机械类型', // 搜索框code
    type: 'select', // 搜索框类型
    modelValue: 'equipmentTypeCode', // 绑定字段
    span: 8, // 占位，共24
    dataConfig: { params: { type: 'MAC_TYPE' } },
  },
  {
    prop: 'deptId',
    name: '所属部门', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'deptId', // 绑定字段
    span: 8, // 占位，共24
    dataConfig: { params: { type: 'DEPT_MACHINE' } },
  },
  {
    name: '机械代码', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'macCode', // 绑定字段
    span: 8, // 占位，共24
  },
])

// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
}

// 复选框选中
const checkData = ref([])
const checkboxChange = res => {
  checkData.value = res
}
const selectAllChangeEvent = res => {
  checkData.value = res.records
}
//表单校验
const validate = async () => {
  let flag = await editTableRef.value.validAllEvent()
  if (flag) {
    return flag
  } else {
    proxy.$modal.warning('请完善表单信息！')
  }
  return flag
}
const checkedList = ref([])
//添加到右边
const joinRight = () => {
  checkedList.value = baseTableRef.value.getSelectEvent()
  if (checkedList.value == null || checkedList.value.length == 0) {
    proxy.$modal.msgWarning('请左边选择一条数据!')
    return
  }

  checkedList.value.forEach(item => {
    initTableData.value.push({
      equipmentTypeName: item.equipmentTypeName, //设备类型名称
      equipmentTypeId: item.equipmentTypeId, //设备类型id
      equipmentNo: item.equipmentNo, //设备编号
      equipmentId: item.equipmentId, //设备ID
      // deptId: item.deptId, //部门id
      // deptName: item.deptName, //部门名称
    })
  })
  console.log('已选中数据', initTableData.value)
  // 从左侧列表中删除已选中的数据
  machineTableData.value = machineTableData.value.filter(item => !checkedList.value.some(i => i.equipmentId === item.equipmentId))
  checkedList.value = []
}
//添加到左边
const joinLeft = () => {
  // const
  checkedList.value = editTableRef.value.getSelectEvent()
  if (checkedList.value == null || checkedList.value.length == 0) {
    proxy.$modal.msgWarning('请从右边选择一条数据!')
    return
  }
  checkedList.value.forEach((tempItem, tempIndex) => {
    // if (checkedList.value.length == initTableData.value.length) {
    // 	initTableData.value = []
    // 	return
    // }
    initTableData.value.forEach((dispatchedItem, dispatchedIndex) => {
      if (dispatchedItem.index == tempItem.index) {
        initTableData.value.splice(dispatchedIndex, 1)
      }
    })
    // 将右侧列表中选中的数据添加至左侧列表数据中
    if (machineTableData.value.map(item => item.equipmentId).indexOf(tempItem.equipmentId) == -1) {
      machineTableData.value.push({
        equipmentTypeName: tempItem.equipmentTypeName, //设备类型名称
        equipmentTypeId: tempItem.equipmentTypeId, //设备类型id
        equipmentNo: tempItem.equipmentNo, //设备编号
        equipmentId: tempItem.equipmentId, //设备ID
        // deptId: tempItem.deptId, //部门id
        // deptName: tempItem.deptName, //部门名称
      })
    }
  })
  checkedList.value = []
}
//初始化机械列表
const init = () => {
  // 全部机械查询
  selectMachineList()
  resetSelectData()
}

//按条件全部机械查询
const selectMachineList = e => {
  api.getMachineList(e).then(res => {
    machineTableData.value = res.data.map(item => {
      item.disabled = true
      return item
    })
  })
}

//重置表格
const resetSelectData = () => {
  SearchHeaderRef.value.resetSearch()
}

/*//下拉框初始化
const selectInit = () => {
  // 给编辑table下拉框设置数据源
  publicApi.getDictList({ types: 'MACHINE_LOCATION' }).then(res => {
    // console.log('测试机械位置下拉框数据', res.data)
    proxy.setEditTableOptions(dispatchedTableColumns, { workPositionCode: res.data.MACHINE_LOCATION })
  })
  publicApi.getLocalSelect({ type: 'USER', post: config.post.jxsj }).then(res => {
    // console.log('测试司机下拉框数据', res.data)
    proxy.setEditTableOptions(dispatchedTableColumns, { operatorsId: res.data })
  })
}

//初始化
selectInit()*/

defineExpose({
  validate,
  resetSelectData,
  init,
  machineTableData,
  checkData,
  dispatchedQueryParams
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
