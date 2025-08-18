<!--
 * @Author: zhangsd
 * @Date: 2025-08-12 14:36:56
 * @LastEditTime: 2025-08-12 16:05:00
 * @LastEditors: zhangsd
 * @Description: 设备指标检测tab
 * @FilePath: \ppm-view\src\views\device\deviceDetection\detail\deviceTargetDetection.vue
-->
<template>
	<div class="container">
		<div class="card-box">
			<div class="card" v-for="item in indicatorData" :key="item.id">
				<div class="card-header">
					<span class="title">指标名称</span>
					<span :class="getStatusClass(item.status)">{{ item.status }}</span>
				</div>
				<div class="card-header-content">{{ item.title }}</div>
				<div class="card-content">
					<div class="item">
						<span class="label">传感器名称</span>
						<span class="value">{{ item.name }}</span>
					</div>
					<div class="item">
						<span class="label">指标标识</span>
						<span class="value">{{ item.id }}</span>
					</div>
					<div class="item">
						<span class="label">监测值:</span>
						<span class="value">{{ item.value }} {{ item.unit || '' }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup name="DeviceTargetDetection">
import { ref, onMounted, onUnmounted } from 'vue'
import deviceApi from '@/api/device/index.js'
import { ElMessage } from 'element-plus'

// 容器高度响应式管理
const containerHeight = ref(0)

// 指标数据
const indicatorData = ref([{
				id: 'ZHIBIAO001',
				title: '电机-转速',
				value: 1000,
				unit: 'rps',
				name:'转速传感器',
				status: '运行',
			},
			{
				id: 'ZHIBIAO002',
				title: '电机-温度',
				value: 20,
				unit: '°C',
				status: '运行',
				name:'三轴温振一体传感器',
			},
			{
				id: 'ZHIBIAO003',
				title: '电机-振动',
				value: 50,
				unit: 'mm/s',
				status: '停止',
				name:'振动传感器',
			},
			{
				id: 'ZHIBIAO004',
				title: '减速箱-温度',
				value: 50,
				unit: '°C',
				status: '运行',
				name:'三轴温振一体传感器',
			},
			{
				id: 'ZHIBIAO005',
				title: '减速箱-振动',
				value: 100,
				unit: 'mm/s',
				status: '运行',
				name:'振动传感器',
			}])

// 状态样式计算
const getStatusClass = (status) => {
	const base = 'status'
	switch(status) {
		case '运行': return `${base} status-running`
		case '停止': return `${base} status-stopped`
		case '维护': return `${base} status-maintaining`
		default: return base
	}
}

// 动态更新高度
const updateHeight = () => {
	containerHeight.value = window.innerHeight - 180
}

// 初始化函数
const init = async () => {
	try {
		const res = await deviceApi.queryDatalinkSignDev()
		if (res) {
			getEquipmentIndicatorObj()
		}
	} catch (error) {
		ElMessage.error('初始化数据失败: ' + error.message)
	}
}

// 故障情况处理函数
const getEquipmentIndicatorObj = () => {
	let answerParamList = []
	let selectParams = [
		{
			lowerLimitExclusive: false,
			param: 'startTime',
			rangeFilter: -1,
			values: [],
		},
		{
			upperLimitExclusive: false,
			param: 'endTime',
			rangeFilter: 1,
			values: [],
		},
	]

	answerParamList.push({
		id: import.meta.env.VITE_MAINTENANCE_FAULT_ID,
		maxRows: 1000,
		pageNum: 1,
		pageSize: 350,
		refreshCache: false,
		params: selectParams,
	})

	getEquipmentIndicatorData({
		srcTenantId: 'fe41a0fc-46bf-d6a0-e6be-850d14e9e0f8',
		boardId: import.meta.env.VITE_MAINTENANCE_STATUTION_BOARDID,
		behavior: 'VIEW',
		boardName: '',
		pageName: '新页面',
		pageId: import.meta.env.VITE_MAINTENANCE_STATUTION_PAGEID,
		answerParamList,
	})
}

// 获取设备指标数据
const getEquipmentIndicatorData = async params => {
	try {
		const res = await deviceApi.getAnswers(params)
		if (res.errorMsg !== 'SUCCESS') {
			ElMessage.warning('获取数据异常: ' + res.errorMsg)
			return
		}
		
		const data = res.data || []
		if (data.length) {
			indicatorData.value = data[0].data
		}
	} catch (error) {
		ElMessage.error('获取指标数据失败: ' + error.message)
	}
}

// 组件挂载时执行初始化
onMounted(() => {
	console.log("indicatorData",indicatorData)
	updateHeight()
	window.addEventListener('resize', updateHeight)
	// init()
})

// 清理事件监听
onUnmounted(() => {
	window.removeEventListener('resize', updateHeight)
})
defineExpose({
	indicatorData,
})
</script>

<style scoped>
.container {
  height: 100%;
  overflow: hidden;
}

.card-box {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
	padding: 16px;
	height: 100%;
	overflow-y: auto;
}

/* 卡片样式 */
.card {
	background-color: #ffffff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 16px;
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 卡片头部 */
.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.card-header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	font-size: 18px;
	font-weight: 500;
	color: #333;
}

.title {
	font-size: 14px;
	color: #666;
	font-weight: 500;
}

.status {
	font-size: 12px;
	color: #fff;
	padding: 4px 8px;
	border-radius: 4px;
}

.status-running {
	background-color: #e6f7ee;
	color: #00875a;
}

.status-stopped {
	background-color: #fff2f3;
	color: #d92525;
}

.status-maintaining {
	background-color: #fff8e6;
	color: #d48806;
}

/* 卡片内容区域 */
.card-content {
	border-top: 1px solid #eee;
	padding-top: 10px;
}

.item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.label {
	font-size: 14px;
	color: #666;
	font-weight: 400;
}

.value {
	font-size: 14px;
	color: #333;
	font-weight: 600;
}
</style>
