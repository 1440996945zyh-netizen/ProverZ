<template>
  <div class="title">
<!--    <div class="loading">-->
<!--      <div class="loadbox"> <img src="picture/loading.gif"> 页面加载中... </div>-->
<!--    </div>-->
    <div class="back"></div>
    <div class="head">
      <div class="weather"><span>{{showTime}}</span></div>
      <h1>生产作业数据监控</h1>
    </div>
    <div class="mainbox">
      <ul class="clearfix">
        <li>
          <div class="boxall" style="height:300px;">
            <div class="alltitle">泊位利用率</div>
            <div class="navboxall" id="echart5"></div>
          </div>
          <div class="boxall" style="height:300px;">
            <div class="alltitle">在港车辆</div>
            <div class="navboxall" >
              <div class="wraptit">
                <span>车号</span><span>船名</span><span>货名</span><span>在港时长</span>
              </div>
              <div class="wrap">
                <ul class="scroll-content">
                  <li><p><span>鲁A2GB20</span><span>润华9</span><span>煤炭</span><span>1小时</span></p></li>
                  <li><p><span>鲁GV782G</span><span>阿拉斯加</span><span>铝矾土</span><span>1.5小时</span></p></li>
                  <li><p><span>鲁B3728R</span><span>凯德6</span><span>砂石</span><span>1.3小时</span></p></li>
                  <li><p><span>冀B34H20</span><span>阿拉丁</span><span>化肥</span><span>2小时</span></p></li>
                  <li><p><span>鲁A2GB20</span><span>奋斗者</span><span>煤炭</span><span>1.8小时</span></p></li>
                  <li><p><span>鲁C2GB20</span><span>中华号</span><span>焦炭</span><span>0.3小时</span></p></li>
                  <li><p><span>鲁D2GB20</span><span>阿拉斯加</span><span>钢卷</span><span>1.6小时</span></p></li>
                  <li><p><span>鲁E2GB20</span><span>阿拉丁</span><span>土方</span><span>0.6小时</span></p></li>
                  <li><p><span>鲁U2GB20</span><span>凯德6</span><span>饲料</span><span>0.9小时</span></p></li>
                  <li><p><span>鲁G2GB20</span><span>润华9</span><span>无烟煤</span><span>1.1小时</span></p></li>

                </ul>
              </div>

            </div>
          </div>
          <div class="boxall" style="height:300px;">
            <div class="alltitle">客户吞吐量占比</div>

            <div class="navboxall" id="echart1"></div>
          </div>
        </li>
        <li>
          <div class="boxall" style="height:200px">
            <div class="clearfix navboxall" style="height: 100%">
              <div class="pulll_left num">
                <div class="numbt">总吞吐量<span>(单位：吨)</span></div>
                <div class="numtxt">19382721 </div>
              </div>
              <div class="pulll_right zhibiao">
                <div class="zb1"><span>外贸量（万吨）</span><div id="zb1"></div></div>
                <div class="zb2"><span>内贸量（万吨）</span><div id="zb2"></div></div>
                <div class="zb3"><span>进口量（万吨）</span><div id="zb3"></div></div>
              </div>
            </div>
          </div>
          <div class="boxall" style="height:350px">
            <div class="alltitle">计划完成率</div>
            <div class="navboxall" id="echart4"></div>

          </div>
          <div class="boxall" style="height:340px">
            <div class="alltitle">收入分析</div>
            <div class="navboxall" id="echart3"></div>
          </div>
        </li>
        <li>
          <div class="boxall" style="height:300px">
            <div class="alltitle">货物吞吐量排名</div>
            <div class="navboxall">
              <table class="table1" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                <tr>
                  <th scope="col">排名</th>
                  <th scope="col">货名</th>
                  <th scope="col">数量</th>
                  <th scope="col">增长率</th>
                </tr>
                <tr>
                  <td><span>1</span></td>
                  <td>煤炭</td>
                  <td>11400200万<br></td>
                  <td>100%<br></td>
                </tr>
                <tr>
                  <td><span>2</span></td>
                  <td>铝矾土</td>
                  <td>1240253万</td>
                  <td>21%</td>
                </tr>

                <tr>
                  <td><span>3</span></td>
                  <td>砂石</td>
                  <td>923823万</td>
                  <td>12%</td>
                </tr>
                <tr>
                  <td><span>4</span></td>
                  <td>土方</td>
                  <td>63823万</td>
                  <td>39%</td>
                </tr>
                <tr>
                  <td><span>5</span></td>
                  <td>化肥</td>
                  <td>13423万</td>
                  <td>9%</td>
                </tr>

                </tbody>
              </table>
            </div>
          </div>

          <div class="boxall" style="height: 300px">
            <div class="alltitle">货物增速排名</div>
            <div class="navboxall">
              <table class="table1" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                <tr>
                  <th scope="col">排名</th>
                  <th scope="col">货名</th>
                  <th scope="col">数量</th>
                  <th scope="col">增长率</th>
                </tr>
                <tr>
                  <td><span>1</span></td>
                  <td>煤炭</td>
                  <td>11400200万<br></td>
                  <td>100%<br></td>
                </tr>
                <tr>
                  <td><span>2</span></td>
                  <td>土方</td>
                  <td>63823万</td>
                  <td>39%</td>
                </tr>

                <tr>
                  <td><span>3</span></td>
                  <td>铝矾土</td>
                  <td>1240253万</td>
                  <td>21%</td>
                </tr>
                <tr>
                  <td><span>4</span></td>
                  <td>砂石</td>
                  <td>923823万</td>
                  <td>12%</td>
                </tr>
                <tr>
                  <td><span>5</span></td>
                  <td>化肥</td>
                  <td>13423万</td>
                  <td>9%</td>
                </tr>

                </tbody>
              </table>
            </div>

          </div>

          <div class="boxall" style="height:300px">
            <div class="alltitle">货物吞吐量占比</div>
            <div class="navboxall" id="echart2"></div>
          </div>


        </li>
      </ul>

    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import api from '@/api/dispatch/visualization/index.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import math from '@/utils/math.js'

