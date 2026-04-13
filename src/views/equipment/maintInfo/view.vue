<template>
	<div class="maint-info-view-wrapper">
		<div class="view-layout">
			<div class="view-main">
				<el-card class="info-card" shadow="never">
					<template #header>
						<div class="card-header">
							<span>提报信息</span>
						</div>
					</template>
					<el-descriptions :column="2" border class="stage-descriptions">
						<el-descriptions-item label="工单号">{{ getDisplayValue(formData.workOrderNo) }}</el-descriptions-item>
						<el-descriptions-item label="当前状态">{{ getStatusText(formData.status) }}</el-descriptions-item>
						<el-descriptions-item label="提报人">{{ getDisplayValue(formData.createByName) }}</el-descriptions-item>
						<el-descriptions-item label="提报时间">{{ formatDateTime(formData.createTime) }}</el-descriptions-item>
						<el-descriptions-item label="设备名称">{{ getDisplayValue(formData.equipName) }}</el-descriptions-item>
						<el-descriptions-item label="设备编码">{{ getDisplayValue(formData.equipCode) }}</el-descriptions-item>
						<el-descriptions-item label="报修类型">{{ getDisplayValue(formData.reportTypeName) }}</el-descriptions-item>
						<el-descriptions-item label="故障发现时间">{{ formatDateTime(formData.faultFindTime) }}</el-descriptions-item>
						<el-descriptions-item label="紧急程度">
							<el-tag :type="getEmergencyLevelTagType(formData.emergencyLevel)">
								{{ getEmergencyLevelText(formData.emergencyLevel) }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="维修类型">{{ getDisplayValue(formData.maintTypeName) }}</el-descriptions-item>
						<el-descriptions-item label="是否停机">
							<el-tag :type="Number(formData.isStopped) === 1 ? 'danger' : 'success'">
								{{ getYesNoText(formData.isStopped) }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="故障描述" :span="2">{{ getDisplayValue(formData.faultDesc) }}</el-descriptions-item>
					</el-descriptions>
					<div v-if="faultImageList.length > 0" class="image-section">
						<div class="section-label">故障图片</div>
						<div class="image-list">
							<el-image
								v-for="(img, index) in faultImageList"
								:key="img.id || index"
								:src="img.url"
								:preview-src-list="faultImageList.map(item => item.url)"
								fit="cover"
								class="preview-image"
								:initial-index="index"
							/>
						</div>
					</div>
				</el-card>

				<el-card class="info-card" shadow="never">
					<template #header>
						<div class="card-header">
							<span>派工信息</span>
						</div>
					</template>
					<el-descriptions :column="2" border class="stage-descriptions">
						<el-descriptions-item label="派工类型">{{ getDispatchTypeText(formData.dispatchTypeCode, formData.dispatchTypeName) }}</el-descriptions-item>
						<el-descriptions-item label="派工时间">{{ formatDateTime(formData.dispatchTime) }}</el-descriptions-item>
						<el-descriptions-item label="派工人">{{ getDisplayValue(formData.dispatcherName) }}</el-descriptions-item>
						<el-descriptions-item label="维修项目申请单">{{ getDisplayValue(formData.mantAppNumber) }}</el-descriptions-item>
						<el-descriptions-item label="承修单位">{{ getDisplayValue(formData.maintOrgName) }}</el-descriptions-item>
						<el-descriptions-item label="维修负责人">{{ getDisplayValue(formData.maintLeaderName) }}</el-descriptions-item>
						<el-descriptions-item label="负责人电话">{{ getDisplayValue(formData.maintLeaderMobile) }}</el-descriptions-item>
						<el-descriptions-item label="涉及特殊作业">{{ getSpecialJobText(formData.isSpecialJob) }}</el-descriptions-item>
						<el-descriptions-item label="特殊作业情况" :span="2">{{ getDisplayValue(formData.specialJobName) }}</el-descriptions-item>
					</el-descriptions>
					<div v-if="dispatchPartList.length > 0" class="table-section">
						<div class="section-label">派工部位部件</div>
						<el-table :data="dispatchPartList" border size="small">
							<el-table-column type="index" label="序号" width="60" align="center" />
							<el-table-column prop="equipInstitutionName" label="设备机构名称" min-width="180" />
							<el-table-column prop="equipUnitName" label="设备部件名称" min-width="180" />
						</el-table>
					</div>
				</el-card>

				<el-card class="info-card" shadow="never">
					<template #header>
						<div class="card-header">
							<span>维修信息</span>
						</div>
					</template>
					<el-descriptions :column="2" border class="stage-descriptions">
						<el-descriptions-item label="维修开始时间">{{ formatDateTime(formData.maintStartTime) }}</el-descriptions-item>
						<el-descriptions-item label="维修结束时间">{{ formatDateTime(formData.maintEndTime) }}</el-descriptions-item>
						<el-descriptions-item label="维修时长(小时)">{{ formatNumber(formData.maintDuration) }}</el-descriptions-item>
						<el-descriptions-item label="故障时长(小时)">{{ formatNumber(formData.faultDuration) }}</el-descriptions-item>
						<el-descriptions-item label="维修说明" :span="2">{{ getDisplayValue(formData.maintRemark) }}</el-descriptions-item>
					</el-descriptions>
					<div v-if="hourFeedbackList.length > 0" class="table-section">
						<div class="section-label">作业工时反馈</div>
						<el-table :data="hourFeedbackList" border size="small">
							<el-table-column type="index" label="序号" width="60" align="center" />
							<el-table-column prop="maintUserName" label="维修人员" min-width="120" />
							<el-table-column prop="startTime" label="开始时间" min-width="160" />
							<el-table-column prop="endTime" label="结束时间" min-width="160" />
							<el-table-column prop="workHour" label="工时" width="100" align="right">
								<template #default="{ row }">
									{{ formatNumber(row.workHour) }}
								</template>
							</el-table-column>
							<el-table-column prop="workContent" label="工作内容" min-width="220" show-overflow-tooltip />
						</el-table>
					</div>
					<div v-if="partReplaceList.length > 0" class="table-section">
						<div class="section-label">配件更换列表</div>
						<el-table :data="partReplaceList" border size="small">
							<el-table-column prop="warehouseOutNo" label="出库单号" width="150" />
							<el-table-column prop="materialName" label="物资名称" min-width="140" />
							<el-table-column prop="specificationModel" label="规格型号" width="150" />
							<el-table-column prop="unitName" label="计量单位" width="100" />
							<el-table-column prop="applicationQuantity" label="出库数量" width="120" align="right">
								<template #default="{ row }">
									{{ formatNumber(row.applicationQuantity) }}
								</template>
							</el-table-column>
							<el-table-column prop="usedQuantity" label="使用数量" width="120" align="right">
								<template #default="{ row }">
									{{ formatNumber(row.usedQuantity) }}
								</template>
							</el-table-column>
						</el-table>
					</div>
					<div v-if="endImageList.length > 0" class="image-section">
						<div class="section-label">维修完成图片</div>
						<div class="image-list">
							<el-image
								v-for="(img, index) in endImageList"
								:key="img.id || index"
								:src="img.url"
								:preview-src-list="endImageList.map(item => item.url)"
								fit="cover"
								class="preview-image"
								:initial-index="index"
							/>
						</div>
					</div>
				</el-card>

				<el-card class="info-card" shadow="never">
					<template #header>
						<div class="card-header">
							<span>验收信息</span>
						</div>
					</template>
					<el-descriptions :column="2" border class="stage-descriptions">
						<el-descriptions-item label="验收结果">{{ currentAcceptanceInfo.result }}</el-descriptions-item>
						<el-descriptions-item label="验收时间">{{ currentAcceptanceInfo.time }}</el-descriptions-item>
						<el-descriptions-item label="验收人">{{ currentAcceptanceInfo.accepter }}</el-descriptions-item>
						<el-descriptions-item label="退回状态">{{ currentAcceptanceInfo.returnStatus }}</el-descriptions-item>
						<el-descriptions-item label="验收备注" :span="2">{{ currentAcceptanceInfo.remark }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<el-card v-if="Number(formData.status) === 7 || formData.cancelTime || formData.cancelByName || formData.cancelRemark" class="info-card" shadow="never">
					<template #header>
						<div class="card-header">
							<span>作废信息</span>
						</div>
					</template>
					<el-descriptions :column="2" border class="stage-descriptions">
						<el-descriptions-item label="作废人">{{ getDisplayValue(formData.cancelByName) }}</el-descriptions-item>
						<el-descriptions-item label="作废时间">{{ formatDateTime(formData.cancelTime || formData.updateTime) }}</el-descriptions-item>
						<el-descriptions-item label="作废备注" :span="2">{{ getDisplayValue(formData.cancelRemark) }}</el-descriptions-item>
					</el-descriptions>
				</el-card>
			</div>

			<div class="view-side">
				<el-card class="timeline-card" shadow="always">
					<template #header>
						<div class="card-header">
							<span>操作记录</span>
						</div>
					</template>
					<el-empty v-if="timelineList.length === 0" description="暂无操作记录" />
					<template v-else>
						<div class="custom-timeline">
							<div
								v-for="(item, index) in timelineList"
								:key="`${item.title}-${index}`"
								class="timeline-item"
							>
								<div class="timeline-dot" :class="getDotClass(item.actionCode, index, timelineList.length)"></div>
								<div class="dot-label" v-if="index === 0 && timelineList.length > 1">当前</div>
								<div class="dot-label" v-else-if="index === timelineList.length - 1 && timelineList.length > 1">开始</div>

								<div class="timeline-card-inner">
									<div class="card-time">{{ item.time }}</div>
									<div class="card-title">{{ item.title }}</div>
									<div class="card-content">
										<div class="content-item" v-for="(line, lineIndex) in item.lines" :key="lineIndex">
											<span class="content-label">{{ line.label }}</span>
											<span class="content-value">{{ line.value }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</template>
				</el-card>
			</div>
		</div>
	</div>
</template>

<script setup name="maintInfoView">
import { computed, reactive, ref } from 'vue'
import publicApi from '@/api/public/index'

defineProps({
	maintInfoId: {
		type: [Number, String],
		default: null
	}
})

const createDefaultFormData = () => ({
	id: null,
	workOrderNo: '',
	equipName: '',
	equipCode: '',
	faultFindTime: '',
	emergencyLevel: '0',
	maintTypeCode: '',
	maintTypeName: '',
	isStopped: 0,
	faultDesc: '',
	reportTypeCode: '',
	reportTypeName: '',
	dispatchTypeCode: '',
	dispatchTypeName: '',
	mantAppNumber: '',
	maintOrgName: '',
	maintLeaderName: '',
	maintLeaderMobile: '',
	isSpecialJob: '0',
	specialJobName: '',
	dispatcherName: '',
	dispatchTime: '',
	maintStartTime: '',
	maintEndTime: '',
	maintRemark: '',
	maintDuration: null,
	faultDuration: null,
	hourFeedbackList: [],
	itemList: [],
	operateLogList: [],
	accepterName: '',
	acceptanceTime: '',
	acceptanceRemark: '',
	status: 0,
	createTime: '',
	createByName: '',
	updateTime: '',
	cancelTime: '',
	cancelByName: '',
	cancelRemark: '',
})

const formData = reactive(createDefaultFormData())

const faultImageList = ref([])
const endImageList = ref([])
const partReplaceList = ref([])

const dispatchTypeMap = {
	'1': '委内',
	'2': '委外',
	'3': '定额',
	'4': '非定额',
	'5': '其他'
}

const statusMap = {
	'0': '提报',
	'1': '已派工',
	'2': '维修中',
	'4': '维修完成',
	'5': '验收通过',
	'6': '验收不通过',
	'7': '作废'
}

const dispatchPartList = computed(() => Array.isArray(formData.itemList) ? formData.itemList : [])
const hourFeedbackList = computed(() => Array.isArray(formData.hourFeedbackList) ? formData.hourFeedbackList : [])

const inferredReturnStatus = computed(() => {
	if (formData.acceptanceTime && [0, 1, 2].includes(Number(formData.status))) {
		return Number(formData.status)
	}
	return null
})

const acceptanceFlag = computed(() => {
	if (!formData.acceptanceTime) {
		return null
	}
	if (Number(formData.status) === 5) {
		return 1
	}
	if (inferredReturnStatus.value != null) {
		return 0
	}
	return null
})

const acceptanceResultText = computed(() => {
	if (acceptanceFlag.value === 1) {
		return '通过'
	}
	if (acceptanceFlag.value === 0) {
		return '不通过'
	}
	return '-'
})

const hasAcceptanceRecord = computed(() => {
	return (
		!!formData.acceptanceTime ||
		!!formData.accepterName ||
		!!formData.acceptanceRemark
	)
})

const returnStatusText = computed(() => {
	if (inferredReturnStatus.value == null || inferredReturnStatus.value === '') {
		return '-'
	}
	return getStatusText(inferredReturnStatus.value)
})

const acceptanceDisplayText = computed(() => {
	if (acceptanceResultText.value !== '不通过') {
		return acceptanceResultText.value
	}
	return returnStatusText.value !== '-' ? `不通过，退回至${returnStatusText.value}` : '不通过'
})

const operateLogList = computed(() => {
	const list = Array.isArray(formData.operateLogList) ? [...formData.operateLogList] : []
	return list.sort((a, b) => getTimeValue(b?.operateTime) - getTimeValue(a?.operateTime))
})

const latestAcceptanceLog = computed(() => {
	return operateLogList.value.find(item => ['ACCEPT_PASS', 'ACCEPT_REJECT'].includes(item?.actionCode)) || null
})

const latestAcceptanceSnapshot = computed(() => {
	return parseSnapshotJson(latestAcceptanceLog.value?.snapshotJson)
})

const currentAcceptanceInfo = computed(() => {
	const currentStatus = Number(formData.status)
	const latestLog = latestAcceptanceLog.value
	const snapshot = latestAcceptanceSnapshot.value
	const latestLogTime = latestLog?.operateTime || formData.acceptanceTime
	const latestLogUser = latestLog?.operateByName || formData.accepterName
	const latestLogRemark = snapshot.acceptanceRemark || latestLog?.remark || formData.acceptanceRemark
	const latestReturnStatus = snapshot.returnStatusName || getStatusText(snapshot.returnStatus)

	if (currentStatus === 4) {
		return {
			result: '待验收',
			time: '-',
			accepter: '-',
			returnStatus: '-',
			remark: '-',
		}
	}

	if (currentStatus === 5) {
		return {
			result: '验收通过',
			time: formatDateTime(formData.acceptanceTime || latestLogTime),
			accepter: getDisplayValue(formData.accepterName || latestLogUser),
			returnStatus: '-',
			remark: getDisplayValue(formData.acceptanceRemark || latestLogRemark),
		}
	}

	if ([0, 1, 2].includes(currentStatus) && latestLog?.actionCode === 'ACCEPT_REJECT') {
		const currentReturnStatus = getStatusText(currentStatus)
		return {
			result: currentReturnStatus !== '-' ? `上次验收不通过，当前已退回至${currentReturnStatus}` : '上次验收不通过',
			time: formatDateTime(formData.acceptanceTime || latestLogTime),
			accepter: getDisplayValue(formData.accepterName || latestLogUser),
			returnStatus: currentReturnStatus,
			remark: getDisplayValue(formData.acceptanceRemark || latestLogRemark),
		}
	}

	if (latestLog?.actionCode === 'ACCEPT_PASS') {
		return {
			result: '验收通过',
			time: formatDateTime(formData.acceptanceTime || latestLogTime),
			accepter: getDisplayValue(formData.accepterName || latestLogUser),
			returnStatus: '-',
			remark: getDisplayValue(formData.acceptanceRemark || latestLogRemark),
		}
	}

	if (latestLog?.actionCode === 'ACCEPT_REJECT') {
		return {
			result: latestReturnStatus && latestReturnStatus !== '-' ? `上次验收不通过，退回至${latestReturnStatus}` : '上次验收不通过',
			time: formatDateTime(formData.acceptanceTime || latestLogTime),
			accepter: getDisplayValue(formData.accepterName || latestLogUser),
			returnStatus: latestReturnStatus && latestReturnStatus !== '-' ? latestReturnStatus : '-',
			remark: getDisplayValue(formData.acceptanceRemark || latestLogRemark),
		}
	}

	return {
		result: '未进入验收',
		time: '-',
		accepter: '-',
		returnStatus: '-',
		remark: '-',
	}
})

const timelineList = computed(() => {
	if (operateLogList.value.length > 0) {
		return operateLogList.value
			.map(item => buildTimelineItem(item))
			.filter(item => item != null)
			.sort((a, b) => getTimeValue(b.rawTime) - getTimeValue(a.rawTime))
	}
	return buildFallbackTimelineList()
})

const formatDateTime = (dateTime) => {
	if (!dateTime) return '-'
	if (typeof dateTime === 'string') {
		return dateTime
	}
	if (dateTime instanceof Date) {
		const year = dateTime.getFullYear()
		const month = String(dateTime.getMonth() + 1).padStart(2, '0')
		const day = String(dateTime.getDate()).padStart(2, '0')
		const hours = String(dateTime.getHours()).padStart(2, '0')
		const minutes = String(dateTime.getMinutes()).padStart(2, '0')
		return `${year}-${month}-${day} ${hours}:${minutes}`
	}
	if (typeof dateTime === 'string' && dateTime.length >= 16) {
		return dateTime.slice(0, 16)
	}
	return dateTime
}

const getTimeValue = (value) => {
	if (!value) return 0
	if (value instanceof Date) return value.getTime()
	const text = String(value).replace(/-/g, '/')
	const result = new Date(text).getTime()
	return Number.isNaN(result) ? 0 : result
}

const getDisplayValue = value => {
	if (value === 0 || value === '0') return value
	return value ? value : '-'
}

const getTextOrEmpty = value => {
	if (value === 0 || value === '0') return String(value)
	return value ? String(value) : ''
}

const getStatusText = status => {
	const key = status == null ? '' : String(status)
	return statusMap[key] || '-'
}

const getEmergencyLevelText = level => {
	const levelMap = {
		'0': '常规',
		'1': '紧急',
		'2': '特急'
	}
	return levelMap[String(level)] || getDisplayValue(level)
}

const getEmergencyLevelTagType = level => {
	if (String(level) === '2') {
		return 'danger'
	}
	if (String(level) === '1') {
		return 'warning'
	}
	return 'info'
}

const getDispatchTypeText = (code, name) => {
	return name || dispatchTypeMap[String(code)] || '-'
}

const getYesNoText = value => {
	return Number(value) === 1 ? '是' : '否'
}

const getSpecialJobText = value => {
	return String(value) === '1' ? '是' : '否'
}

const getLogColor = actionCode => {
	const colorMap = {
		REPORT: '#409EFF',
		DISPATCH: '#67C23A',
		START_MAINT: '#E6A23C',
		END_MAINT: '#909399',
		ACCEPT_PASS: '#67C23A',
		ACCEPT_REJECT: '#F56C6C',
		CANCEL: '#909399',
	}
	return colorMap[actionCode] || '#409EFF'
}

const parseSnapshotJson = snapshotJson => {
	if (!snapshotJson) return {}
	if (typeof snapshotJson === 'object') return snapshotJson
	try {
		return JSON.parse(snapshotJson)
	} catch (error) {
		console.error('解析操作日志快照失败:', error)
		return {}
	}
}

const appendLine = (lines, label, value, formatter) => {
	const text = formatter ? formatter(value) : getTextOrEmpty(value)
	if (!text || text === '-') return
	lines.push({ label, value: text })
}

const buildTimelineItem = logItem => {
	if (!logItem) return null

	const snapshot = parseSnapshotJson(logItem.snapshotJson)
	const actionCode = getTextOrEmpty(logItem.actionCode)
	const operatorName = getTextOrEmpty(logItem.operateByName) || '系统'
	const remark = getTextOrEmpty(logItem.remark)
	const lines = []
	let title = getTextOrEmpty(logItem.actionName) || '操作记录'

	lines.push({ label: '操作人', value: operatorName })

	if (actionCode === 'REPORT') {
		title = '提报'
		lines.push({ label: '操作动作', value: '提交了报修信息' })
		appendLine(lines, '报修类型', snapshot.reportTypeName || formData.reportTypeName)
		appendLine(lines, '故障发现时间', snapshot.faultFindTime || formData.faultFindTime, formatDateTime)
	} else if (actionCode === 'DISPATCH') {
		title = '派工'
		lines.push({ label: '操作动作', value: '完成派工' })
		appendLine(lines, '派工类型', snapshot.dispatchTypeName || getDispatchTypeText(snapshot.dispatchTypeCode, formData.dispatchTypeName))
		appendLine(lines, '承修单位', snapshot.maintOrgName || formData.maintOrgName)
		appendLine(lines, '维修负责人', snapshot.maintLeaderName || formData.maintLeaderName)
	} else if (actionCode === 'START_MAINT') {
		title = '开始维修'
		lines.push({ label: '操作动作', value: '开始维修' })
		appendLine(lines, '开始时间', snapshot.maintStartTime || logItem.operateTime, formatDateTime)
	} else if (actionCode === 'END_MAINT') {
		title = '维修完成'
		lines.push({ label: '操作动作', value: '完成维修' })
		appendLine(lines, '维修时长', snapshot.maintDuration, value => `${formatNumber(value)} 小时`)
		appendLine(lines, '故障时长', snapshot.faultDuration, value => `${formatNumber(value)} 小时`)
		appendLine(lines, '维修说明', snapshot.maintRemark || remark)
	} else if (actionCode === 'ACCEPT_PASS') {
		title = '验收通过'
		lines.push({ label: '操作动作', value: '验收通过' })
		appendLine(lines, '验收备注', snapshot.acceptanceRemark || remark)
	} else if (actionCode === 'ACCEPT_REJECT') {
		const returnStatus = snapshot.returnStatusName || getStatusText(snapshot.returnStatus)
		title = returnStatus && returnStatus !== '-' ? `验收不通过（退回至${returnStatus}）` : '验收不通过'
		lines.push({ label: '操作动作', value: '验收不通过' })
		appendLine(lines, '退回状态', returnStatus)
		appendLine(lines, '验收备注', snapshot.acceptanceRemark || remark)
	} else if (actionCode === 'CANCEL') {
		title = '作废'
		lines.push({ label: '操作动作', value: '作废了记录' })
		appendLine(lines, '作废备注', remark || snapshot.cancelRemark)
	} else {
		lines.push({ label: '操作动作', value: `执行了${title}` })
		appendLine(lines, '备注', remark)
	}

	return {
		actionCode,
		title,
		time: formatDateTime(logItem.operateTime),
		rawTime: logItem.operateTime,
		color: getLogColor(actionCode),
		lines,
	}
}

const getDotClass = (actionCode, index, total) => {
	const classes = []
	if (index === 0 && total > 1) classes.push('dot-end')
	else if (index === total - 1 && total > 1) classes.push('dot-start')

	const colorMap = {
		REPORT: 'dot-blue',
		DISPATCH: 'dot-green',
		START_MAINT: 'dot-orange',
		END_MAINT: 'dot-gray',
		ACCEPT_PASS: 'dot-green',
		ACCEPT_REJECT: 'dot-red',
		CANCEL: 'dot-gray',
	}
	classes.push(colorMap[actionCode] || 'dot-blue')
	return classes.join(' ')
}

const buildFallbackTimelineList = () => {
	const list = []

	if (formData.createTime) {
		list.push({
			actionCode: 'REPORT',
			title: '提报',
			time: formatDateTime(formData.createTime),
			rawTime: formData.createTime,
			color: '#409EFF',
			lines: [
				{ label: '操作人', value: formData.createByName || '系统' },
				{ label: '操作动作', value: '提交了报修信息' },
				{ label: '报修类型', value: getDisplayValue(formData.reportTypeName) },
				{ label: '故障发现时间', value: formatDateTime(formData.faultFindTime) }
			]
		})
	}
	if (formData.dispatchTime || formData.dispatcherName || formData.maintOrgName || formData.maintLeaderName) {
		list.push({
			actionCode: 'DISPATCH',
			title: '派工',
			time: formatDateTime(formData.dispatchTime),
			rawTime: formData.dispatchTime,
			color: '#67C23A',
			lines: [
				{ label: '操作人', value: formData.dispatcherName || '系统' },
				{ label: '操作动作', value: '完成派工' },
				{ label: '派工类型', value: getDispatchTypeText(formData.dispatchTypeCode, formData.dispatchTypeName) },
				{ label: '承修单位', value: getDisplayValue(formData.maintOrgName) },
				{ label: '维修负责人', value: getDisplayValue(formData.maintLeaderName) }
			]
		})
	}

	if (formData.maintStartTime) {
		list.push({
			actionCode: 'START_MAINT',
			title: '开始维修',
			time: formatDateTime(formData.maintStartTime),
			rawTime: formData.maintStartTime,
			color: '#E6A23C',
			lines: [
				{ label: '操作人', value: formData.maintLeaderName || '系统' },
				{ label: '操作动作', value: '开始维修' }
			]
		})
	}

	if (formData.maintEndTime || formData.maintRemark || partReplaceList.value.length > 0 || hourFeedbackList.value.length > 0) {
		list.push({
			actionCode: 'END_MAINT',
			title: '维修完成',
			time: formatDateTime(formData.maintEndTime),
			rawTime: formData.maintEndTime,
			color: '#909399',
			lines: [
				{ label: '操作人', value: formData.maintLeaderName || '系统' },
				{ label: '操作动作', value: '完成维修' },
				{ label: '维修说明', value: getDisplayValue(formData.maintRemark) }
			]
		})
	}

	if (hasAcceptanceRecord.value) {
		list.push({
			actionCode: acceptanceResultText.value === '通过' ? 'ACCEPT_PASS' : 'ACCEPT_REJECT',
			title: acceptanceDisplayText.value === '-' ? '验收记录' : acceptanceDisplayText.value,
			time: formatDateTime(formData.acceptanceTime || formData.updateTime),
			rawTime: formData.acceptanceTime || formData.updateTime,
			color: acceptanceResultText.value === '通过' ? '#67C23A' : '#F56C6C',
			lines: [
				{ label: '操作人', value: formData.accepterName || '系统' },
				{ label: '操作动作', value: '提交了验收记录' },
				{ label: '验收结果', value: acceptanceResultText.value },
				{ label: '验收备注', value: getDisplayValue(formData.acceptanceRemark) }
			]
		})
	}

	if (Number(formData.status) === 7 || formData.cancelTime || formData.cancelByName || formData.cancelRemark) {
		list.push({
			actionCode: 'CANCEL',
			title: '作废',
			time: formatDateTime(formData.cancelTime || formData.updateTime),
			rawTime: formData.cancelTime || formData.updateTime,
			color: '#909399',
			lines: [
				{ label: '操作人', value: formData.cancelByName || '系统' },
				{ label: '操作动作', value: '作废了记录' },
				{ label: '作废备注', value: getDisplayValue(formData.cancelRemark) }
			]
		})
	}

	return list.sort((a, b) => getTimeValue(b.rawTime) - getTimeValue(a.rawTime))
}

const loadData = data => {
	const nextData = {
		...createDefaultFormData(),
		...data,
		emergencyLevel: data?.emergencyLevel != null ? String(data.emergencyLevel) : '0',
		isSpecialJob: data?.isSpecialJob != null ? String(data.isSpecialJob) : '0',
		itemList: Array.isArray(data?.itemList) ? data.itemList : (Array.isArray(data?.dispatchItemList) ? data.dispatchItemList : (Array.isArray(data?.partList) ? data.partList : [])),
		hourFeedbackList: Array.isArray(data?.hourFeedbackList) ? data.hourFeedbackList : [],
		operateLogList: Array.isArray(data?.operateLogList) ? data.operateLogList : [],
	}

	Object.assign(formData, nextData)
	partReplaceList.value = Array.isArray(data?.partReplaceList) ? data.partReplaceList : []

	loadImages()
}

const loadImages = async () => {
	if (!formData.id) return

	try {
		const faultRes = await publicApi.getBusFiles({
			businessId: formData.id,
			businessType: 'MAINT_INFO_IMAGE',
		})
		if (faultRes.code === '0000' && Array.isArray(faultRes.data) && faultRes.data.length > 0) {
			faultImageList.value = await Promise.all(
				faultRes.data.map(async item => {
					try {
						const downRes = await publicApi.down(item.id, 'arraybuffer')
						const blob = new Blob([downRes.data], { type: 'image/jpeg' })
						const url = window.URL.createObjectURL(blob)
						return { id: item.id, url }
					} catch (error) {
						console.error('加载故障图片失败:', error)
						return null
					}
				})
			)
			faultImageList.value = faultImageList.value.filter(item => item !== null)
		} else {
			faultImageList.value = []
		}
	} catch (error) {
		console.error('获取故障图片失败:', error)
		faultImageList.value = []
	}

	try {
		const endRes = await publicApi.getBusFiles({
			businessId: formData.id,
			businessType: 'MAINT_INFO_IMAGE_END',
		})
		if (endRes.code === '0000' && Array.isArray(endRes.data) && endRes.data.length > 0) {
			endImageList.value = await Promise.all(
				endRes.data.map(async item => {
					try {
						const downRes = await publicApi.down(item.id, 'arraybuffer')
						const blob = new Blob([downRes.data], { type: 'image/jpeg' })
						const url = window.URL.createObjectURL(blob)
						return { id: item.id, url }
					} catch (error) {
						console.error('加载维修完成图片失败:', error)
						return null
					}
				})
			)
			endImageList.value = endImageList.value.filter(item => item !== null)
		} else {
			endImageList.value = []
		}
	} catch (error) {
		console.error('获取维修完成图片失败:', error)
		endImageList.value = []
	}
}

const formatNumber = value => {
	if (value == null || value === '') return '-'
	const num = Number(value)
	if (Number.isNaN(num)) return value
	return num.toFixed(2)
}

const resetForm = () => {
	Object.assign(formData, createDefaultFormData())
	faultImageList.value = []
	endImageList.value = []
	partReplaceList.value = []
}

defineExpose({
	loadData,
	resetForm
})
</script>

<style scoped lang="scss">
.maint-info-view-wrapper {
	height: calc(100vh - 80px); /* 占据抽屉主体高度 */
	padding: 0;

	.view-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 420px;
		gap: 20px;
		height: 100%;
	}

	.view-main,
	.view-side {
		min-width: 0;
		height: 100%;
		overflow-y: auto;
		padding: 20px;
		box-sizing: border-box;

		/* 增加滚动条样式 */
		&::-webkit-scrollbar {
			width: 6px;
		}
		&::-webkit-scrollbar-thumb {
			background: #dcdfe6;
			border-radius: 3px;
		}
		&::-webkit-scrollbar-track {
			background: transparent;
		}
	}

	.info-card {
		margin-bottom: 20px;
	}

	.card-header {
		font-weight: bold;
		font-size: 16px;
	}

	.stage-descriptions {
		:deep(.el-descriptions__content) {
			word-break: break-word;
		}
	}

	.section-label {
		margin-bottom: 10px;
		font-weight: 500;
		color: #606266;
	}

	.table-section,
	.image-section {
		margin-top: 16px;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.preview-image {
		width: 140px;
		height: 140px;
		border-radius: 4px;
		cursor: pointer;
	}

	.custom-timeline {
		position: relative;
		padding-left: 40px; /* 增大内边距，给左侧 label 留空间 */
		margin-top: 20px;
		margin-left: 20px; /* 把整个线条往右边移一点 */
	}

	.custom-timeline::before {
		content: '';
		position: absolute;
		left: 0px;
		top: 10px;
		bottom: 10px;
		width: 2px;
		background: linear-gradient(to bottom, #3662e3 0%, #4299e1 25%, #48bb78 50%, #ed8936 75%, #e53e3e 100%);
		border-radius: 1px;
	}

	.timeline-item {
		position: relative;
		margin-bottom: 24px;
	}

	.timeline-item:last-child {
		margin-bottom: 0;
	}

	.timeline-dot {
		position: absolute;
		left: -27px;
		top: 14px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 3px solid #ffffff;
		box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		z-index: 3;
	}

	.dot-start {
		width: 20px;
		height: 20px;
		left: -29px;
		top: 12px;
		box-shadow: 0 0 0 3px rgba(54, 98, 227, 0.3);
	}

	.dot-end {
		width: 20px;
		height: 20px;
		left: -29px;
		top: 12px;
		box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.3);
	}

	.dot-label {
		position: absolute;
		left: -65px;
		top: 10px;
		font-size: 12px;
		color: #667085;
		background-color: #ffffff;
		padding: 2px 8px;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		white-space: nowrap;
	}

	.timeline-card-inner {
		background: #ffffff;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		border: 1px solid #f0f2f5;
	}

	.timeline-card-inner:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		border-color: #e8eaed;
	}

	.card-time {
		font-size: 13px;
		color: #667085;
		margin-bottom: 12px;
		display: flex;
		align-items: center;
	}

	.card-time::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
		margin-right: 8px;
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: #1d2939;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #f0f2f5;
	}

	.card-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.content-item {
		font-size: 14px;
		color: #475467;
		display: flex;
		flex-direction: row; /* 水平排列 */
		align-items: center; /* 居中对齐 */
	}

	.content-label {
		font-size: 12px;
		color: #667085;
		margin-right: 8px; /* 右侧增加一点间距 */
	}

	.content-value {
		font-weight: 500;
		color: #1d2939;
		flex: 1; /* 值太长时可以自适应 */
		word-break: break-all;
	}

	.dot-blue { color: #3662e3; background-color: #3662e3; }
	.dot-green { color: #48bb78; background-color: #48bb78; }
	.dot-orange { color: #ed8936; background-color: #ed8936; }
	.dot-gray { color: #667085; background-color: #667085; }
	.dot-red { color: #e53e3e; background-color: #e53e3e; }
}

@media screen and (max-width: 1400px) {
	.maint-info-view-wrapper {
		.view-layout {
			grid-template-columns: minmax(0, 1fr);
		}

		.timeline-card {
			position: static;
		}
	}
}
</style>
