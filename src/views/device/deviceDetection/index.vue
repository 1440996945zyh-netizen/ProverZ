<!--
 * @Author: zhangsd
 * @Date: 2025-08-12 14:14:32
 * @LastEditTime: 2025-08-13 21:19:59
 * @LastEditors: zhangsd
 * @Description: 设备检测主界面
 * @FilePath: \ppm-view\src\views\device\deviceDetection\index.vue
-->
<template>
	<div>
		<div style="height: 90vh">
			<!-- 上侧区域-->
			<el-row style="" class="top-title">
				<div style="font-size: 28px">1#门机状态监测</div>
			</el-row>

			<!-- 下侧区域-->
			<el-row>
				<div style="display: flex; width: 100%">
					<el-col :span="6">
						<!-- 左侧区域-->
						<div>
							<ul class="infinite-list" v-infinite-scroll="load" style="overflow: auto">
								<Left></Left>
							</ul>
						</div>
					</el-col>
					<!-- 中间区域SVG区域 - 固定尺寸确保稳定性 -->
					<el-col :span="12">
						<div style="">
							<SvgIndex @selectLabel="selectLabel" />
						</div>
					</el-col>
					<!-- 右侧区域-->
					<el-col :span="6">
						<div>
							<Right></Right>
						</div>
					</el-col>
				</div>
			</el-row>
		</div>
	</div>
</template>
<script setup name="deviceDetection">
import SvgIndex from './detail/svgIndex.vue'
import DeviceTargetDetection from './detail/deviceTargetDetection.vue'
import Left from './detail/left.vue'
import Right from './detail/right.vue'
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/device/index.js'
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'

// 状态管理
const activeTab = ref('1')
const baseTable = ref()
const tableHeight = ref(0)
const tableHeight1 = ref(window.innerHeight - 250)
const total = ref(0)
const tableData = ref([])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	deviceName: '',
	startTime: '',
	endTime: '',
	repairCenter: '',
	alarmLevel: '',
})
const tabsNameSuffix = ref('-起升机构')
const deviceTargetDetectionRef = ref(null)

// 表格列配置
const tableColumns = reactive([
	{ label: '设备名称', prop: 'deviceName', align: 'center', width: 120 },
	{ label: '所属单位', prop: 'company', align: 'center', width: 120 },
	{ label: '使用部门', prop: 'department', align: 'center', width: 120 },
	{ label: '维修中心', prop: 'repairCenter', align: 'center', width: 120 },
	{ label: '报警名称', prop: 'alarmName', align: 'center', width: 120 },
	{ label: '报警级别', prop: 'alarmLevel', align: 'center', width: 120 },
	{ label: '报警内容', prop: 'alarmContent', align: 'center', width: 120 },
	{ label: '报警时间', prop: 'alarmTime', align: 'center', width: 120 },
	{ label: '报警描述', prop: 'alarmDesc', align: 'center', width: 120 },
	{ label: '工单号', prop: 'orderNo', align: 'center', width: 120 },
	{
		prop: '',
		label: '操作',
		width: 120,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleEdit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Switch',
					},
					{
						default: () => '转工单',
					}
				),
			]
		},
	},
])

// 查询条件配置
const selectData = reactive([
	{
		name: '报警时间',
		type: 'datetimerange',
		modelValue: 'dateRange',
		span: 12,
		format: 'YYYY-MM-DD HH:mm:ss',
	},
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'deviceName',
		span: 4,
	},
	{
		name: '维修中心',
		type: 'input',
		modelValue: 'repairCenter',
		span: 4,
	},
	{
		name: '报警级别',
		type: 'input',
		modelValue: 'alarmLevel',
		span: 4,
	},
])

// 按钮列表配置
const buttonList = reactive([
	{
		label: '新增',
		type: 'success',
		icon: 'Check',
		click: () => batchApprove(),
		permission: 'master:arrival:agree',
	},
])

// 查询列表
const getList = params => {
	// 合并分页与查询条件
	const query = { ...queryParams.value, ...params }
	// api.getAlarmList(query).then(res => {
	// 	tableData.value = res.data.records
	// 	total.value = res.data.total
	// }).catch(err => {
	// 	ElMessage.error('查询失败，请重试')
	// })
	tableData.value = [
		{
			deviceName: 'S08门机',
			company: '一公司',
			department: '门机队',
			repairCenter: '南区维修中心',
			alarmName: '水温过高报警',
			alarmLevel: '预警',
			alarmContent: '温度T=30度',
			alarmTime: '2025-08-01 13:55:00',
			alarmDesc: '水温超出正常范围',
			orderNo: '--',
		},
		{
			deviceName: 'S08门机',
			company: '一公司',
			department: '门机队',
			repairCenter: '南区维修中心',
			alarmName: '电机过载报警',
			alarmLevel: '警告',
			alarmContent: '电流I=15A',
			alarmTime: '2025-08-02 10:20:00',
			alarmDesc: '电机负载过大',
			orderNo: 'WD001',
		},
	]
}

// 转工单处理函数
const handleEdit = row => {
	ElMessageBox.prompt(`确定要将 "${row.alarmName}" 转为工单吗？`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			ElMessage.success('转工单成功')
			getList(queryParams.value) // 刷新列表
		})
		.catch(() => {
			ElMessage.info('已取消转工单')
		})
}

