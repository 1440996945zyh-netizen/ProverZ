<template style="margin: 0px;padding: 0px !important;">
  <div style="width: 100%;height: 590px;margin:0px;padding:0px">
    <div style="width: 100%;height: 172px;">
      <div style="font-size: 18px;font-weight: bold;color:#0571c4;border-bottom:solid 1px #DDD">船舶信息</div>
      <el-row :gutter="40" style="padding: 15px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">船名</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.shipName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">英文船名</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.shipNameEn" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">国籍</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.nationCode" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">总长</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.shipLength" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">船宽</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.shipWidth" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">载重吨</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.dwt" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">总吨</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.totalWeight" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">净吨</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.netWeight" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">舱口数</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.hatchNum" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">船型</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.shipKindName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">MMSI</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.mmsi" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">船上电话</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.captainPhone" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
    <div style="width: 100%;height: 177px;">
      <div style="margin-top: 10px;font-size: 18px;font-weight: bold;color:#1a6eaf;border-bottom:solid 1px #DDD">艘次信息</div>
      <el-row :gutter="40" style="padding: 15px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">作业方式</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.loadUnload" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">进出口</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.impExp" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">来港</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.prePortName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">往港</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.nextPortName" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">起运港</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.startPortName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">目的港</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.endPortName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">进口吃水</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.bowDraft" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">出口吃水</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.sternDraft" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">预抵时间</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.arrivalTimePlan" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">预计离港</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.leavePortTimePlan" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">码头</el-col>
            <el-col :span="19"><el-input v-model=shipVoyageInfo.wharf disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">引航方式</el-col>
            <el-col :span="19"><el-input v-model="shipVoyageInfo.pilotage" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
    <div style="width: 100%;height: 200px;">
      <div style="margin-top: 5px;font-size: 18px;font-weight: bold;color:#1a6eaf;border-bottom:solid 1px #DDD">
        <el-row>
          <el-col :span="12">进口航次</el-col>
          <el-col :span="12">出口航次</el-col>
        </el-row>
      </div>
      <el-row :gutter="40" style="padding: 15px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">进口航次</el-col>
            <el-col :span="19"><el-input v-model="inInfo.voyage" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">内外贸</el-col>
            <el-col :span="19"><el-input v-model="inInfo.tradeType" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">出口航次</el-col>
            <el-col :span="19"><el-input v-if="outInfo" v-model="outInfo.voyage" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">内外贸</el-col>
            <el-col :span="19"><el-input v-model="outInfo.tradeType" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">作业公司</el-col>
            <el-col :span="19"><el-input v-model="inInfo.companyName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">装卸</el-col>
            <el-col :span="19"><el-input v-model="inInfo.loadUnload" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">作业公司</el-col>
            <el-col :span="19"><el-input v-model="outInfo.companyName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">装卸</el-col>
            <el-col :span="19"><el-input v-model="outInfo.loadUnload" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">货名</el-col>
            <el-col :span="19"><el-input v-model="inInfo.cargoCategoryName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">货量</el-col>
            <el-col :span="19"><el-input v-model="inInfo.cargoNum" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">货名</el-col>
            <el-col :span="19"><el-input v-model="outInfo.cargoCategoryName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">货量</el-col>
            <el-col :span="19"><el-input v-model="outInfo.cargoNum" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="40" style="padding: 0px 0px 8px 0px">
        <el-col :span="6">
          <el-row>
            <el-col :span="5">船代</el-col>
            <el-col :span="19"><el-input v-model="inInfo.customerName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">备注</el-col>
            <el-col :span="19"><el-input v-model="inInfo.remark" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">船代</el-col>
            <el-col :span="19"><el-input v-model="outInfo.customerName" disabled /></el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="5">备注</el-col>
            <el-col :span="19"><el-input v-model="outInfo.remark" disabled /></el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script name="ShipAisBoard" setup>
import {reactive} from "vue";
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

defineExpose({
  shipVoyageInfo,
  inInfo,
  outInfo,
})

</script>

<style lang="scss" scoped>

</style>
