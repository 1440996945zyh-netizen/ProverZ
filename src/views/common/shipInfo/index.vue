<template style="margin: 0px;padding: 0px !important;">
  <div style="width:100%;height: 755px;margin: 0px;padding:0px;border:solid 1px #DDD">
    <div style="width:100%;height: 100px;padding: 12px 15px 5px 15px">
      <el-steps :active=active finish-status="success">
        <el-step v-for="(item,index) in dataStep" :key="index" :title=item.title :description=item.date></el-step>
      </el-steps>
    </div>
    <div style="width:100%;height: 650px;">
      <el-tabs v-model="activeName" type="border-card" style="padding-left: 0px !important;padding-right: 0px !important;">
        <el-tab-pane name="first" label="门机作业信息">
          <div style="width: 100%;height: 600px;">
            <div style="width: 100%;height: 50px;">
              <el-button-group style="margin: 10px 0px;">
                <el-button :class="{ active: isActive === '卸' }"  @click="changeGroup('卸')">卸</el-button>
                <el-button :class="{ active: isActive === '装' }"   @click="changeGroup('装')">装</el-button>
              </el-button-group>
            </div>
            <div style="border:solid 1px #DDD;width: 100%;height: 540px;overflow-y: auto; margin:0">
              <ShipDoorInfo ref="shipDoorRef"/>
            </div>
          </div>
        </el-tab-pane>
<!--        <el-tab-pane name="second" label="整船进度">-->
<!--          <div style="width: 100%;height: 580px;background-color: #aaa;">整船进度</div>-->
<!--        </el-tab-pane>-->
        <el-tab-pane name="third" label="航次信息" style="margin:0px;padding-top:15px">
          <ShipVoyageInfo ref="shipVoyageRef"/>
        </el-tab-pane>
        <el-tab-pane name="fourth" label="船舶动态" style="margin:0px;padding-top:15px">
          <ShipDynamic ref="shipDynamicRef"/>
        </el-tab-pane>
        <el-tab-pane name="five" label="港存动态" style="margin:0px;padding-top:15px">
          <PortTrends ref="portTrendsRef"/>
        </el-tab-pane>
        <el-tab-pane name="six" label="费用" >
          <CostInfo ref="costRef"/>
        </el-tab-pane>
        <el-tab-pane name="seven" label="过磅明细" >
            <PoundInfo ref="poundRef"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script name="ShipAisBoard" setup>
import {reactive, ref,onBeforeUnmount} from "vue";
import api from "@/api/common/shipInfo/index.js"
import PoundInfo from "@/views/common/shipInfo/poundInfo/index.vue"

const isActive = ref(null);
const activeName = ref('third')

/**
 * 获取船舶进度条...
 * @type {*}
 */
const active = ref(0)
let steps = reactive([
  { title:"步骤1",date:"" },
  { title:"步骤2",date:"" },
  { title:"步骤3",date:"" },
  { title:"步骤4",date:"" },
  { title:"步骤5",date:"" },
  { title:"步骤6",date:"" },
  { title:"步骤7",date:"" },
])
const dataStep = ref([]);

const getSteps=shipVoyageId=>{
  dataStep.value = []
  api.getSteps({shipVoyageId:shipVoyageId}).then(res=>{
    let data = res.data;
    active.value = Number(data.stepIndex);
    data.stepList.forEach(x=>{
      console.log(x.date)
      if(x.date != undefined )
        dataStep.value.push(x)
    })
    console.log(dataStep.value)
  })
}

/**
 * 获取航次信息
 */
import ShipVoyageInfo from "@/views/common/shipInfo/shipVoyageInfo/index.vue"
import ShipDoorInfo from "@/views/common/shipInfo/shipDoorInfo/index.vue"
const shipVoyageRef = ref()
const shipVoyageInfo = ref({})
const inInfo = ref({
  id:'',
  impExp: '',
  voyage: '',
  tradeType: '',
  loadUnload: '',
  companyId: '',
  companyName: '',
  cargoCategoryCode: '',
  cargoCategoryName: '',
  cargoNum: '',
  customerId: '',
  customerName: '',
  contacts: '',
  shipPhone: '',
  paymentAmount: '',
  remark: '',
  preChangeShipName:'',
  preChangeShipNo:'',
  residualAmount:''
})
const outInfo = ref({
  id:'',
  impExp: '',
  voyage: '',
  tradeType: '',
  loadUnload: '',
  companyId: '',
  companyName: '',
  cargoCategoryCode: '',
  cargoCategoryName: '',
  cargoNum: '',
  customerId: '',
  customerName: '',
  contacts: '',
  shipPhone: '',
  paymentAmount: '',
  remark: '',
  residualAmount:''
})
const getShipVoyageInfo=shipVoyageId=>{
  api.getShipVoyageInfo({shipVoyageId:shipVoyageId}).then(res=>{
    shipVoyageRef.value.shipVoyageInfo = {}
    shipVoyageRef.value.inInfo = {
      id:'',
      impExp: '',
      voyage: '',
      tradeType: '',
      loadUnload: '',
      companyId: '',
      companyName: '',
      cargoCategoryCode: '',
      cargoCategoryName: '',
      cargoNum: '',
      customerId: '',
      customerName: '',
      contacts: '',
      shipPhone: '',
      paymentAmount: '',
      remark: '',
      preChangeShipName:'',
      preChangeShipNo:'',
      residualAmount:''
    }
    shipVoyageRef.value.outInfo = {
      id:'',
      impExp: '',
      voyage: '',
      tradeType: '',
      loadUnload: '',
      companyId: '',
      companyName: '',
      cargoCategoryCode: '',
      cargoCategoryName: '',
      cargoNum: '',
      customerId: '',
      customerName: '',
      contacts: '',
      shipPhone: '',
      paymentAmount: '',
      remark: '',
      residualAmount:''
    }
    let data = res.data;
    shipVoyageRef.value.shipVoyageInfo = data
    shipVoyageRef.value.shipVoyageInfo.wharf=data.wharf=='1'?'散杂货':data.wharf=='2'?'液化品':'晨鸣'
    shipVoyageRef.value.shipVoyageInfo.impExp=data.impExp=='IN'?'进口':data.impExp=='OUT'?'出口':'进出口'
    shipVoyageRef.value.shipVoyageInfo.pilotage = data.pilotage=='1'?'自引':data.pilotage=='2'?'引航':data.pilotage=='3'?'进自引出引航':'出引航进自引'
    if(res.data.in){shipVoyageRef.value.inInfo = res.data.in;}
    if(res.data.out){shipVoyageRef.value.outInfo = res.data.out;}
  })
}

