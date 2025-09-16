
<!--
 * @Author: zhangsd
 * @Date: 2025-09-10 15:18:28
 * @LastEditTime: 2025-09-15 17:23:34
 * @LastEditors: zhangsd
 * @Description: 流程关系
 * @FilePath: \view\src\views\example\process\index.vue
-->
<template>
	<div class="app">
		<h1>港口作业流程图演示</h1>
		<!-- <el-button @click="dialogVisible = true">哈哈哈哈</el-button> -->
		<div class="tabs">
			<el-tabs v-model="activeTab">
				<el-tab-pane label="ECharts版本" name="echarts">
					<FlowChart />
				</el-tab-pane>
				<el-tab-pane label="svg版本" name="svg1">
					<PortOperationFlowchart
						:treeData="treeFlowData"
						:config="{
							nodeWidth: 200,
							horizontalSpacing: 300,
							showGrid: true,
						}"
					/>
				</el-tab-pane>
				<el-tab-pane label="PortFlowChart" name="PortFlowChart">
					<PortFlowChart
						:treeData="customFlowData"
						:config="{
							nodeWidth: 200,
							horizontalSpacing: 300,
							showGrid: false,
						}"
					/>
				</el-tab-pane>
			</el-tabs>
		</div>
		<!-- 弹窗 -->
		<Dialog :title="dialogTitle" v-model:visible="dialogVisible" width="60%" :close-on-click-modal="false">
			<template #header>
				<div class="dialog-header">
					<h2>{{ dialogTitle }}</h2>
					<svg-icon id="close-icon" icon-class="close" @click="dialogVisible = false" class="close-icon" />
				</div>
			</template>
			<div>
				<el-form :model="form">
					<el-form-item label="Promotion name" :label-width="formLabelWidth">
						<el-input v-model="form.name" autocomplete="off" />
					</el-form-item>
					<el-form-item label="Zones" :label-width="formLabelWidth">
						<el-select v-model="form.region" placeholder="Please select a zone">
							<el-option label="Zone No.1" value="shanghai" />
							<el-option label="Zone No.2" value="beijing" />
						</el-select>
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">Cancel</el-button>
					<el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import FlowChart from './detail/FlowChart.vue'
