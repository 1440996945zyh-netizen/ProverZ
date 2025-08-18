<template>
  <div class="app-container">
    <SearchHeader
      ref="SearchHeaderRef"
      class="tab_header"
      :selectData="selectData"
      @searchClick="getList"
      :endSelect="endSelect"
      :dropdownSelect="dropdownSelect"
      :buttonList="buttonList"
      :defaultWidth="15"
    />
    <el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="船舶计划" name="1">
        <EditTable
          class="tab_table"
          ref="shipEditTableRef"
          :tableColumns="shipTableColumns"
          :tableData="tableData"
          :border="true"
          :editRules="editRules"
          :showFooter="true"
          :tableHeight="'pageTableHeight'"
          @change="getAllData"
          :cellClickEvent="cellClickEvent"
          :checkbox-config="checkboxConfig"
          @checkbox-change="checkboxChangeEvent"
          :selectAllChangeEvent="selectAllChangeEvent"
          :disabledKey="'rowDisabled'"
          @blur="handleBlur"
        />
      </el-tab-pane>
      <el-tab-pane label="辅助计划" name="4">
        <EditTable
          class="tab_table"
          ref="jobEditTableRef"
          :tableColumns="jobTableColumns"
          :tableData="tableData"
          :border="true"
          :editRules="editRules"
          :showFooter="true"
          :tableHeight="'pageTableHeight'"
          @change="getAllData"
          :cellClickEvent="cellClickEvent"
          :checkbox-config="checkboxConfig"
          @checkbox-change="checkboxChangeEvent"
          :selectAllChangeEvent="selectAllChangeEvent"
          :disabledKey="'rowDisabled'"
        />
      </el-tab-pane>
      <el-tab-pane label="集疏港计划" name="2">
        <EditTable
          class="tab_table"
          ref="harborEditTableRef"
          :tableColumns="harborTableColumns"
          :tableData="tableData"
          :border="true"
          :editRules="editRules"
          :showFooter="true"
          :tableHeight="'pageTableHeight'"
          @change="getAllData"
          :cellClickEvent="cellClickEvent"
          :checkbox-config="checkboxConfig"
          @checkbox-change="checkboxChangeEvent"
          :selectAllChangeEvent="selectAllChangeEvent"
          :disabledKey="'rowDisabled'"
        />
      </el-tab-pane>
      <el-tab-pane label="转运计划" name="3">
        <EditTable
          class="tab_table"
          ref="transferEditTableRef"
          :tableColumns="transferTableColumns"
          :tableData="tableData"
          :border="true"
          :editRules="editRules"
          :showFooter="true"
          :tableHeight="'pageTableHeight'"
          @change="getAllData"
          :cellClickEvent="cellClickEvent"
          :checkbox-config="checkboxConfig"
          @checkbox-change="checkboxChangeEvent"
          :selectAllChangeEvent="selectAllChangeEvent"
          :disabledKey="'rowDisabled'"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
  <!-- 导入作业指令 -->
  <instructionsImport
    ref="instructionsImportRef"
    :permission="'storage:openPortApply:add'"
    :trustType="trustType"
    @change="instructionsChange"
  />

  <!-- 调度员派工 -->
  <el-drawer v-model="drawerVisible" title="调度员派工" size="40%">
    <tallyDetail ref="tallyDetailRef"/>
    <template #footer>
      <div>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTally">保存</el-button>
      </div>
    </template>
  </el-drawer>
  <!--理货员派工-->
  <el-drawer v-model="tallyUpdateDrawer" :title="'理货员派工'" size="40%">
    <tallyUpdate ref="tallyUpdateRef"/>
    <template #footer>
      <div>
        <el-button @click="tallyUpdateDrawer = false">取消</el-button>
        <el-button type="primary" @click="tallyUpdateSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
  <!--库场派工-->
  <el-drawer v-model="massUpdateDrawer" :title="'场地安排'" size="40%">
    <massUpdate ref="massUpdateRef"/>
    <template #footer>
      <div>
        <el-button @click="massUpdateDrawer = false">取消</el-button>
        <el-button type="primary" @click="massUpdateSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
  <el-drawer v-model="lgDrawerVisible" :title="'场地安排'" size="40%">
    <lgMassUpdate ref="lgDrawerRef"/>
    <template #footer>
      <div>
        <el-button @click="lgDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="lgMassUpdateSave">保存</el-button>
      </div>
    </template>
  </el-drawer>

  <!-- 导入上班次 -->
  <workPlanImport ref="workPlanDetailRef" @importSuccess="importSuccess"/>

  <!-- 导入作业指令 -->
  <dayNightWorkPlanImport
    ref="dayNightWorkPlanDetailRef"
    :permission="'storage:openPortApply:add'"
    :trustType="trustType"
    @change="instructionsChange"
  />

</template>

