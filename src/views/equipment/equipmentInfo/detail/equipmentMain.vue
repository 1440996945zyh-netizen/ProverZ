<template>
	<div class="equipment-detail">
		<el-tabs v-model="activeTab" type="border-card">
			<!-- 设备基本信息 -->
			<el-tab-pane label="设备基本信息" name="basic">
				<BasicInfo
					ref="basicInfoRef"
					:formData="formData"
					:readonly="readonly"
					@update:formData="handleFormDataUpdate"
				/>
			</el-tab-pane>

			<!-- 财务/供货信息 -->
			<el-tab-pane label="财务/供货信息" name="finance">
				<FinanceSupply
					ref="financeSupplyRef"
					:formData="formData"
					:readonly="readonly"
					@update:formData="handleFormDataUpdate"
				/>
			</el-tab-pane>

			<!-- 特种设备信息 -->
			<el-tab-pane v-if="formData.isParticular == '1' || formData.isParticular == 1" label="特种设备信息" name="special">
				<SpecialInfo
					ref="specialInfoRef"
					:formData="formData"
					:readonly="readonly"
					@update:formData="handleFormDataUpdate"
				/>
			</el-tab-pane>

			<!-- 附件与照片 -->
			<el-tab-pane label="设备照片" name="attachment">
				<Attachment
					v-if="formData.id"
					ref="attachmentRef"
					:equipmentId="formData.id"
					:readonly="readonly"
					@update:imageIds="handleImageIdsUpdate"
				/>
				<div v-else class="empty-placeholder">请先保存设备信息</div>
			</el-tab-pane>

			<!-- 检修历史 -->
			<el-tab-pane label="检修历史" name="maintenance">
				<Maintenance v-if="formData.id" ref="maintenanceRef" :equipId="formData.id" />
				<div v-else class="empty-placeholder">请先保存设备信息</div>
			</el-tab-pane>

			<!-- 指标数据 -->
			<el-tab-pane label="指标数据" name="indicator">
				<Indicator v-if="formData.id" ref="indicatorRef" :equipId="formData.id" />
				<div v-else class="empty-placeholder">请先保存设备信息</div>
			</el-tab-pane>

			<!-- 技术资料 -->
			<el-tab-pane label="技术资料" name="technical">
				<Technical
					v-if="formData.id"
					ref="technicalRef"
					:equipId="formData.id"
				/>
				<div v-else class="empty-placeholder">请先保存设备信息</div>
			</el-tab-pane>

			<!-- 改造记录 -->
			<el-tab-pane label="改造记录" name="modification">
				<Modification
					v-if="formData.id"
					ref="modificationRef"
					:equipId="formData.id"
					:readonly="readonly"
				/>
				<div v-else class="empty-placeholder">请先保存设备信息</div>
			</el-tab-pane>

			<!-- 备品备件 -->
			<el-tab-pane label="备品备件" name="spare">
				<Spare v-if="formData.id" ref="spareRef" :equipId="formData.id" />
				<div v-else class="empty-placeholder">请先保存设备信息</div>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup name="equipmentMain">
import { ref, watch, getCurrentInstance, nextTick } from 'vue'
import BasicInfo from './components/BasicInfo.vue'
import FinanceSupply from './components/FinanceSupply.vue'
import SpecialInfo from './components/SpecialInfo.vue'
import Attachment from './components/Attachment.vue'
import Maintenance from './components/Maintenance.vue'
import Indicator from './components/Indicator.vue'
import Technical from './components/Technical.vue'
import Modification from './components/Modification.vue'
import Spare from './components/Spare.vue'
import api from '@/api/equipment/equipmentInfo/index'

const { proxy } = getCurrentInstance()

