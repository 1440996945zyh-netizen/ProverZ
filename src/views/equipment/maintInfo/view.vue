<template>
	<div class="maint-info-view-wrapper">
		<!-- 基本信息 -->
		<el-card class="info-card" shadow="never">
			<template #header>
				<div class="card-header">
					<span>基本信息</span>
				</div>
			</template>
			<el-descriptions :column="3" border>
				<el-descriptions-item label="工单号">{{ formData.workOrderNo || '-' }}</el-descriptions-item>
				<el-descriptions-item label="设备名称">{{ formData.equipName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="设备编码">{{ formData.equipCode || '-' }}</el-descriptions-item>
				<el-descriptions-item label="故障发现时间">{{ formData.faultFindTime || '-' }}</el-descriptions-item>
				<el-descriptions-item label="紧急程度">
					<el-tag :type="getEmergencyLevelTagType(formData.emergencyLevel)">
						{{ getEmergencyLevelText(formData.emergencyLevel) }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="维修类型">{{ formData.maintTypeName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="是否停机">
					<el-tag :type="formData.isStopped === 1 ? 'danger' : 'success'">
						{{ formData.isStopped === 1 ? '是' : '否' }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="报修类型">{{ formData.reportTypeName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="故障描述" :span="3">{{ formData.faultDesc || '-' }}</el-descriptions-item>
			</el-descriptions>
			<!-- 故障图片 -->
			<div v-if="faultImageList.length > 0" class="image-section">
				<div class="image-label">故障图片</div>
				<el-image
					v-for="(img, index) in faultImageList"
					:key="index"
					:src="img.url"
					:preview-src-list="faultImageList.map(item => item.url)"
					fit="cover"
					class="preview-image"
					:initial-index="index"
				/>
			</div>
		</el-card>

		<!-- 时间线 -->
		<el-card class="info-card timeline-card" shadow="never">
			<template #header>
				<div class="card-header">
					<span>操作记录</span>
				</div>
			</template>
			<el-timeline>
				<!-- 提报 -->
				<el-timeline-item
					v-if="formData.createTime"
					:timestamp="formatDateTime(formData.createTime)"
					placement="top"
					color="#409EFF"
				>
					<el-card>
						<h4>提报</h4>
						<p>{{ formData.createByName || '系统' }} 提交了信息</p>
					</el-card>
				</el-timeline-item>

				<!-- 派工 -->
				<el-timeline-item
					v-if="formData.dispatchTime"
					:timestamp="formatDateTime(formData.dispatchTime)"
					placement="top"
					color="#67C23A"
				>
					<el-card>
						<h4>已派工</h4>
						<p>{{ formData.dispatcherName || '系统' }} 进行了派工</p>
						<p v-if="formData.maintOrgName || formData.maintLeaderName">
							<span v-if="formData.maintOrgName">承修单位：{{ formData.maintOrgName }}</span>
							<span v-if="formData.maintOrgName && formData.maintLeaderName" style="margin: 0 12px;">|</span>
							<span v-if="formData.maintLeaderName">维修负责人：{{ formData.maintLeaderName }}</span>
						</p>
					</el-card>
				</el-timeline-item>

				<!-- 开始维修 -->
				<el-timeline-item
					v-if="formData.maintStartTime"
					:timestamp="formatDateTime(formData.maintStartTime)"
					placement="top"
					color="#E6A23C"
				>
					<el-card>
						<h4>开始维修</h4>
						<p>{{ formData.maintLeaderName || '系统' }} 开始维修</p>
					</el-card>
				</el-timeline-item>

				<!-- 结束维修 -->
				<el-timeline-item
					v-if="formData.maintEndTime"
					:timestamp="formatDateTime(formData.maintEndTime)"
					placement="top"
					color="#909399"
				>
					<el-card>
						<h4>维修完成</h4>
						<p>{{ formData.maintLeaderName || '系统' }} 维修完成</p>
<!--						<p v-if="formData.maintStartTime">维修开始时间：{{ formatDateTime(formData.maintStartTime) }}</p>-->
<!--						<p v-if="formData.maintEndTime">维修结束时间：{{ formatDateTime(formData.maintEndTime) }}</p>-->
						<p v-if="formData.maintDuration || formData.faultDuration">
							<span v-if="formData.maintDuration">维修时长：{{ formData.maintDuration }} 小时</span>
							<span v-if="formData.maintDuration && formData.faultDuration" style="margin: 0 12px;">|</span>
							<span v-if="formData.faultDuration">故障时长：{{ formData.faultDuration }} 小时</span>
						</p>
						<p v-if="formData.maintRemark" style="margin-top: 8px; color: #606266;">
							维修说明：{{ formData.maintRemark }}
						</p>
						<!-- 配件更换列表 -->
						<div v-if="partReplaceList.length > 0" class="timeline-part-replace-section">
							<div class="part-replace-label">配件更换列表</div>
							<el-table :data="partReplaceList" border size="small" style="margin-top: 8px;">
								<el-table-column prop="warehouseOutNo" label="出库单号" width="150" />
								<el-table-column prop="materialName" label="物资名称" min-width="120" />
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
						<!-- 维修完成图片 -->
						<div v-if="endImageList.length > 0" class="timeline-image-section">
							<div class="image-label">维修完成图片</div>
							<el-image
								v-for="(img, index) in endImageList"
								:key="index"
								:src="img.url"
								:preview-src-list="endImageList.map(item => item.url)"
								fit="cover"
								class="preview-image"
								:initial-index="index"
							/>
						</div>
					</el-card>
				</el-timeline-item>

				<!-- 验收通过 -->
				<el-timeline-item
					v-if="formData.acceptanceTime && formData.status === 5"
					:timestamp="formatDateTime(formData.acceptanceTime)"
					placement="top"
					color="#67C23A"
				>
					<el-card>
						<h4>验收通过</h4>
						<p>{{ formData.accepterName || '系统' }} 验收通过</p>
						<p v-if="formData.acceptanceRemark" style="margin-top: 8px; color: #606266;">
							验收备注：{{ formData.acceptanceRemark }}
						</p>
					</el-card>
				</el-timeline-item>

				<!-- 验收不通过 -->
				<el-timeline-item
					v-if="formData.status === 6"
					:timestamp="formData.acceptanceTime ? formatDateTime(formData.acceptanceTime) : '未知时间'"
					placement="top"
					color="#F56C6C"
				>
					<el-card>
						<h4>验收不通过</h4>
						<p>{{ formData.accepterName || '系统' }} 验收不通过</p>
					</el-card>
				</el-timeline-item>

				<!-- 作废 -->
				<el-timeline-item
					v-if="formData.status === 7"
					:timestamp="formData.cancelTime ? formatDateTime(formData.cancelTime) : (formData.updateTime ? formatDateTime(formData.updateTime) : '未知时间')"
					placement="top"
					color="#909399"
				>
					<el-card>
						<h4>作废</h4>
						<p v-if="formData.cancelTime && formData.cancelByName">
							 {{ formData.cancelByName }} 作废了记录
						</p>
						<p v-else>记录已作废</p>
						<p v-if="formData.cancelRemark" style="margin-top: 8px; color: #606266;">
							作废备注：{{ formData.cancelRemark }}
						</p>
					</el-card>
				</el-timeline-item>
			</el-timeline>
		</el-card>
	</div>
</template>

<script setup name="maintInfoView">
import { ref, reactive } from 'vue'
import api from '@/api/equipment/maintInfo/index'
import publicApi from '@/api/public/index'

const props = defineProps({
	maintInfoId: {
		type: [Number, String],
		default: null
	}
})

const formData = reactive({
	id: null,
	workOrderNo: '',
	equipName: '',
	equipCode: '',
	faultFindTime: '',
	emergencyLevel: '0',
	maintTypeName: '',
	isStopped: 0,
	faultDesc: '',
	reportTypeName: '',
	dispatchTypeCode: '',
	dispatchTypeName: '',
	maintOrgName: '',
	maintLeaderName: '',
	dispatcherName: '',
	dispatchTime: '',
	maintStartTime: '',
	maintEndTime: '',
	maintRemark: '',
	maintDuration: null,
	faultDuration: null,
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

const faultImageList = ref([])
const endImageList = ref([])
const partReplaceList = ref([])

// 格式化日期时间
const formatDateTime = (dateTime) => {
	if (!dateTime) return '-'
	// 如果已经是格式化好的字符串，直接返回
	if (typeof dateTime === 'string') {
		return dateTime
	}
	// 如果是Date对象，格式化
	if (dateTime instanceof Date) {
		const year = dateTime.getFullYear()
		const month = String(dateTime.getMonth() + 1).padStart(2, '0')
		const day = String(dateTime.getDate()).padStart(2, '0')
		const hours = String(dateTime.getHours()).padStart(2, '0')
		const minutes = String(dateTime.getMinutes()).padStart(2, '0')
		const seconds = String(dateTime.getSeconds()).padStart(2, '0')
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
	}
	return dateTime
}

// 获取紧急程度文本
const getEmergencyLevelText = (level) => {
	const levelMap = {
		'0': '常规',
		'1': '紧急',
		'2': '特急'
	}
	return levelMap[level] || level
}

// 获取紧急程度标签类型
const getEmergencyLevelTagType = (level) => {
	if (level === '2') {
		return 'danger'
	} else if (level === '1') {
		return 'warning'
	}
	return 'info'
}

// 加载数据
const loadData = (data) => {
	// 重置表单
	Object.keys(formData).forEach(key => {
		formData[key] = data[key] || formData[key]
	})

	// 加载图片
	loadImages()

	// 加载配件更换列表
	if (data.id) {
		loadPartReplaceList(data.id)
	}
}

// 加载图片
const loadImages = async () => {
	if (!formData.id) return

	// 加载故障图片
	try {
		const faultRes = await publicApi.getBusFiles({
			businessId: formData.id,
			businessType: 'MAINT_INFO_IMAGE',
		})
		if (faultRes.code === '0000' && faultRes.data && faultRes.data.length > 0) {
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

	// 加载维修完成图片
	try {
		const endRes = await publicApi.getBusFiles({
			businessId: formData.id,
			businessType: 'MAINT_INFO_IMAGE_END',
		})
		if (endRes.code === '0000' && endRes.data && endRes.data.length > 0) {
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

// 加载配件更换列表
const loadPartReplaceList = async (maintInfoId) => {
	if (!maintInfoId) return

	try {
		const res = await api.getPartReplaceListByMaintInfoId(maintInfoId)
		if (res.code === '0000' && res.data) {
			partReplaceList.value = res.data || []
		} else {
			partReplaceList.value = []
		}
	} catch (error) {
		console.error('获取配件更换列表失败:', error)
		partReplaceList.value = []
	}
}

// 格式化数字（保留2位小数）
const formatNumber = (value) => {
	if (value == null || value === '') return '-'
	const num = Number(value)
	if (isNaN(num)) return value
	return num.toFixed(2)
}

// 重置表单
const resetForm = () => {
	Object.keys(formData).forEach(key => {
		if (typeof formData[key] === 'string') {
			formData[key] = ''
		} else if (typeof formData[key] === 'number') {
			formData[key] = 0
		} else if (Array.isArray(formData[key])) {
			formData[key] = []
		} else {
			formData[key] = null
		}
	})
	faultImageList.value = []
	endImageList.value = []
	partReplaceList.value = []
}

// 暴露方法供父组件调用
defineExpose({
	loadData,
	resetForm
})
</script>

<style scoped lang="scss">
.maint-info-view-wrapper {
	padding: 20px;

	.info-card {
		margin-bottom: 20px;

		.card-header {
			font-weight: bold;
			font-size: 16px;
		}

		.image-section {
			margin-top: 20px;

			.image-label {
				margin-bottom: 10px;
				font-weight: 500;
				color: #606266;
			}

			.preview-image {
				width: 150px;
				height: 150px;
				margin-right: 10px;
				margin-bottom: 10px;
				border-radius: 4px;
				cursor: pointer;
			}
		}
	}

	.timeline-card {
		:deep(.el-timeline) {
			padding-left: 20px;
		}

		:deep(.el-timeline-item__content) {
			h4 {
				margin: 0 0 8px 0;
				font-size: 16px;
				font-weight: 500;
			}

			p {
				margin: 4px 0;
				color: #606266;
				line-height: 1.6;
			}

			.timeline-part-replace-section {
				margin-top: 12px;

				.part-replace-label {
					margin-bottom: 8px;
					font-weight: 500;
					color: #606266;
					font-size: 14px;
				}
			}

			.timeline-image-section {
				margin-top: 12px;

				.image-label {
					margin-bottom: 8px;
					font-weight: 500;
					color: #606266;
					font-size: 14px;
				}

				.preview-image {
					width: 120px;
					height: 120px;
					margin-right: 8px;
					margin-bottom: 8px;
					border-radius: 4px;
					cursor: pointer;
				}
			}
		}
	}
}
</style>