import PortOperationFlowchart from './detail/PortOperationFlowchart.vue'
import PortFlowChart from './detail/PortFlowChart.vue'
import { ref } from 'vue'
import Dialog from '@/components/Dialog'
const activeTab = ref('echarts')
const dialogTitle = ref('测试')
const dialogVisible = ref(false)
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})
const formLabelWidth = '140px'
const treeFlowData = ref([
	// 流程1：集港→货区→装船/转栈→疏港/二次转栈
	{
		id: 1,
		label: '集港作业(钢材)',
		type: 'collection',
		cargo: '螺纹钢',
		pieces: 500,
		weight: 2500,
		plannedTime: '2024-05-01 08:00',
		actualTime: '2024-05-01 08:30',
		status: 'completed',
		operator: '张三',
		notes: '提前30分钟完成，无异常',
		area: '码头入口',
		children: [
			{
				id: 2,
				label: '进入货区A',
				type: 'normal',
				cargo: '螺纹钢',
				pieces: 500,
				weight: 2500,
				plannedTime: '2024-05-01 09:00',
				actualTime: '2024-05-01 09:15',
				status: 'completed',
				operator: '李四',
				notes: '货区A-12号仓位',
				area: '货区A',
				children: [
					// 分支1：装船作业→疏港作业
					{
						id: 3,
						label: '装船作业(泊位1)',
						type: 'loading',
						cargo: '螺纹钢',
						pieces: 300,
						weight: 1500,
						plannedTime: '2024-05-01 10:00',
						actualTime: '2024-05-01 12:30',
						status: 'completed',
						operator: '王五',
						notes: '使用门机3#，效率达标',
						area: '泊位1',
						children: [
							{
								id: 4,
								label: '疏港作业(外运)',
								type: 'end',
								cargo: '螺纹钢',
								pieces: 300,
								weight: 1500,
								plannedTime: '2024-05-01 13:00',
								actualTime: '2024-05-01 14:00',
								status: 'completed',
								operator: '赵六',
								notes: '外运船「渤海号」',
								area: '出港通道',
							},
						],
					},
					// 分支2：多个转栈作业→共同子节点
					{
						id: 5,
						label: '转栈作业(A→C)',
						type: 'transfer',
						cargo: '螺纹钢',
						pieces: 70,
						weight: 350,
						plannedTime: '2024-05-01 10:30',
						actualTime: '2024-05-01 11:30',
						status: 'completed',
						operator: '孙七',
						notes: '叉车2台协同，无损耗',
						area: '中转区',
						children: [
							// 共同子节点：三个转栈作业都会指向这个节点
							{
								id: 15,
								label: '共同存储区',
								type: 'storage',
								cargo: '螺纹钢',
								pieces: 200,
								weight: 1000,
								plannedTime: '2024-05-01 12:00',
								status: 'processing',
								operator: '杨十七',
								notes: '统一存储区，待分配',
								area: '存储区中心',
								children: [
									{
										id: 16,
										label: '最终分配',
										type: 'end',
										cargo: '螺纹钢',
										pieces: 200,
										weight: 1000,
										plannedTime: '2024-05-01 15:00',
										status: 'pending',
										operator: '朱十八',
										notes: '根据订单分配至各客户',
										area: '分配中心',
									}
								]
							}
						],
					},
					{
						id: 17,
						label: '转栈作业(A→D)',
						type: 'transfer',
						cargo: '螺纹钢',
						pieces: 60,
						weight: 300,
						plannedTime: '2024-05-01 10:45',
						actualTime: '2024-05-01 11:45',
						status: 'completed',
						operator: '秦十九',
						notes: '使用起重机辅助转栈',
						area: '中转区',
						children: [
							// 引用同一个共同子节点
							{
								id: 15,  // 与上面的共同子节点ID相同
								label: '共同存储区',
								type: 'storage'
								// 其他属性可以省略，会使用第一个定义的完整属性
							}
						],
					},
					{
						id: 18,
						label: '转栈作业(A→E)',
						type: 'transfer',
						cargo: '螺纹钢',
						pieces: 70,
						weight: 350,
						plannedTime: '2024-05-01 11:00',
						actualTime: '2024-05-01 12:00',
						status: 'completed',
						operator: '尤二十',
						notes: '夜间作业，照明充足',
						area: '中转区',
						children: [
							// 引用同一个共同子节点
							{
								id: 15,  // 与上面的共同子节点ID相同
								label: '共同存储区',
								type: 'storage'
								// 其他属性可以省略，会使用第一个定义的完整属性
							}
						],
					}
				],
			},
			// 集港作业的另一分支：进入货区B
			{
				id: 9,
				label: '进入货区B',
				type: 'normal',
				cargo: '螺纹钢',
				pieces: 0,
				weight: 0,
				plannedTime: '2024-05-01 09:00',
				status: 'cancelled',
				operator: '钱十一',
				notes: '货区B临时占用，取消分配',
				area: '货区B',
			},
		],
	},
	// 流程2：卸船作业→货区→入库/盘点(并行流程)
	{
		id: 10,
		label: '卸船作业(散货)',
		type: 'collection',
		cargo: '煤炭',
		pieces: 1000,
		weight: 8000,
		plannedTime: '2024-05-01 09:00',
		actualTime: '2024-05-01 11:00',
		status: 'completed',
		operator: '冯十二',
		notes: '「黄海号」卸船，效率1200t/h',
		area: '泊位2',
		children: [
			{
				id: 11,
				label: '进入货区C',
				type: 'normal',
				cargo: '煤炭',
				pieces: 1000,
				weight: 8000,
				plannedTime: '2024-05-01 11:30',
				actualTime: '2024-05-01 12:00',
				status: 'completed',
				operator: '陈十三',
				notes: '货区C-08号堆场',
				area: '货区C',
				children: [
					{
						id: 12,
						label: '入库作业(筒仓3)',
						type: 'normal',
						cargo: '煤炭',
						pieces: 800,
						weight: 6400,
						plannedTime: '2024-05-01 12:30',
						status: 'processing',
						operator: '褚十四',
						notes: '正在入库，预计14:00完成',
						area: '筒仓区',
					},
					{
						id: 13,
						label: '抽样盘点',
						type: 'normal',
						cargo: '煤炭',
						pieces: 200,
						weight: 1600,
						plannedTime: '2024-05-01 13:00',
						status: 'pending',
						operator: '卫十五',
						notes: '待入库后抽样，检验热值',
						area: '质检区',
						children: [
							{
								id: 14,
								label: '盘点报告生成',
								type: 'end',
								cargo: '煤炭',
								pieces: 200,
								weight: 1600,
								plannedTime: '2024-05-01 15:00',
								status: 'pending',
								operator: '蒋十六',
								notes: '电子版报告同步至系统',
								area: '办公室',
							},
						],
					},
				],
			},
		],
	},
])

