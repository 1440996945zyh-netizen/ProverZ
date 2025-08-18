<template>
  <div class="box app-container">
    <div class="right">
      <SearchHeader
        ref="SearchHeaderRef"
        class="tab_header"
        :selectData="selectData"
        @searchClick="getList"
        :endSelect="endSelect"
        :buttonList="buttonList"
        @handleChange="handleChange"
      />
      <el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="预到" name="00"></el-tab-pane>
        <el-tab-pane label="锚地" name="10"></el-tab-pane>
        <el-tab-pane label="在港" name="20"></el-tab-pane>
        <el-tab-pane label="离港" name="30"></el-tab-pane>
      </el-tabs>
      <BaseTable
        :tableHeight="tableHeight"
        v-if="tabActiveName === '00'"
        ref="baseTable"
        class="tab_table"
        :tableColumns="yvBaoColumns"
        :tableData="tableData"
        :searchClick="getList"
        :cellClickEvent="cellClickEvent"
        :total="total"
        style="margin: 10px 0 5px 5px"
      />
      <BaseTable
        v-if="tabActiveName === '10'"
        ref="baseTable"
        class="tab_table"
        :tableColumns="maoDiColumns"
        :tableData="tableData"
        :searchClick="getList"
        :cellClickEvent="cellClickEvent"
        :tableHeight="tableHeight"
        :total="total"
        style="margin: 10px 0 5px 5px"
      />
      <BaseTable
        v-if="tabActiveName === '20'"
        ref="baseTable"
        class="tab_table"
        :tableColumns="zaiGangColumns"
        :tableData="tableData"
        :searchClick="getList"
        :cellClickEvent="cellClickEvent"
        :tableHeight="tableHeight"
        :total="total"
        style="margin: 10px 0 5px 5px"
      />
      <BaseTable
        v-if="tabActiveName === '30'"
        ref="baseTable"
        class="tab_table"
        :tableColumns="liGangColumns"
        :tableData="tableData"
        :searchClick="getList"
        :cellClickEvent="cellClickEvent"
        :tableHeight="tableHeight"
        :total="total"
        style="margin: 10px 0 5px 5px"
      />
    </div>
    <el-drawer v-model="shipDynamicsVisible" title="船舶动态" size="65%">
      <shipDynamics ref="shipDynamicsRef" @deleteDynamics="deleteDynamics" />
      <div style="margin-top: 30px">
        <shipDoor ref="shipDynamicsRef_door" />
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button v-hasPermi="['dispatch:boatingDispatch:export']" type="primary" @click="exportExcel">
            导出门机记录
          </el-button>
          <el-button @click="shipDynamicsClose">取消</el-button>
        </div>
      </template>
    </el-drawer>
    <el-drawer title="动态跟踪" v-model="dynamicTrackingVisible" size="65%">
      <dynamicTracking :clickRow="clickRow" :dynamicType="dynamicType" ref="dynamicTrackingRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="dynamicTrackingVisible = false">取消</el-button>
          <el-button v-hasPermi="['dispatch:boatingDispatch:leavePlan']" type="primary" @click="saveDynamicTracking">
            保存
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="boatingDispatch">