<script setup name="workPlan">
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import MechanicalType from '@/businessComponents/MechanicalType/mechanical.vue'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue' //导入作业指令
import workPlanImport from '@/views/dispatch/workPlan/importWorkPlan/index.vue'
import dayNightWorkPlanImport from '@/views/dispatch/workPlan/importDayNightWorkPlan/index.vue'//导入集疏港昼夜计划
import tallyDetail from './tallyDetail/index' //派工抽屉
import tallyUpdate from './tallyUpdate/index' //理货员派工抽屉
import massUpdate from './massUpdate/index' //场地安排抽屉
import lgMassUpdate from './lgMassUpdate/index' //场地安排抽屉
const lgDrawerVisible = ref(false)
const lgDrawerRef = ref(false)
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/dispatch/workPlan/index.js'
import publicApi from '@/api/public/index'
import EditTable from '@/components/EditTable/index.vue'
import { ElTag, ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { nextTick, reactive, ref } from 'vue'
const workPlanDetailRef = ref(null) //导入上班次
const dayNightWorkPlanDetailRef = ref(null) //导入集疏港昼夜计划
const drawerVisible = ref(false) //弹出框
const tallyDetailRef = ref(null) // 派工明细组件ref
const tempId = ref()
//理货员派工组件相关
const tallyUpdateRef = ref(null)
const tallyUpdateDrawer = ref(false)
//场地安排组件相关
const massUpdateRef = ref(null)
const massUpdateDrawer = ref(false)
const clickRow = ref({})
// 表格获取当前行数据
const cellClickEvent = ({row, columnIndex}) => {
  clickRow.value = row
  nextTick(() => {
    tempId.value = row.id
  })
  if (row.status != '20') {
    let dataList = []
    for (let i = 1; i <= row.hatchNum; i++) {
      dataList.push({label: String(i), value: String(i)})
    }
    if (tabActiveName.value == '1') {
      proxy.setEditTableOptions(shipTableColumns.value, {hatch: dataList})
    } else if (tabActiveName.value == '3') {
      proxy.setEditTableOptions(transferTableColumns.value, {hatch: dataList})
    }
  }
}
const SearchHeaderRef = ref()
const selectData = reactive([
  {
    type: 'date', // 搜索框类型
    modelValue: 'workDate', // 绑定字段
    span: 14, // 占位，共24
    name: '选择日期',
  },
  {
    name: '班次',
    type: 'select',
    modelValue: 'classCode',
    span: 10,
    dataConfig: {params: {type: 'DICT', dictType: 'WORK_SCHEDULE'}},
  },
  {
    name: '',
    type: '', //空的站格子
    modelValue: '', //
    span: 0,
    dataType: '',
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 3, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '通知单号',
    type: 'input',
    modelValue: 'trustNo',
    span: 3,
  },
  {
    name: '货主', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'cargoOwnerId', // 绑定字段
    span: 3, // 占位，共24
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '货名', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'cargoCode', // 绑定字段
    span: 3, // 占位，共24
    dataType: 'CARGO_INFO',
  },
  {
    name: '作业区', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'portCode', // 绑定字段
    span: 3, // 占位，共24
    selectData: [
      {label: '东港', value: '01'},
      {label: '中港', value: '02'},
      {label: '西港', value: '03'},
    ],
  },
  {
    name: '包装',
    type: 'select',
    modelValue: 'packageCode',
    span: 2,
    dataConfig: {params: {type: 'DICT', dictType: 'PACKAGE_TYPE'}},
  },
])
const getAllData = (row, e, title) => { }
// 零工按钮参数
let buttonLists = ref([
  {
    label: '新增', // 按钮名称
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    type: 'primary', // 按钮类型
    click: () => insert, // 回调函数
    permission: 'dispatch:workPlan:save', // 权限
  },
  {
    label: '删除', // 按钮名称
    type: 'danger', // 按钮类型
    icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
    click: () => lgDelete, // 回调函数
    permission: 'dispatch:workPlan:placeDelete', // 权限
  },
  {
    label: '保存', // 按钮名称
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    type: 'primary', // 按钮类型
    click: () => lgSave, // 回调函数
    permission: 'dispatch:workPlan:save', // 权限
  },
  {
    label: '调度员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Avatar', // 按钮图标，支持element-Plus中所有图标
    click: () => updateDispatch, // 回调函数
    // click: () => lgDispatch, // 回调函数
    permission: 'dispatch:workPlan:shipDispatch', // 权限
  },
  {
    label: '场地', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
    click: () => lgUpdateMass, // 回调函数
    permission: 'dispatch:workPlan:massUpdate', // 权限
  },
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => receive, // 回调函数
    permission: 'dispatch:workPlan:submit', // 权限
  },
  {
    label: '撤销审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    // icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
    click: () => revocation, // 回调函数
    permission: 'dispatch:workPlan:cancelSubmit', // 权限
  },
])
//集疏港计划导入按钮
let sparseDropdownSelect = ref([
  {
    label: '导入', // 按钮名称
    icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
    permission: 'dispatch:workPlan:save', // 权限
    type: 'primary', // 按钮类型
    buttonList: [
      {
        label: '导入指令', // 按钮名称
        type: 'primary', // 按钮类型
        icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
        click: () => importInstruction1, // 回调函数
        permission: 'dispatch:workPlan:importInstruction', // 权限
      },
      {
        label: '导入昼夜计划', // 按钮名称·
        type: 'primary', // 按钮类型
        icon: 'DocumentAdd', // 按钮图标，支持element-Plus中所有图标
        click: () => importWorkPlan1, // 回调函数
        permission: 'dispatch:workPlan:placeImport', // 权限
      },
    ],
  },
])
// 集疏港按钮参数
let setSparseLists = ref([
  {
    label: '保存', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'dispatch:workPlan:save', // 权限
  },
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => receive, // 回调函数
    permission: 'dispatch:workPlan:submit', // 权限
  },
  {
    label: '销审', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    click: () => revocation, // 回调函数
    permission: 'dispatch:workPlan:cancelSubmit', // 权限
  },
  {
    label: '场地', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
    click: () => updateMass, // 回调函数
    permission: 'dispatch:workPlan:massUpdate', // 权限
  },
  {
    label: '理货员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => updateTally, // 回调函数
    permission: 'dispatch:workPlan:tallyUpdate', // 权限
  },
  {
    label: '调度员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Avatar', // 按钮图标，支持element-Plus中所有图标
    click: () => updateDispatch, // 回调函数
    permission: 'dispatch:workPlan:shipDispatch', // 权限
  },
  {
    label: '删除', // 按钮名称
    type: 'danger', // 按钮类型
    icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
    click: () => handleDelete, // 回调函数
    permission: 'dispatch:workPlan:placeDelete', // 权限
  },
  {
    label: '复制', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'CopyDocument', // 按钮图标，支持element-Plus中所有图标
    click: () => copyJSG, // 回调函数
    permission: 'dispatch:workPlan:shipCopy', // 权限
  },
])
//转运计划按钮
let transportButtonList = ref([
  {
    label: '保存', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'dispatch:workPlan:save', // 权限
  },
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => receive, // 回调函数
    permission: 'dispatch:workPlan:submit', // 权限
  },
  {
    label: '销审', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    click: () => revocation, // 回调函数
    permission: 'dispatch:workPlan:cancelSubmit', // 权限
  },
  {
    label: '场地', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
    click: () => updateMass, // 回调函数
    permission: 'dispatch:workPlan:massUpdate', // 权限
  },
  {
    label: '理货员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => updateTally, // 回调函数
    permission: 'dispatch:workPlan:tallyUpdate', // 权限
  },
  {
    label: '调度员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Avatar', // 按钮图标，支持element-Plus中所有图标
    click: () => updateDispatch, // 回调函数
    permission: 'dispatch:workPlan:shipDispatch', // 权限
  },
  {
    label: '删除', // 按钮名称
    type: 'danger', // 按钮类型
    icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
    click: () => handleDelete, // 回调函数
    permission: 'dispatch:workPlan:shipDelete', // 权限
  },
  {
    label: '复制', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'CopyDocument', // 按钮图标，支持element-Plus中所有图标
    click: () => copyZY, // 回调函数
    permission: 'dispatch:workPlan:shipCopy', // 权限
  },
])
//转运计划导入按钮
let transportDropdownSelect = ref([
  {
    label: '导入', // 按钮名称
    icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
    type: 'primary', // 按钮类型
    permission: 'dispatch:workPlan:save', // 权限
    buttonList: [
      {
        label: '导入指令', // 按钮名称
        type: 'primary', // 按钮类型
        icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
        click: () => importInstruction3, // 回调函数
        permission: 'dispatch:workPlan:importInstruction', // 权限
      },
      {
        label: '导入上班次', // 按钮名称
        type: 'primary', // 按钮类型
        icon: 'DocumentAdd', // 按钮图标，支持element-Plus中所有图标
        click: () => importWorkPlan2, // 回调函数
        permission: 'dispatch:workPlan:transImport', // 权限
      },
    ],
  },
])
//船舶计划导入按钮
let shipDropdownSelect = ref([
  {
    label: '导入', // 按钮名称
    icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
    permission: 'dispatch:workPlan:save', // 权限
    type: 'primary', // 按钮类型
    buttonList: [
      {
        label: '导入指令', // 按钮名称
        icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
        click: () => importInstruction, // 回调函数
        permission: 'dispatch:workPlan:save', // 权限
      },
      {
        label: '导入上班次', // 按钮名称
        type: 'primary', // 按钮类型
        icon: 'DocumentAdd', // 按钮图标，支持element-Plus中所有图标
        click: () => importWorkPlan, // 回调函数
        permission: 'dispatch:workPlan:save', // 权限
      },
    ],
  },
])
// 船舶计划按钮参数
let shipButtonList = ref([
  {
    label: '保存', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'dispatch:workPlan:save', // 权限
  },
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => receive, // 回调函数
    permission: 'dispatch:workPlan:submit', // 权限
  },
  {
    label: '销审', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    click: () => revocation, // 回调函数
    permission: 'dispatch:workPlan:cancelSubmit', // 权限
  },
  {
    label: '场地', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
    click: () => updateMass, // 回调函数
    permission: 'dispatch:workPlan:massUpdate', // 权限
  },
  {
    label: '理货员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => updateTally, // 回调函数
    permission: 'dispatch:workPlan:tallyUpdate', // 权限
  },
  {
    label: '调度员', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Avatar', // 按钮图标，支持element-Plus中所有图标
    click: () => updateDispatch, // 回调函数
    permission: 'dispatch:workPlan:shipDispatch', // 权限
  },
  {
    label: '删除', // 按钮名称
    type: 'danger', // 按钮类型
    icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
    click: () => handleDelete, // 回调函数
    permission: 'dispatch:workPlan:shipDelete', // 权限
  },
  {
    label: '复制', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'CopyDocument', // 按钮图标，支持element-Plus中所有图标
    click: () => copy, // 回调函数
    permission: 'dispatch:workPlan:shipCopy', // 权限
  },
])
// 按钮参数列表
let buttonList = ref([...shipButtonList.value])
let dropdownSelect = ref([...shipDropdownSelect.value])
// 保存
const add = async () => {
  proxy.$modal
    .confirm('确定保存？')
    .then(async res => {
      let tableDatas = tableData.value.map(item => {
        if (item.hatch && Array.isArray(item.hatch)) {
          item.hatch = item.hatch.join(',')
        }
        return item
      })
      const params = JSON.parse(JSON.stringify(tableDatas))
      await api.updatePlan(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        getList(queryParams.value)
      })
    })
}
const lgSave = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择一条数据再进行保存')
    return
  }
  proxy.$modal.confirm('确定保存？').then(async res => {
    let insertList = []
    let updateList = []
    for (let index in checkboxList.value) {
      let checkItem = checkboxList.value[index]
      if (!checkItem.id || checkItem.id == null || checkItem.id == undefined || checkItem.id == '') {
        insertList.push(checkItem)
        console.log("新增")
      }
      tableData.value.map(item => {
        item.planType = '4'
        item.workDate = queryParams.value.workDate
        item.classCode = queryParams.value.classCode
        if (item.hatch && Array.isArray(item.hatch)) {
          item.hatch = item.hatch.join(',')
        }
        if (checkItem.id && checkItem.id == item.id) {
          if(item.shipvoyageItemId == "" || item.shipvoyageItemId == null || item.shipvoyageItemId == undefined){
            item.shipVoyageIds= null;
            item.shipvoyageId= null;
            item.shipVoyage=null;
            item.shipName=null;
            item.shipvoyageLabel=null;
            item.voyage=null;
          }
          updateList.push(item)
        }
      })
    }
    if (insertList.length != 0) {
      const insertParams = JSON.parse(JSON.stringify(insertList))
      await api.insertLgWorkPlan(insertParams).then(res => {
        proxy.$modal.msgSuccess(res.msg)
      })
    }
    if (updateList.length != 0) {
      const updateParams = JSON.parse(JSON.stringify(updateList));
      await api.updatePlan(updateParams).then(res => {
        proxy.$modal.msgSuccess(res.msg)
      })
    }
    getList(queryParams.value)
  })
}
const insert = async () => {
  tableData.value.push({status: "10", statusLabel: "未审核"})
}
// 复制
const copy = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择一条数据再进行复制')
    return
  }
  if (checkboxList.value.length > 1) {
    proxy.$modal.msgError('只能复制一条数据')
    return
  }
  proxy.$modal
    .confirm('确定复制此数据吗？')
    .then(async res => {
      let copyId = checkboxList.value.map(item => item.id).join(',')
      await api.reqCopyWorkPlan(copyId).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        getList(queryParams.value)
      })
    })
}

