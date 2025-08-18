<template>
  <el-row style="margin: 5px 10px">
    <el-col :span="24">
      <div v-for="(card, index) in cardData" :key="index">
        <el-card :bordered="false" style="border-radius: 10px;margin: 5px 0px">
          <el-row  >
            <el-col  :span="6" style=" margin-bottom: 10px;">
              <span style="font-weight: bold;">门机: {{card.equipmentNo}}</span>
            </el-col>
            <el-col  :span="6" >
              <span style="font-weight: bold;">舱口: {{card.cabinNo}}</span>
            </el-col>
            <el-col  :span="6" >
              <span style="font-weight: bold;">货名: {{card.cargoName}}</span>
            </el-col>
            <el-col  :span="6" >
              <span style="font-weight: bold;">时长 :{{card.cnsc}}</span>
            </el-col>
            <el-col  :span="6"  style=" margin-bottom: 10px">
              <span style="font-weight: bold;">工作量 :{{card.workload}}</span>
            </el-col>
            <el-col  :span="6" >
              <span style="font-weight: bold;">开始时间 :{{card.startTime}}</span>
            </el-col>
            <el-col  :span="6" >
              <span style="font-weight: bold;">结束时间 :{{card.endTime}}</span>
            </el-col>
            <el-col  :span="6" >
              <span style="font-weight: bold;">备注 :{{card.remark}}</span>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script setup name="shipDoorInfo">
import {ref, reactive, nextTick, h, getCurrentInstance, onMounted} from 'vue'

const cardData = ref([])


const clearData=()=>{

}
defineExpose({
  cardData,
  clearData,
})
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
