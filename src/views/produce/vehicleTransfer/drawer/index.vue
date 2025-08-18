<template>
  <div>
    <el-row>
      <el-col :span="22">
      </el-col>
      <el-col :span="2">
      <el-button type="primary"  @click="addMachine"  style="margin: 5px; " >新增
      </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="10">
        <BaseTable
          ref="baseTableRef"
          :tableColumns="tableColumns"
          :tableData="machineTableData"
          :checkbox-config="checkboxConfig"
          :tableHeight="'drawerHeaderPageTableHeight'"
        />
      </el-col>
      <el-col :span="3" style="text-align: center; display: flex; align-items: center; justify-content: center">
        <el-button type="primary" :icon="ArrowRight" style="margin-right: 5px" @click="joinRight">
          <el-icon><ArrowRight /></el-icon>
        </el-button>

        <el-button type="primary" :icon="ArrowLeft" @click="joinLeft">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <!-- <el-button type="primary" @click="joinRight">添加到右边</el-button>
        <el-button style="margin-top: 20px; margin-left: 0px" type="primary" @click="joinLeft">添加到左边</el-button> -->
      </el-col>
      <el-col :span="10">
        <EditTable
          ref="editTableRef"
          :selectData="selectData"
          :showSearchHeader="true"
          :tableColumns="dispatchedTableColumns"
          :tableData="dispatchedTableData"
          @change="dispatchedTableDataChange"
          :checkbox-config="checkboxConfig"
          :editRules="editRules"
          :tableHeight="'drawerHeaderPageTableHeight'"
        />
      </el-col>
    </el-row>

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="addMachineVisible" title="新增数据" size="70%">
      <MachineDetail1 ref="drawerDetailRef1" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="addMachineVisible = false">取 消</el-button>
          <el-button type="primary" @click="save">保 存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="machineDetail">
import { ref, reactive, getCurrentInstance, h, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/produce/vehicleTransfer/index.js'
import publicApi from '@/api/public/index'
import config from '@/config/index.js'
import SearchHeader from '@/components/SearchHeader/index.vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import MachineDetail1 from './drawerDetail/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const editTableRef = ref()
const baseTableRef = ref()
const SearchHeaderRef = ref()
const drawerDetailRef1 = ref(null)
//表格数据
const machineTableData = ref([])
const dispatchedTableData = ref([])
const addMachineVisible = ref(false) //弹出框组件显示隐藏
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
/*  {
    prop: 'deptName',
    label: '部门名称',
  },*/
])

//已配工机械
const dispatchedTableColumns = reactive([
  { label: '', type: 'checkbox', width: 60 },
  {
    prop: 'equipmentTypeName',
    label: '机械类型',
    sortable: "true"
  },
  {
    prop: 'equipmentNo',
    label: '机械编号',
  },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 'status',
    config: 'status',
    render: row => {
      return [
        h(
          ElSwitch,
          {
            onClick: () => {
              handleStatusChange(row)
            },
            modelValue: row.status,
            'active-value': '1',
            'inactive-value': '0',
          },

          {
            // default: () => row.status,
          }
        ),
      ]
    },
  },
/*  {
    prop: 'workPositionCode',
    label: '机械位置',
    editType: 'select',
    editRender: {},
    modelLabel: 'workPositionName',
    modelvalue: 'workPositionCode',
    align: 'center',
    selectData: [],
  },
  {
    prop: 'subProcessCode',
    label: '子过程',
    editType: 'select',
    modelLabel: 'subProcessName',
    modelvalue: 'subProcessCode',
    editRender: {},
    align: 'center',
    selectData: [],
  },
  {
    prop: 'operatorsId',
    label: '司机',
    editType: 'select',
    modelLabel: 'operatorsName',
    editRender: {},
    align: 'center',
    selectData: [],
  },*/
])
//表单校验
const editRules = reactive({
  workPositionCode: proxy.getRules({
    required: true,
  }),
  subProcessCode: proxy.getRules({
    required: true,
  }),
})