const echarts_1 = () => {
  var chartDom = document.getElementById('echart1')
  var myChart = echarts.init(chartDom)
	var option = {
    tooltip : {
      trigger: 'item',
      formatter: "{b} : {c} ({d}%)"
    },
    legend: {
      right:0,
      top:30,
      height:160,
      itemWidth:10,
      itemHeight:10,
      itemGap:10,
      textStyle:{
        color: 'rgba(255,255,255,.6)',
        fontSize:12
      },
      orient:'vertical',
      data:['客户1','客户2','客户3','客户4','客户5']
    },
    calculable : true,
    series : [
      {
        name:' ',
        color: ['#62c98d', '#2f89cf', '#4cb9cf', '#f78c44', '#ed405d', '#205acf', '#c9c862', '#c98b62', '#c962b9', '#7562c9','#c96262','#c25775','#00b7be'],
        type:'pie',
        radius : [30, 70],
        center : ['35%', '50%'],
        roseType : 'radius',
        label: {
          normal: {
            show: true
          },
          emphasis: {
            show: true
          }
        },

        lableLine: {
          normal: {
            show: true
          },
          emphasis: {
            show: true
          }
        },

        data:[
          {value:10, name:'客户1'},
          {value:5, name:'客户2'},
          {value:15, name:'客户3'},
          {value:25, name:'客户4'},
          {value:20, name:'客户5'},

        ]
      },
    ]
	}
	option && myChart.setOption(option)
	window.addEventListener('resize', function () {
		myChart.resize()
	})
}
const echarts_2 = () => {
	var chartDom = document.getElementById('echart2')
	var myChart = echarts.init(chartDom)
	var option
	option = {
    tooltip: {
      trigger: 'item',
      formatter: "{b} : {c} ({d}%)"
    },
    legend: {

      top:'15%',
      data: ['煤炭', '铝矾土', '化肥', '砂石', '焦炭'],
      icon: 'circle',
      textStyle: {
        color: 'rgba(255,255,255,.6)',
      }
    },
    calculable: true,
    series: [{
      name: '',
      color: ['#62c98d', '#2f89cf', '#4cb9cf', '#f78c44', '#ed405d', '#205acf', '#c9c862', '#c98b62', '#c962b9','#c96262'],
      type: 'pie',
      //起始角度，支持范围[0, 360]
      startAngle: 0,
      //饼图的半径，数组的第一项是内半径，第二项是外半径
      radius: [51, 100],
      //支持设置成百分比，设置成百分比时第一项是相对于容器宽度，第二项是相对于容器高度
      center: ['50%', '45%'],

      //是否展示成南丁格尔图，通过半径区分数据大小。可选择两种模式：
      // 'radius' 面积展现数据的百分比，半径展现数据的大小。
      //  'area' 所有扇区面积相同，仅通过半径展现数据大小
      roseType: 'area',
      //是否启用防止标签重叠策略，默认开启，圆环图这个例子中需要强制所有标签放在中心位置，可以将该值设为 false。
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: true,
          //  formatter: '{c}辆'
        },
        emphasis: {
          show: true
        }
      },
      labelLine: {
        normal: {
          show: true,
          length2: 1,
        },
        emphasis: {
          show: true
        }
      },
      data: [
        {value: 1,name: '煤炭',},
        {value: 4,name: '铝矾土',},
        {value: 5,name: '化肥',},
        {value: 6,name: '砂石',},
        {value: 9,name: '焦炭',},

        {value: 0, name: "",label: {show: false},labelLine: {show: false}},
        {value: 0, name: "",label: {show: false},labelLine: {show: false}},
        {value: 0, name: "",label: {show: false},labelLine: {show: false}},
        {value: 0, name: "",label: {show: false},labelLine: {show: false}},
        {value: 0, name: "",label: {show: false},labelLine: {show: false}},

      ]
    }]
	}
	option && myChart.setOption(option)
	window.addEventListener('resize', function () {
		myChart.resize()
	})
}
const echarts_3 = () => {
	var chartDom = document.getElementById('echart3')
	var myChart = echarts.init(chartDom)
	var option
	option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#57617B'
        }
      }
    },
    legend: {

      //icon: 'vertical',
      data: ['收入', '利润'],
      //align: 'center',
      // right: '35%',
      top:'0',
      textStyle: {
        color: "#fff"
      },
      // itemWidth: 15,
      // itemHeight: 15,
      itemGap: 20,
    },
    grid: {
      left: '0',
      right: '20',
      top:'10',
      bottom: '20',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        show: true,
        textStyle: {
          color: 'rgba(255,255,255,.6)'
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,.1)'
        }
      },
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    }, {
    }],
    yAxis: [{
      axisLabel: {
        show: true,
        textStyle: {
          color: 'rgba(255,255,255,.6)'
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,.1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,.1)'
        }
      }
    }],
    series: [{
      name: '收入',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 2
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(24, 163, 64, 0.3)'
          }, {
            offset: 0.8,
            color: 'rgba(24, 163, 64, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: '#f78c44',
          borderColor: 'rgba(137,189,2,0.27)',
          borderWidth: 12
        }
      },
      data: [220, 182, 191, 134, 150, 120, 210, 225, 245, 222, 265, 192]
    }, {
      name: '利润',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 2
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(39, 122,206, 0.3)'
          }, {
            offset: 0.8,
            color: 'rgba(39, 122,206, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: '#277ace',
          borderColor: 'rgba(0,136,212,0.2)',
          borderWidth: 12
        }
      },
      data: [120, 110, 125, 125, 122, 98, 122, 220, 182, 191, 134, 150]
    }]
	}
	option && myChart.setOption(option)
	window.addEventListener('resize', function () {
		myChart.resize()
	})
}
const echarts_4 = () => {
  var chartDom = document.getElementById('echart4')
  var myChart = echarts.init(chartDom)
  var option
  option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#57617B'
        }
      }
    },
    "legend": {

      "data": [
        {"name": "计划量"},
        {"name": "实际量"},
        {"name": "完成率"}
      ],
      "top": "0%",
      "textStyle": {
        "color": "rgba(255,255,255,0.9)"//图例文字
      }
    },

    "xAxis": [
      {
        "type": "category",

        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        axisLine: { lineStyle: {color: "rgba(255,255,255,.1)"}},
        axisLabel:  { textStyle: {color: "rgba(255,255,255,.6)", fontSize: '14', },
        },

      },
    ],
    "yAxis": [
      {
        "type": "value",
        "name": "万吨",
        "min": 0,
        "max": 50,
        "interval": 10,
        "axisLabel": {
          "show": true,

        },
        axisLine: {lineStyle: {color: 'rgba(255,255,255,.4)'}},//左线色

      },
      {
        "type": "value",
        "name": "完成率",
        "show": true,
        "axisLabel": {
          "show": true,

        },
        axisLine: {lineStyle: {color: 'rgba(255,255,255,.4)'}},//右线色
        splitLine: {show:true,lineStyle: {color:"#001e94"}},//x轴线
      },
    ],
    "grid": {
      "top": "10%",
      "right":"30",
      "bottom":"30",
      "left":"30",
    },
    "series": [
      {
        "name": "计划量",

        "type": "bar",
        "data": [4,6,36,6,8,6,6,6,30,6,8,12],
        "barWidth": "auto",
        "itemStyle": {
          "normal": {
            "color": {
              "type": "linear",
              "x": 0,
              "y": 0,
              "x2": 0,
              "y2": 1,
              "colorStops": [
                {
                  "offset": 0,
                  "color": "#609db8"
                },

                {
                  "offset": 1,
                  "color": "#609db8"
                }
              ],
              "globalCoord": false
            }
          }
        }
      },
      {
        "name": "实际量",
        "type": "bar",
        "data": [
          4,3,34,6,8,6,4,2,32,6,0,0
        ],
        "barWidth": "auto",

        "itemStyle": {
          "normal": {
            "color": {
              "type": "linear",
              "x": 0,
              "y": 0,
              "x2": 0,
              "y2": 1,
              "colorStops": [
                {
                  "offset": 0,
                  "color": "#66b8a7"
                },
                {
                  "offset": 1,
                  "color": "#66b8a7"
                }
              ],
              "globalCoord": false
            }
          }
        },
        "barGap": "0"
      },
      {
        "name": "完成率",
        "type": "line",
        "yAxisIndex": 1,

        "data": [100,50,90,100,100,100, 70,33,100,100,0,0],
        lineStyle: {
          normal: {
            width: 2
          },
        },
        "itemStyle": {
          "normal": {
            "color": "#cdba00",

          }
        },
        "smooth": true
      }
    ]
  }
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}
const echarts_5 = () => {
  var chartDom = document.getElementById('echart5')
  var myChart = echarts.init(chartDom)
  // 颜色
  var lightBlue = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [{
      offset: 0,
      color: 'rgba(41, 121, 255, 1)'
    }, {
      offset: 1,
      color: 'rgba(0, 192, 255, 1)'
    }],
    globalCoord: false
  }
  var option
  option = {
    tooltip: {
      show: false
    },
    grid: {
      top: '0%',
      left: '65',
      right: '14%',
      bottom: '0%',
    },
    xAxis: {
      min: 0,
      max: 100,
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      data: ['9#泊位','8#泊位','7#泊位','6#泊位','5#泊位','4#泊位','3#泊位','2#泊位','1#泊位'],
      //offset: 15,
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: 'rgba(255,255,255,.6)',
        fontSize: 14
      }
    },
    series: [{
      type: 'bar',
      label: {
        show: true,
        zlevel: 10000,
        position: 'right',
        padding: 10,
        color: '#49bcf7',
        fontSize: 14,
        formatter: '{c}%'

      },
      itemStyle: {
        color:'#49bcf7'
      },
      barWidth: '15',
      data: [ 67, 99, 12, 19, 39, 84, 28, 47, 57, 100],
      z: 10
    }, {
      type: 'bar',
      barGap: '-100%',
      itemStyle: {
        color:'#fff',
        opacity: 0.1
      },
      barWidth: '15',
      data: [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      z: 5
    }],
  }
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}