const props = defineProps({
	formData: {
		type: Object,
		required: true,
		default: () => ({})
	},
	readonly: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:formData', 'saved'])

const activeTab = ref('basic')
const basicInfoRef = ref(null)
const financeSupplyRef = ref(null)
const specialInfoRef = ref(null)
const attachmentRef = ref(null)
const modificationRef = ref(null)
const maintenanceRef = ref(null)
const indicatorRef = ref(null)
const technicalRef = ref(null)
const spareRef = ref(null)

// 处理表单数据更新
const handleFormDataUpdate = (data) => {
	emit('update:formData', data)
}

// 处理图片ID更新
const handleImageIdsUpdate = (imageIds) => {
	// 更新 formData 中的图片ID列表
	if (imageIds.panoramaImageIds) {
		props.formData.panoramaImageIds = imageIds.panoramaImageIds
	}
	if (imageIds.orientationImageIds) {
		props.formData.orientationImageIds = imageIds.orientationImageIds
	}
	if (imageIds.accessoryImageIds) {
		props.formData.accessoryImageIds = imageIds.accessoryImageIds
	}
}

// 监听保存成功事件，通知父组件刷新数据
const handleSaved = () => {
	emit('saved')
	// 保存成功后重新加载变更记录
	loadChangeLogs()
}

// 加载所有变更记录
const loadChangeLogs = () => {
	if (basicInfoRef.value && typeof basicInfoRef.value.loadChangeLog === 'function') {
		basicInfoRef.value.loadChangeLog()
	}
	if (financeSupplyRef.value && typeof financeSupplyRef.value.loadChangeLog === 'function') {
		financeSupplyRef.value.loadChangeLog()
	}
	if (specialInfoRef.value && typeof specialInfoRef.value.loadChangeLog === 'function') {
		specialInfoRef.value.loadChangeLog()
	}
}

// 监听 formData.id 变化，当有设备ID时加载变更记录
watch(
	() => props.formData.id,
	(newId) => {
		if (newId) {
			// 延迟一下，确保子组件已经渲染完成
			setTimeout(() => {
				loadChangeLogs()
			}, 100)
		}
	},
	{ immediate: true }
)

		// 监听 tab 切换，当切换到包含变更记录的 tab 时刷新表格
	watch(
		() => activeTab.value,
		(newTab) => {
			// 当切换到包含变更记录的 tab 时，延迟刷新表格以确保表头正确渲染
			if (newTab === 'basic' || newTab === 'finance' || newTab === 'special') {
				setTimeout(() => {
					loadChangeLogs()
				}, 200)
			}
			// 当切换到改造记录 tab 时，刷新表格
			if (newTab === 'modification') {
				// 先等待 tab 切换完成
				nextTick(() => {
					setTimeout(() => {
						if (modificationRef.value && typeof modificationRef.value.loadData === 'function') {
							modificationRef.value.loadData()
						}
					}, 200)
				})
			}
			// 当切换到检修历史 tab 时，刷新表格
			if (newTab === 'maintenance') {
				nextTick(() => {
					setTimeout(() => {
						if (maintenanceRef.value && typeof maintenanceRef.value.loadData === 'function') {
							maintenanceRef.value.loadData()
						}
						// 刷新表头
						setTimeout(() => {
							if (maintenanceRef.value && typeof maintenanceRef.value.refreshTableHeader === 'function') {
								maintenanceRef.value.refreshTableHeader()
							}
						}, 300)
					}, 200)
				})
			}
			// 当切换到指标数据 tab 时，刷新表格
			if (newTab === 'indicator') {
				nextTick(() => {
					setTimeout(() => {
						if (indicatorRef.value && typeof indicatorRef.value.loadData === 'function') {
							indicatorRef.value.loadData()
						}
						// 刷新表头
						setTimeout(() => {
							if (indicatorRef.value && typeof indicatorRef.value.refreshTableHeader === 'function') {
								indicatorRef.value.refreshTableHeader()
							}
						}, 300)
					}, 200)
				})
			}
			// 当切换到技术资料 tab 时，刷新表格
			if (newTab === 'technical') {
				nextTick(() => {
					setTimeout(() => {
						if (technicalRef.value && typeof technicalRef.value.loadData === 'function') {
							technicalRef.value.loadData()
						}
						// 刷新表头
						setTimeout(() => {
							if (technicalRef.value && typeof technicalRef.value.refreshTableHeader === 'function') {
								technicalRef.value.refreshTableHeader()
							}
						}, 300)
					}, 200)
				})
			}
			// 当切换到备品备件 tab 时，刷新表格
			if (newTab === 'spare') {
				nextTick(() => {
					setTimeout(() => {
						if (spareRef.value && typeof spareRef.value.loadData === 'function') {
							spareRef.value.loadData()
						}
						// 刷新表头
						setTimeout(() => {
							if (spareRef.value && typeof spareRef.value.refreshTableHeader === 'function') {
								spareRef.value.refreshTableHeader()
							}
						}, 300)
					}, 200)
				})
			}
		}
	)

// 验证所有表单
const validate = async () => {
	const results = []

	if (basicInfoRef.value && typeof basicInfoRef.value.validate === 'function') {
		const basicResult = await basicInfoRef.value.validate()
		results.push(basicResult)
	}

	if (financeSupplyRef.value && typeof financeSupplyRef.value.validate === 'function') {
		const financeResult = await financeSupplyRef.value.validate()
		results.push(financeResult)
	}

	if (props.formData.isParticular == '1' && specialInfoRef.value && typeof specialInfoRef.value.validate === 'function') {
		const specialResult = await specialInfoRef.value.validate()
		results.push(specialResult)
	}

	return results.every(result => result === true)
}

// 重置表单
const resetForm = () => {
	if (basicInfoRef.value && typeof basicInfoRef.value.resetForm === 'function') {
		basicInfoRef.value.resetForm()
	}
	if (financeSupplyRef.value && typeof financeSupplyRef.value.resetForm === 'function') {
		financeSupplyRef.value.resetForm()
	}
	if (specialInfoRef.value && typeof specialInfoRef.value.resetForm === 'function') {
		specialInfoRef.value.resetForm()
	}
}

// 保存设备基本信息
const saveBasicInfo = async () => {
	if (basicInfoRef.value && typeof basicInfoRef.value.validate === 'function') {
		const valid = await basicInfoRef.value.validate()
		if (!valid) {
			proxy.$message.warning('请检查表单填写是否正确')
			return
		}
	}

	proxy.$modal.confirm('确定保存设备基本信息?').then(() => {
		const submitData = JSON.parse(JSON.stringify(props.formData))
		api.updateBasicInfo(submitData).then(res => {
			if (res.code == '0000') {
				proxy.$message.success(res.msg)
				handleSaved()
			} else {
				proxy.$message.error(res.msg)
			}
		})
	}).catch(() => {})
}

// 保存财务/供货信息
const saveFinanceSupply = async () => {
	if (financeSupplyRef.value && typeof financeSupplyRef.value.validate === 'function') {
		const valid = await financeSupplyRef.value.validate()
		if (!valid) {
			proxy.$message.warning('请检查表单填写是否正确')
			return
		}
	}

	proxy.$modal.confirm('确定保存财务/供货信息?').then(() => {
		const submitData = JSON.parse(JSON.stringify(props.formData))
		api.updateFinanceSupply(submitData).then(res => {
			if (res.code == '0000') {
				proxy.$message.success(res.msg)
				handleSaved()
			} else {
				proxy.$message.error(res.msg)
			}
		})
	}).catch(() => {})
}

// 保存特种设备信息
const saveSpecialInfo = async () => {
	if (specialInfoRef.value && typeof specialInfoRef.value.validate === 'function') {
		const valid = await specialInfoRef.value.validate()
		if (!valid) {
			proxy.$message.warning('请检查表单填写是否正确')
			return
		}
	}

	proxy.$modal.confirm('确定保存特种设备信息?').then(() => {
		const submitData = JSON.parse(JSON.stringify(props.formData))
		api.updateSpecialInfo(submitData).then(res => {
			if (res.code == '0000') {
				proxy.$message.success(res.msg)
				handleSaved()
			} else {
				proxy.$message.error(res.msg)
			}
		})
	}).catch(() => {})
}

// 保存设备照片
const saveEquipmentImages = async () => {
	proxy.$modal.confirm('确定保存设备照片?').then(() => {
		const submitData = {
			id: props.formData.id,
			panoramaImageIds: props.formData.panoramaImageIds || [],
			orientationImageIds: props.formData.orientationImageIds || [],
			accessoryImageIds: props.formData.accessoryImageIds || [],
		}
		api.updateEquipmentImages(submitData).then(res => {
			if (res.code == '0000') {
				proxy.$message.success(res.msg)
				handleSaved()
			} else {
				proxy.$message.error(res.msg)
			}
		})
	}).catch(() => {})
}

// 根据当前激活的标签页获取对应的保存方法
const getSaveMethod = () => {
	if (activeTab.value === 'basic') {
		return saveBasicInfo
	} else if (activeTab.value === 'finance') {
		return saveFinanceSupply
	} else if (activeTab.value === 'special') {
		return saveSpecialInfo
	} else if (activeTab.value === 'attachment') {
		return saveEquipmentImages
	}
	return null
}

defineExpose({
	validate,
	resetForm,
	getSaveMethod,
	activeTab,
	loadChangeLogs
})
</script>

<style scoped lang="scss">
.equipment-detail {
	:deep(.el-tabs__content) {
		padding: 0px;
	}

	.empty-placeholder {
		text-align: center;
		color: #909399;
		padding: 50px 0;
	}
}
</style>

