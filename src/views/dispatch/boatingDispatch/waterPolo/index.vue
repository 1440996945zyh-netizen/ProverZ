<template>
	<div id="main" style="width: 100%; height: 150px"></div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts-liquidfill/src/liquidFill.js' //在这里引入'
export default {
	name: 'waterPolo',
	props: {
		data: {
			type: Object,
		},
	},
	data() {
		return {
			waterPoloData: this.data,
		}
	},
	created() {
		this.$nextTick(() => {
			this.waterPoloData = this.data
			// this.drawLine();
		})
	},
	computed: {
		dataArray() {
			let waterPoloData = this.data
			return waterPoloData
		},
	},
	watch: {
		dataArray: {
			handler(val) {
				this.$nextTick(() => {
					console.log('水滴图数据', val)
					this.waterPoloData = val
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
			var myChart = echarts.init(document.getElementById('main'))

			// 指定图表的配置项和数据
			// data个数代表波浪数
			var value = 0
			var time = 0
			// var data = [0.5,0.5,0.5];   // 一个item 展示一条波浪
			var data = []
			if (this.waterPoloData.finishWorkDate != null && this.waterPoloData.startWorkDate != null) {
				let finishWorkDate = Date.parse(new Date(this.waterPoloData.finishWorkDate))
				let startWorkDate = Date.parse(new Date(this.waterPoloData.startWorkDate))
				time = ((finishWorkDate - startWorkDate) / 1000 / 60 / 60).toFixed(2)
				console.log(time, 'time')
			}
			if (this.waterPoloData.progress) {
				value = (this.waterPoloData.progress * 100).toFixed(0)
				data = [this.waterPoloData.progress, this.waterPoloData.progress, this.waterPoloData.progress]
			} else {
				data = [0, 0, 0]
			}
			// var time = 0

			var option = {
				backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [
					{
						offset: 0,
						color: '#fff',
					},
					// }, {
					//     offset: 1,
					//     color: '#471bba'
					// }
				]),
				title: {
					// text: (value * 100).toFixed(0) + '{a|%}' + '/' +  (value * 100).toFixed(0) + '{a|%}',
					text: time + '{a|h}' + '/' + value + '{a|%}',
					textStyle: {
						fontSize: 16,
						fontFamily: 'HelveticaNeue-Medium',
						fontWeight: 'normal',
						color: 'rgba(0,0,0,0.45)',
						rich: {
							a: {
								fontSize: 16,
							},
						},
					},
					x: 'center',
					y: '60%',
				},
				graphic: [
					{
						type: 'group',
						left: 'center',
						top: '30%',
						children: [
							{
								type: 'text',
								z: 100,
								left: '10',
								top: 'middle',
								style: {
									fill: '#000000',
									// fill: '#a5a5a5',
									text: '作业时间/进度',
									font: '12px PingFangSC-Regular',
								},
							},
						],
					},
				],
				series: [
					{
						type: 'liquidFill',
						radius: '95%',
						center: ['50%', '50%'],
						//  shape: 'roundRect',
						data: data,
						backgroundStyle: {
							color: {
								type: 'linear',
								x: 1,
								y: 0,
								x2: 0.5,
								y2: 1,
								colorStops: [
									{
										offset: 1,
										// color: 'rgba(68, 145, 253, 0)'
										color: '#fff',
									},
									// {
									//     offset: 0.5,
									//     color: 'rgba(68, 145, 253, .25)'
									// }, {
									//     offset: 0,
									//     color: 'rgba(68, 145, 253, 1)'
									// }
								],
								globalCoord: false,
							},
						},
						outline: {
							borderDistance: 0,
							itemStyle: {
								borderWidth: 2,
								borderColor: {
									type: 'linear',
									x: 0,
									y: 0,
									x2: 0,
									y2: 1,
									colorStops: [
										{
											offset: 0,
											color: '#5B8FF9',
										},
										// {
										//     offset: 0.5,
										//     color: 'rgba(69, 73, 240, .25)'
										// }, {
										//     offset: 1,
										//     color: 'rgba(69, 73, 240, 1)'
										// }
									],
									globalCoord: false,
								},
								shadowBlur: 0,
								// shadowColor: '#000',
							},
						},
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [
								{
									offset: 0,
									color: '#6a99f9',
								},
								// {
								//     offset: 0.75,
								//     color: '#5B8FF9'
								// },
								// {
								//     offset: 0,
								//     color: '#c5d6fd'
								// }
							],
							globalCoord: false,
						},
						label: {
							formatter: '',
						},
					},
				],
			}
			// 使用刚指定的配置项和数据显示图表。
			myChart.setOption(option)
		},
	},
}
</script>
<style lang="less" scoped></style>
