<template>
	<div class="dashboard-container">
		<div class="core-section">
			<div class="core-card approval-card" @click="navigateToApproval('todo')">
				<div class="card-header">
					<div class="card-title-row">
						<div class="card-icon">
							<el-icon><Document /></el-icon>
						</div>
						<div class="card-info">
							<div class="card-title">审批中心</div>
							<div class="card-desc">待办任务处理</div>
						</div>
					</div>
					<div class="card-badge">{{ approvalData.todo }}项待处理</div>
				</div>
				<div class="card-body">
					<div class="stat-row">
						<div class="stat-item" @click.stop="navigateToApproval('todo')">
							<span class="stat-num">{{ approvalData.todo }}</span>
							<span class="stat-label">待办任务</span>
						</div>
						<div class="stat-item" @click.stop="navigateToApproval('done')">
							<span class="stat-num">{{ approvalData.handled }}</span>
							<span class="stat-label">已办任务</span>
						</div>
						<div class="stat-item" @click.stop="navigateToApproval('copy')">
							<span class="stat-num">{{ approvalData.copy }}</span>
							<span class="stat-label">抄送我的</span>
						</div>
						<div class="stat-item" @click.stop="navigateToApproval('myProcess')">
							<span class="stat-num">{{ approvalData.created }}</span>
							<span class="stat-label">我的流程</span>
						</div>
					</div>
					<div class="todo-preview">
						<div class="preview-title">待办预览</div>
						<div class="preview-list" v-loading="todoLoading">
							<div
								class="preview-item"
								v-for="(item, index) in paginatedTodoList"
								:key="index"
								@click.stop="handleTodoClick(item)"
							>
								<span class="preview-tag" :class="item.type">{{ item.title }}</span>
								<span class="preview-text">{{ item.summary }}</span>
								<span class="preview-time">{{ item.time }}</span>
							</div>
							<div class="preview-empty" v-if="!todoLoading && paginatedTodoList.length === 0">暂无待办任务</div>
						</div>
						<div class="preview-pagination" v-if="todoTotal > todoPageSize">
							<span class="pagination-btn" :class="{ disabled: todoCurrentPage === 1 }" @click.stop="todoPrevPage">
								<el-icon><CaretLeft /></el-icon>
							</span>
							<span class="pagination-info">{{ todoCurrentPage }} / {{ todoTotalPages }}</span>
							<span
								class="pagination-btn"
								:class="{ disabled: todoCurrentPage === todoTotalPages }"
								@click.stop="todoNextPage"
							>
								<el-icon><CaretRight /></el-icon>
							</span>
						</div>
					</div>
				</div>
			</div>

			<div class="core-card workorder-card" @click="navigateTo('/equipment/maintInfo')">
				<div class="card-header">
					<div class="card-title-row">
						<div class="card-icon">
							<el-icon><Tickets /></el-icon>
						</div>
						<div class="card-info">
							<div class="card-title">设备管理中心</div>
							<div class="card-desc">维修工单管理</div>
						</div>
					</div>
					<div class="card-badge warning">{{ workOrderCenter.dispatch + workOrderCenter.repairing }}项进行中</div>
				</div>
				<div class="card-body">
					<div class="stat-row">
						<div class="stat-item" @click.stop="navigateToWorkOrder('total')">
							<span class="stat-num">{{ workOrderCenter.total }}</span>
							<span class="stat-label">工单总数</span>
						</div>
						<div class="stat-item highlight" @click.stop="navigateToWorkOrder('dispatch')">
							<span class="stat-num">{{ workOrderCenter.dispatch }}</span>
							<span class="stat-label">待派工</span>
						</div>
						<div class="stat-item" @click.stop="navigateToWorkOrder('repairing')">
							<span class="stat-num">{{ workOrderCenter.repairing }}</span>
							<span class="stat-label">维修中</span>
						</div>
						<div class="stat-item" @click.stop="navigateToWorkOrder('acceptance')">
							<span class="stat-num">{{ workOrderCenter.acceptance }}</span>
							<span class="stat-label">待验收</span>
						</div>
					</div>
					<div class="section-divider"></div>
					<div class="maintenance-section">
						<div class="status-grid inspection-grid">
							<div
								class="status-item"
								v-for="(item, index) in inspectionStatusList.filter(
									i => i.type.includes('inspection') || i.type.includes('check'),
								)"
								:key="index"
								:class="{ 'is-pending': item.isPending }"
								@click.stop="navigateToStatus(item.type)"
							>
								<span class="status-num">{{ item.value }}</span>
								<span class="status-label">{{ item.label }}</span>
							</div>
						</div>
						<div class="status-grid maintenance-grid">
							<div
								class="status-item"
								v-for="(item, index) in inspectionStatusList.filter(
									i => i.type.includes('lubrication') || i.type.includes('maintenance'),
								)"
								:key="index"
								:class="{ 'is-pending': item.isPending }"
								@click.stop="navigateToStatus(item.type)"
							>
								<span class="status-num">{{ item.value }}</span>
								<span class="status-label">{{ item.label }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="core-card message-card">
				<div class="card-header">
					<div class="card-title-row">
						<div class="card-icon">
							<el-icon><Bell /></el-icon>
							<span class="icon-badge" v-if="messageTotal > 0">{{ messageTotal > 99 ? '99+' : messageTotal }}</span>
						</div>
						<div class="card-info">
							<div class="card-title">消息中心</div>
							<div class="card-desc">系统通知公告</div>
						</div>
					</div>
					<div class="card-badge danger" v-if="messageTotal > 0">{{ messageTotal }}条未读</div>
				</div>
				<div class="card-body">
					<div class="message-list-full">
						<div class="msg-item-full" v-for="(item, index) in messageList" :key="index" :class="{ unread: !item.read }">
							<div class="msg-left">
								<span class="msg-icon" :class="item.type">
									<el-icon v-if="item.type === 'success'"><Check /></el-icon>
									<el-icon v-else-if="item.type === 'warning'"><Warning /></el-icon>
									<el-icon v-else><InfoFilled /></el-icon>
								</span>
								<div class="msg-content">
									<span class="msg-title">{{ item.title }}</span>
									<span class="msg-desc">{{ item.desc || '点击查看详情' }}</span>
								</div>
							</div>
							<span class="msg-time">{{ item.time }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="trend-section">
			<div class="panel trend-panel">
				<div class="panel-header">
					<div class="panel-title">
						<div class="title-icon"></div>
						<span>工单趋势（近7天）</span>
					</div>
					<div class="trend-summary">
						<div class="summary-item">
							<span class="summary-num">{{ weekSummary.total }}</span>
							<span class="summary-label">本周提报</span>
						</div>
						<div class="summary-item">
							<span class="summary-num">{{ weekSummary.completed }}</span>
							<span class="summary-label">已完成</span>
						</div>
						<div class="summary-item">
							<span class="summary-num">{{ weekSummary.rate }}%</span>
							<span class="summary-label">完成率</span>
						</div>
					</div>
				</div>
				<div class="panel-body">
					<div ref="trendChartRef" class="chart-trend"></div>
				</div>
			</div>

			<div class="panel quick-panel-enhanced">
				<div class="panel-header">
					<div class="panel-title">
						<div class="title-icon"></div>
						<span>快捷入口</span>
					</div>
					<el-button type="primary" link size="small" @click="handleCustomizeModule">
						<el-icon><Setting /></el-icon>
						自定义
					</el-button>
				</div>
				<div class="panel-body">
					<div class="quick-grid-enhanced" :class="quickGridClass">
						<div
							class="quick-item-enhanced"
							v-for="(module, index) in customModules.slice(0, displayModuleCount)"
							:key="index"
							@click="handleModuleClick(module)"
						>
							<div class="quick-icon-enhanced" :class="module.colorType">
								<el-icon><component :is="module.icon" /></el-icon>
							</div>
							<span class="quick-name-enhanced">{{ module.name }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="main-section">
			<div class="panel workorder-stats-panel-full">
				<div class="panel-header">
					<div class="panel-title">
						<div class="title-icon"></div>
						<span>工单统计</span>
					</div>
					<div class="panel-tabs">
						<span :class="{ active: workOrderTab === 'type' }" @click="workOrderTab = 'type'">类型</span>
						<span :class="{ active: workOrderTab === 'node' }" @click="workOrderTab = 'node'">节点</span>
						<span :class="{ active: workOrderTab === 'today' }" @click="workOrderTab = 'today'">今日</span>
					</div>
				</div>
				<div class="panel-body">
					<div v-if="workOrderTab === 'type'" class="type-view-compact">
						<div ref="workOrderTypeChartRef" class="chart-pie-compact"></div>
						<div class="type-list-compact">
							<div class="type-item-compact" v-for="(item, index) in workOrderByType" :key="index">
								<span class="type-dot" :style="{ background: item.color }"></span>
								<span class="type-name">{{ item.name }}</span>
								<span class="type-value">{{ item.value }}</span>
							</div>
						</div>
					</div>
					<div v-if="workOrderTab === 'node'" class="node-view-compact">
						<div class="node-item-compact" v-for="(item, index) in workOrderByNode" :key="index">
							<div class="node-header">
								<span class="node-name">{{ item.name }}</span>
								<span class="node-value">{{ item.value }}</span>
							</div>
							<div class="node-progress">
								<div class="node-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
							</div>
						</div>
					</div>
					<div v-if="workOrderTab === 'today'" class="today-view-compact">
						<div class="today-item-compact" v-for="(item, index) in todayWorkOrder" :key="index">
							<div class="today-icon" :class="item.type">
								<el-icon><component :is="item.icon" /></el-icon>
							</div>
							<div class="today-info">
								<div class="today-num">{{ item.value }}</div>
								<div class="today-label">{{ item.label }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="panel equipment-panel">
				<div class="panel-header">
					<div class="panel-title">
						<div class="title-icon"></div>
						<span>设备统计</span>
					</div>
					<el-radio-group v-model="equipmentView" size="small">
						<el-radio-button label="type">按类型</el-radio-button>
						<el-radio-button label="status">按状态</el-radio-button>
					</el-radio-group>
				</div>
				<div class="panel-body">
					<div class="equipment-grid">
						<div
							class="equipment-item"
							v-for="(item, index) in equipmentView === 'type' ? equipmentByType : equipmentByStatus"
							:key="index"
							:style="{ borderColor: item.color }"
						>
							<div class="equipment-icon" :style="{ background: item.color + '20' }">
								<el-icon><component :is="getEquipmentIcon(index)" /></el-icon>
							</div>
							<div class="equipment-info">
								<div class="equipment-num" :style="{ color: item.color }">{{ item.value }}</div>
								<div class="equipment-label">{{ item.name }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="panel warning-panel">
				<div class="panel-header">
					<div class="panel-title">
						<div class="title-icon warning"></div>
						<span>物资预警</span>
					</div>
				</div>
				<div class="panel-body">
					<div class="warning-list">
						<div class="warning-item" v-for="(item, index) in materialWarning" :key="index" :class="item.level">
							<div class="warning-indicator"></div>
							<div class="warning-content">
								<span class="warning-name">{{ item.name }}</span>
								<span class="warning-desc">库存 {{ item.stock }} / 预警 {{ item.threshold }}</span>
							</div>
							<span class="warning-tag">{{ item.levelText }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<el-dialog v-model="customizeDialogVisible" title="自定义功能模块" width="680px" class="customize-dialog">
			<div class="customize-content">
				<div class="customize-header">
					<div class="customize-tip">
						<el-icon class="tip-icon"><InfoFilled /></el-icon>
						<span>点击模块可添加或移除，最多可选择12个快捷入口</span>
					</div>
					<div class="selected-count">
						已选择
						<span class="count-num">{{ selectedModuleIds.length }}</span>
						/ 12 个
					</div>
				</div>
				<div class="module-pool">
					<div class="module-pool-grid">
						<div
							class="module-pool-item"
							v-for="module in allModules"
							:key="module.id"
							:class="{
								selected: isModuleSelected(module.id),
								disabled: !isModuleSelected(module.id) && selectedModuleIds.length >= 12,
							}"
							@click="toggleModuleSelection(module)"
						>
							<div class="module-icon" :class="module.colorType">
								<el-icon><component :is="module.icon" /></el-icon>
							</div>
							<span class="module-name">{{ module.name }}</span>
							<div class="module-check" v-if="isModuleSelected(module.id)">
								<el-icon><Check /></el-icon>
							</div>
						</div>
					</div>
				</div>
			</div>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="customizeDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="saveCustomModules">保存设置</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="Index">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
	Setting,
	Check,
	Document,
	Bell,
	Tickets,
	Grid,
	FolderOpened,
	Operation,
	FirstAidKit,
	Search,
	Files,
	Calendar,
	Wallet,
	TrendCharts,
	DataAnalysis,
	Finished,
	Warning,
	InfoFilled,
	CaretRight,
	CaretLeft,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import usePermissionStore from '@/store/modules/permission'
import { getTaskTodoPage } from '@/api/system/bpm/task'
const permissionStore = usePermissionStore()
const router = useRouter()

const iconMap = {
	FolderOpened,
	Operation,
	FirstAidKit,
	Search,
	Files,
	Calendar,
	Wallet,
	TrendCharts,
	DataAnalysis,
	Setting,
	Grid,
	Document,
	Check,
	Bell,
	Tickets,
	Finished,
	Warning,
	InfoFilled,
	CaretRight,
	CaretLeft,
}

const iconList = Object.keys(iconMap)
const colorList = ['blue', 'green', 'orange', 'purple']

const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(i => i.hidden == false))

const flattenMenus = menus => {
	const result = []
	const flatten = (items, parentPath = '') => {
		items.forEach(item => {
			const path = parentPath ? `${parentPath}/${item.path}`.replace(/\/+/g, '/') : item.path
			if (item.children && item.children.length > 0) {
				flatten(item.children, path)
			} else if (item.path) {
				result.push({
					id: item.id || item.path,
					name: item.meta?.title || item.name || item.path,
					path: path,
					icon: item.meta?.icon || iconList[result.length % iconList.length],
				})
			}
		})
	}
	flatten(menus)
	return result
}

const allModules = computed(() => {
	const menus = flattenMenus(sidebarRouters.value)
	return menus.map((item, index) => ({
		id: item.id,
		name: item.name,
		icon: iconMap[item.icon] || iconMap[iconList[index % iconList.length]],
		colorType: colorList[index % colorList.length],
		route: item.path,
	}))
})

const approvalData = ref({
	todo: 12,
	created: 8,
	handled: 45,
	copy: 6,
})

const approvalTodoList = ref([])
const todoLoading = ref(false)
const todoCurrentPage = ref(1)
const todoPageSize = 3
const todoTotal = ref(0)

const todoTotalPages = computed(() => Math.ceil(todoTotal.value / todoPageSize))

const paginatedTodoList = computed(() => {
	return approvalTodoList.value
})

const getTodoList = async () => {
	todoLoading.value = true
	try {
		const res = await getTaskTodoPage({
			startPage: todoCurrentPage.value,
			pageSize: todoPageSize,
		})
		approvalTodoList.value = (res.data.pages || []).map(item => ({
			id: item.id,
			title: item.processInstance?.name || '未知流程',
			summary: formatSummary(item.processInstance?.summary),
			type: getProcessType(item.processInstance?.name),
			time: formatTimeAgo(item.processInstance?.createTime),
			processInstance: item.processInstance,
		}))
		todoTotal.value = res.data.totalNum || 0
	} catch (error) {
		console.error('获取待办任务失败:', error)
		approvalTodoList.value = []
		todoTotal.value = 0
	} finally {
		todoLoading.value = false
	}
}

const getProcessType = name => {
	if (!name) return 'other'
	if (name.includes('采购')) return 'purchase'
	if (name.includes('计划')) return 'plan'
	if (name.includes('维修') || name.includes('维修')) return 'repair'
	if (name.includes('报废')) return 'scrap'
	if (name.includes('备件') || name.includes('领用')) return 'parts'
	if (name.includes('调拨')) return 'transfer'
	return 'other'
}

const getProcessTypeText = name => {
	if (!name) return '其他'
	if (name.includes('采购')) return '采购'
	if (name.includes('计划')) return '计划'
	if (name.includes('维修') || name.includes('维修')) return '维修'
	if (name.includes('报废')) return '报废'
	if (name.includes('备件') || name.includes('领用')) return '备件'
	if (name.includes('调拨')) return '调拨'
	return '其他'
}

const formatTimeAgo = time => {
	if (!time) return ''
	const now = new Date()
	const createTime = new Date(time)
	const diff = now - createTime
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)
	if (minutes < 60) return `${minutes}分钟前`
	if (hours < 24) return `${hours}小时前`
	return `${days}天前`
}

const formatSummary = summary => {
	if (!summary || !Array.isArray(summary) || summary.length === 0) return '无摘要'
	return summary
		.slice(0, 2)
		.map(item => `${item.key}: ${item.value}`)
		.join(', ')
}

const todoPrevPage = () => {
	if (todoCurrentPage.value > 1) {
		todoCurrentPage.value--
		getTodoList()
	}
}

const todoNextPage = () => {
	if (todoCurrentPage.value < todoTotalPages.value) {
		todoCurrentPage.value++
		getTodoList()
	}
}

const handleTodoClick = item => {
	console.log('handleTodoClick', item)

	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: item.processInstance.id,
			taskId: item.id,
		},
	})
}