import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import panel from './panel/index.vue' // 船时效率
import shipDynamics from './shipDynamics/index.vue' // 船舶动态
import shipDoor from './shipDoor/index.vue' // 门机记录
import dynamicTracking from './dynamicTracking/index.vue' // 动态跟踪
import api from '@/api/dispatch/boatingDispatch/index.js'
import publicApi from '@/api/public/index.js'
import urlOpen from '@/assets/images/open.png'
import urlClose from '@/assets/images/close.png'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
import {ElButton, ElInput, ElTag} from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'
import {useRoute} from "vue-router";
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 左侧--------------------------------------------------------------------------------------------
const extraData = ref('预到0 锚地0 在港0') // 船舶信息
const isFold = ref(false) // 是否为展开状态
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight + 130
const foldNav = () => {
  // 切换展开状态
  // isFold.value = !isFold.value
}
let itemShipName = ref(null)
const openUrl = ref(urlOpen)
const closeUrl = ref(urlClose)
const statusData = reactive([
  // 船舶状态列表综合
  { title: '预报', dynamicTypeCode: '1', dynamicTime: '--/-/- --:--', type: 'primary', icon: 'MoreFilled' },
  { title: '接收', dynamicTypeCode: '2', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '#0bbd87' },
  { title: '抵锚', dynamicTypeCode: '3', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '' },
  { title: '起锚', dynamicTypeCode: '4', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '' },
  { title: '靠泊', dynamicTypeCode: '5', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '' },
  { title: '开工', dynamicTypeCode: '6', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '' },
  { title: '完工', dynamicTypeCode: '7', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '' },
  { title: '离泊', dynamicTypeCode: '8', dynamicTime: '--/-/- --:--', type: '', icon: '', color: '' },
  { title: '特殊停泊费', dynamicTypeCode: '9', dynamicTime: '--/-/- --:--', type: '', icon: '', color: ''},
])
// 右侧--------------------------------------------------------------------------------------------
const tabActiveName = ref('00')
const SearchHeaderRef = ref()
const selectData = reactive([
  {
    name: '船名',
    type: 'input',
    modelValue: 'shipName',
    span: 8,
  },
  {
    name: '航次',
    type: 'input',
    modelValue: 'voyage',
    span: 8
  },
  {
    name: '货种名称',
    type: 'input',
    modelValue: 'cargoCategoryName',
    span: 8,
    // isHidden:true,
  },
  {
    name: '离港时间',
    vif: false,
    type: 'portTime', // 搜索框类型
    modelValue: 'timeRange', // 绑定字段
    span: 8,
  },
  {
    name: 'time',
    isHidden:true,
    type: 'input', // 搜索框类型
    modelValue: 'time', // 绑定字段
    span: 8,
  }
])
/*
const selectData = reactive([
	{
		name: '船名航次',
		type: 'remoteSelect',
		modelValue: 'shipId',
		span: 24,
		dataType: 'SHIP',
	},
])
*/

const queryParams = ref({
  startPage: 1,
  pageSize: 10,
  shipStatusBroadCode: '00',
})
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
  if("30"!=queryParams.value.shipStatusBroadCode){
    queryParams.value.timeRange=[];
  }
  api.reqGetBoat(queryParams.value).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}
