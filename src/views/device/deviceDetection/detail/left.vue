<!--
 * @Author: zhangsd
 * @Date: 2025-08-12 14:36:56
 * @LastEditTime: 2025-08-12 16:05:00
 * @LastEditors: zhangsd
 * @Description: 设备指标检测tab
 * @FilePath: \ppm-view\src\views\device\deviceDetection\detail\deviceTargetDetection.vue
-->
<template>
	<!-- <div class="container"> -->
		<div class="card-box">
			<div class="card" >
				<div class="card-header">
					<span class="title">设备基本信息</span>
					<span style="color: green; font-weight: 800;">
						<el-tag effect="dark"  type="success">{{ deviceBasicInfo.statusName }}</el-tag>
						
					</span>
				</div>
				<div class="card-content">
					<div class="item">
						<span class="label">设备名称</span>
						<span class="value">{{ deviceBasicInfo.name }}</span>
					</div>
					<div class="item">
						<span class="label">设备型号</span>
						<span class="value">{{ deviceBasicInfo.deviceModel }}</span>
					</div>
					<div class="item">
						<span class="label">生产厂家</span>
						<span class="value">{{ deviceBasicInfo.manufacturer }}</span>
					</div>
					<div class="item">
						<span class="label">生产日期</span>
						<span class="value">{{ deviceBasicInfo.createDate }}</span>
					</div>
					<div class="item">
						<span class="label">投用日期</span>
						<span class="value">{{ deviceBasicInfo.dateOfUse }}</span>
					</div>
					<div class="item">
						<span class="label">描述</span>
						<span class="value">{{ deviceBasicInfo.describe }}</span>
					</div>
				</div>
			</div>

			<!-- 告警数据-->
			 <div class="card " >
				<div class="card-header">
					<span class="title">告警数据</span>
				</div>
				<div class="card-content">
					<el-table
						size="mini"
						:data="tableData"
						:height="tableHeight"
						style="width: 100%">
						<el-table-column v-for="item in tableColumns"
							:prop="item.prop"
							:label="item.label"
							:width="item.width"
							:align="item.align" />
					</el-table>
				</div>
			</div>
		</div>
	<!-- </div> -->
</template>

<script setup name="DeviceTargetDetection">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
const tableHeight = ref(window.innerHeight - 520)

// 容器高度响应式管理
const containerHeight = ref(0)
// 设备基础信息
const deviceBasicInfo = ref({
	name: '1#门机', // 设备名称
	deviceModel: '50T', // 规格型号
	manufacturer: 'XXX机械有限公司', // 制造商
	createDate: '2025-01-01', // 生产日期
	dateOfUse: '2025-06-01',  // 投用日期
	describe: '', // 描述
	statusName: '在线', // 设备状态
})



// 告警信息
const tableColumns = reactive([
	{ label: '报警名称', prop: 'alarmName', align: 'center', width: "80px"},
	{ label: '报警级别', prop: 'alarmLevel', align: 'center',width: "80px" },
	{ label: '报警内容', prop: 'alarmContent', align: 'center',  width: "80px"},
	{ label: '报警时间', prop: 'alarmTime', align: 'center', width: "140px"},
])
const tableData = ref([
			{
				alarmName: '水温过高',
				alarmLevel: '预警',
				alarmContent: 'T=30度',
				alarmTime: '2025-08-01 13:55',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
			},
			{
				alarmName: '电机过载',
				alarmLevel: '警告',
				alarmContent: 'I=15A',
				alarmTime: '2025-08-02 10:20',
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
	background-color: #ffffff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding:0px 16px;
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
	border-top: 1px solid #eee;
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
</style>