/**
 * 获取船舶动态
 */
import ShipDynamic from "@/views/common/shipInfo/shipDynamicInfo/index.vue"
const baseTableRef = ref()
const tableData = ref([])
const tmpShipVoyageId = ref(null)
const tmpLoadUnload = ref('')
// 计算表格高度
const shipDynamicRef = ref()
const shipDoorRef = ref()
const getShipDynamicInfo= async shipVoyageId =>{
  api.getShipDynamicInfo({shipVoyageId:shipVoyageId}).then(res=>{
    if(res.data){
      shipDynamicRef.value.clearData();
      let data = res.data;
      let dynamicDTOS = data.dynamicDTOS;
      let inData = data.inData;
      let outData = data.outData;
      let inStopTime = data.inStopTime;
      let outStopTime = data.outStopTime;
      shipDynamicRef.value.tableData   = dynamicDTOS;
      shipDynamicRef.value.inData      = inData;
      shipDynamicRef.value.outData     = outData;
      shipDynamicRef.value.inStopTime  = inStopTime?inStopTime:"0"
      shipDynamicRef.value.outStopTime = outStopTime?outStopTime:"0"
      shipDynamicRef.value.show()
    }
  })

}

const changeGroup = group=>{
  isActive.value = group
  if(group == '装'){
    tmpLoadUnload.value = '装'
    getShipDoorInfo(tmpShipVoyageId.value,tmpLoadUnload.value)
  }
  if(group == '卸'){
    tmpLoadUnload.value = '卸'
    getShipDoorInfo(tmpShipVoyageId.value,tmpLoadUnload.value)
  }
}
const getShipDoorInfo= async (shipVoyageId,loadUnload) =>{
  tmpShipVoyageId.value = shipVoyageId
  if(loadUnload == '装'){
    api.getShipDoorInfo({shipvoyageId:shipVoyageId,loadUnload:loadUnload}).then(res=>{
      if(res.data){
        shipDoorRef.value.clearData();
        shipDoorRef.value.cardData = res.data
      }
    })
  }else if(loadUnload == '卸'){
    api.getShipDoorInfo({shipvoyageId:shipVoyageId,loadUnload:loadUnload}).then(res=>{
      if(res.data){
        shipDoorRef.value.clearData();
        shipDoorRef.value.cardData = res.data
      }
    })
  }else{
    api.getShipDoorInfo({shipvoyageId:shipVoyageId}).then(res=>{
      if(res.data){
        shipDoorRef.value.clearData();
        shipDoorRef.value.cardData = res.data
      }
    })
  }
}

const getCostInfo= async shipVoyageId =>{
  api.getCostInfo({shipVoyageId:shipVoyageId}).then(res=>{
    if(res.data){
      costRef.value.clearData();
      let dataList = res.data
      dataList.forEach(x=>{
        if(x.type == '30'){
          costRef.value.tableDataShip.push(x)
        }else if(x.type == '10'){
          costRef.value.tableDataCargo.push(x)
        }else if(x.type == '40'){
          costRef.value.tableDataMisc.push(x)
        }
      })
    }
  })
}
/**
 * 获取港存动态
 */
import PortTrends from "@/views/common/shipInfo/portTrendsInfo/index.vue"
const portTrendsRef = ref()
const getPortTrendsInfo = async shipVoyageId =>{
  portTrendsRef.value.tableData = [];
  //根据航次id获取
  await api.getPortTrendsInfo({shipVoyageId:shipVoyageId}).then(res=>{
    let data = res.data;
    portTrendsRef.value.tableData = data;
    portTrendsRef.value.show();
  })
}


import CostInfo from "@/views/common/shipInfo/costInfo/index.vue"
const costRef = ref()

const getCostInf = async shipVoyageId =>{
  // portTrendsRef.value.tableData = [];
  // //根据航次id获取
  // await api.getPortTrendsInfo({shipVoyageId:shipVoyageId}).then(res=>{
  //   let data = res.data;
  //   portTrendsRef.value.tableData = data;
  //   portTrendsRef.value.show();
  // })
}
const poundRef = ref()
const getPoundInfo= async shipVoyageId =>{
  api.getPoundInfo({shipVoyageId:shipVoyageId}).then(res=>{
    if(res.data){
      poundRef.value.setTableData(res.data)
    }
  })
}

defineExpose({
  getSteps,
  getShipVoyageInfo,
  getShipDynamicInfo,
  getShipDoorInfo,
  isActive,
  getPortTrendsInfo,
  getCostInfo,
  getPoundInfo,
  activeName,
})

</script>

<style lang="scss" scoped>
.active {
  background-color: #079cfd; /* 激活状态的按钮背景色 */
  color: white; /* 激活状态的按钮文字颜色 */
}
:deep(.el-tabs--border-card>.el-tabs__content){
  padding-top: 0px;
}
</style>