const workOrderCenter = ref({
	total: 28,
	dispatch: 8,
	repairing: 15,
	acceptance: 5,
	completed: 156,
	monthTotal: 200,
})

const workOrderProgress = computed(() => {
	const total = workOrderCenter.value.monthTotal || 1
	const completed = workOrderCenter.value.completed || 0
	return Math.round((completed / total) * 100)
})

const inspectionStatusList = ref([
	{ label: '待巡检', value: 12, type: 'inspection-pending', isPending: true },
	{ label: '已巡检', value: 45, type: 'inspection-done', isPending: false },
	{ label: '待点检', value: 8, type: 'check-pending', isPending: true },
	{ label: '已点检', value: 38, type: 'check-done', isPending: false },
	{ label: '待润滑', value: 6, type: 'lubrication-pending', isPending: true },
	{ label: '已润滑', value: 24, type: 'lubrication-done', isPending: false },
	{ label: '待保养', value: 10, type: 'maintenance-pending', isPending: true },
	{ label: '已保养', value: 32, type: 'maintenance-done', isPending: false },
])

const messageList = ref([
	{ title: '设备维修工单已审批通过', desc: '您提交的设备维修申请已通过审批', time: '10分钟前', type: 'success', read: false },
	{ title: '您有新的待办任务需要处理', desc: '有3个工单待派工，请及时处理', time: '30分钟前', type: 'warning', read: false },
	{ title: '系统将于今晚进行维护升级', desc: '预计维护时间22:00-24:00', time: '2小时前', type: 'info', read: true },
])