// 批量审批（占位）
const batchApprove = () => {
	ElMessage.info('新增功能待实现')
}

// 动态更新表格高度
const updateTableHeight = () => {
	tableHeight.value = window.innerHeight - 220
}

// Tab切换处理
const handleTabChange = () => {
	updateTableHeight()
}
const selectLabel = label => {
	console.log('label====》', label)
	// 显示机构名称
	tabsNameSuffix.value = '-' + label.text
	nextTick(() => {
		// 根据不同机构显示不同告警数据和监测数据
		if ('变幅机构' == label.text) {
			// 告警数据
			tableData.value = [
				{
					deviceName: 'S08门机',
					company: '一公司',
					department: '门机队',
					repairCenter: '南区维修中心',
					alarmName: '润滑不足报警',
					alarmLevel: '预警',
					alarmContent: '润滑油液位低',
					alarmTime: '2025-08-03 09:10:00',
					alarmDesc: '需补充润滑油',
					orderNo: '--',
				},
				{
					deviceName: 'S08门机',
					company: '一公司',
					department: '门机队',
					repairCenter: '南区维修中心',
					alarmName: '振动异常报警',
					alarmLevel: '严重',
					alarmContent: '振动值V=5mm/s',
					alarmTime: '2025-08-04 14:30:00',
					alarmDesc: '设备可能故障',
					orderNo: 'WD002',
				},
			]
			// 指标数据
			deviceTargetDetectionRef.value.indicatorData = [
				{
					id: 'ZHIBIA1001',
					title: '电机-转速',
					value: 2000,
					unit: 'rps',
					name: '转速传感器',
					status: '运行',
				},
				{
					id: 'ZHIBIA1002',
					title: '电机-温度',
					value: 40,
					unit: '°C',
					status: '运行',
					name: '三轴温振一体传感器',
				},
				{
					id: 'ZHIBIA1004',
					title: '减速箱-温度',
					value: 30,
					unit: '°C',
					status: '运行',
					name: '三轴温振一体传感器',
				},
				{
					id: 'ZHIBIA1005',
					title: '减速箱-振动',
					value: 1000,
					unit: 'mm/s',
					status: '运行',
					name: '三轴温振一体传感器',
				},
			]
		} else if ('起升机构' == label.text) {
			// 告警数据
			tableData.value = [
				{
					deviceName: 'S08门机',
					company: '一公司',
					department: '门机队',
					repairCenter: '南区维修中心',
					alarmName: '水温过高报警',
					alarmLevel: '预警',
					alarmContent: '温度T=30度',
					alarmTime: '2025-08-01 13:55:00',
					alarmDesc: '水温超出正常范围',
					orderNo: '--',
				},
				{
					deviceName: 'S08门机',
					company: '一公司',
					department: '门机队',
					repairCenter: '南区维修中心',
					alarmName: '电机过载报警',
					alarmLevel: '警告',
					alarmContent: '电流I=15A',
					alarmTime: '2025-08-02 10:20:00',
					alarmDesc: '电机负载过大',
					orderNo: 'WD001',
				},
			]

			// 指标数据
			deviceTargetDetectionRef.value.indicatorData = [
				{
					id: 'ZHIBIAO001',
					title: '电机-转速',
					value: 1000,
					unit: 'rps',
					name: '转速传感器',
					status: '运行',
				},
				{
					id: 'ZHIBIAO002',
					title: '电机-温度',
					value: 20,
					unit: '°C',
					status: '运行',
					name: '三轴温振一体传感器',
				},
				{
					id: 'ZHIBIAO003',
					title: '电机-振动',
					value: 50,
					unit: 'mm/s',
					status: '停止',
					name: '三轴温振一体传感器',
				},
				{
					id: 'ZHIBIAO004',
					title: '减速箱-温度',
					value: 50,
					unit: '°C',
					status: '运行',
					name: '三轴温振一体传感器',
				},
				{
					id: 'ZHIBIAO005',
					title: '减速箱-振动',
					value: 100,
					unit: 'mm/s',
					status: '运行',
					name: '三轴温振一体传感器',
				},
			]
		}
	})
}

// 初始化
onMounted(() => {
	updateTableHeight()
	window.addEventListener('resize', updateTableHeight)
	getList(queryParams.value)
})

// 清理
onUnmounted(() => {
	window.removeEventListener('resize', updateTableHeight)
})
</script>

<style lang="scss" scoped>
.app-container {
	// display: flex;
	// height: 100vh;
	// overflow: hidden;

	.left-container {
		width: 40vw;
		height: 100vh;
		min-width: 500px;
		// padding: 16px;
		box-sizing: border-box;
		background: #f5f7fa;
		// transition: all 0.3s ease;
	}

	.right-container {
		width: 60vw;
		height: 100vh;
		min-width: 600px;
		overflow: hidden;

		.demo-tabs {
			height: 100%;
			display: flex;
			flex-direction: column;

			& > .el-tabs__header {
				padding: 0 16px;
				border-bottom: 1px solid #e5e7eb;
			}

			& > .el-tabs__content {
				flex: 1;
				padding: 16px;
				overflow-y: auto;
			}
		}
	}
}
.card-box {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
	padding: 0px 16px;
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
.top-title {
	height: 50px;
	background-color: antiquewhite;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	// width: 97%;
	margin: 0 auto;
	margin-bottom:15px;
}
</style>