const customFlowData = ref([
	// 流程1：集港→货区→装船/转栈→疏港/二次转栈
	{
		id: 1,
		label: '集港作业（钢材）',
		type: 'start', // 开始节点
		cargo: '螺纹钢',
		pieces: 500,
		weight: 2500,
		plannedTime: '2024-05-01 08:00',
		actualTime: '2024-05-01 08:30',
		status: 'completed',
		operator: '张三',
		notes: '提前30分钟完成，无异常',
		area: '码头入口',
		children: [
			{
				id: 2,
				label: '进入货区A',
				type: 'normal', // 普通节点
				cargo: '螺纹钢',
				pieces: 500,
				weight: 2500,
				plannedTime: '2024-05-01 09:00',
				actualTime: '2024-05-01 09:15',
				status: 'completed',
				operator: '李四',
				notes: '货区A-12号仓位',
				area: '货区A',
				children: [
					// 分支1：装船作业→疏港作业
					{
						id: 3,
						label: '装船作业（泊位1）',
						type: 'normal',
						cargo: '螺纹钢',
						pieces: 300,
						weight: 1500,
						plannedTime: '2024-05-01 10:00',
						actualTime: '2024-05-01 12:30',
						status: 'completed',
						operator: '王五',
						notes: '使用门机3#，效率达标',
						area: '泊位1',
						children: [
							{
								id: 4,
								label: '疏港作业（外运）',
								type: 'end', // 结束节点
								cargo: '螺纹钢',
								pieces: 300,
								weight: 1500,
								plannedTime: '2024-05-01 13:00',
								actualTime: '2024-05-01 14:00',
								status: 'completed',
								operator: '赵六',
								notes: '外运船「渤海号」',
								area: '出港通道',
							},
						],
					},
					// 分支2：转栈作业→疏港作业/二次转栈
					{
						id: 5,
						label: '转栈作业（货区A→C）',
						type: 'normal',
						cargo: '螺纹钢',
						pieces: 200,
						weight: 1000,
						plannedTime: '2024-05-01 10:30',
						actualTime: '2024-05-01 11:30',
						status: 'completed',
						operator: '孙七',
						notes: '叉车2台协同，无损耗',
						area: '中转区',
						children: [
							{
								id: 6,
								label: '疏港作业（内运）',
								type: 'end',
								cargo: '螺纹钢',
								pieces: 150,
								weight: 750,
								plannedTime: '2024-05-01 12:00',
								actualTime: '2024-05-01 12:45',
								status: 'completed',
								operator: '周八',
								notes: '内运车队#12',
								area: '内运通道',
							},
							{
								id: 7,
								label: '二次转栈（货区C→D）',
								type: 'normal',
								cargo: '螺纹钢',
								pieces: 50,
								weight: 250,
								plannedTime: '2024-05-01 13:00',
								status: 'processing', // 进行中
								operator: '吴九',
								notes: '待入库，等待货区D空闲',
								area: '中转区',
								children: [
									{
										id: 8,
										label: '长期存储（货区D）',
										type: 'end',
										cargo: '螺纹钢',
										pieces: 50,
										weight: 250,
										plannedTime: '2024-05-01 14:30',
										status: 'pending', // 待处理
										operator: '郑十',
										notes: '存储周期30天',
										area: '货区D',
									},
								],
							},
						],
					},
				],
			},
			// 集港作业的另一分支：进入货区B
			{
				id: 9,
				label: '进入货区B',
				type: 'normal',
				cargo: '螺纹钢',
				pieces: 0,
				weight: 0,
				plannedTime: '2024-05-01 09:00',
				status: 'cancelled', // 已取消
				operator: '钱十一',
				notes: '货区B临时占用，取消分配',
				area: '货区B',
			},
		],
	},
	// 流程2：卸船作业→货区→入库/盘点（并行流程）
	{
		id: 10,
		label: '卸船作业（散货）',
		type: 'start',
		cargo: '煤炭',
		pieces: 1000,
		weight: 8000,
		plannedTime: '2024-05-01 09:00',
		actualTime: '2024-05-01 11:00',
		status: 'completed',
		operator: '冯十二',
		notes: '「黄海号」卸船，效率1200t/h',
		area: '泊位2',
		children: [
			{
				id: 11,
				label: '进入货区C',
				type: 'normal',
				cargo: '煤炭',
				pieces: 1000,
				weight: 8000,
				plannedTime: '2024-05-01 11:30',
				actualTime: '2024-05-01 12:00',
				status: 'completed',
				operator: '陈十三',
				notes: '货区C-08号堆场',
				area: '货区C',
				children: [
					{
						id: 12,
						label: '入库作业（筒仓3）',
						type: 'normal',
						cargo: '煤炭',
						pieces: 800,
						weight: 6400,
						plannedTime: '2024-05-01 12:30',
						status: 'processing',
						operator: '褚十四',
						notes: '正在入库，预计14:00完成',
						area: '筒仓区',
					},
					{
						id: 13,
						label: '抽样盘点',
						type: 'normal',
						cargo: '煤炭',
						pieces: 200,
						weight: 1600,
						plannedTime: '2024-05-01 13:00',
						status: 'pending',
						operator: '卫十五',
						notes: '待入库后抽样，检验热值',
						area: '质检区',
						children: [
							{
								id: 14,
								label: '盘点报告生成',
								type: 'end',
								cargo: '煤炭',
								pieces: 200,
								weight: 1600,
								plannedTime: '2024-05-01 15:00',
								status: 'pending',
								operator: '蒋十六',
								notes: '电子版报告同步至系统',
								area: '办公室',
							},
						],
					},
				],
			},
		],
	},
])
// 流程3：多对一(装船+转垛→临时存储)
// 港口作业测试数据(包含多对一、一对多、一对一关系)
const portNodes = ref([
	// 流程1：集港→堆场→装船/转垛→出港/疏港(一对多)
	{
		id: 1,
		x: 100,
		y: 100,
		label: '集港作业',
		type: 'start',
		cargo: '集装箱(40尺)',
		pieces: 200,
		weight: 5000,
		plannedTime: '2024-05-01 08:00',
		actualTime: '2024-05-01 08:15',
		status: '已完成',
		notes: '准时完成，无异常',
	},
	{
		id: 2,
		x: 400,
		y: 100,
		label: '进入堆场',
		type: 'normal',
		cargo: '集装箱(40尺)',
		pieces: 200,
		weight: 5000,
		plannedTime: '2024-05-01 09:00',
		actualTime: '2024-05-01 09:20',
		status: '已完成',
	},
	{
		id: 3,
		x: 700,
		y: 50,
		label: '装船作业',
		type: 'normal',
		cargo: '集装箱(40尺)',
		pieces: 120,
		weight: 3000,
		plannedTime: '2024-05-01 14:00',
		actualTime: '2024-05-01 14:45',
		status: '已完成',
	},
	{
		id: 4,
		x: 700,
		y: 150,
		label: '转垛作业',
		type: 'normal',
		cargo: '集装箱(40尺)',
		pieces: 80,
		weight: 2000,
		plannedTime: '2024-05-01 10:00',
		actualTime: '2024-05-01 10:30',
		status: '已完成',
	},
	{
		id: 5,
		x: 1000,
		y: 50,
		label: '出港作业',
		type: 'end',
		cargo: '集装箱(40尺)',
		pieces: 120,
		weight: 3000,
		plannedTime: '2024-05-01 16:00',
		actualTime: '2024-05-01 16:10',
		status: '已完成',
	},

	// 流程2：卸船→堆场→疏港(一对一)
	{
		id: 6,
		x: 100,
		y: 300,
		label: '卸船作业',
		type: 'start',
		cargo: '散货(煤炭)',
		pieces: 500,
		weight: 8000,
		plannedTime: '2024-05-02 09:00',
		actualTime: '2024-05-02 10:30',
		status: '已完成',
	},
	{
		id: 7,
		x: 400,
		y: 300,
		label: '进入堆场',
		type: 'normal',
		cargo: '散货(煤炭)',
		pieces: 500,
		weight: 8000,
		plannedTime: '2024-05-02 11:00',
		actualTime: '2024-05-02 11:20',
		status: '已完成',
	},
	{
		id: 8,
		x: 700,
		y: 300,
		label: '疏港作业',
		type: 'end',
		cargo: '散货(煤炭)',
		pieces: 500,
		weight: 8000,
		plannedTime: '2024-05-02 16:00',
		status: '进行中',
	},

	// 流程3：多对一(装船+转垛→临时存储)
	{
		id: 9,
		x: 700,
		y: 250,
		label: '临时存储',
		type: 'normal',
		cargo: '集装箱(40尺)',
		pieces: 200,
		weight: 5000,
		plannedTime: '2024-05-01 11:00',
		actualTime: '2024-05-01 11:10',
		status: '已完成',
	},
	{
		id: 10,
		x: 1000,
		y: 150,
		label: '疏港作业',
		type: 'end',
		cargo: '集装箱(40尺)',
		pieces: 80,
		weight: 2000,
		plannedTime: '2024-05-01 15:00',
		status: '未开始',
	},
	{
		id: 11,
		x: 1000,
		y: 250,
		label: '二次装船',
		type: 'end',
		cargo: '集装箱(40尺)',
		pieces: 200,
		weight: 5000,
		plannedTime: '2024-05-03 09:00',
		status: '计划中',
	},
])

const portLinks = ref([
	{ id: 1, source: 1, target: 2 }, // 一对一
	{ id: 2, source: 2, target: 3 }, // 一对多(2→3, 2→4)
	{ id: 3, source: 2, target: 4 },
	{ id: 4, source: 3, target: 5 }, // 一对一
	{ id: 5, source: 4, target: 10 }, // 一对一
	{ id: 6, source: 3, target: 9 }, // 多对一(3→9, 4→9)
	{ id: 7, source: 4, target: 9 },
	{ id: 8, source: 9, target: 11 }, // 一对多(9→11)
	{ id: 9, source: 6, target: 7 }, // 一对一(卸船→堆场)
	{ id: 10, source: 7, target: 8 }, // 一对一(堆场→疏港)
])
</script>

<style>
.app {
	padding: 20px;
	max-width: 1400px;
	margin: 0 auto;
}

.tabs {
	margin-top: 20px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>