const copyZY = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择一条数据再进行复制')
    return
  }
  if (checkboxList.value.length > 1) {
    proxy.$modal.msgError('只能复制一条数据')
    return
  }
  proxy.$modal
    .confirm('确定复制此数据吗？')
    .then(async res => {
      let copyId = checkboxList.value.map(item => item.id).join(',')
      await api.reqCopyZYWorkPlan(copyId).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        getList(queryParams.value)
      })
    })
}

const copyJSG = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择一条数据再进行复制')
    return
  }
  if (checkboxList.value.length > 1) {
    proxy.$modal.msgError('只能复制一条数据')
    return
  }
  proxy.$modal
    .confirm('确定复制此数据吗？')
    .then(async res => {
      let copyId = checkboxList.value.map(item => item.id).join(',')
      await api.reqCopyJSGWorkPlan(copyId).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        getList(queryParams.value)
      })
    })
    .catch(err => {
    })
}
// 调度员派工
const updateDispatch = () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择数据再进行派工')
    return
  }
  let ids = checkboxList.value.map(item => item.id).join(',')
  drawerVisible.value = true
  nextTick(() => {
    //清空事件
    tallyDetailRef.value.resetForm()
    tallyDetailRef.value.formData.batchId = ids
  })
  if (checkboxList.value.length == 1 && ids != null && ids != undefined && ids != '' && ids.length != 0) {
    api.getDetail(ids).then(res => {
      nextTick(() => {
        //清空事件
        tallyDetailRef.value.resetForm()
        tallyDetailRef.value.formData.id = res.data.id
        tallyDetailRef.value.formData.batchId = ids
        tallyDetailRef.value.formData.dispatchBy = res.data.dispatchBy ? res.data.dispatchBy.split(',') : ''
        tallyDetailRef.value.formData.dispatchByName = res.data.dispatchByName ? res.data.dispatchByName.split(',') : ''
      })
    })
  }
}
//零工单派工
const lgDispatch = () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择数据再进行派工')
    return
  }
  console.log(checkboxList.value)
  drawerVisible.value = true
}
// 调度员派工保存
const saveTally = () => {
  const tmpParams = JSON.parse(JSON.stringify(tallyDetailRef.value.formData))
  let params = {}
  params = {
    ...tmpParams,
    dispatchBy: tmpParams.dispatchBy ? tmpParams.dispatchBy.join(',') : '',
    dispatchByName: tmpParams.dispatchByName ? tmpParams.dispatchByName.join(',') : '',
  }
  if (queryParams.value.planType != '4') {//不等于零工
    proxy.$modal.confirm('确定保存？').then(res => {
      api.reqUpdateDispatch(params).then(res => {
        proxy.$message.success(res.msg)
        getList(queryParams.value)
        drawerVisible.value = false
      })
    })
  } else if (queryParams.value.planType == '4') {
    if (params.id == null || params.id == undefined || params.id == '') {
      proxy.$modal.msgError('请先保存数据再进行派工')
      drawerVisible.value = false
    } else {
      proxy.$modal.confirm('确定保存？').then(res => {
        api.reqUpdateDispatch(params).then(res => {
          proxy.$message.success(res.msg)
          getList(queryParams.value)
          drawerVisible.value = false
        })
      })
    }
  }
}
const trustType = ref('1')
// 导入作业指令
const instructionsImportRef = ref(null) //作业指令组件抽屉
//船舶计划导入指令
const importInstruction = () => {
  trustType.value = '1'
  nextTick(() => {
    instructionsImportRef.value.instructDrawerVisible = true
    instructionsImportRef.value.formData.workDate = queryParams.value.workDate
    instructionsImportRef.value.formData.classCode = queryParams.value.classCode
    instructionsImportRef.value.formData.className = queryParams.value.className
    instructionsImportRef.value.isHidden = true
  })
}
//转运计划导入指令
const importInstruction3 = () => {
  trustType.value = '3'
  nextTick(() => {
    instructionsImportRef.value.instructDrawerVisible = true
    instructionsImportRef.value.formData.workDate = queryParams.value.workDate
    instructionsImportRef.value.formData.classCode = queryParams.value.classCode
    instructionsImportRef.value.formData.className = queryParams.value.className
    instructionsImportRef.value.isHidden = true
  })
}
//集疏港计划导入指令
const importInstruction1 = () => {
  trustType.value = '2'
  nextTick(() => {
    instructionsImportRef.value.instructDrawerVisible = true
    instructionsImportRef.value.formData.workDate = queryParams.value.workDate
    instructionsImportRef.value.formData.classCode = queryParams.value.classCode
    instructionsImportRef.value.formData.className = queryParams.value.className
    instructionsImportRef.value.isHidden = false
  })
}
// 导入集疏港昼夜计划
const importWorkPlan3 = () => {
  trustType.value = '2'
  nextTick(() => {
    dayNightWorkPlanDetailRef.value.instructDrawerVisible = true
    dayNightWorkPlanDetailRef.value.formData.workDate = queryParams.value.workDate
    dayNightWorkPlanDetailRef.value.formData.classCode = queryParams.value.classCode
    dayNightWorkPlanDetailRef.value.formData.className = queryParams.value.className
    dayNightWorkPlanDetailRef.value.isHidden = false
  })
}
// 船舶、转运、集疏港导入作业指令
const instructionsChange = async e => {
  if (e.classCode == '01') {
    e.className = '白班'
  } else if (e.classCode == '02') {
    e.className = '夜班'
  }
  if (e.trustType == '1' || e.trustType == '3') {
    await api.insertWorkPlan(e.trustIds, e.workDate, e.classCode, e.className, tabActiveName.value).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      getList(queryParams.value)
    })
  } else {
    await api.insertWorkPlanData(e.trustIds, e.workDate, e.classCode, e.className).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      getList(queryParams.value)
    })
  }
}
// 船舶计划导入上班次
const importWorkPlan = val => {
  workPlanDetailRef.value.drawerVisible = true
  publicApi.getNowDate().then(res => {
    workPlanDetailRef.value.formData.classCode = res.data.classCode
    workPlanDetailRef.value.formData.className = res.data.className
    workPlanDetailRef.value.formData.workDate = res.data.workDate
    workPlanDetailRef.value.getSelectData('cbjh')
  })
}
// 集疏港导入上班次 集疏港导入昼夜计划
const importWorkPlan1 = val => {
  workPlanDetailRef.value.drawerVisible = true
  publicApi.getNowDate().then(res => {
    workPlanDetailRef.value.formData.classCode = res.data.classCode
    workPlanDetailRef.value.formData.className = res.data.className
    workPlanDetailRef.value.formData.workDate = res.data.workDate
    workPlanDetailRef.value.getSelectData('jsg')
  })
}
//转运计划导入上班次
const importWorkPlan2 = val => {
  workPlanDetailRef.value.drawerVisible = true
  publicApi.getNowDate().then(res => {
    workPlanDetailRef.value.formData.classCode = res.data.classCode
    workPlanDetailRef.value.formData.className = res.data.className
    workPlanDetailRef.value.formData.workDate = res.data.workDate
    workPlanDetailRef.value.getSelectData('zyjh')
  })
}
// 导入上班次触发自定义事件
const importSuccess = e => {
  if (e) {
    getList(queryParams.value)
  }
}
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
// 全选事件
const selectAllChangeEvent = ({checked}) => {
  checkboxList.value = checked ? tableData.value : []
}
const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data
}
// 删除
const handleDelete = () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择需要删除的数据')
    return
  }
  proxy.$modal
    .confirm('确定删除？')
    .then(res => {
      let ids = checkboxList.value.map(item => item.id)
      api.reqDelete(ids).then(res => {
        proxy.$message.success(res.msg)
        getList(queryParams.value)
      })
    })
}
const lgDelete = () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择需要删除的数据')
    return
  }
  proxy.$modal.confirm('确定删除？').then(res => {
    let ids = checkboxList.value.map(item => item.id)
    api.reqDelete(ids).then(res => {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
    })
  })
}
// 审核
const receive = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择需要审核的数据')
    return
  }
  let ids = checkboxList.value.map(item => item.id)
  await api.reqApprove(ids).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    getList(queryParams.value)
  })
}
// 撤销审核
const revocation = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择需要撤销审核的数据')
    return
  }
  let ids = checkboxList.value.map(item => item.id)
  await api.reqCancle(ids).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    getList(queryParams.value)
  })
}
// 可编辑表格数据
const tableData = ref([])
const shipEditTableRef = ref() //船舶计划 editTable的ref
const jobEditTableRef = ref() //零工
const harborEditTableRef = ref() //集疏港
const transferEditTableRef = ref() //转运
const processNameList = ref([])

