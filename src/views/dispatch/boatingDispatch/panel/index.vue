<template>
	<div id="panel" style="width: 100%; height: 180px"></div>
</template>

<script>
import * as echarts from 'echarts'
export default {
	name: 'panel',
	props: {
		data: {
			type: Object,
		},
	},
	data() {
		return {
			panelData: this.data,
		}
	},
	created() {
		this.$nextTick(() => {
			this.panelData = this.data
			// this.drawLine();
		})
	},
	computed: {
		dataArray() {
			let panelData = this.data
			return panelData
		},
	},
	watch: {
		dataArray: {
			handler(val) {
				this.$nextTick(() => {
					console.log('仪表盘数据', val)
					this.panelData = val
					this.drawLine()
				})
			},
			deep: true,
		},
	},
	mounted() {
		this.drawLine()
	},
	methods: {
		drawLine() {
			// 基于准备好的dom，初始化echarts实例
			var myChart = echarts.init(document.getElementById('panel'))

			// 指定图表的配置项和数据
			var colors = ['#30BF78', '#A0D911', '#FAAD14', '#F4664A ']
			// var  texts = ['畅通','基本畅通','缓行','拥堵'];
			function getIdx(value) {
				var p = value / 4,
					idx = 0
				if (p > 1 && p <= 2) {
					idx = 1
				} else if (p > 2 && p <= 3) {
					idx = 2
				} else if (p > 3 && p <= 4) {
					idx = 3
				}
				return idx
			}
			function getColor(value) {
				return colors[getIdx(value)]
			}
			// function getText(value){
			//     return texts[getIdx(value)];
			// }

			var shipHour = 0
			var time = 0
			// 船时效率  =  总作业量 / (完工时间 - 开工时间)
			if (this.panelData.finishWorkDate != null && this.panelData.startWorkDate != null) {
				let finishWorkDate = Date.parse(new Date(this.panelData.finishWorkDate))
				let startWorkDate = Date.parse(new Date(this.panelData.startWorkDate))
				time = ((finishWorkDate - startWorkDate) / 1000 / 60 / 60).toFixed(2)
				console.log(time, 'time')
			}
			if (this.panelData.weight != 0 && time != 0) {
				shipHour = (this.panelData.weight / time).toFixed(2)
				console.log(shipHour, 'shipHour')
			}

			var option = {
				tooltip: {
					// formatter: '{a} : {c}'
					formatter: function (params) {
						var str = ''
						// console.log(params);
						if (params.name == '台时效率') {
							str = `<span style="color:red;margin-right:5px">${
								params.value
							}</span><span style="color:#abaca4">${'吨/小时'}</span>`
						} else if (params.name == '船时效率') {
							str = `<span style="color:red;margin-right:5px">${shipHour}</span><span style="color:#abaca4">${'吨/小时'}</span>`
						}
						return str
					},
					position: ['50%', '5%'],
					backgroundColor: '#f5f7fa',
					textStyle: {
						// color:'#f35a3c',
					},
				},
				// toolbox: {
				//     feature: {
				//         restore: {},
				//         saveAsImage: {}
				//     }
				// },
				series: [
					// 外圆环
					{
						tooltip: {
							show: false,
						},
						name: 'wrap',
						type: 'pie',
						hoverAnimation: false,
						legendHoverLink: false,
						center: ['50%', '50%'],
						radius: ['0%', '6%'],
						z: 10,
						label: {
							normal: {
								show: false,
								position: 'center',
							},
							emphasis: {
								show: false,
							},
						},
						labelLine: {
							normal: {
								show: false,
							},
						},
						data: [
							{
								value: 100,
								itemStyle: {
									normal: {
										color: '#bfbfbf',
									},
									// emphasis: {
									//     color: "#bfbfbf"
									// }
								},
							},
						],
					},

					// 内圆环
					{
						tooltip: {
							show: false,
						},
						name: 'wrap',
						type: 'pie',
						hoverAnimation: false,
						legendHoverLink: false,
						center: ['50%', '75%'],
						radius: ['0%', '4%'],
						z: 10,
						label: {
							normal: {
								show: false,
								position: 'center',
							},
							emphasis: {
								show: false,
							},
						},
						labelLine: {
							normal: {
								show: false,
							},
						},
						data: [
							{
								value: 100,
								itemStyle: {
									normal: {
										color: '#bfbfbf',
									},
									// emphasis: {
									//     color: "#bfbfbf"
									// }
								},
							},
						],
					},
					// 内仪表盘
					{
						// name: '实时交通指数',
						type: 'gauge',
						// 红色的数字
						detail: {
							formatter: '{value}',
							fontSize: 12,
							fontWeight: 500,
							fontFamily: 'PingFangSC-Medium',
							color: '#3a3a3a',
							offsetCenter: [0, '70%'],
						},
						// 单位
						// data: [{value: 0, name:'单位：小时/千吨'}],
						data: [{ value: this.panelData.efficiency ? this.panelData.efficiency : 0, name: '台时效率' }],
						min: 0,
						max: 1000,
						radius: '30%',
						splitNumber: 2,
						z: 10,
						startAngle: 155,
						endAngle: 25,
						center: ['50%', '75%'],
						title: {
							offsetCenter: [0, '140%'],
							fontSize: 12,
							color: '#9f9f96',
							fontFamily: 'MicrosoftYaHei',
						},
						// 仪表盘颜色
						axisLine: {
							lineStyle: {
								width: 2,
								// color:[[0.25,colors[0]],[0.5,colors[1]],[0.75,colors[2]],[1,colors[3]]]
								color: [[1, '#30BF78']],
							},
						},
						// 仪表盘内的数字
						axisLabel: {
							show: false,
							fontSize: 12,
							// fontWeight:'bold'
							fontFamily: 'HelveticaNeue',
							color: '#999999',
						},
						// 仪表盘指针
						pointer: {
							// icon: dataUrl,
							show: true,
							length: '90%',
							radius: '20%',
							width: 2, //指针粗细
						},
						// 指针颜色
						itemStyle: {
							normal: {
								color: '#bfbfbf', //指针颜色
							},
						},
						//仪表盘轴线
						axisTick: {
							show: true,
							lineStyle: {
								color: '#30BF78',
								width: 1,
							},
							length: 5,
						},
						//刻度样式
						splitLine: {
							show: true,
							length: 7,
							lineStyle: {
								color: '#30BF78',
								width: 2,
							},
						},
						//分隔线样式
						axisLabel: {
							show: false,
							// distance: 30,
							// textStyle: {
							//     color: '#000',
							//     fontSize: '14'
							// },
							// formatter: '{value}'
						},
					},
					// 外仪表盘
					{
						// name: '实时交通指数',
						type: 'gauge',
						// 红色的数字
						detail: {
							// formatter: '',
							// fontSize:16,
							// // fontWeight:'bold'
							// fontFamily: 'PingFangSC-Medium',
							// color: '#F4664A',
							// offsetCenter:[0,'80%'],
							show: false,
						},
						// 单位
						// data: [{value: 0}],
						// 结果除以1000  每一个刻度代表 1000吨/小时   最大 4000吨/小时
						data: [{ value: shipHour / 1000, name: '船时效率' }],
						min: 0,
						max: 4,
						radius: '80%',
						splitNumber: 4,
						z: 5,
						center: ['50%', '50%'],
						title: {
							offsetCenter: [0, '-30%'],
							fontSize: 14,
							color: '#9f9f96',
							fontFamily: 'MicrosoftYaHei',
						},
						// 仪表盘颜色
						axisLine: {
							lineStyle: {
								width: 7,
								color: [
									[0.25, colors[0]],
									[0.5, colors[1]],
									[0.75, colors[2]],
									[1, colors[3]],
								],
							},
						},
						// 仪表盘内的数字
						axisLabel: {
							fontSize: 12,
							// fontWeight:'bold'
							fontFamily: 'HelveticaNeue',
							color: '#999999',
						},
						// 仪表盘指针
						pointer: {
							// icon: dataUrl,
							show: true,
							length: '70%',
							radius: '20%',
							width: 2, //指针粗细
						},
						// 指针颜色
						itemStyle: {
							normal: {
								color: '#bfbfbf', //指针颜色
							},
						},
						//仪表盘轴线
						axisTick: {
							show: false,
							lineStyle: {
								color: '#fff',
								width: 2,
							},
							length: 0,
						},
						//刻度样式
						splitLine: {
							show: true,
							length: 7,
							lineStyle: {
								color: '#fff',
								width: 2,
							},
						},
						//分隔线样式
						// axisLabel: {
						//     //show:false,
						//     distance: 30,
						//     textStyle: {
						//         color: '#000',
						//         fontSize: '14'
						//     },
						//     formatter: '{value}'
						// },
					},
				],
			}

			// 使用刚指定的配置项和数据显示图表。
			// setInterval(function () {
			//  var value =  Math.round((Math.random() * 10)*10)/10;
			//   option.series[0].data[0].value = value;
			//  option.series[0].data[0].name = getText(value);
			//  option.series[0].title.color = getColor(value);

			myChart.setOption(option, true)
			// },3000);
		},
	},
}
</script>
<style lang="less" scoped></style>
