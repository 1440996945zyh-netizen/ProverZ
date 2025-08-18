<template>
  <div class="father" style="background-color: #3427a1;">
    <el-row  style="margin: -5px 20px" >
      <el-col :span="18" >
        <el-form-item  >
          <el-date-picker type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="选择日期"
                          v-model="formData.planDate"
                          size="medium"
                          clearable
                          format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <div class="buttonValue">
          <el-button style="margin-left: 10px" type="primary" icon="Search" @click="getList">查询</el-button>
        </div>
      </el-col>
    </el-row>
    <el-row style="margin: 0px 10px"  >
      <el-col :span="24">
        <div >
          <el-card :bordered="false" style="border-radius: 10px;">
            <el-row >
              <el-col :span="24" >
                <span style="font-weight: bold; color: #000000;font-size: 20px;">吞吐量</span>
                <el-divider style="margin: 10px 0px"></el-divider>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="7">
                <div>当日</div>
                  <span style="color: #1200a2;font-weight: bold;">{{invoiceDayCount}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div>月累</div>
                <span style="color: #1200a2;font-weight: bold;">{{invoiceMouthCount}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div>年累</div>
                <span  style="color: #ef9d05;font-weight: bold;">{{invoiceYearCount}}</span>
              </el-col>
            </el-row>
            <el-row style="margin: 20px 0px" >
              <el-col :span="7">
                <div>当日外贸</div>
                <span style="color: #1200a2;font-weight: bold;">{{tradeDayCount}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div>月累外贸</div>
                <span style="color: #1200a2;font-weight: bold;">{{tradeMouthCount}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div>年累外贸</div>
                <span  style="color: #ef9d05;font-weight: bold;">{{tradeYearCount}}</span>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-col>
    </el-row>
    <el-row  style="margin:5px 10px">
      <el-col :span="24">
        <div >
<!--          <el-card class="box-card">-->
          <el-card :bordered="false" style="border-radius: 10px;">
            <el-row >
              <el-col :span="24" >
                <span style="font-weight: bold; color: #000000;font-size: 20px;">车辆详情</span>
                <el-divider style="margin: 10px 0px"></el-divider>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="7">
                <div>在港车辆</div>
                <span style="color: #1200a2;font-weight: bold;">{{nowCarCount}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div>当日车次</div>
                <span style="color: #1200a2;font-weight: bold;">{{dayCarCount}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div>月累车次</div>
                <span style="color: #ef9d05;font-weight: bold;">{{mouthCarCount}}</span>
              </el-col>
            </el-row>
            <el-row style="margin: 20px 0px" >
              <el-col :span="7">
                <div style="font-size: 15px;">东作业区车次</div>
                <span style="color: #1200a2;font-weight: bold;">{{eastPort}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div style="font-size: 15px;">中作业区车次</div>
                <span style="color: #1200a2;font-weight: bold;">{{midPort}}</span>
              </el-col>
              <el-col :span="1">
                <el-divider direction="vertical" style="height: 50px;"></el-divider>
              </el-col>
              <el-col :span="7">
                <div style="font-size: 15px;">西作业区车次</div>
                <span style="color: #ef9d05;font-weight: bold;">{{westPort}}</span>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-col>
    </el-row>
    <el-row style="margin: 5px 10px">
      <el-col :span="24">
        <el-card :bordered="false" style="padding: 0px;margin: 0px">
          <div style="font-weight: bold; color: #000000;font-size: 20px;">当月货类详情</div>
          <div style="height: 200px;width: 100%" id="echarts_right_center"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="comprehensiveQuery">
import api from '@/api/business/comprehensiveQuery/index.js'
import comEcharts from '@/views/business/comprehensiveQuery/comprehensiveQueryEcharts/index.js'
import {ref, reactive, nextTick, h, getCurrentInstance, onMounted} from 'vue'
import {getNowDate} from "@/utils";
import * as echarts from "echarts";

const invoiceDayCount =ref(null)
const invoiceMouthCount =ref(null)
const invoiceYearCount =ref(null)
const tradeDayCount =ref(null)
const tradeMouthCount =ref(null)
const tradeYearCount =ref(null)
const nowCarCount =ref(null)
const dayCarCount =ref(null)
const mouthCarCount =ref(null)
const eastPort =ref(null)
const midPort =ref(null)
const westPort =ref(null)

const formData = ref({
  planDate: '',
})
const getList = async () => {
  await api.getList(formData.value.planDate).then(res => {
    invoiceDayCount.value= res.data.invoiceDayCount
    invoiceMouthCount.value= res.data.invoiceMouthCount
    invoiceYearCount.value= res.data.invoiceYearCount
    tradeDayCount.value= res.data.tradeDayCount
    tradeMouthCount.value= res.data.tradeMouthCount
    tradeYearCount.value= res.data.tradeYearCount
    nowCarCount.value= res.data.nowCarCount
    dayCarCount.value= res.data.dayCarCount
    mouthCarCount.value= res.data.mouthCarCount
    eastPort.value= res.data.eastPort
    midPort.value= res.data.midPort
    westPort.value= res.data.westPort
    echartsRightRight()
  })
}

const echartsRightRight = async () => {
  let data = [];
  await api.getPieList(formData.value.planDate).then(res=>{ data = res.data })
  var chartDom = document.getElementById('echarts_right_center')
  var myChart = echarts.init(chartDom)
  var option = await comEcharts.option(data)
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}
onMounted( async () => {
  echartsRightRight()
})

const init = () => {
  formData.value.planDate = getNowDate('YYYY-MM-DD')
  getList()
  // echartsRightRight()
}
init()
</script>

<style >
.father{
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 10px solid #3427a1;
}
/*.el-main{
    border: 10px solid pink;
} */
.date{
  height: 50px;
  /*border: 1px solid #3427a1;*/
}
.card {
  margin-bottom: 20px;
  height: 200px;
  /*border: 1px solid #3427a1;*/
}
.el-row{
  text-align: center;
}
.dateValue{
  text-align: right;
}
.buttonValue{
  text-align: left;
}
.box-card{
  height: 24vh;
}
.el-row{
  margin-bottom: 5px;
}


</style>