//船舶表格数据
const shipTableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '', type: 'checkbox', width: 30, fixed: 'left' },
	{ prop: 'trustNo', label: '通知单编号', width: 150, align: 'center' },
	// { prop: 'planNo', label: '计划编号', width: 150, align: 'center' },
	{
		prop: 'statusLabel',
		label: '状态',
		width: 100,
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag =
				row.status == 10
					? 'info'
					: row.status == 20
					? 'success'
					: row.status == 30
					? 'primary'
					: row.status == 40
					? 'danger'
					: 'success'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
  { prop: 'shipvoyageLabel', label: '船名航次', width: 100, align: 'left' },
  {
		prop: 'processCode',
		label: '作业过程',
		width: 140,
		align: 'left',
		selectValue: 'value',
		selectLabel: 'label',
		modelLabel: 'processName',
		modelValue: 'processCode',
		editRender: {},
		editType: 'select',
		selectData: processNameList,
	},
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 160 },
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{
		label: '舱口',
		prop: 'hatch',
		editType: 'select',
		modelLabel: 'hatch',
		multiple: true,
		editRender: {},
		width: 80,
	},
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'left' },
	{ prop: 'berthName', label: '泊位', width: 80, align: 'left' },
	{ prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 150, align: 'left' },
	{
		prop: 'equipmentNamesFront',
		label: '前沿',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesFront,
					workPlanId: row.id,
					workPositionCode: '01',
					disabled: row.rowDisabled,
					onChange: data => {
						row.equmentListFront = data
						// console.log(data, 'data')
					},
					'onUpdate:value': val => {
						row.equipmentNamesFront = val
						// row.equmentListFront = val
					},
				}),
			]
		},
	},
	{
		prop: 'equipmentNamesReshipment',
		label: '转运',
		modelLabel: 'moveInBerthName',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesReshipment,
					workPlanId: row.id,
					workPositionCode: '03',
					disabled: row.rowDisabled,
					onChange: data => {
						row.equmentListReshipment = data
						// console.log(data, 'data')
					},
					'onUpdate:value': val => {
						row.equipmentNamesReshipment = val
					},
				}),
			]
		},
	},
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesBack,
					workPlanId: row.id,
					workPositionCode: '02',
					disabled: row.rowDisabled,
					onChange: data => {
						row.equmentListBack = data
					},
					'onUpdate:value': val => {
						row.equipmentNamesBack = val
					},
				}),
			]
		},
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'backTallyByName',
		label: '理货员',
		width: 70,
		align: 'left',
		render: row => {
			let text1 = row.frontTallyByName ? row.frontTallyByName : ''
			let text2 = row.backTallyByName ? row.backTallyByName : ''
			let text = ''
			if (text1) {
				if (text2) {
					text = text1 + '/' + text2
				} else {
					text = text1
				}
			} else {
				text = text2
			}
			return [h('div', {}, text)]
		},
	},
	{ prop: 'dispatchByName', label: '调度员', width: 70, align: 'left' },
	{
		prop: 'quantityPlan',
		label: '计划件数',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'tonPlan',
		label: '计划重量',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'startTimePlan',
		label: '计划开工时间',
		editType: 'datetime',
		editRender: {},
		width: 160,
		align: 'center',
	},
	{
		prop: 'endTimePlan',
		label: '计划完工时间',
		editType: 'datetime',
		editRender: {},
		width: 160,
		align: 'center',
	},
	{
		prop: 'remark',
		label: '作业要求',
		editType: 'input',
		editRender: {},
		width: 160,
		align: 'center',
	},
])