const buttonList = reactive([
  {
    label: '船舶动态', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Flag', // 按钮图标，支持element-Plus中所有图标
    click: () => getShipDynamics(), // 回调函数
    permission: 'dispatch:boatingDispatch:query', // 权限
  },
])
// 船舶动态--------------------------------------------------------------------------------
const shipDynamicsRef = ref(null) // 船舶动态ref
const shipDynamicsRef_door = ref(null) // 船舶动态ref
const shipDynamicsVisible = ref(false)
// 获取点击行对应状态
const getBoatStatus = row => {
  endSelect[0].selectData.forEach(item => {
    if(row.shipStatusName === '特殊停泊费'){
      item.disabled = false
    }else{
      item.disabled = true
    }
  })
  if(endSelect[0].selectData.length>0){
    endSelect[0].selectData[endSelect[0].selectData.length-1].disabled = false
  }
  if (row.shipStatusName === '接收') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '30' || item.dictValue === '50') {
        item.disabled = false
        return item
      }
    })
  } else if (row.shipStatusName === '抵锚') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '50') {
        item.disabled = false
        return item
      }
    })
  }
  else if (("1" == row.isStartWork || null == row.isStartWork) &&  row.shipStatusName === '靠泊') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '60' || item.dictValue === '70' || item.dictValue === '110') {
        item.disabled = false
        return item
      }
    })
  }
  else if ("0" == row.isStartWork && (row.shipStatusName === '靠泊' || row.shipStatusName === '移泊' )) {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '60' || item.dictValue === '110' || item.dictValue === '120') {
        item.disabled = false
        return item
      }
    })
  }
  else if (row.shipStatusName === '开工' || row.shipStatusName === '复工') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '80' || item.dictValue === '100') {
        item.disabled = false
        return item
      }
    })
  } else if (row.shipStatusName === '停工') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '60' || item.dictValue === '90' || item.dictValue === '110') {
        item.disabled = false
        return item
      }
    })
  } else if (row.shipStatusName === '完工') {
    // if (row.loadUnload === '装卸' && row.allowStartWork) {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '60' || item.dictValue === '70' || item.dictValue === '110' || item.dictValue === '120') {
        item.disabled = false
        return item
      }
    })
    // }
  } else if (row.shipStatusName === '离泊') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '120' || item.dictValue === '50') {
        item.disabled = false
        return item
      }
    })
  } else if (row.shipStatusName === '离港') {
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '0') {
        item.disabled = false
        return item
      }
    })
  } else {
    // 其他情况只能离泊
    endSelect[0].selectData.map(item => {
      if (item.dictValue === '110' || item.dictValue === '120') {
        item.disabled = false
        return item
      }
    })
  }
}
const clickRow = ref({})
const stepActive = ref(0)
const shipDynamicsData = ref([])
const shipDoorData = ref([])
// 点击行，获取对应船状态
const loadUnloads = ref([])
const cellClickEvent = async ({ row }) => {
  loadUnloads.value = []
  if(row.in){
    loadUnloads.value.push({
      value:row.in.id,
      label:row.in.loadUnload,
    })
  }
  if(row.out){
    loadUnloads.value.push({
      value:row.out.id,
      label:row.out.loadUnload,
    })
  }
  itemShipName.value = row.shipName
  stepActive.value = 0
  clickRow.value = row
  getBoatStatus(row)
  statusData.forEach(item => {
    item.dynamicTime = '--/-/- --:--'
    item.type = ''
    item.icon = ''
    item.color = ''
  })
  // 获取新状态
  const params = { shipvoyageId: row.id }
  const res = await api.reqGetBoatStatus(params) // 获取船动态
  shipDynamicsData.value = res.data

  const doorRes = await api.doorStatus(params) // 获取船动态
  shipDoorData.value = doorRes.data
  // 如果预报状态，则预报亮
  if (res.data.length === 0) {
    statusData[0].type = 'primary'
    statusData[0].icon = 'MoreFilled'
    statusData[1].color = '#0bbd87'
  } else {
    // 将时间赋值，并且拿到当前步数
    res.data.forEach(item => {
      statusData.forEach((i, index) => {
        if (item.dynamicTypeName === i.title) {
          i.dynamicTime = item.dynamicStartTime
          stepActive.value = Math.max(index + 1, stepActive.value)
        }
      })
    })
    statusData[0].dynamicTime = row.createTime
    statusData[1].dynamicTime = row.receiveTime
  }

  // 根据最大步数去将前面的上色
  statusData.forEach((item, index) => {
    if (index < stepActive.value) {
      item.type = 'primary'
      item.icon = 'MoreFilled'
    }
  })
  if (stepActive.value > 0) statusData[stepActive.value - 1].color = '#0bbd87'
}
// 打开船舶动态抽屉
const getShipDynamics = (row) => {
  shipDynamicsVisible.value = true
  nextTick(() => {
    shipDynamicsRef.value.tableData = shipDynamicsData.value // 给子组件的queryParams赋值
    shipDynamicsRef_door.value.tableData = shipDoorData.value // 给子组件的queryParams赋值
    for(let index in shipDynamicsRef.value.tableData){
      shipDynamicsRef.value.tableData[index]["shipName"] = itemShipName.value.slice(0,itemShipName.value.indexOf("_"));
    }
  })
}
const endSelect = reactive([
  {
    name: '动态跟踪',
    type: 'select',
    modelValue: 'dynamiTracking',
    selectValue: 'dictValue',
    selectLabel: 'dictLabel',
    selectData: [],
  },
])
// 获取船舶动态字典数据
const getShipStatus = async () => {
  const res = await publicApi.getDictListByType('SHIPSTATUS')
  endSelect[0].selectData = res.data
    .filter(item => Number(item.dictValue) > 25)
    .map(item => {
      if(item.value == "130"){
        item.disabled = false
      }else{
        item.disabled = true
      }
      // if(row.shipStatusName === '特殊停泊费')[
      //
      // ]
      return item
    })
  endSelect[0].selectData = endSelect[0].selectData.filter(item => {
    return !['70', '80', '90', '100'].includes(item.dictValue);
  });
}
getShipStatus()
const dynamicTrackingVisible = ref(false)
const dynamicType = ref('') // 动态代码
const dynamicTrackingRef = ref(null)
// 选择动态打开抽屉--------------------------------------------------------------------------
const handleChange = (i, data) => {
  const open = () => {
    dynamicTrackingVisible.value = true
    dynamicType.value = i
    let dynamicTypeName = ''
    data.forEach(item => {
      if (item.dictValue === i) {
        dynamicTypeName = item.dictLabel
      }
    })
    nextTick(() => {
      dynamicTrackingRef.value.resetForm()
      dynamicTrackingRef.value.resetLoadUnload()
      dynamicTrackingRef.value.loadUnloads = loadUnloads.value
      dynamicTrackingRef.value.formData.dynamicTypeName = dynamicTypeName
      dynamicTrackingRef.value.formData.dynamicTypeCode = i
      dynamicTrackingRef.value.formData.isStandardUse = '1'
      dynamicTrackingRef.value.formData.shipvoyageId = clickRow.value.id
      dynamicTrackingRef.value.formData.shipvoyageItemId =
        clickRow.value.nextLoadUnload === '卸' ? (clickRow.value.in?clickRow.value.in.id:null) : (clickRow.value.out?clickRow.value.out.id:null)
      dynamicTrackingRef.value.formData.voyage =
        clickRow.value.nextLoadUnload === '卸' ? (clickRow.value.in?clickRow.value.in.voyage:null) : (clickRow.value.out?clickRow.value.out.voyage:null)
      SearchHeaderRef.value.resetSearch('dynamiTracking') // 清空动态选择
      // if (i === '60') dynamicTrackingRef.value.formData.beforeBerthNo = clickRow.value.berthName // 移泊
      // if (i === '50' || i === '60') dynamicTrackingRef.value.formData.berthType = clickRow.value.berthType //靠泊或一移泊,给默认舷靠/
      if (i === '70' || i === '80' || i === '90' || i === '100'|| i === '130')
        dynamicTrackingRef.value.formData.loadUnload = clickRow.value.nextLoadUnload //开工停工完工复工需要装卸
    })
  }
  if (i === '50' && tabActiveName.value === '00') {
    proxy.$modal
      .confirm('是否直靠？')
      .then(() => {
        open()
      })
      .catch(() => {
        proxy.$modal.msgInfo('已取消直靠')
      })
  } else {
    open()
  }
}
// 保存船舶动态
const saveDynamicTracking = async () => {
  if (await dynamicTrackingRef.value.validate()) {
    const params = JSON.parse(JSON.stringify(dynamicTrackingRef.value.formData)) // 取到子组件的formData
    params.tugs = dynamicTrackingRef.value.tableData.filter(item => {
      if (item.tugName) {
        return item
      }
    })
    proxy.$modal.confirm('是否保存？').then(() => {
      api.reqAddShipDynamic(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        dynamicTrackingVisible.value = false
        getList(queryParams.value)
      })
    })
  }
}
const deleteDynamics = () => {
  // shipDynamicsVisible.value = false
  //重新获取船舶动态列表
  // getList(queryParams.value)
}
//导出
const exportExcel =()=>{
  api.exportExcel(clickRow.value.id).then(res => {
    downLoadBlob(res, '门机记录')
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

// tabs--------------------------------------------------------------------------------------------
const handleClick = (tab,event) => {
  if (tab.index === '0' || tab === '0') {
    queryParams.value.shipStatusBroadCode = '00'
    selectData[3].vif= false;
  } else if (tab.index === '1' || tab === '1') {
    queryParams.value.shipStatusBroadCode = '10'
    selectData[3].vif= false;
  } else if (tab.index === '2' || tab === '2') {
    queryParams.value.shipStatusBroadCode = '20'
    selectData[3].vif= false;
  } else if (tab.index === '3' || tab === '3') {
    selectData[3].vif= true;
    queryParams.value.shipStatusBroadCode = '30'
  }
  queryParams.value = Object.assign(queryParams.value,SearchHeaderRef.value.searchData)
  getList(queryParams.value)
}

const route = useRoute()
const tabIndex = route.query.tabIndex
const tmpQueryTime = route.query.time

// table--------------------------------------------------------------------------------------------
const baseTable = ref() // table的ref
const total = ref(0) // 数据总数
// 表格数据
const tableData = ref([])
const yvBaoColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    label: '船名航次',
    prop: 'shipName',
    align: 'left',
    width: 150,
    render: row => {
      return [
        h(
          'div',
          {
            onClick: () => {
              edit(row)
            },
            style: 'color: #409eff;cursor: pointer;',
          },
          row.shipName.split("_")[0] + "_" +
          ((row.in ? row.in.voyage : '') == null ? '' : row.in ? row.in.voyage : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.voyage : '') == null ? '' : row.out ? row.out.voyage : '')
        ),
      ]
    },
  },
  { prop: 'scn', label: 'SCN',width: 90 ,align: 'left'},
  {
    prop: 'shipStatusName',
    label: '状态',
    align: 'left',
    width: 80,
    // fixed: 'right',
    render: row => {
      let type = 'info'
      if (row.shipStatusName === '预报') {
        type = ''
      } else if (row.shipStatusName === '作废') {
        type = 'danger'
      }
      return [
        h(
          ElTag,
          {
            type,
          },
          {
            default: () => row.shipStatusName,
          }
        ),
      ]
    },
  },
  { prop: 'loadUnload', label: '装卸', width: 80 , align: 'left'},
  { prop: 'tradeType', label: '贸别', align: 'left', width: 80 },
  {
    prop: 'cargoCategoryName',
    label: '货名',
    align: 'left',
    width: 150,
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.cargoCategoryName : '') == null ? '' : row.in ? row.in.cargoCategoryName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.cargoCategoryName : '') == null ? '' : row.out ? row.out.cargoCategoryName : '')
        ),
      ]
    },
  },
  {
    prop: 'loadUnload',
    label: '货量',
    align: 'left',
    width: 120,
    render: row => {
      return [
        h(
          'div',
          {},
          Number(
            Number((row.in  ? (row.in.cargoNum  ? row.in.cargoNum  : 0) : 0)) +
            Number((row.out ? (row.out.cargoNum ? row.out.cargoNum : 0) : 0))
          )
        ),
      ]
    },
  },
  { prop: 'arrivalTimePlan', label: '预计抵港时间',width: 200,align: 'left'},
  { prop: 'hatchNum', label: '舱口数',width: 100,align: 'left'},
  {
    prop: 'chuandai',
    label: '船代',
    align: 'left',
    width: 210,
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.customerName : '') == null ? '' : row.in ? row.in.customerName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.customerName : '') == null ? '' : row.out ? row.out.customerName : '')
        ),
      ]
    },
  },
  { prop: 'prePortName', label: '来港' ,align: 'left',width: 160},
  { prop: 'nextPortName', label: '往港' ,align: 'left',width: 160},
])
const maoDiColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    label: '船名航次',
    prop: 'shipName',
    align: 'left',
    width: 140,
    render: row => {
      return [
        h(
          'div',
          {
            onClick: () => {
              edit(row)
            },
            style: 'color: #409eff;cursor: pointer;',
          },
          row.shipName.split("_")[0] + "_" +
          ((row.in ? row.in.voyage : '') == null ? '' : row.in ? row.in.voyage : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.voyage : '') == null ? '' : row.out ? row.out.voyage : '')
        ),
      ]
    },
  },
  { prop: 'scn', label: 'SCN',width: 90 ,align: 'left'},
  { prop: 'berthName', label: '泊位', width: 80,align: 'left' },
  {
    prop: 'shipStatusName',
    label: '状态',
    align: 'left',
    width: 80,
    // fixed: 'right',
    render: row => {
      let type = 'info'
      if (row.shipStatusName === '预报') {
        type = ''
      } else if (row.shipStatusName === '作废') {
        type = 'danger'
      }
      return [
        h(
          ElTag,
          {
            type,
          },
          {
            default: () => row.shipStatusName,
          }
        ),
      ]
    },
  },
  { prop: 'loadUnload', label: '装卸', width: 80 , align: 'left'},
  { prop: 'tradeType', label: '贸别', align: 'left', width: 80 },
  {
    prop: 'cargoCategoryName',
    label: '货名',
    align: 'left',
    width: 120,
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.cargoCategoryName : '') == null ? '' : row.in ? row.in.cargoCategoryName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.cargoCategoryName : '') == null ? '' : row.out ? row.out.cargoCategoryName : '')
        ),
      ]
    },
  },
  {
    prop: 'loadUnload',
    label: '货量',
    align: 'left',
    width: 110,
    render: row => {
      return [
        h(
          'div',
          {},
          Number(
            Number((row.in  ? (row.in.cargoNum  ? row.in.cargoNum  : 0) : 0)) +
            Number((row.out ? (row.out.cargoNum ? row.out.cargoNum : 0) : 0))
          )
        ),
      ]
    },
  },
  { prop: 'arrivalAnchorageTime', label: '抵锚时间',width: 170,align: 'left'},
  { prop: 'leaveBerthTime', label: '离泊时间',width: 170,align: 'left'},
  { prop: 'hatchNum', label: '舱口数',width: 90,align: 'left'},
  {
    prop: 'chuandai',
    label: '船代',
    width: 280,
    align: 'left',
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.customerName : '') == null ? '' : row.in ? row.in.customerName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.customerName : '') == null ? '' : row.out ? row.out.customerName : '')
        ),
      ]
    },
  },
  { prop: 'prePortName', label: '来港' ,align: 'left',width: 160},
  { prop: 'nextPortName', label: '往港' ,align: 'left',width: 160},
])
const zaiGangColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    label: '船名航次',
    prop: 'shipName',
    align: 'left',
    width: 140,
    render: row => {
      return [
        h(
          'div',
          {
            onClick: () => {
              edit(row)
            },
            style: 'color: #409eff;cursor: pointer;',
          },
          row.shipName.split("_")[0] + "_" +
          ((row.in ? row.in.voyage : '') == null ? '' : row.in ? row.in.voyage : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.voyage : '') == null ? '' : row.out ? row.out.voyage : '')
        ),
      ]
    },
  },
  { prop: 'scn', label: 'SCN',width: 90 ,align: 'left'},
  { prop: 'berthName', label: '泊位', width: 80,align: 'left' },
  {
    prop: 'shipStatusName',
    label: '状态',
    align: 'left',
    width: 80,
    // fixed: 'right',
    render: row => {
      let type = 'info'
      if (row.shipStatusName === '预报') {
        type = ''
      } else if (row.shipStatusName === '作废') {
        type = 'danger'
      }
      return [
        h(
          ElTag,
          {
            type,
          },
          {
            default: () => row.shipStatusName,
          }
        ),
      ]
    },
  },
  { prop: 'loadUnload', label: '装卸', width: 80 , align: 'left'},
  { prop: 'tradeType', label: '贸别', align: 'left', width: 80 },
  {
    prop: 'cargoCategoryName',
    label: '货名',
    align: 'left',
    width: 150,
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.cargoCategoryName : '') == null ? '' : row.in ? row.in.cargoCategoryName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.cargoCategoryName : '') == null ? '' : row.out ? row.out.cargoCategoryName : '')
        ),
      ]
    },
  },
  {
    prop: 'loadUnload',
    label: '货量',
    align: 'left',
    width: 120,
    render: row => {
      return [
        h(
          'div',
          {},
          Number(
            Number((row.in  ? (row.in.cargoNum  ? row.in.cargoNum  : 0) : 0)) +
            Number((row.out ? (row.out.cargoNum ? row.out.cargoNum : 0) : 0))
          )
        ),
      ]
    },
  },
  { prop: 'berthTime', label: '实际靠泊时间',width: 180,align: 'left'},
  { prop: 'hatchNum', label: '舱口数',width: 100,align: 'left'},
  {
    prop: 'chuandai',
    label: '船代',
    align: 'left',
    width: 280,
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.customerName : '') == null ? '' : row.in ? row.in.customerName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.customerName : '') == null ? '' : row.out ? row.out.customerName : '')
        ),
      ]
    },
  },
  { prop: 'prePortName', label: '来港' ,align: 'left',width: 160},
  { prop: 'nextPortName', label: '往港' ,align: 'left',width: 160},
])
const liGangColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    label: '船名航次',
    prop: 'shipName',
    align: 'left',
    width: 140,
    render: row => {
      return [
        h(
          'div',
          {
            onClick: () => {
              edit(row)
            },
            style: 'color: #409eff;cursor: pointer;',
          },
          row.shipName.split("_")[0] + "_" +
          ((row.in ? row.in.voyage : '') == null ? '' : row.in ? row.in.voyage : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.voyage : '') == null ? '' : row.out ? row.out.voyage : '')
        ),
      ]
    },
  },
  { prop: 'scn', label: 'SCN',width: 90 ,align: 'left'},
  { prop: 'berthName', label: '泊位', width: 80 ,align: 'left'},
  {
    prop: 'shipStatusName',
    label: '状态',
    align: 'left',
    width: 80,
    // fixed: 'right',
    render: row => {
      let type = 'info'
      if (row.shipStatusName === '预报') {
        type = ''
      } else if (row.shipStatusName === '作废') {
        type = 'danger'
      }
      return [
        h(
          ElTag,
          {
            type,
          },
          {
            default: () => row.shipStatusName,
          }
        ),
      ]
    },
  },
  { prop: 'loadUnload', label: '装卸', width: 80 , align: 'left'},
  // 字段顺序：船名+航次、SCN、泊位、状态、装卸、贸别、货名、货量、预抵时间、舱口数、船代、货主、货代、来港->往港、操作
  { prop: 'tradeType', label: '贸别', align: 'left', width: 80 },
  {
    prop: 'cargoCategoryName',
    label: '货名',
    align: 'left',
    width: 150,
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.cargoCategoryName : '') == null ? '' : row.in ? row.in.cargoCategoryName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.cargoCategoryName : '') == null ? '' : row.out ? row.out.cargoCategoryName : '')
        ),
      ]
    },
  },
  {
    prop: 'loadUnload',
    label: '货量',
    align: 'left',
    width: 120,
    render: row => {
      return [
        h(
          'div',
          {},
          Number(
            Number((row.in  ? (row.in.cargoNum  ? row.in.cargoNum  : 0) : 0)) +
            Number((row.out ? (row.out.cargoNum ? row.out.cargoNum : 0) : 0))
          )
        ),
      ]
    },
  },
  { prop: 'leavePortTimePlan', label: '实际离港时间',width: 170,align: 'left'},
  { prop: 'hatchNum', label: '舱口数',width: 100,align: 'left'},
  {
    prop: 'chuandai',
    label: '船代',
    width: 280,
    align: 'left',
    render: row => {
      return [
        h(
          'div',
          {},
          ((row.in ? row.in.customerName : '') == null ? '' : row.in ? row.in.customerName : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.customerName : '') == null ? '' : row.out ? row.out.customerName : '')
        ),
      ]
    },
  },
  { prop: 'prePortName', label: '来港' ,align: 'left',width: 160},
  { prop: 'nextPortName', label: '往港' ,align: 'left',width: 160},
])

