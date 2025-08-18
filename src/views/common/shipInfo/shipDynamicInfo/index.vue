<template style="margin: 0px;padding: 0px !important;">
  <div style="width: 100%;height: 590px;margin:0px;padding:0px;">
    <div style="height: 260px;width: 100%">
      <el-table :data="tableData" border style="width: 100%"  height="260">
        <el-table-column
          prop="shipName"
          label="船名"
          width="130">
        </el-table-column>
        <el-table-column
          prop="dynamicTypeName"
          label="动态类型"
          width="90">
        </el-table-column>
        <el-table-column
          prop="loadUnload"
          label="装卸"
          width="90">
        </el-table-column>
        <el-table-column
          prop="dynamicStartTime"
          label="动态时间"
          width="160">
        </el-table-column>
        <el-table-column
          prop="berthName"
          label="泊位"
          width="90">
        </el-table-column>
        <el-table-column
          prop="berthTypeLabel"
          label="舷靠"
          width="90">
        </el-table-column>
        <el-table-column
          prop="bollardNoStart"
          label="首缆编号"
          width="90">
        </el-table-column>
        <el-table-column
          prop="bollardNoEnd"
          label="尾缆编号"
          width="90">
        </el-table-column>
        <el-table-column
          prop="stopTypeName"
          label="停时类型"
          >
        </el-table-column>
        <el-table-column
          prop="stopName"
          label="停工原因"
          >
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          >
        </el-table-column>
        <el-table-column
          prop="createByName"
          label="操作人"
          width="100">
        </el-table-column>
      </el-table>
    </div>
    <el-row :gutter="5">
      <el-col :span="12">
        <div style="border:solid 1px #DDD;margin: 5px 0px 0px 0px;width: 100%;height: 320px">
          <div style="float: left;font-size: 18px;font-weight: bold;width: 70%;height: 40px;line-height: 40px;border-bottom:solid 1px #DDD;padding-left: 10px  ">进口停时</div>
          <div style="float: right;font-size: 18px;font-weight: bold;width: 30%;height: 40px;line-height: 40px;border-bottom:solid 1px #DDD;padding: 0px">停时总时长：{{inStopTime}} 小时</div>
          <div style="margin-top: 40px;width: 700px;height: 280px;" id="inTimeEcharts"/>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="border:solid 1px #DDD;margin: 5px 0px 0px 0px;width: 100%;height: 320px">
          <div style="float: left;font-size: 18px;font-weight: bold;width: 70%;height: 40px;line-height: 40px;border-bottom:solid 1px #DDD;padding-left: 10px">出口停时</div>
          <div style="float: right;font-size: 18px;font-weight: bold;width: 30%;height: 40px;line-height: 40px;border-bottom:solid 1px #DDD;padding: 0px">停时总时长：{{outStopTime}} 小时</div>
          <div style="margin-top: 40px;width: 700px;height: 280px;" id="outTimeEcharts"/>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script name="ShipAisBoard" setup>
import {reactive, ref} from "vue";
const tableData = ref([])
const inData = ref([])
const outData = ref([])
const inStopTime = ref(null)
const outStopTime = ref(null)
const show=()=>{
  inStopTime?inStopTime:"0"
  outStopTime?outStopTime:"0"
  showEcharts('inTimeEcharts',inData.value)
  showEcharts('outTimeEcharts',outData.value)
}
const clearData=()=>{
  tableData.value = []
  inData.value = []
  outData.value = []
  inStopTime.value = null
  outStopTime.value = null
}

/**
 *
 */
import * as echarts from 'echarts'
const showEcharts = async (id,data)=>{
  var chartDom = document.getElementById(id)
  var myChart = echarts.init(chartDom)
  myChart.clear();
  if(data ==undefined || data ==null || data==[]){
    return;
  }
  // let data = [];
  // data = yData;
  var colorList = [
    '#6a89E2',
    '#219CF9',
    '#3862d8',
    '#765deb',
    '#c065e7',
  ];
// 颜色值配置一个空，用于显示间距
  const colorList1 = [

    '#6a89E2', '',
    '#219CF9', '',
    '#3862d8', '',
    '#765deb', '',
    '#c065e7', '',
    // '#40c057', '',
    // '#ff8e43', '',
  ];
  const colorList2 = [
    '#acc7f8', '',
    '#79c4fd', '',
    '#88a0e2', '',
    '#9f92db', '',
    '#a97fbb', '',
  ];
  let sum = 0;
  let optionData = []
  for(let index in data){
    let item = data[index]
    sum += Number(item.value);
  }
  for(let index in data){
    let item = data[index]
    optionData.push({ value: item.value, name: item.name });
    // 配置一个空值
    optionData.push({ name: '', value: sum / 100, itemStyle: { color: 'transparent' } });
  }
  var option= {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      icon: 'none',
      orient: "vertical",
      top: "middle",
      left: 380,
      itemWidth: 12,
      itemHeight: 12,
      formatter: (name) => {
        let obj = data.find(item => item.name === name)
        const arr = [
          `{iconName|}{name|${name}}{value|${obj.value}}{percent|${obj.percent}}{unit|%}`
        ];
        return arr.join('')
      },
      textStyle: {
        color: '#FFF',
        fontSize: 20,
        rich: {
          name: {
            color: '#555',
            fontSize: 20,
            width: 100,
            padding: [0, 0, 0, 10],
          },
          value: {
            color: '#2BDFD4',
            fontFamily: 'PangMenZhengDao',
            fontSize: 20,
            width: 40,
            textAlign: 'right',
            padding: [0, 0, 0, 10]
          },
          percent: {
            color: '#2BDFD4',
            fontFamily: 'PangMenZhengDao',
            fontSize: 20,
            padding: [0, 0, 0, 30]
          },
          unit: {
            color: '#555',
            fontSize: 18,
            padding: [0, 0, 0, 5]
          }
        }
      },
      data: data.map((dItem,dIndex) => {
        return {
          ...dItem,
          textStyle: {
            rich: {
              iconName: {
                width: 16,
                height: 16,
                borderRadius: 2,
                backgroundColor: colorList[dIndex],
              },
              percent: {
                color: colorList[dIndex],
              },
            }
          },

        }
      }),
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['25%', '50%'],
        minAngle: 5,
        labelLine: {
          show: false
        },
        label: {
          show: false,
        },
        itemStyle: {
          normal: {
            color: function (params) {
              return colorList1[params.dataIndex]
            }
          }
        },
        data: optionData,
        z: 666
      },
      {
        type: 'pie',
        radius: ['75%', '85%'],
        center: ['25%', '50%'],
        hoverAnimation: false,
        minAngle: 5,
        emphasis: { scale: false },
        label: {
          show: false
        },
        itemStyle: {
          normal: {
            color: function (params) {
              return colorList2[params.dataIndex]
            }
          }
        },
        data: optionData,
        z: 1
      },
    ]
  };
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}

defineExpose({
  tableData,
  inData,
  outData,
  inStopTime,
  outStopTime,
  show,
  clearData,
})
</script>

<style lang="scss" scoped>
</style>