const messageTotal = computed(() => {
	return messageList.value.filter(item => !item.read).length
})

const workOrderTab = ref('type')

const workOrderByType = ref([
	{ name: '定额工单', value: 128, color: '#3b82f6' },
	{ name: '非定额工单', value: 85, color: '#10b981' },
	{ name: '大包工单', value: 56, color: '#f59e0b' },
	{ name: '内修工单', value: 92, color: '#8b5cf6' },
])

const workOrderByNode = ref([
	{ name: '工单总数', value: 361, percent: 100, color: '#3b82f6' },
	{ name: '未派工', value: 45, percent: 12, color: '#f59e0b' },
	{ name: '进行中', value: 128, percent: 35, color: '#3b82f6' },
	{ name: '已完成', value: 188, percent: 52, color: '#10b981' },
])

const todayWorkOrder = ref([
	{ label: '已提报', value: 35, type: 'blue', icon: 'Files' },
	{ label: '已派工', value: 28, type: 'orange', icon: 'Operation' },
	{ label: '已完成', value: 22, type: 'green', icon: 'Finished' },
])

const weekSummary = ref({
	total: 173,
	completed: 148,
	rate: 85,
})

const equipmentView = ref('type')

const equipmentByType = ref([
	{ name: '机械设备', value: 186, color: '#3b82f6' },
	{ name: '电气设备', value: 128, color: '#10b981' },
	{ name: '仪表设备', value: 95, color: '#f59e0b' },
	{ name: '特种设备', value: 67, color: '#8b5cf6' },
])

const equipmentByStatus = ref([
	{ name: '在用', value: 486, color: '#10b981' },
	{ name: '在修', value: 32, color: '#f59e0b' },
	{ name: '停用', value: 15, color: '#6b7280' },
	{ name: '报废', value: 18, color: '#ef4444' },
])

const equipmentIcons = ['Operation', 'Connection', 'Monitor', 'Setting']

const getEquipmentIcon = index => {
	return equipmentIcons[index % equipmentIcons.length]
}

const materialWarning = ref([
	{ name: '润滑油', stock: 15, threshold: 50, level: 'danger', levelText: '紧急' },
	{ name: '密封圈', stock: 28, threshold: 40, level: 'warning', levelText: '预警' },
	{ name: '轴承', stock: 35, threshold: 50, level: 'warning', levelText: '预警' },
])

const materialTopList = ref([
	{ name: '润滑油', value: 2580, unit: 'L', percent: 100 },
	{ name: '螺栓', value: 1890, unit: '个', percent: 73 },
	{ name: '电缆', value: 1450, unit: '米', percent: 56 },
	{ name: '密封圈', value: 1320, unit: '个', percent: 51 },
	{ name: '轴承', value: 1156, unit: '个', percent: 45 },
	{ name: '皮带', value: 980, unit: '条', percent: 38 },
	{ name: '滤芯', value: 850, unit: '个', percent: 33 },
	{ name: '阀门', value: 720, unit: '个', percent: 28 },
	{ name: '电机', value: 580, unit: '台', percent: 22 },
	{ name: '传感器', value: 450, unit: '个', percent: 17 },
])

const costPeriod = ref('month')

const customizeDialogVisible = ref(false)

const customModules = ref([])
const selectedModuleIds = ref([])

const displayModuleCount = computed(() => Math.min(customModules.value.length, 12))

const quickGridClass = computed(() => {
	const count = displayModuleCount.value
	if (count <= 6) return 'grid-small'
	if (count <= 9) return 'grid-medium'
	return 'grid-large'
})

const workOrderTypeChartRef = ref(null)
const trendChartRef = ref(null)
const costChartRef = ref(null)
const materialTopChartRef = ref(null)
const equipmentChartRef = ref(null)

let workOrderTypeChart = null
let trendChart = null
let costChart = null
let materialTopChart = null
let equipmentChart = null

