<!--
 * @Author: zhangsd
 * @Date: 2025-08-12 14:36:56
 * @LastEditTime: 2025-08-13 21:05:31
 * @LastEditors: zhangsd
 * @Description: 设备指标检测tab
 * @FilePath: \ppm-view\src\views\device\deviceDetection\detail\right.vue
-->
<template>
	<div class="card-box" :style="{ height: height + 'px' }">
		<div class="card" v-for="item in featureInfoArr">
			<div class="card-header">
				<span class="title">{{ item.title }}</span>
			</div>
			<div class="card-content" v-for="(components, index) in item.components">

				<div style="display: flex; padding-bottom: 15px; font-weight: 700;"><span class="circle">{{ index + 1 }}</span> {{ components.title }}</div>
				<div>
					<div v-for="(feature, index) in components.feature" >
						<div style="display: flex;">
							<div style="width: 15%; font-weight: 600; font-size: 12px;">
								{{ feature.title }}
							</div>
							<div style="width: 85%; font-size: 11px;">
								<div v-for="featureChild in feature.featureChild">
									<el-row style="padding-bottom: 5px;">
										<el-col :span="3" >
											<span >{{ featureChild.name }}</span>
										</el-col>
										<el-col :span="7" >
											<span>{{ featureChild.value }}<el-divider direction="vertical"></el-divider>{{ featureChild.unit }}</span>
										</el-col>
										<el-col :span="9" >
											<span>{{ featureChild.sensorName }}</span>
										</el-col>
										<el-col :span="2" >
											<span><el-tag size="mini" :type="featureChild.statusName == '运行' ? 'success' : 'info'">{{ featureChild.statusName }}</el-tag></span>
										</el-col>
									
									</el-row>
									
								
								</div>
							</div>
						</div>
						<el-divider v-if="index != feature.length - 1"></el-divider>

					</div>
					
				</div>

			</div>
		</div>
	</div>
</template>

<script setup name="DeviceTargetDetection">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
const height = ref(window.innerHeight - 110)

// 容器高度响应式管理
const containerHeight = ref(0)
// 指标信息
const featureInfoArr = ref([
	{
		title: '起升机构',
		components: [{
			title: '起升1#机构',
			feature: [
				{
					title: '电机',
					featureChild: [
						{
							name: '转速', // 设备名称
							value: '1000',
							unit: 'rps',
							statusName: '运行',
							sensorName: '温度传感器'
						},{
							name: '温度', // 设备名称
							value: '30.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '99.99',
							unit: 'mm/s',
							statusName: '停止',
							sensorName: '振动传感器'
						}
					]
				},{
					title: '减速箱',
					featureChild: [
						{
							name: '温度', // 设备名称
							value: '50.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '1000',
							unit: 'mm/s',
							statusName: '运行',
							sensorName: '振动传感器'
						}
					]
				}
			]
		},{
			title: '起升2#机构',
			feature: [
				{
					title: '电机',
					featureChild: [
						{
							name: '转速', // 设备名称
							value: '1000',
							unit: 'rps',
							statusName: '运行',
							sensorName: '温度传感器'
						},{
							name: '温度', // 设备名称
							value: '30.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '99.99',
							unit: 'mm/s',
							statusName: '停止',
							sensorName: '振动传感器'
						}
					]
				},{
					title: '减速箱',
					featureChild: [
						{
							name: '温度', // 设备名称
							value: '50.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '1000',
							unit: 'mm/s',
							statusName: '运行',
							sensorName: '振动传感器'
						}
					]
				}
			]
		}]
	},{
		title: '旋转机构',
		components: [{
			title: '旋转1#机构',
			feature: [
				{
					title: '电机',
					featureChild: [
						{
							name: '转速', // 设备名称
							value: '1000',
							unit: 'rps',
							statusName: '运行',
							sensorName: '温度传感器'
						},{
							name: '温度', // 设备名称
							value: '30.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '99.99',
							unit: 'mm/s',
							statusName: '停止',
							sensorName: '振动传感器'
						}
					]
				},{
					title: '减速箱',
					featureChild: [
						{
							name: '温度', // 设备名称
							value: '50.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '1000',
							unit: 'mm/s',
							statusName: '运行',
							sensorName: '振动传感器'
						}
					]
				}
			]
		},{
			title: '大回转',
			feature: [
				{
					title: '驱动齿轮1',
					featureChild: [
						{
							name: '温度', // 设备名称
							value: '30.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '99.99',
							unit: 'mm/s',
							statusName: '停止',
							sensorName: '振动传感器'
						}
					]
				},{
					title: '驱动齿轮2',
					featureChild: [
						{
							name: '温度', // 设备名称
							value: '50.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '1000',
							unit: 'mm/s',
							statusName: '运行',
							sensorName: '振动传感器'
						}
					]
				}
			]
		}]
	},{
		title: '变幅机构',
		components: [{
			title: '变幅机构',
			feature: [
				{
					title: '电机',
					featureChild: [
						{
							name: '转速', // 设备名称
							value: '1000',
							unit: 'rps',
							statusName: '运行',
							sensorName: '温度传感器'
						},{
							name: '温度', // 设备名称
							value: '30.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '99.99',
							unit: 'mm/s',
							statusName: '停止',
							sensorName: '振动传感器'
						}
					]
				},{
					title: '减速箱',
					featureChild: [
						{
							name: '温度', // 设备名称
							value: '50.00',
							unit: '°C',
							statusName: '运行',
							sensorName: '三轴温振一体传感器'
						},{
							name: '振动', // 设备名称
							value: '1000',
							unit: 'mm/s',
							statusName: '运行',
							sensorName: '振动传感器'
						}
					]
				}
			]
		}]
	}
])

// 动态更新高度
const updateHeight = () => {
	containerHeight.value = window.innerHeight - 180
}

// 组件挂载时执行初始化
onMounted(() => {
	window.addEventListener('resize', updateHeight)
})

// 清理事件监听
onUnmounted(() => {
	window.removeEventListener('resize', updateHeight)
})
</script>

<style scoped lang="scss">
.container {
	height: 100%;
	overflow: hidden;
	background-color: rgba(255, 255, 255, 0.3)
}

.card-box {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
	padding:0px 16px;
	height: 100%;
	overflow-y: auto;
	background-color: #ffffff;
}

/* 卡片样式 */
.card {
	/* background-color: #ffffff; */
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding:0px 16px;
	box-sizing: border-box;
	transition: all 0.3s ease;
	/* background-color: rgba(0, 0, 0, 0.2), */
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
	color: #333;
	font-weight: 700;
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
	/* border-top: 1px solid #eee; */
	padding-top: 10px;
}

.item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
}

.label {
	font-size: 14px;
	color: #333;
	font-weight: 500;
}

.value {
	font-size: 14px;
	color: #666;
	font-weight: 400;
}

.circle {
	display: flex;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	text-align: center;
	justify-content: center;
	align-items: center;
	border: 1px solid #fff;
	background-color: #87d182;
	color: #fff;
	margin-right: 10px;

}
</style>