// 集疏港表格数据
const harborTableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '', type: 'checkbox', width: 30, fixed: 'left' },
	{ prop: 'trustNo', label: '通知单编号', width: 150, align: 'center' },
	{
		prop: 'statusLabel',
		label: '状态',
		width: 100,
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag =
				row.status == 10
					? 'info'
					: row.status == 20
					? 'success'
					: row.status == 30
					? 'primary'
					: row.status == 40
					? 'danger'
					: 'success'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
	{
		prop: 'processCode',
		label: '作业过程',
		width: 140,
		align: 'left',
		modelLabel: 'processName',
		modelValue: 'processCode',
		selectData: processNameList,
		editRender: {},
		editType: 'select',
	},
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 150, align: 'left' },
	{ label: '货主', prop: 'cargoOwnerName', width: 120, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{
		prop: 'backTallyByName',
		label: '理货员',
		width: 120,
		align: 'left',
		render: row => {
			let text1 = row.frontTallyByName ? row.frontTallyByName : ''
			let text2 = row.backTallyByName ? row.backTallyByName : ''
			let text = ''
			if (text1) {
				text = text1 + '/' + text2
			} else {
				text = text2
			}
			return [h('div', {}, text)]
		},
	},
	{ prop: 'dispatchByName', label: '调度员', width: 70, align: 'left' },
	{ prop: 'massNamesSource', label: '起始位置', width: 180, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 180, align: 'left' },
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesBack,
					workPlanId: row.id,
					disabled: row.rowDisabled,
					workPositionCode: '02',
					onChange: data => {
						row.equmentListBack = data
					},
					'onUpdate:value': val => {
						row.equipmentNamesBack = val
					},
				}),
			]
		},
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	// { prop: 'dispatchByName', label: '调渡员', width: 100, align: 'left' },
	{
		prop: 'quantityPlan',
		label: '计划件数',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'tonPlan',
		label: '计划重量',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'startTimePlan',
		label: '计划开工时间',
		editType: 'datetime',
		editRender: {},
		width: 180,
		align: 'center',
	},
	{
		prop: 'endTimePlan',
		label: '计划完工时间',
		editType: 'datetime',
		editRender: {},
		width: 180,
		align: 'center',
	},
	{
		prop: 'remark',
		label: '作业要求',
		editType: 'input',
		editRender: {},
		width: 180,
		align: 'center',
	},
])