const initWorkOrderTypeChart = () => {
	if (!workOrderTypeChartRef.value) return
	workOrderTypeChart = echarts.init(workOrderTypeChartRef.value)
	const option = {
		series: [
			{
				type: 'pie',
				radius: ['60%', '85%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: workOrderByType.value.map(item => ({
					value: item.value,
					name: item.name,
					itemStyle: { color: item.color },
				})),
			},
		],
	}
	workOrderTypeChart.setOption(option)
}

const initTrendChart = () => {
	if (!trendChartRef.value) return
	trendChart = echarts.init(trendChartRef.value)
	const dates = []
	const today = new Date()
	for (let i = 6; i >= 0; i--) {
		const d = new Date(today)
		d.setDate(d.getDate() - i)
		dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
	}
	const option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: { color: '#374151', fontSize: 13 },
			padding: [10, 15],
		},
		legend: {
			data: ['提报数', '进行中', '已完成'],
			right: 20,
			top: 5,
			textStyle: { color: '#6b7280', fontSize: 12 },
			itemWidth: 16,
			itemHeight: 8,
			itemGap: 20,
		},
		grid: {
			top: 50,
			right: 30,
			bottom: 40,
			left: 50,
		},
		xAxis: {
			type: 'category',
			data: dates,
			axisLine: { lineStyle: { color: '#e5e7eb' } },
			axisLabel: { color: '#6b7280', fontSize: 12 },
			axisTick: { show: false },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: '#9ca3af', fontSize: 11 },
			splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
		},
		series: [
			{
				name: '提报数',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 8,
				data: [23, 18, 32, 28, 35, 15, 22],
				lineStyle: { width: 3, color: '#3b82f6' },
				itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
						{ offset: 1, color: 'rgba(59, 130, 246, 0)' },
					]),
				},
			},
			{
				name: '进行中',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 8,
				data: [45, 38, 52, 48, 55, 35, 42],
				lineStyle: { width: 3, color: '#f59e0b' },
				itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
			},
			{
				name: '已完成',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 8,
				data: [20, 15, 28, 30, 32, 18, 25],
				lineStyle: { width: 3, color: '#10b981' },
				itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#fff' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
						{ offset: 1, color: 'rgba(16, 185, 129, 0)' },
					]),
				},
			},
		],
	}
	trendChart.setOption(option)
}

const initCostChart = () => {
	if (!costChartRef.value) return
	costChart = echarts.init(costChartRef.value)
	const option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: { color: '#374151' },
		},
		legend: {
			data: ['预算成本', '实际费用'],
			right: 20,
			top: 0,
			textStyle: { color: '#6b7280', fontSize: 12 },
		},
		grid: {
			top: 40,
			right: 20,
			bottom: 30,
			left: 60,
		},
		xAxis: {
			type: 'category',
			data: ['维修费', '材料费', '人工费', '外协费', '其他'],
			axisLine: { lineStyle: { color: '#e5e7eb' } },
			axisLabel: { color: '#6b7280' },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: '#6b7280' },
			splitLine: { lineStyle: { color: '#f3f4f6' } },
		},
		series: [
			{
				name: '预算成本',
				type: 'bar',
				barWidth: 16,
				data: [85000, 62000, 45000, 28000, 15000],
				itemStyle: {
					borderRadius: [4, 4, 0, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#3b82f6' },
						{ offset: 1, color: '#60a5fa' },
					]),
				},
			},
			{
				name: '实际费用',
				type: 'bar',
				barWidth: 16,
				data: [78500, 58200, 42000, 31000, 12800],
				itemStyle: {
					borderRadius: [4, 4, 0, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#10b981' },
						{ offset: 1, color: '#34d399' },
					]),
				},
			},
		],
	}
	costChart.setOption(option)
}

const initMaterialTopChart = () => {
	if (!materialTopChartRef.value) return
	materialTopChart = echarts.init(materialTopChartRef.value)
	const data = [
		{ name: '润滑油', value: 2580 },
		{ name: '螺栓', value: 1890 },
		{ name: '电缆', value: 1450 },
		{ name: '密封圈', value: 1320 },
		{ name: '轴承', value: 1156 },
		{ name: '皮带', value: 980 },
		{ name: '滤芯', value: 850 },
		{ name: '阀门', value: 720 },
		{ name: '电机', value: 580 },
		{ name: '传感器', value: 450 },
	]
	const option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
		},
		grid: {
			top: 10,
			right: 50,
			bottom: 10,
			left: 60,
		},
		xAxis: {
			type: 'value',
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { show: false },
			splitLine: { show: false },
		},
		yAxis: {
			type: 'category',
			data: data.map(d => d.name).reverse(),
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
		},
		series: [
			{
				type: 'bar',
				data: data.map(d => d.value).reverse(),
				barWidth: 10,
				itemStyle: {
					borderRadius: [0, 5, 5, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
						{ offset: 0, color: '#3b82f6' },
						{ offset: 1, color: '#60a5fa' },
					]),
				},
			},
		],
	}
	materialTopChart.setOption(option)
}

const initEquipmentChart = () => {
	if (!equipmentChartRef.value) return
	equipmentChart = echarts.init(equipmentChartRef.value)
	updateEquipmentChart()
}

const updateEquipmentChart = () => {
	if (!equipmentChart) return
	const data = equipmentView.value === 'type' ? equipmentByType.value : equipmentByStatus.value
	const option = {
		series: [
			{
				type: 'pie',
				radius: ['55%', '80%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: data.map(item => ({
					value: item.value,
					name: item.name,
					itemStyle: { color: item.color },
				})),
			},
		],
	}
	equipmentChart.setOption(option)
}

const handleResize = () => {
	workOrderTypeChart?.resize()
	trendChart?.resize()
	costChart?.resize()
	materialTopChart?.resize()
	equipmentChart?.resize()
}

const navigateTo = path => {
	router.push(path)
}

const navigateToWorkOrder = tab => {
	router.push({
		path: '/equipment/maintInfo',
		query: { tab },
	})
}

const navigateToStatus = type => {
	let path = '/equipment/maintInfo'
	if (type.includes('inspection')) {
		path = '/equipment/patrolTask'
	} else if (type.includes('check')) {
		path = '/equipment/inspectionTask'
	} else if (type.includes('lubrication') || type.includes('maintenance')) {
		path = '/equipment/maintainTask'
	}
	router.push({
		path,
		query: { status: type },
	})
}

const navigateToApproval = tab => {
	router.push({
		path: '/bpmModel/processInstance/index',
		query: { tab },
	})
}

const handleModuleClick = module => {
	if (module.route) {
		router.push(module.route)
	}
}

const handleCustomizeModule = () => {
	customizeDialogVisible.value = true
}

const isModuleSelected = id => {
	return selectedModuleIds.value.includes(id)
}

const toggleModuleSelection = module => {
	const index = selectedModuleIds.value.indexOf(module.id)
	if (index > -1) {
		selectedModuleIds.value.splice(index, 1)
	} else {
		selectedModuleIds.value.push(module.id)
	}
}

const saveCustomModules = () => {
	const validIds = selectedModuleIds.value.filter(id => allModules.value.some(m => m.id === id))
	const limitedIds = validIds.slice(0, 12)
	selectedModuleIds.value = limitedIds
	customModules.value = allModules.value.filter(m => limitedIds.includes(m.id))
	localStorage.setItem('customModules', JSON.stringify(limitedIds))
	customizeDialogVisible.value = false
	ElMessage.success('自定义模块保存成功')
}