/*
//机械搜索框
const selectData = reactive([
  {
    prop: 'equipmentTypeCode',
    name: '机械类型', // 搜索框code
    type: 'select', // 搜索框类型
    modelValue: 'equipmentTypeCode', // 绑定字段
    span: 7, // 占位，共24
    dataConfig: { params: { type: 'MAC_TYPE' } },
  },
  // {
  //   prop: 'deptId',
  //   name: '所属部门', // 搜索框name
  //   type: 'select', // 搜索框类型
  //   modelValue: 'deptId', // 绑定字段
  //   span: 7, // 占位，共24
  //   dataConfig: { params: { type: 'DEPT_MACHINE' } },
  // },
])
*/
const dispatchedQueryParams = ref({
  trustId: '',
  trustCargoId: '',
})
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
}
const addMachine = () => {
    addMachineVisible.value =true
    nextTick(() => {
      drawerDetailRef1.value.dispatchedQueryParams.trustId = dispatchedQueryParams.value.trustId
      drawerDetailRef1.value.dispatchedQueryParams.trustCargoId = dispatchedQueryParams.value.trustCargoId
      drawerDetailRef1.value.init()
      console.log(drawerDetailRef1.value.trustId)
    })
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
  let flagss = 0
  checkedList.value.forEach(x =>{
    dispatchedTableData.value.forEach(item =>{
      if( x.equipmentId == item.equipmentId ){
        flagss=1
      }
    })
  })
  if(flagss == '1'){
    proxy.$message.warning("机械编号重复")
    flagss=0
    return
  }
  console.log(checkedList.value)
  checkedList.value.forEach(item => {
    item.status="1"
    dispatchedTableData.value.push({
      equipmentTypeName: item.equipmentTypeName, //设备类型名称
      equipmentTypeId: item.equipmentTypeId, //设备类型id
      equipmentNo: item.equipmentNo, //设备编号
      equipmentId: item.equipmentId, //设备ID
      status:item.status
      // deptId: item.deptId, //部门id
      // deptName: item.deptName, //部门名称
    })
  })
  console.log('已选中数据', dispatchedTableData.value)
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
    // if (checkedList.value.length == dispatchedTableData.value.length) {
    // 	dispatchedTableData.value = []
    // 	return
    // }
    dispatchedTableData.value.forEach((dispatchedItem, dispatchedIndex) => {
      if (dispatchedItem.index == tempItem.index) {
        dispatchedTableData.value.splice(dispatchedIndex, 1)
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
const save = async () => {
  const changeData = JSON.parse(JSON.stringify(drawerDetailRef1.value.checkData))
  if(changeData==null || changeData.length < 1){
    proxy.$message.warning('请选中至少一条数据进行保存！')
    return
  }
  let flags = 0
  changeData.forEach(x =>{
    dispatchedTableData.value.forEach(item =>{
        if( x.equipmentId == item.equipmentId ){
          flags=1
        }
    })
  })
  if(flags == '1'){
    proxy.$message.warning("机械编号重复")
    flags=0
    return
  }
  proxy.$modal.confirm('确定保存?').then(() => {
    api.insertVehicleTransferList({
      trustId: drawerDetailRef1.value.dispatchedQueryParams.trustId,
      trustCargoId: drawerDetailRef1.value.dispatchedQueryParams.trustCargoId,
      busVehicleTransferList: changeData,
      flag:1,// 是1就不走先删后插
    }).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      addMachineVisible.value =false
      init(dispatchedQueryParams.value,false)
    })
  })
 /* nextTick(() => {
    console.log(changeData)
    changeData.forEach(item => {
      item.trustId=dispatchedQueryParams.value.trustId
      item.trustCargoId = dispatchedQueryParams.value.trustCargoId
      item.status =0
      dispatchedTableData.value.push({
        equipmentTypeName: item.equipmentTypeName, //设备类型名称
        equipmentTypeId: item.equipmentTypeId, //设备类型id
        equipmentNo: item.equipmentNo, //设备编号
        equipmentId: item.equipmentId, //设备ID
        status:item.status,
        trustId:item.trustId,
        trustCargoId:item.trustCargoId,
      })
    })
  })*/
}
const handleStatusChange = (row) => {
  console.log(row)
  let text = row.status == '0' ? '启用' : '停用'
  proxy.$modal.confirm('确定"' + text + '"数据?').then(() => {
    api.changeDetailStatus({ id:row.id, status:row.status == '1' ? '0' : '1',trustCargoId:row.trustCargoId,trustId:row.trustId,equipmentNo:row.equipmentNo }).then(res => {
      proxy.$modal.msgSuccess(text + '成功')
      api.getVehicleList({trustId:row.trustId,trustCargoId:row.trustCargoId}).then(res => {
        console.log('派好的机械数据', res.data)
        dispatchedTableData.value = res.data
      })
    })
  })
}
// 配工数据修改
const dispatchedTableDataChange = (e, row, title) => {
  if('机械位置' == title){
    for (let index = 0; index < dispatchedTableData.value.length; index++) {
      if(index > row.index && !dispatchedTableData.value[index].workPositionCode
        && row.equipmentTypeId == dispatchedTableData.value[index].equipmentTypeId){
        dispatchedTableData.value[index].workPositionCode = e.value
        dispatchedTableData.value[index].workPositionName = e.label
      }
    }
  }

  if ('子过程' == title){
    for (let index = 0; index < dispatchedTableData.value.length; index++) {
      if(index > row.index && !dispatchedTableData.value[index].subProcessCode
        && row.equipmentTypeId == dispatchedTableData.value[index].equipmentTypeId){
        dispatchedTableData.value[index].subProcessCode = e.value
        dispatchedTableData.value[index].subProcessName = e.label
      }
    }
  }
}

//初始化机械列表
const init = (dispatchedQueryParams,batchFlag) => {
  //已派机械查询
  if(!batchFlag){
    api.getVehicleList(dispatchedQueryParams).then(res => {
      console.log('派好的机械数据', res.data)
      dispatchedTableData.value = res.data
    })
  }
}


defineExpose({
  validate,
  init,
  machineTableData,
  dispatchedTableData,
  dispatchedQueryParams,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