const zb1 = () => {
  var chartDom = document.getElementById('zb1')
  var myChart = echarts.init(chartDom)

  var v1=298//男消费
  var v2=523//女消费
  var v3=v1+v2//总消费

  var option
  option = {
    series: [{

      type: 'pie',
      radius: ['60%', '70%'],
      color:'#49bcf7',
      label: {
        normal: {
          position: 'center'
        }
      },
      data: [{
        value: v2,
        name: '女消费',
        label: {
          normal: {
            formatter: v2 +'',
            textStyle: {
              fontSize: 20,
              color:'#fff',
            }
          }
        }
      }, {
        value: v1,
        name: '男消费',
        label: {
          normal: {
            formatter : function (params){
              return '占比'+Math.round( v2/v3*100)+ '%'
            },
            textStyle: {
              color: '#aaa',
              fontSize: 12
            }
          }
        },
        itemStyle: {
          normal: {
            color: 'rgba(255,255,255,.2)'
          },
          emphasis: {
            color: '#fff'
          }
        },
      }]
    }]
  }
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}
const zb2 = () => {
  var chartDom = document.getElementById('zb2')
  var myChart = echarts.init(chartDom)

  var v1=298//男消费
  var v2=523//女消费
  var v3=v1+v2//总消费

  var option
  option = {
    series: [{
      type: 'pie',
      radius: ['60%', '70%'],
      color:'#cdba00',
      label: {
        normal: {
          position: 'center'
        }
      },
      data: [{
        value: v1,
        name: '男消费',
        label: {
          normal: {
            formatter: v1 +'',
            textStyle: {
              fontSize: 20,
              color:'#fff',
            }
          }
        }
      }, {
        value: v2,
        name: '女消费',
        label: {
          normal: {
            formatter : function (params){
              return '占比'+Math.round( v1/v3*100)+ '%'
            },
            textStyle: {
              color: '#aaa',
              fontSize: 12
            }
          }
        },
        itemStyle: {
          normal: {
            color: 'rgba(255,255,255,.2)'
          },
          emphasis: {
            color: '#fff'
          }
        },
      }]
    }]
  }
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}
const zb3 = () => {
  var chartDom = document.getElementById('zb3')
  var myChart = echarts.init(chartDom)

  var v1=298//男消费
  var v2=523//女消费
  var v3=v1+v2//总消费

  var option
  option = {
    series: [{

      type: 'pie',
      radius: ['60%', '70%'],
      color:'#62c98d',
      label: {
        normal: {
          position: 'center'
        }
      },
      data: [{
        value: v2,
        name: '女消费',
        label: {
          normal: {
            formatter : function (params){
              return v2 +''
            },
            textStyle: {
              fontSize: 20,
              color:'#fff',
            }
          }
        }
      }, {
        value: v1,
        name: '男消费',
        label: {
          normal: {
            formatter : function (params){
              return '占比'+Math.round( v2/v3*100)+ '%'
            },
            textStyle: {
              color: '#aaa',
              fontSize: 12
            }
          }
        },
        itemStyle: {
          normal: {
            color: 'rgba(255,255,255,.2)'
          },
          emphasis: {
            color: '#fff'
          }
        },
      }]
    }]
  }
  option && myChart.setOption(option)
  window.addEventListener('resize', function () {
    myChart.resize()
  })
}

const showTime = ref(null)
// 获取当前时间星期
const getWeek = () => {
	const now = new Date()
	const year = now.getFullYear() //年
	const month = now.getMonth() + 1 //月
	const day = now.getDate() //日
	const hours = now.getHours() //小时数
	const minutes = now.getMinutes() //分钟数
	const seconds = now.getSeconds() //秒数
  showTime.value = year+"年"+month+"月"+day+"日"+hours+"时"+minutes+"分"+seconds+"秒";
}

// 数据初始化
const init = () => {
  echarts_1()
  echarts_2()
  echarts_3()
  echarts_4()
  echarts_5()

  zb1()
  zb2()
  zb3()
}
const timer = ref(null)
onMounted(() => {
  init()
  timer.value = setInterval(() => {
    getWeek()
  }, 1000)
  //
})

</script>

<style lang="scss" scoped>
@import '@/assets/styles/dispatch/visualization.scss';
</style>
