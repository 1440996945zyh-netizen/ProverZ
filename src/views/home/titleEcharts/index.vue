<template>
	<div id="titleCharts" style="width: 100%; height: 50px"></div>
</template>

<script setup name="TitleEcharts">
import * as echarts from 'echarts'
import { nextTick, onMounted, reactive, toRefs } from 'vue'
const naturalOptions = reactive({
	// 提示框
	tooltip: {
		show: true,
		trigger: 'axis',
		confine: true,
		formatter: '{b}: {c}吨',
	},
	grid: {
		top: 20,
		bottom: 0,
		left: 40,
		right: 40,
	},
	xAxis: {
		type: 'category',
		axisTick: {
			show: false,
		},
		data: [],
		boundaryGap: false,
		axisTick: {
			show: false,
		},
		axisLabel: {
			color: '#fff',
		},
		axisLine: {
			lineStyle: {
				color: 'rgba(12,102,173,.5)',
				width: 1,
			},
		},
		//x轴
		show: false,
	},
	yAxis: {
		//y轴
		show: false,
	},
	series: [
		{
			data: [],
			type: 'line',
			symbol: 'circle',
			symbolSize: 5,
			smooth: true,
			smoothMonotone: 'x',
			itemStyle: {
				normal: {
					color: '#82D99D',
				},
			},
			label: {
				show: true,
				color: '#606266',
				formatter: function (param) {
					if (param.name == '潍坊港区散货码头有限公司') {
						return '散货码头有限公司'
					} else if (param.name == '潍坊港西作业区码头有限公司') {
						return '西作业区码头有限公司'
					} else if (param.name == '山东港口集团潍坊港有限公司') {
						return '潍坊港有限公司'
					} else {
						return param.name
					}
				},
				fontSize: 10,
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: '#82D99D',
						},
						{
							offset: 1,
							color: '#DCF9E0',
						},
					]),
				},
			},
		},
	],
})
const initeCharts = () => {
	let myChart = echarts.init(document.getElementById('titleCharts'))
	// 绘制图表
	myChart.setOption(naturalOptions)
	window.addEventListener('resize', function () {
		myChart.resize()
	})
}

onMounted(() => {
	nextTick(() => {
		initeCharts()
	})
})

defineExpose({
	naturalOptions,
})
</script>

<style lang="scss" scoped></style>