// 转运计划表格数据
const transferTableColumns = ref([
  {label: '', type: 'checkbox', width: 30, fixed: 'left'},
  {prop: 'trustNo', label: '通知单编号', width: 150, align: 'center'},
  // { prop: 'planNo', label: '计划编号', width: 150, align: 'center' },
  {
    prop: 'statusLabel',
    label: '状态',
    width: 100,
    align: 'center',
    render: row => {
      let typeFlag = ''
      typeFlag =
        row.status == 10
          ? 'info'
          : row.status == 20
            ? 'success'
            : row.status == 30
              ? 'primary'
              : row.status == 40
                ? 'danger'
                : 'success'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => row.statusLabel,
          }
        ),
      ]
    },
  },
  {prop: 'shipvoyageLabel', label: '船名航次', width: 100, align: 'left'},
  {
    prop: 'processCode',
    label: '作业过程',
    width: 140,
    align: 'left',
    selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'processName',
    modelValue: 'processCode',
    editRender: {},
    editType: 'select',
    selectData: processNameList,
  },
  {prop: 'cargoOwnerName', label: '货主', align: 'center', width: 160},
  {prop: 'cargoName', label: '货名', width: 120, align: 'center'},
  {
    label: '舱口',
    prop: 'hatch',
    editType: 'select',
    modelLabel: 'hatch',
    multiple: true,
    editRender: {},
    width: 80,
  },
  {prop: 'loadUnload', label: '装卸', width: 80, align: 'left'},
  {prop: 'berthName', label: '泊位', width: 80, align: 'left'},
  {prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left'},
  {prop: 'massNamesTarget', label: '目标位置', width: 150, align: 'left'},
  {
    prop: 'equipmentNamesFront',
    label: '前沿',
    width: 180,
    align: 'canter',
    render: row => {
      return [
        h(MechanicalType, {
          value: row.equipmentNamesFront,
          workPlanId: row.id,
          workPositionCode: '01',
          disabled: row.rowDisabled,
          onChange: data => {
            row.equmentListFront = data
            // console.log(data, 'data')
          },
          'onUpdate:value': val => {
            row.equipmentNamesFront = val
            // row.equmentListFront = val
          },
        }),
      ]
    },
  },
  {
    prop: 'equipmentNamesReshipment',
    label: '转运',
    modelLabel: 'moveInBerthName',
    width: 180,
    align: 'canter',
    render: row => {
      return [
        h(MechanicalType, {
          value: row.equipmentNamesReshipment,
          workPlanId: row.id,
          workPositionCode: '03',
          disabled: row.rowDisabled,
          onChange: data => {
            row.equmentListReshipment = data
            // console.log(data, 'data')
          },
          'onUpdate:value': val => {
            row.equipmentNamesReshipment = val
          },
        }),
      ]
    },
  },
  {
    prop: 'equipmentNamesBack',
    label: '后场',
    width: 180,
    align: 'canter',
    render: row => {
      return [
        h(MechanicalType, {
          value: row.equipmentNamesBack,
          workPlanId: row.id,
          workPositionCode: '02',
          disabled: row.rowDisabled,
          onChange: data => {
            row.equmentListBack = data
          },
          'onUpdate:value': val => {
            row.equipmentNamesBack = val
          },
        }),
      ]
    },
  },
  {
    prop: 'laborNum',
    label: '装卸队',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'center',
  },
  {
    prop: 'backTallyByName',
    label: '理货员',
    width: 70,
    align: 'left',
    render: row => {
      let text1 = row.frontTallyByName ? row.frontTallyByName : ''
      let text2 = row.backTallyByName ? row.backTallyByName : ''
      let text = ''
      if (text1) {
        if (text2) {
          text = text1 + '/' + text2
        } else {
          text = text1
        }
      } else {
        text = text2
      }
      return [h('div', {}, text)]
    },
  },
  {prop: 'dispatchByName', label: '调度员', width: 70, align: 'left'},
  {
    prop: 'quantityPlan',
    label: '计划件数',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'center',
  },
  {
    prop: 'tonPlan',
    label: '计划重量',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'center',
  },
  {
    prop: 'startTimePlan',
    label: '计划开工时间',
    editType: 'datetime',
    editRender: {},
    width: 160,
    align: 'center',
  },
  {
    prop: 'endTimePlan',
    label: '计划完工时间',
    editType: 'datetime',
    editRender: {},
    width: 160,
    align: 'center',
  },
  {
    prop: 'remark',
    label: '作业要求',
    editType: 'input',
    editRender: {},
    width: 160,
    align: 'center',
  },
])
//主列表查询条件
const dispatchedQueryParams = ref({
  dispatchType: '',
  workPlanId: '',
})
//获取已经派好的机械数据
const getDispatchedList = async e => {
  if(clickRow.value.id == undefined){
    return;
  }
  let dispatchedQueryParams = {
    dispatchType: 1,
    workPlanId: clickRow.value.id,
  }
  api.getDispatchAllList(dispatchedQueryParams).then(res => {
    if(res.data.length>0){
      clickRow.value.isUpdate = false
      proxy.$modal.msgWarning('作业线已经派工请不要修改作业过程！')
    }
  })
}
// 零工计划表格
const jobTableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {label: '', type: 'checkbox', width: 30, fixed: 'left'},
  {prop: 'planNo', label: '计划编号', width: 150, align: 'center'},
  {
    prop: 'statusLabel',
    label: '状态',
    width: 100,
    align: 'center',
    render: row => {
      let typeFlag = ''
      typeFlag =
        row.status == 10
          ? 'info'
          : row.status == 20
            ? 'success'
            : row.status == 30
              ? 'primary'
              : row.status == 40
                ? 'danger'
                : 'success'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => row.statusLabel,
          }
        ),
      ]
    },
  },
  {
    prop: 'processCode',
    label: '作业过程',
    width: 140,
    align: 'left',
    modelLabel: 'processName',
    modelValue: 'processCode',
    selectData: processNameList,
    editRender: {},
    editType: 'select',
    // changeSelect:getDispatchedList()
  },
  {
    prop: 'shipvoyageItemId',
    label: '船名航次',
    modelLabel: 'shipVoyage',
    selectLabel: 'label',
    selectValue: 'value',
    editType: 'remoteSelect',
    type: 'VOYAGE',
    width: 200,
    align: 'center',
    editRender: {},
  },
  {
    prop: 'companyId',
    label: '作业公司',
    modelLabel: 'companyName',
    selectLabel: 'label',
    selectValue: 'value',
    editType: 'select',
    width: 200,
    align: 'center',
    editRender: {},
    selectData: [
      { label: '潍坊港区散货码头有限公司', value: '1677242790846795776' },
      { label: '潍坊港西作业区码头有限公司', value: '1677242971285753856' },
      { label: '山东港口集团潍坊港有限公司', value: '1677243099354632192' },
    ],
  },
  {
    prop: 'cargoOwnerId',
    label: '货主',
    modelLabel: 'cargoOwnerName',
    selectLabel: 'label',
    selectValue: 'value',
    editType: 'remoteSelect',
    type: 'CUSTOMER_CARGO_OWNER',
    width: 200,
    align: 'center',
    editRender: {},
  },
  {
    prop: 'cargoCode',
    label: '货名',
    modelLabel: 'cargoName',
    selectLabel: 'label',
    selectValue: 'value',
    editType: 'remoteSelect',
    type: 'CARGO_INFO_SIGN',
    width: 160,
    editRender: {},
    align: 'left'
  },
  {prop: 'cargoInfoNo', label: '票货号', width: 150, align: 'left',editRender: {},editType: 'input'},
  {prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left'},
  {
    prop: 'equipmentNamesFront',
    label: '前沿',
    width: 180,
    align: 'canter',
    render: row => {
      return [
        h(MechanicalType, {
          value: row.equipmentNamesFront,
          workPlanId: row.id,
          workPositionCode: '01',
          disabled: row.rowDisabled,
          onChange: data => {
            row.equmentListFront = data
          },
          'onUpdate:value': val => {
            row.equipmentNamesFront = val
          },
        }),
      ]
    },
  },
  {
    prop: 'equipmentNamesReshipment',
    label: '转运',
    modelLabel: 'moveInBerthName',
    width: 180,
    align: 'canter',
    render: row => {
      return [
        h(MechanicalType, {
          value: row.equipmentNamesReshipment,
          workPlanId: row.id,
          workPositionCode: '03',
          disabled: row.rowDisabled,
          onChange: data => {
            row.equmentListReshipment = data
            // console.log(data, 'data')
          },
          'onUpdate:value': val => {
            row.equipmentNamesReshipment = val
          },
        }),
      ]
    },
  },
  {
    prop: 'equipmentNamesBack',
    label: '后场',
    width: 180,
    align: 'canter',
    render: row => {
      return [
        h(MechanicalType, {
          value: row.equipmentNamesBack,
          workPlanId: row.id,
          disabled: row.rowDisabled,
          workPositionCode: '02',
          onChange: data => {
            row.equmentListBack = data
          },
          'onUpdate:value': val => {
            row.equipmentNamesBack = val
          },
        }),
      ]
    },
  },
  {prop: 'dispatchByName', label: '调度员', width: 70, align: 'left'},
  {
    prop: 'quantityPlan',
    label: '计划件数',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'center',
  },
  {
    prop: 'tonPlan',
    label: '计划重量',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'center',
  },
  {
    prop: 'startTimePlan',
    label: '计划开工时间',
    editType: 'datetime',
    editRender: {},
    width: 160,
    align: 'center',
  },
  {
    prop: 'endTimePlan',
    label: '计划完工时间',
    editType: 'datetime',
    editRender: {},
    width: 160,
    align: 'center',
  },
  {
    prop: 'laborNum',
    label: '装卸队',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'center',
  },
  {
    prop: 'remark',
    label: '备注',
    editType: 'input',
    editRender: {},
    width: 100,
    align: 'left',
  },
  // {prop: 'remark', label: '备注', width: 140, align: 'left'},
])
//查询参数
const queryParams = ref({
  planType: '1',
  pageSize: 10,
  workDate: '',
  classCode: '',
})
// tab
const tabActiveName = ref('1')
const handleClick = async tab => {
  let newProcessFlag = false;
  await publicApi.getSystemParams({key: "NEW_PROCESS"}).then(res => {
      if(res.data==null){
        proxy.$message.error("缺少系统参数")
      }else{
        let data = res.data;
        newProcessFlag = data.paramVal == "Y" ? true : false;
      }
  })
  if (tab.index === '0') {
    queryParams.value.planType = '1'
    buttonList.value = shipButtonList.value
    dropdownSelect.value = shipDropdownSelect.value
    api.getNormalProcessByType(queryParams.value.planType).then(res => {
      processNameList.value.splice(0, processNameList.value.length)
      if (newProcessFlag) {
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].newProcess == '1') {
            processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
          }
        }
      } else {
        for (var i = 0; i < res.data.length; i++) {
          processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
        }
      }
    })
  }
  else if (tab.index === '1') {
    queryParams.value.planType = '4'
    buttonList.value = buttonLists.value
    dropdownSelect.value = []
    api.getNormalProcessByType2({planType: queryParams.value.planType, dictValue: "0002"}).then(res => {
      processNameList.value.splice(0, processNameList.value.length)
      if (newProcessFlag) {
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].newProcess == '1') {
            processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
          }
        }
      } else {
        for (var i = 0; i < res.data.length; i++) {
          processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
        }
      }
    })
  } else if (tab.index === '2') {
    queryParams.value.planType = '2'
    buttonList.value = setSparseLists.value
    dropdownSelect.value = sparseDropdownSelect.value
    api.getNormalProcessByType(queryParams.value.planType).then(res => {
      processNameList.value.splice(0, processNameList.value.length)
      if (newProcessFlag) {
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].newProcess == '1') {
            processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
          }
        }
      } else {
        for (var i = 0; i < res.data.length; i++) {
          processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
        }
      }
    })
  } else if (tab.index === '3') {
    queryParams.value.planType = '3'
    buttonList.value = transportButtonList.value
    dropdownSelect.value = transportDropdownSelect.value
    api.getNormalProcessByType(queryParams.value.planType).then(res => {
      processNameList.value.splice(0, processNameList.value.length)
      if (newProcessFlag) {
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].newProcess == '1') {
            processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
          }
        }
      } else {
        for (var i = 0; i < res.data.length; i++) {
          processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
        }
      }
    })
  }
  checkboxList.value = [] //多选已选中清空
  getList(queryParams.value)
}
const handleBlur = (val, rowData, title) => {
  if (title == '装卸队') {
    let a = /^\d{0,7}?$/
    if (!a.test(rowData.laborNum)) {
      proxy.$modal.msgWarning('装卸队请输入整数！')
      rowData.laborNum = ''
      return
    }
  }
}
// 获取默认当前时间班次
const getCurrentShiftClassInfo = async () => {
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
  getList(queryParams.value)
}
// 列表数据
const getList = async e => {
  if (e.isClear != null || e.isClear != '') {
    e.isClear = ''
  }
  queryParams.value = Object.assign(queryParams.value, e)
  if (!queryParams.value.workDate || !queryParams.value.classCode) {
    proxy.$modal.msgError('请选择日期和班次')
    return
  }
  await api.reqGetWorkPlanList(queryParams.value).then(res => {
    tableData.value = res.data.map(item => {
      if (item.hatch) {
        item.hatch = item.hatch.split(',')
      }
      if (item.status >= 20) {
        item.rowDisabled = true
      }
      return item
    })
    checkboxList.value = []
  })
}

