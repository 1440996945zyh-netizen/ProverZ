<template>
	<div class="geo" id="map_geo"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import shandong from '@/assets/styles/dispatch/shandong.json'
import { onMounted, ref } from 'vue'
const emit = defineEmits(['map_change'])
const mapData = ref([
	// { name: '潍坊港', value: [119.190891, 37.237446], type: 10, itemStyle: { color: '#06f797' } },
  { name: '潍坊港', value: [119.190891, 37.237446], type: 10, },
	{ name: '寿光港', value: [118.89, 37.25], type: 20 },
	{ name: '滨州港', value: [118.056061, 38.177471], type: 40 },
	{ name: '东营港', value: [118.95865, 38.092389], type: 30 },
	// 其他标记点数据
])
const init = name => {
	// 获取图标 初始化
	var myChart = echarts.init(document.getElementById('map_geo'))

	// 图标指定数据
	echarts.registerMap(name, name)

	const option = {
		backgroundColor: '#080a20',
		// 图标标题
		// 鼠标移入显示的内容
		// tooltip: {
		// 	trigger: 'item',
		// 	formatter: '{b}<br/>{c} (p / km2)',
		// },
		// 数据视图
		geo: [
			{
				// 指定图标为地图
				type: 'map',
				// 设置数据
				map: name,
				zoom: 3.5, //设置初始化的缩放比例
				roam: true, // 设置允许缩放以及拖动的效果
				center: [118.3, 37.65], // 调整地图位置
				label: {
					show: false, //展示标签
					color: '#68feef',
				},
				itemStyle: {
					// 地图样式
					areaColor: '#142957', //区域颜色
					borderColor: '#71dff8', //边框颜色
					borderWidth: 1,
					shadowBlur: 3,
					shadowColor: '#06a5a2cc',
				},
				emphasis: {
					// 鼠标移入时显示的默认样式
					itemStyle: {
						areaColor: '#1d3a78',
						borderColor: '#71f8f1',
						borderWidth: 1,
					},
					label: {
						// 文字
						show: true,
						color: '#68ddfe',
						fontSize: 12,
						fontWeight: 600,
					},
				},
			},
		],
		series: [
			{
				name: '标记点',
				// type: 'scatter',
				type: 'effectScatter',
				effectType: 'ripple',
				showEffectOn: 'render',
				rippleEffect: {
					//设置涟漪特效
					period: 4, //设置动画的时间，数字越小，动画越快
					scale: 3.5, //设置动画中波纹的最大缩放比例
					brushType: 'fill', //设置波纹的绘制方式，可选'stroke'和'fill'
				},
				coordinateSystem: 'geo',
				data: mapData.value,
				symbolSize: 10,
				label: {
					show: true, //是否显示标签
					position: 'top', //标签的位置
					color: '#fff', //文字的颜色
					shadowBlur: 10,
					shadowColor: '#fff',
					fontSize: 12, //文字的字体大小
					formatter: '{b}',
				},
				itemStyle: {
					opacity: 0.8, //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
					color: '#03bdfa',
					shadowBlur: 10,
					shadowColor: '#bedff9',
					// color: onColor,
				},
			},
		],
	}

	// 把option设置给myChart实例
	myChart.setOption(option, true)

	window.addEventListener('resize', function () {
		myChart.resize()
	})
  const regions = ref([
    { name: '潍坊港', value: [119.190891, 37.237446], type: 10, itemStyle: { color: '#0cf2cc' } },
    { name: '寿光港', value: [118.89, 37.25], type: 20 },
    { name: '滨州港', value: [118.056061, 38.177471], type: 40 },
    { name: '东营港', value: [118.95865, 38.092389], type: 30 },
  ]) // 不同的地域列表
  const timer = ref(null)
  const index = ref(0)
  const mapRef = ref(null)
  const mapType = ref(10)

  myChart.off('click');
  // // 点击切换到省份
	myChart.on('click', function (params) {
    console.log(1111)
    var clickedMarkerName = params.name // 获取点击的标记名称
    let data = [];
    // 查找被点击的标记
    const clickedMarker = regions.value.find(marker => marker.name === clickedMarkerName);
    if (clickedMarker) {
      // 更新地图类型
      mapType.value = clickedMarker.type;

      // 更新数据，突出显示被点击的标记
      data = regions.value.map(item => {
        if (item.name === clickedMarkerName) {
          return { name: item.name, value: item.value, type: item.type, itemStyle: { color: '#06f797' } };
        } else {
          return { name: item.name, value: item.value, type: item.type };
        }
      });
      emit('map_change', mapType.value)
      updateMap(data);
    }
	})


  myChart.getZr().on('click', function(params){
    if(params.topTarget===undefined){
      mapType.value = null
      emit('map_change', mapType.value)
    }else if(params.topTarget.eventData !==undefined){
      mapType.value = null
      emit('map_change', mapType.value)
    }
  })
}

const updateMap = data => {
	mapData.value = data
	// myChart.setOption(option) // 重新渲染地图
	init(shandong)
}
// 加载完就调用的方法 vue3生命周期
onMounted(() => {
	init(shandong)
})
defineExpose({
	updateMap,
})
</script>

<style lang="scss" scoped>
.geo {
	width: 100%;
	height: 100%;
}
</style>
