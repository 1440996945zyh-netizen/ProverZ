<template>
  <div id="mCharts" style="width: 100%">
    <div id="throughput" style="width: 100%; height: 360px"></div>
  </div>
</template>

<script setup name="ThroughputCharts">
import * as echarts from 'echarts'
import { nextTick, onMounted, reactive, ref } from 'vue'

// 定义不同时间段的货物数据
const cargoData = reactive({
  today: [
    { name: '木材', value: 3066.3, compareValue: 2847.8 },
    { name: '锂辉石', value: 5863.4, compareValue: 5432.1 },
    { name: '土方', value: 2156.7, compareValue: 1987.3 },
    { name: '砂石料', value: 1892.4, compareValue: 1756.9 },
    { name: '设备', value: 1201.6, compareValue: 1187.2 },
    { name: '钢管', value: 1534.3, compareValue: 1498.7 },
    { name: '木片', value: 3062.3, compareValue: 2845.6 },
    { name: '化肥', value: 3858.2, compareValue: 3654.8 },
    { name: '其它', value: 1642.1, compareValue: 1598.3 }
  ],
  month: [
    { name: '木材', value: 189536.6, compareValue: 176543.2 },
    { name: '锂辉石', value: 187369.2, compareValue: 173456.8 },
    { name: '土方', value: 154860.0, compareValue: 143210.5 },
    { name: '砂石料', value: 85569.0, compareValue: 79873.3 },
    { name: '设备', value: 45821.2, compareValue: 44765.8 },
    { name: '钢管', value: 129966.5, compareValue: 128765.4 },
    { name: '木片', value: 54472.1, compareValue: 54123.7 },
    { name: '化肥', value: 111521.9, compareValue: 103456.2 },
    { name: '其它', value: 52172.5, compareValue: 52012.8 }
  ],
  year: [
    { name: '木材', value: 1680909.2, compareValue: 1543210.8 },
    { name: '锂辉石', value: 2501979.6, compareValue: 2345678.9 },
    { name: '土方', value: 905793.0, compareValue: 843210.5 },
    { name: '砂石料', value: 650495.4, compareValue: 626543.2 },
    { name: '设备', value: 534837.3, compareValue: 532109.8 },
    { name: '钢管', value: 1128677.3, compareValue: 1119876.5 },
    { name: '木片', value: 584189.0, compareValue: 578965.4 },
    { name: '化肥', value: 668857.0, compareValue: 623456.7 },
    { name: '其它', value: 699938.8, compareValue: 665432.1 }
  ]
})

// 当前显示的数据类型
const currentDataType = ref('today')

const throughputOptions = reactive({
  // 提示框
  tooltip: {
    show: true,
    trigger: 'axis',
    confine: true,
    formatter: function (params) {
      var relVal = params[0].name
      for (var i = 0, l = params.length; i < l; i++) {
        relVal += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + params[i].value + '(吨)'
      }
      return relVal
    },
  },
  title: {
    top: 0,
    left: 0,
    subtext: '单位：吨',
    subtextStyle: {
      color: '#6D6D6D',
    },
  },
  grid: {
    top: 60,
    bottom: 60,
    left: '8%',
    right: '5%',
  },
  color: ['#409eff', '#67C23A'],
  legend: {
    show: true,
    orient: 'horizontal',
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    top: 0,
    right: 15,
    data: ['本期', '同期']
  },
  xAxis: {
    type: 'category',
    axisLine: {
      show: true,
      lineStyle: {
        color: '#FCE6BC',
        type: 'solid',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      margin: 15,
      color: '#404040',
      rotate: 0,
      fontSize: 12,
      interval: 0,
      formatter: function(value) {
        // 限制货物名称长度，超过6个字符就截断
        if (value.length > 6) {
          return value.substring(0, 6) + '...'
        }
        return value
      }
    },
    splitLine: {
      show: false,
    },
    boundaryGap: true,
    data: [],
  },
  yAxis: {
    type: 'value',
    axisTick: {
      show: false,
    },
    axisLine: {
      lineStyle: {
        opacity: 0.61,
        color: '#B0BEC5',
        type: 'solid',
      },
    },
    axisLabel: {
      margin: 10,
      color: '#404040',
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        opacity: 0.76,
        color: '#8CA0B3',
      },
      show: true,
    },
  },
  series: [
    {
      name: '本期',
      data: [],
      type: 'bar',
      barWidth: '25%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          0, 0, 0, 1,
          [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#66b1ff' }
          ]
        ),
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              { offset: 0, color: '#337ecc' },
              { offset: 1, color: '#409eff' }
            ]
          )
        }
      }
    },
    {
      name: '同期',
      data: [],
      type: 'bar',
      barWidth: '25%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          0, 0, 0, 1,
          [
            { offset: 0, color: '#67C23A' },
            { offset: 1, color: '#85ce61' }
          ]
        ),
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              { offset: 0, color: '#5daf34' },
              { offset: 1, color: '#67C23A' }
            ]
          )
        }
      }
    }
  ],
})

// 随机打乱数组顺序的函数
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 更新图表数据
const updateChartData = (dataType) => {
  const data = cargoData[dataType]
  // 随机打乱数据顺序
  const shuffledData = shuffleArray(data)
  throughputOptions.xAxis.data = shuffledData.map(item => item.name)
  throughputOptions.series[0].data = shuffledData.map(item => item.value)
  throughputOptions.series[1].data = shuffledData.map(item => item.compareValue)

  // 重新渲染图表
  if (window.myChart) {
    window.myChart.setOption(throughputOptions)
  }
}

// 切换数据类型
const switchDataType = (type) => {
  currentDataType.value = type
  updateChartData(type)
}

const initeCharts = () => {
  window.myChart = echarts.init(document.getElementById('throughput'))
  // 初始化显示今日数据
  updateChartData('today')
  // 绘制图表
  window.myChart.setOption(throughputOptions)
  window.addEventListener('resize', function () {
    window.myChart.resize()
  })
}
onMounted(() => {
  nextTick(() => {
    initeCharts()
  })
})

defineExpose({
  throughputOptions,
  switchDataType
})
</script>

<style lang="scss" scoped></style>