const loadCustomModules = () => {
	if (!allModules.value || allModules.value.length === 0) return
	const saved = localStorage.getItem('customModules')
	if (saved) {
		try {
			const savedIds = JSON.parse(saved)
			const validIds = savedIds.filter(id => allModules.value.some(m => m.id === id))
			const limitedIds = validIds.slice(0, 12)
			selectedModuleIds.value = limitedIds
			customModules.value = allModules.value.filter(m => limitedIds.includes(m.id))
		} catch (e) {
			const defaultModules = allModules.value.slice(0, 8)
			customModules.value = [...defaultModules]
			selectedModuleIds.value = defaultModules.map(m => m.id)
		}
	} else {
		const defaultModules = allModules.value.slice(0, 8)
		customModules.value = [...defaultModules]
		selectedModuleIds.value = defaultModules.map(m => m.id)
	}
}

watch(
	() => allModules.value,
	newVal => {
		if (newVal && newVal.length > 0 && customModules.value.length === 0) {
			loadCustomModules()
		}
	},
	{ immediate: true },
)

watch(workOrderTab, async newTab => {
	await nextTick()
	if (newTab === 'type') {
		initWorkOrderTypeChart()
	}
})

watch(equipmentView, () => {
	updateEquipmentChart()
})

onMounted(() => {
	getTodoList()
	setTimeout(() => {
		initWorkOrderTypeChart()
		initTrendChart()
		initCostChart()
		initMaterialTopChart()
		initEquipmentChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
	window.removeEventListener('resize', handleResize)
	workOrderTypeChart?.dispose()
	trendChart?.dispose()
	costChart?.dispose()
	materialTopChart?.dispose()
	equipmentChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
	min-height: 100vh;
	background: #f5f7fa;
	padding: 20px;
	box-sizing: border-box;
}

.core-section {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 20px;
}

.core-card {
	position: relative;
	border-radius: 12px;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s ease;
	background: #fff;
	border: 1px solid #e5e7eb;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
		border-color: #d1d5db;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #f3f4f6;
		background: #fafafa;

		.card-title-row {
			display: flex;
			align-items: center;
			gap: 12px;

			.card-icon {
				position: relative;
				width: 44px;
				height: 44px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;

				.el-icon {
					font-size: 22px;
					color: #fff;
				}

				.icon-badge {
					position: absolute;
					top: -6px;
					right: -6px;
					min-width: 18px;
					height: 18px;
					padding: 0 5px;
					border-radius: 9px;
					background: #ef4444;
					font-size: 10px;
					font-weight: 600;
					color: #fff;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.card-info {
				.card-title {
					font-size: 15px;
					font-weight: 600;
					color: #1f2937;
					margin-bottom: 2px;
				}

				.card-desc {
					font-size: 12px;
					color: #9ca3af;
				}
			}
		}

		.card-badge {
			padding: 4px 10px;
			border-radius: 12px;
			font-size: 11px;
			font-weight: 500;
			background: #eff6ff;
			color: #3b82f6;

			&.warning {
				background: #fffbeb;
				color: #f59e0b;
			}

			&.danger {
				background: #fef2f2;
				color: #ef4444;
			}
		}
	}

	.card-body {
		padding: 16px 20px;

		.section-title {
			font-size: 13px;
			font-weight: 600;
			color: #374151;
			margin-bottom: 12px;
			padding-left: 4px;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 3px;
				height: 14px;
				background: linear-gradient(180deg, #3b82f6, #2563eb);
				border-radius: 2px;
			}
		}

		.maintenance-section {
			display: flex;
			flex-direction: column;
			gap: 12px;

			.inspection-grid {
				background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
				border-left: 3px solid #3b82f6;

				.status-item {
					background: #fff;
					border: 1px solid rgba(59, 130, 246, 0.15);
					box-shadow: 0 1px 3px rgba(59, 130, 246, 0.08);

					&:hover {
						background: #fff;
						border-color: rgba(59, 130, 246, 0.25);
						box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
					}

					&.is-pending {
						background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
						border-color: rgba(245, 158, 11, 0.2);
						box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);

						&:hover {
							background: #fffbeb;
							border-color: rgba(245, 158, 11, 0.3);
						}
					}
				}
			}

			.maintenance-grid {
				background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
				border-left: 3px solid #10b981;

				.status-item {
					background: #fff;
					border: 1px solid rgba(16, 185, 129, 0.15);
					box-shadow: 0 1px 3px rgba(16, 185, 129, 0.08);

					&:hover {
						background: #fff;
						border-color: rgba(16, 185, 129, 0.25);
						box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
					}

					&.is-pending {
						background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
						border-color: rgba(245, 158, 11, 0.2);
						box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);

						&:hover {
							background: #fffbeb;
							border-color: rgba(245, 158, 11, 0.3);
						}
					}
				}
			}

			.status-grid {
				padding: 12px;
				border-radius: 8px;
				border-top: 1px solid #e5e7eb;
				border-right: 1px solid #e5e7eb;
				border-bottom: 1px solid #e5e7eb;
			}
		}

		.section-divider {
			height: 1px;
			background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
			margin: 16px 0;
		}

		.stat-row {
			display: flex;
			gap: 16px;
			margin-bottom: 16px;

			.stat-item {
				flex: 1;
				text-align: center;
				padding: 12px 8px;
				border-radius: 8px;
				background: #f9fafb;
				cursor: pointer;
				transition: all 0.2s;

				&:hover {
					background: #f3f4f6;
				}

				&.highlight {
					background: #fff7ed;

					.stat-num {
						color: #f59e0b;
					}
				}

				.stat-num {
					display: block;
					font-size: 24px;
					font-weight: 700;
					color: #1f2937;
					line-height: 1;
					margin-bottom: 6px;
				}

				.stat-label {
					font-size: 11px;
					color: #9ca3af;
				}
			}
		}

		.todo-preview {
			.preview-title {
				font-size: 12px;
				color: #9ca3af;
				margin-bottom: 10px;
			}

			.preview-list {
				display: flex;
				flex-direction: column;
				gap: 8px;

				.preview-item {
					display: flex;
					align-items: center;
					gap: 10px;
					padding: 10px 12px;
					background: #f9fafb;
					border-radius: 8px;
					transition: all 0.2s;
					cursor: pointer;

					&:hover {
						background: #f3f4f6;
					}

					.preview-tag {
						min-width: 75px;
						text-align: center;
						padding: 2px 8px;
						border-radius: 4px;
						font-size: 10px;
						font-weight: 500;
						flex-shrink: 0;

						&.purchase {
							background: #dbeafe;
							color: #3b82f6;
						}
						&.plan {
							background: #d1fae5;
							color: #10b981;
						}
						&.repair {
							background: #fef3c7;
							color: #f59e0b;
						}
						&.scrap {
							background: #fee2e2;
							color: #ef4444;
						}
						&.parts {
							background: #e0e7ff;
							color: #6366f1;
						}
						&.transfer {
							background: #f3e8ff;
							color: #8b5cf6;
						}
					}

					.preview-text {
						flex: 1;
						font-size: 12px;
						color: #4b5563;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.preview-time {
						font-size: 11px;
						color: #9ca3af;
						flex-shrink: 0;
					}
				}

				.preview-empty {
					text-align: center;
					padding: 20px;
					color: #9ca3af;
					font-size: 13px;
				}
			}

			.preview-pagination {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12px;
				margin-top: 12px;
				padding-top: 12px;
				border-top: 1px solid #f3f4f6;

				.pagination-btn {
					width: 28px;
					height: 28px;
					border-radius: 6px;
					background: #f9fafb;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					transition: all 0.2s;

					&:hover:not(.disabled) {
						background: #f3f4f6;
					}

					&.disabled {
						opacity: 0.4;
						cursor: not-allowed;
					}

					.el-icon {
						font-size: 14px;
						color: #6b7280;
					}
				}

				.pagination-info {
					font-size: 12px;
					color: #6b7280;
					min-width: 40px;
					text-align: center;
				}
			}
		}

		.progress-section {
			.progress-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8px;
				font-size: 12px;
				color: #6b7280;

				.progress-rate {
					font-size: 16px;
					font-weight: 700;
					color: #10b981;
				}
			}

			.progress-bar {
				height: 8px;
				background: #e5e7eb;
				border-radius: 4px;
				overflow: hidden;
				margin-bottom: 8px;

				.progress-fill {
					height: 100%;
					background: linear-gradient(90deg, #10b981, #34d399);
					border-radius: 4px;
					transition: width 0.3s ease;
				}
			}

			.progress-detail {
				font-size: 11px;
				color: #9ca3af;
			}
		}

		.status-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 16px;

			.status-item {
				text-align: center;
				padding: 12px 8px;
				border-radius: 8px;
				cursor: pointer;
				transition: all 0.2s;

				&:hover {
					transform: translateY(-1px);
				}

				&.is-pending {
					.status-num {
						color: #f59e0b;
						font-weight: 700;
					}
				}

				&:not(.is-pending) {
					.status-num {
						color: #10b981;
						font-weight: 600;
					}
				}

				.status-num {
					display: block;
					font-size: 24px;
					margin-bottom: 4px;
					font-weight: 600;
				}

				.status-label {
					display: block;
					font-size: 12px;
					color: #6b7280;
				}
			}
		}

		.message-list-full {
			display: flex;
			flex-direction: column;
			gap: 10px;

			.msg-item-full {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				gap: 12px;
				padding: 12px;
				border-radius: 8px;
				background: #f9fafb;
				cursor: pointer;
				transition: all 0.2s;

				&:hover {
					background: #f3f4f6;
				}

				&.unread {
					background: #fffbeb;

					.msg-title {
						font-weight: 600;
					}
				}

				.msg-left {
					display: flex;
					gap: 10px;
					flex: 1;
					min-width: 0;

					.msg-icon {
						width: 32px;
						height: 32px;
						border-radius: 8px;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;

						.el-icon {
							font-size: 16px;
							color: #fff;
						}

						&.success {
							background: linear-gradient(135deg, #10b981, #34d399);
						}
						&.warning {
							background: linear-gradient(135deg, #f59e0b, #fbbf24);
						}
						&.info {
							background: linear-gradient(135deg, #3b82f6, #60a5fa);
						}
					}

					.msg-content {
						flex: 1;
						min-width: 0;

						.msg-title {
							font-size: 13px;
							font-weight: 500;
							color: #1f2937;
							margin-bottom: 4px;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.msg-desc {
							font-size: 11px;
							color: #9ca3af;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}
				}

				.msg-time {
					font-size: 11px;
					color: #9ca3af;
					flex-shrink: 0;
				}
			}
		}
	}

	&.approval-card {
		.card-header .card-title-row .card-icon {
			background: linear-gradient(135deg, #3b82f6, #60a5fa);
			box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
		}
	}

	&.workorder-card {
		.card-header .card-title-row .card-icon {
			background: linear-gradient(135deg, #10b981, #34d399);
			box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
		}
	}

	&.message-card {
		.card-header .card-title-row .card-icon {
			background: linear-gradient(135deg, #f59e0b, #fbbf24);
			box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
		}
	}
}

.trend-section {
	display: grid;
	grid-template-columns: 1fr 520px;
	gap: 20px;
	margin-bottom: 20px;

	.trend-panel {
		background: #fff;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		overflow: hidden;

		.panel-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 16px 20px;
			border-bottom: 1px solid #f3f4f6;

			.panel-title {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 15px;
				font-weight: 600;
				color: #1f2937;

				.title-icon {
					width: 4px;
					height: 16px;
					background: linear-gradient(180deg, #3b82f6, #60a5fa);
					border-radius: 2px;
				}
			}

			.trend-summary {
				display: flex;
				gap: 32px;

				.summary-item {
					text-align: center;

					.summary-num {
						display: block;
						font-size: 24px;
						font-weight: 700;
						color: #1f2937;
						line-height: 1;
						margin-bottom: 4px;
					}

					.summary-label {
						font-size: 12px;
						color: #9ca3af;
					}

					&:nth-child(1) .summary-num {
						color: #3b82f6;
					}
					&:nth-child(2) .summary-num {
						color: #10b981;
					}
					&:nth-child(3) .summary-num {
						color: #f59e0b;
					}
				}
			}
		}

		.panel-body {
			padding: 16px 20px;

			.chart-trend {
				height: 280px;
			}
		}
	}

	.quick-panel-enhanced {
		background: #fff;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		overflow: hidden;

		.panel-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 14px 16px;
			border-bottom: 1px solid #f3f4f6;

			.panel-title {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 14px;
				font-weight: 500;
				color: #1f2937;

				.title-icon {
					width: 4px;
					height: 14px;
					background: linear-gradient(180deg, #3b82f6, #60a5fa);
					border-radius: 2px;
				}
			}
		}

		.panel-body {
			padding: 12px;

			.quick-grid-enhanced {
				display: grid;
				gap: 10px;

				&.grid-small {
					grid-template-columns: repeat(2, 1fr);

					.quick-item-enhanced {
						padding: 18px 12px;

						.quick-icon-enhanced {
							width: 52px;
							height: 52px;
							font-size: 26px;
							border-radius: 14px;
						}

						.quick-name-enhanced {
							font-size: 13px;
						}
					}
				}

				&.grid-medium {
					grid-template-columns: repeat(3, 1fr);

					.quick-item-enhanced {
						padding: 14px 10px;

						.quick-icon-enhanced {
							width: 44px;
							height: 44px;
							font-size: 22px;
							border-radius: 12px;
						}

						.quick-name-enhanced {
							font-size: 12px;
						}
					}
				}

				&.grid-large {
					grid-template-columns: repeat(4, 1fr);

					.quick-item-enhanced {
						padding: 10px 6px;

						.quick-icon-enhanced {
							width: 36px;
							height: 36px;
							font-size: 18px;
							border-radius: 10px;
						}

						.quick-name-enhanced {
							font-size: 10px;
						}
					}
				}

				.quick-item-enhanced {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 6px;
					padding: 14px 10px;
					border-radius: 8px;
					background: #f9fafb;
					cursor: pointer;
					transition: all 0.25s ease;
					border: 1px solid transparent;

					&:hover {
						background: #f3f4f6;
						transform: translateY(-2px);
						border-color: #e5e7eb;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
					}

					.quick-icon-enhanced {
						width: 44px;
						height: 44px;
						border-radius: 12px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 22px;
						color: #fff;
						box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
						transition: all 0.25s ease;

						&.blue {
							background: linear-gradient(135deg, #3b82f6, #60a5fa);
						}
						&.green {
							background: linear-gradient(135deg, #10b981, #34d399);
						}
						&.orange {
							background: linear-gradient(135deg, #f59e0b, #fbbf24);
						}
						&.purple {
							background: linear-gradient(135deg, #8b5cf6, #a78bfa);
						}
					}

					.quick-name-enhanced {
						font-size: 12px;
						color: #4b5563;
						text-align: center;
						font-weight: 500;
						line-height: 1.2;
						transition: font-size 0.25s ease;
					}
				}
			}
		}
	}
}

.workorder-stats-panel-full {
	background: #fff;
	border-radius: 12px;
	border: 1px solid #e5e7eb;
	overflow: hidden;

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		border-bottom: 1px solid #f3f4f6;

		.panel-title {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 14px;
			font-weight: 500;
			color: #1f2937;

			.title-icon {
				width: 4px;
				height: 14px;
				background: linear-gradient(180deg, #3b82f6, #60a5fa);
				border-radius: 2px;
			}
		}

		.panel-tabs {
			display: flex;
			gap: 2px;
			background: #f3f4f6;
			padding: 2px;
			border-radius: 6px;

			span {
				padding: 4px 10px;
				font-size: 12px;
				color: #6b7280;
				border-radius: 4px;
				cursor: pointer;
				transition: all 0.2s;

				&.active {
					background: #fff;
					color: #1f2937;
					box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
				}
			}
		}
	}

	.panel-body {
		padding: 16px;

		.type-view-compact {
			display: flex;
			align-items: center;
			gap: 20px;

			.chart-pie-compact {
				width: 140px;
				height: 140px;
				flex-shrink: 0;
			}

			.type-list-compact {
				flex: 1;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 8px;

				.type-item-compact {
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 10px 12px;
					background: #f9fafb;
					border-radius: 8px;
					cursor: pointer;
					transition: all 0.2s;

					&:hover {
						background: #f3f4f6;
					}

					.type-dot {
						width: 8px;
						height: 8px;
						border-radius: 50%;
					}

					.type-name {
						flex: 1;
						font-size: 12px;
						color: #6b7280;
					}

					.type-value {
						font-size: 14px;
						font-weight: 600;
						color: #1f2937;
					}
				}
			}
		}

		.node-view-compact {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;

			.node-item-compact {
				.node-header {
					display: flex;
					justify-content: space-between;
					margin-bottom: 6px;

					.node-name {
						font-size: 12px;
						color: #6b7280;
					}

					.node-value {
						font-size: 12px;
						font-weight: 600;
						color: #1f2937;
					}
				}

				.node-progress {
					height: 6px;
					background: #e5e7eb;
					border-radius: 3px;
					overflow: hidden;

					.node-bar {
						height: 100%;
						border-radius: 3px;
					}
				}
			}
		}

		.today-view-compact {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 12px;

			.today-item-compact {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 14px;
				background: #f9fafb;
				border-radius: 10px;
				cursor: pointer;
				transition: all 0.2s;

				&:hover {
					background: #f3f4f6;
				}

				.today-icon {
					width: 42px;
					height: 42px;
					border-radius: 10px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 20px;
					color: #fff;

					&.blue {
						background: linear-gradient(135deg, #3b82f6, #60a5fa);
					}
					&.orange {
						background: linear-gradient(135deg, #f59e0b, #fbbf24);
					}
					&.green {
						background: linear-gradient(135deg, #10b981, #34d399);
					}
				}

				.today-info {
					.today-num {
						font-size: 22px;
						font-weight: 700;
						color: #1f2937;
						line-height: 1;
					}

					.today-label {
						font-size: 12px;
						color: #9ca3af;
						margin-top: 4px;
					}
				}
			}
		}
	}
}

.main-section {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
}

.bottom-section {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	margin-top: 20px;
}

.panel {
	background: #fff;
	border-radius: 12px;
	border: 1px solid #e5e7eb;
	overflow: hidden;
	transition: all 0.3s ease;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		border-bottom: 1px solid #f3f4f6;

		.panel-title {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 14px;
			font-weight: 500;
			color: #1f2937;

			.title-icon {
				width: 4px;
				height: 14px;
				background: linear-gradient(180deg, #3b82f6, #60a5fa);
				border-radius: 2px;

				&.warning {
					background: linear-gradient(180deg, #f59e0b, #fbbf24);
				}
			}
		}

		.panel-tabs {
			display: flex;
			gap: 4px;
			background: #f3f4f6;
			padding: 3px;
			border-radius: 6px;

			span {
				padding: 4px 10px;
				font-size: 12px;
				color: #6b7280;
				border-radius: 4px;
				cursor: pointer;
				transition: all 0.2s;

				&.active {
					background: #fff;
					color: #1f2937;
					box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
				}

				&:hover:not(.active) {
					color: #374151;
				}
			}
		}

		:deep(.el-radio-group) {
			.el-radio-button__inner {
				background: transparent;
				border: none;
				color: #6b7280;
				padding: 4px 10px;
				font-size: 12px;

				&:hover {
					color: #374151;
				}
			}

			.el-radio-button__original-radio:checked + .el-radio-button__inner {
				background: #3b82f6;
				color: #fff;
				box-shadow: none;
			}
		}
	}

	.panel-body {
		padding: 16px;
	}
}

.workorder-panel {
	flex: 1;

	.type-view {
		display: flex;
		gap: 20px;

		.chart-pie {
			width: 120px;
			height: 120px;
			flex-shrink: 0;
		}

		.type-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 8px;

			.type-item {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 8px 12px;
				background: #f9fafb;
				border-radius: 6px;
				cursor: pointer;
				transition: all 0.2s;

				&:hover {
					background: #f3f4f6;
				}

				.type-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
				}

				.type-name {
					flex: 1;
					font-size: 12px;
					color: #6b7280;
				}

				.type-value {
					font-size: 14px;
					font-weight: 600;
					color: #1f2937;
				}
			}
		}
	}

	.node-view {
		display: flex;
		flex-direction: column;
		gap: 12px;

		.node-item {
			.node-header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 6px;

				.node-name {
					font-size: 12px;
					color: #6b7280;
				}

				.node-value {
					font-size: 12px;
					font-weight: 600;
					color: #1f2937;
				}
			}

			.node-progress {
				height: 6px;
				background: #e5e7eb;
				border-radius: 3px;
				overflow: hidden;

				.node-bar {
					height: 100%;
					border-radius: 3px;
					transition: width 0.3s ease;
				}
			}
		}
	}

	.today-view {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;

		.today-item {
			text-align: center;
			padding: 16px;
			background: #f9fafb;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: #f3f4f6;
			}

			.today-icon {
				width: 40px;
				height: 40px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20px;
				margin: 0 auto 8px;
				color: #fff;

				&.blue {
					background: linear-gradient(135deg, #3b82f6, #60a5fa);
				}
				&.orange {
					background: linear-gradient(135deg, #f59e0b, #fbbf24);
				}
				&.green {
					background: linear-gradient(135deg, #10b981, #34d399);
				}
			}

			.today-num {
				font-size: 24px;
				font-weight: 700;
				color: #1f2937;
				margin-bottom: 4px;
			}

			.today-label {
				font-size: 12px;
				color: #6b7280;
			}
		}
	}
}

.trend-panel {
	flex: 1;

	.chart-line {
		height: 200px;
	}
}

.cost-panel {
	flex: 1;

	.chart-bar {
		height: 220px;
	}
}

.equipment-panel {
	.panel-body {
		padding: 16px;

		.equipment-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;

			.equipment-item {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 16px;
				background: #fff;
				border-radius: 10px;
				border: 2px solid #e5e7eb;
				cursor: pointer;
				transition: all 0.3s;

				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
				}

				.equipment-icon {
					width: 48px;
					height: 48px;
					border-radius: 10px;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.el-icon {
						font-size: 24px;
						color: #fff;
					}
				}

				.equipment-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 4px;

					.equipment-num {
						font-size: 28px;
						font-weight: 700;
						line-height: 1;
						font-family: 'DIN Alternate', 'Arial', sans-serif;
					}

					.equipment-label {
						font-size: 13px;
						color: #6b7280;
					}
				}
			}
		}
	}
}

.warning-panel {
	.panel-body {
		padding: 16px;
	}

	.warning-list {
		display: flex;
		flex-direction: column;
		gap: 10px;

		.warning-item {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 14px 16px;
			border-radius: 10px;
			background: #f9fafb;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: #f3f4f6;
			}

			.warning-indicator {
				width: 4px;
				height: 36px;
				border-radius: 2px;
				background: #d1d5db;
			}

			&.danger {
				background: #fef2f2;
				border: 1px solid #fecaca;

				.warning-indicator {
					background: #ef4444;
				}
				.warning-tag {
					background: #ef4444;
				}
			}

			&.warning {
				background: #fffbeb;
				border: 1px solid #fde68a;

				.warning-indicator {
					background: #f59e0b;
				}
				.warning-tag {
					background: #f59e0b;
				}
			}

			.warning-content {
				flex: 1;

				.warning-name {
					display: block;
					font-size: 14px;
					font-weight: 500;
					color: #1f2937;
					margin-bottom: 4px;
				}

				.warning-desc {
					font-size: 12px;
					color: #6b7280;
				}
			}

			.warning-tag {
				padding: 4px 10px;
				border-radius: 4px;
				font-size: 12px;
				font-weight: 500;
				color: #fff;
			}
		}
	}
}

.material-panel {
	.panel-header {
		.material-summary {
			display: flex;
			align-items: baseline;
			gap: 8px;

			.total-label {
				font-size: 12px;
				color: #9ca3af;
			}

			.total-value {
				font-size: 18px;
				font-weight: 700;
				color: #3b82f6;
			}
		}
	}

	.panel-body {
		.material-list {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;

			.material-item {
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 12px;
				background: #f9fafb;
				border-radius: 8px;
				transition: all 0.2s;

				&:hover {
					background: #f3f4f6;
				}

				.material-rank {
					width: 24px;
					height: 24px;
					border-radius: 6px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 12px;
					font-weight: 600;
					color: #9ca3af;
					background: #e5e7eb;
					flex-shrink: 0;

					&.top {
						background: linear-gradient(135deg, #3b82f6, #60a5fa);
						color: #fff;
					}
				}

				.material-info {
					flex: 1;
					min-width: 0;

					.material-name {
						font-size: 13px;
						font-weight: 500;
						color: #1f2937;
						margin-bottom: 4px;
					}

					.material-bar-wrap {
						height: 4px;
						background: #e5e7eb;
						border-radius: 2px;
						overflow: hidden;

						.material-bar {
							height: 100%;
							background: linear-gradient(90deg, #3b82f6, #60a5fa);
							border-radius: 2px;
							transition: width 0.3s ease;
						}
					}
				}

				.material-data {
					text-align: right;
					flex-shrink: 0;

					.material-value {
						font-size: 14px;
						font-weight: 600;
						color: #1f2937;
					}

					.material-unit {
						font-size: 11px;
						color: #9ca3af;
						margin-left: 2px;
					}
				}
			}
		}
	}
}

.quick-panel {
	.quick-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;

		.quick-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 6px;
			padding: 12px 8px;
			border-radius: 8px;
			background: #f9fafb;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: #f3f4f6;
				transform: translateY(-2px);
			}

			.quick-icon {
				width: 36px;
				height: 36px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
				color: #fff;

				&.blue {
					background: linear-gradient(135deg, #3b82f6, #60a5fa);
				}
				&.green {
					background: linear-gradient(135deg, #10b981, #34d399);
				}
				&.orange {
					background: linear-gradient(135deg, #f59e0b, #fbbf24);
				}
				&.purple {
					background: linear-gradient(135deg, #8b5cf6, #a78bfa);
				}
			}

			.quick-name {
				font-size: 11px;
				color: #6b7280;
				text-align: center;
			}
		}
	}
}

.customize-dialog {
	.el-dialog__header {
		padding: 16px 20px;
		border-bottom: 1px solid #f3f4f6;
		margin-right: 0;

		.el-dialog__title {
			font-size: 16px;
			font-weight: 600;
			color: #1f2937;
		}
	}

	.el-dialog__body {
		padding: 20px;
	}

	.el-dialog__footer {
		padding: 16px 20px;
		border-top: 1px solid #f3f4f6;
	}
}

.customize-content {
	.customize-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		background: #f8fafc;
		border-radius: 10px;
		margin-bottom: 20px;

		.customize-tip {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 13px;
			color: #64748b;

			.tip-icon {
				font-size: 16px;
				color: #3b82f6;
			}
		}

		.selected-count {
			font-size: 13px;
			color: #64748b;

			.count-num {
				font-size: 18px;
				font-weight: 700;
				color: #3b82f6;
				margin: 0 4px;
			}
		}
	}

	.module-pool {
		.module-pool-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;

			.module-pool-item {
				position: relative;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 10px;
				padding: 16px 12px;
				border-radius: 12px;
				background: #fff;
				border: 2px solid #e5e7eb;
				cursor: pointer;
				transition: all 0.25s ease;

				&:hover {
					border-color: #93c5fd;
					background: #f8fafc;
					transform: translateY(-2px);
					box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
				}

				&.selected {
					border-color: #3b82f6;
					background: #eff6ff;

					.module-name {
						color: #1f2937;
						font-weight: 500;
					}

					.module-check {
						position: absolute;
						top: 8px;
						right: 8px;
						width: 20px;
						height: 20px;
						border-radius: 50%;
						background: #3b82f6;
						display: flex;
						align-items: center;
						justify-content: center;

						.el-icon {
							font-size: 12px;
							color: #fff;
						}
					}
				}

				&.disabled {
					opacity: 0.5;
					cursor: not-allowed;

					&:hover {
						transform: none;
						box-shadow: none;
						border-color: #e5e7eb;
						background: #fff;
					}
				}

				.module-icon {
					width: 48px;
					height: 48px;
					border-radius: 14px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24px;
					color: #fff;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

					&.blue {
						background: linear-gradient(135deg, #3b82f6, #60a5fa);
					}
					&.green {
						background: linear-gradient(135deg, #10b981, #34d399);
					}
					&.orange {
						background: linear-gradient(135deg, #f59e0b, #fbbf24);
					}
					&.purple {
						background: linear-gradient(135deg, #8b5cf6, #a78bfa);
					}
				}

				.module-name {
					font-size: 12px;
					color: #6b7280;
					text-align: center;
					line-height: 1.3;
					max-width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}
		}
	}
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

@media (max-width: 1600px) {
	.main-section {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (max-width: 1400px) {
	.core-section {
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.trend-section {
		grid-template-columns: 1fr;

		.trend-summary {
			gap: 20px;

			.summary-num {
				font-size: 20px;
			}
		}

		.chart-trend {
			height: 220px;
		}

		.quick-panel-enhanced {
			.panel-body {
				.quick-grid-enhanced {
					&.grid-small {
						grid-template-columns: repeat(2, 1fr);
					}

					&.grid-medium {
						grid-template-columns: repeat(2, 1fr);
					}

					&.grid-large {
						grid-template-columns: repeat(3, 1fr);
					}
				}
			}
		}
	}

	.main-section {
		grid-template-columns: 1fr 1fr;
	}

	.workorder-stats-panel-full {
		.panel-body {
			.type-view-compact {
				flex-direction: column;

				.chart-pie-compact {
					width: 120px;
					height: 120px;
				}

				.type-list-compact {
					grid-template-columns: repeat(4, 1fr);
				}
			}

			.today-view-compact {
				grid-template-columns: repeat(3, 1fr);
			}
		}
	}

	.customize-content {
		.module-pool {
			.module-pool-grid {
				grid-template-columns: repeat(3, 1fr);
			}
		}
	}
}

@media (max-width: 1200px) {
	.main-section {
		grid-template-columns: 1fr;
	}

	.workorder-stats-panel-full {
		.panel-body {
			.type-view-compact {
				.type-list-compact {
					grid-template-columns: repeat(2, 1fr);
				}
			}

			.node-view-compact {
				grid-template-columns: 1fr;
			}
		}
	}

	.customize-content {
		.module-pool {
			.module-pool-grid {
				grid-template-columns: repeat(2, 1fr);
			}
		}
	}
}
</style>