// 可编辑列表验证
const editRules = ref({
  quantityPlan: proxy.getRules({required: false, message: '计划件数必须填写'}),
})
// 更新理货员派工
const updateTally = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择数据再进行派工')
    return
  }
  tallyUpdateDrawer.value = true
  nextTick(() => {
    tallyUpdateRef.value.resetForm()
    if (checkboxList.value.length == 1) {
      let tmpPlanIds = checkboxList.value.map(item => item.id)
      tallyUpdateRef.value.formData.id = tmpPlanIds[0]
      tallyUpdateRef.value.formData.updateType = '1'
      ;(tallyUpdateRef.value.formData.frontTallyBy = ''),
        (tallyUpdateRef.value.formData.frontTallyByName = ''),
        (tallyUpdateRef.value.formData.backTallyBy = ''),
        (tallyUpdateRef.value.formData.backTallyByName = '')
      tallyUpdateRef.value.planType = queryParams.value.planType
      api.getDetail(tmpPlanIds[0]).then(res => {
        // proxy.setFormData(tallyDetailRef.value.formData, res.data),
        tallyUpdateRef.value.formData.frontTallyBy = res.data.frontTallyBy ? res.data.frontTallyBy.split(',') : []
        tallyUpdateRef.value.formData.frontTallyByName = res.data.frontTallyByName ? res.data.frontTallyByName.split(',') : []
        tallyUpdateRef.value.formData.backTallyBy = res.data.backTallyBy ? res.data.backTallyBy.split(',') : []
        tallyUpdateRef.value.formData.backTallyByName = res.data.backTallyByName ? res.data.backTallyByName.split(',') : []
      })
    } else {
      return
    }
  })
}
//理货员派工保存按钮
const tallyUpdateSave = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择数据再进行派工')
    return
  }
  tallyUpdateRef.value.formData.updateType = '1'
  proxy.$modal.confirm('确定保存？').then(res => {
    let frontTallyBy = tallyUpdateRef.value.formData.frontTallyBy
    let frontTallyByName = tallyUpdateRef.value.formData.frontTallyByName
    let backTallyBy = tallyUpdateRef.value.formData.backTallyBy
    let backTallyByName = tallyUpdateRef.value.formData.backTallyByName

    const params = {
      planIds: checkboxList.value.map(item => item.id),
      updateType: tallyUpdateRef.value.formData.updateType,
      frontTallyBy: frontTallyBy ? frontTallyBy.join(',') : '',
      frontTallyByName: frontTallyByName ? frontTallyByName.join(',') : '',
      backTallyBy: backTallyBy ? backTallyBy.join(',') : '',
      backTallyByName: backTallyByName ? backTallyByName.join(',') : '',
    }
    api.tallYUpdateSave(params).then(res => {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
      tallyUpdateDrawer.value = false
      tallyUpdateRef.value.formData.id = ''
      tempId.value = ''
    })
  })
}
// 更新场地派工
const updateMass = row => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择数据再进行派工')
    return
  }
  massUpdateDrawer.value = true
  nextTick(async () => {
    massUpdateRef.value.resetForm()
    //之选中一条的情况
    massUpdateRef.value.planType = queryParams.value.planType
    if (checkboxList.value.length == 1) {
      let tmpPlanIds = checkboxList.value.map(item => item.id)
      massUpdateRef.value.formData.locationListSource = []
      massUpdateRef.value.formData.locationListTarget = []
      await api.getDetail(tmpPlanIds[0]).then(res => {
        proxy.setFormData(massUpdateRef.value.formData, res.data)
        massUpdateRef.value.formData.regionIdsSource = res.data.regionIdsSource
        massUpdateRef.value.formData.regionIdsTarget = res.data.regionIdsTarget
        tempId.value = ''
      })
      //计划默认指派位置场地
        api.getMassIdsWithPlanId(tmpPlanIds[0],'NO').then(res => {
          //集港赋值目标位置
          if (res.data != null && res.data.length > 0) {
            if (
              res.data[0].planType == '集港' && (massUpdateRef.value.formData.regionIdsTarget.length <= 0)
            ) {
              massUpdateRef.value.formData.regionIdsTarget = res.data.map(item => item.value)
              //疏港赋值源垛位
            } else if (
              res.data[0].planType == '疏港' && (massUpdateRef.value.formData.regionIdsSource.length <= 0)
            ) {
              massUpdateRef.value.formData.regionIdsSource = res.data.map(item => item.value)
            }
            //船舶计划赋值作业位置
            else {
              console.log(row, "row");
              if ((res.data[0].sourceCd == '05' || res.data[0].sourceCd == '06') && (massUpdateRef.value.formData.regionIdsSource.length <= 0)) {
                massUpdateRef.value.formData.regionIdsSource =  massUpdateRef.value.formData.regionIdsSource==''? res.data.map(item => item.value):massUpdateRef.value.formData.regionIdsSource

              }
              if ((res.data[0].targetCd == '05' || res.data[0].targetCd == '06') && (massUpdateRef.value.formData.regionIdsTarget.length <= 0)) {
                massUpdateRef.value.formData.regionIdsTarget = massUpdateRef.value.formData.regionIdsTarget==null ?res.data.map(item => item.value):massUpdateRef.value.formData.regionIdsTarget

              }
            }
          }
        })
      //多选不默认指派，也不回显位置
    } else {
      massUpdateRef.value.formData.locationListSource = []
      massUpdateRef.value.formData.locationListTarget = []
      return
    }
  })
}
const lgUpdateMass = row => {
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请选择数据再进行派工')
    return
  }
  lgDrawerVisible.value = true
  nextTick(async () => {
    lgDrawerRef.value.resetForm()
    //之选中一条的情况
    lgDrawerRef.value.planType = queryParams.value.planType
    console.log(11111111111111)
    console.log(lgDrawerRef.value.planType)
    console.log(33333333333333)
    if (checkboxList.value.length == 1) {
      let tmpPlanIds = checkboxList.value.map(item => item.id)
      lgDrawerRef.value.formData.locationListSource = []
      lgDrawerRef.value.formData.locationListTarget = []
      await api.getDetail(tmpPlanIds[0]).then(res => {
        proxy.setFormData(lgDrawerRef.value.formData, res.data)
        lgDrawerRef.value.formData.regionIdsSource = res.data.regionIdsSource
        lgDrawerRef.value.formData.regionIdsTarget = res.data.regionIdsTarget
        tempId.value = ''
      })
      //集疏港默认计划指派位置场地
      if (tabActiveName.value == '2') {
        api.getMassIdsWithPlanId(tmpPlanIds[0],'NO').then(res => {
          //集港赋值目标位置
          if (res.data.length > 0) {
            if (
              res.data[0].planType == '集港' && (lgDrawerRef.value.formData.regionIdsTarget.length <= 0)
            ) {
              lgDrawerRef.value.formData.regionIdsTarget = res.data.map(item => item.value)
              //疏港赋值源垛位
            } else if (
              res.data[0].planType == '疏港' && (lgDrawerRef.value.formData.regionIdsSource.length <= 0)
            ) {
              lgDrawerRef.value.formData.regionIdsSource = res.data.map(item => item.value)
            }
          }
        })
      }
      //多选不默认指派，也不回显位置
    } else {
      lgDrawerRef.value.formData.locationListSource = []
      lgDrawerRef.value.formData.locationListTarget = []
      return
    }
  })
}
// 更新场地派工 保存
const massUpdateSave = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  massUpdateRef.value.formData.updateType = '2'
  proxy.$modal.confirm('确定保存？').then(async res => {
    const params = {
      planIds: checkboxList.value.map(item => item.id),
      updateType: massUpdateRef.value.formData.updateType,
      locationListSource: massUpdateRef.value.formData.locationListSource,
      locationListTarget: massUpdateRef.value.formData.locationListTarget,
    }

    if (
      (params.locationListSource == null || params.locationListSource.length < 1) &&
      (params.locationListTarget == null || params.locationListTarget.length < 1)
    ) {
      proxy.$message.warning('请至少选择一个位置！')
      return
    }
    if (checkboxList.value.length == 1){

      let tmpFlag =false
      await api.getMassIdsWithPlanId(params.planIds[0],'YES').then(res => {
        if ((res.data[0].sourceCd == '05' || res.data[0].sourceCd == '06') && (params.locationListSource == null || params.locationListSource.length < 1) ) {
          proxy.$message.error("源垛位必填")
          tmpFlag=true
        }
        if ((res.data[0].targetCd == '05' || res.data[0].targetCd == '06') &&  (params.locationListTarget == null || params.locationListTarget.length < 1)) {
          proxy.$message.error("目标垛位必填")
          tmpFlag=true
        }
      })
      if(tmpFlag){
        return;
      }
    }
    api.massUpdateSave(params).then(res => {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
      massUpdateDrawer.value = false
      massUpdateRef.value.formData.id = ''
      tempId.value = ''
    })
  })
}
const lgMassUpdateSave = async () => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  lgDrawerRef.value.formData.updateType = '2'
  proxy.$modal.confirm('确定保存？').then(res => {
    const params = {
      planIds: checkboxList.value.map(item => item.id),
      updateType: lgDrawerRef.value.formData.updateType,
      locationListSource: lgDrawerRef.value.formData.locationListSource,
      locationListTarget: lgDrawerRef.value.formData.locationListTarget,
    }

    if (
      (params.locationListSource == null || params.locationListSource.length < 1) &&
      (params.locationListTarget == null || params.locationListTarget.length < 1)
    ) {
      proxy.$message.warning('请至少选择一个位置！')
      return
    }
    api.massUpdateSave(params).then(res => {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
      lgDrawerVisible.value = false
      lgDrawerRef.value.formData.id = ''
      tempId.value = ''
    })
  })
}

const init = () => {
  //获取舱口的列表并转为字符串
  let dataList = []
  for (let i = 1; i <= 10; i++) {
    dataList.push({label: String(i), value: String(i)})
  }
  if (tabActiveName.value == '1') {
    proxy.setEditTableOptions(shipTableColumns.value, {hatch: dataList})
  }
  api.getNormalProcessByType('1').then(res => {
    processNameList.value.splice(0, processNameList.value.length)
    for (var i = 0; i < res.data.length; i++) {
      processNameList.value.push({label: res.data[i].label, value: res.data[i].value})
    }
  })
}
init()
getCurrentShiftClassInfo()
</script>

<style lang="scss" scoped></style>