const shipDynamicsClose =()=>{
  shipDynamicsVisible.value = false
  getList(queryParams.value)
}
watch(()=> shipDynamicsVisible.value,(newValue,oldValue)=>{
  getList(queryParams.value)
})

// 编辑函数
const edit = (row) => {
  // 这里可以添加编辑逻辑
  console.log('编辑行数据:', row)
}

const clickLoad=()=>{
  if(tabIndex && tabIndex!=null && tabIndex!=undefined){
    tabActiveName.value = tabIndex+"0"
    nextTick(()=>{
      SearchHeaderRef.value.searchData.time = route.query.time
      handleClick(tabIndex)
    })

  }
}
const init=()=>{
  route.query.tabIndex ?clickLoad():
    getList(queryParams.value)
}
init()
</script>
<style lang="scss" scoped>
.box {
  display: flex;
  //justify-content: space-between;

  .left {
    width: 260px;
    height: calc(100vh - 85px);
    display: inline-block;
    white-space: nowrap;
    position: relative;
    transition: all 0.3s;

    &.close {
      width: 0px;

      .content {
        display: none;
      }
    }

    .content {
      overflow-x: hidden;
      height: 100%;

      .left-top {
        height: 40px;
        line-height: 40px;
        padding-left: 10px;
        font-size: 14px;
      }

      .shipData {
        width: 100%;
        height: 150px;
        margin-top: 10px;
      }

      .panel {
        width: 100%;
        height: 200px;
      }

      .step {
        height: calc(100vh - 557px);
        padding: 20px;
        box-sizing: border-box;
        margin-top: 14px;

        :deep(.el-timeline-item) {
          left: 50px;

          :deep(.el-timeline-item__wrapper) {
            height: 43px;
          }
        }

        :deep(.el-timeline-item__content) {
          position: relative;
          top: -1px;
          left: -160px;
          text-align: center;
        }

        :deep(.el-timeline-item__timestamp) {
          position: relative;
          top: -25px;
          left: 0px;
        }
      }
    }

    .fold-wrap {
      position: absolute;
      top: 0;
      right: -16px;
      width: 16px;
      height: 100%;
      display: inline-block;
    }

    .btn-fold {
      font-size: 12px;
      width: 16px;
      padding: 15px 0;
      position: absolute;
      top: 50%;
      right: 0px;
      transform: translateY(-50%);
      cursor: pointer;
      overflow: hidden;
      opacity: 0.8;
    }

    .btn-fold:hover {
      opacity: 1;
      // transform:scale(1.2);//设置缩放比例
      // transform: translateX(10%);
    }
  }

  .right {
    width: 100%;
    height: 100%;
  }

  .close + .right {
    width: calc(100% - 20px);
  }
}
:deep(.el-tabs__header) {
  margin: 0 0 0;
}
</style>
