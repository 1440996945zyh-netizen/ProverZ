<template>
	<div class="dispatch-wrapper">
		<el-form ref="formRef" :model="formData" :rules="rules" label-position="top" :inline="true">
			<el-collapse v-model="activeNames">
				<!-- 基本信息（只读） -->
				<el-collapse-item title="基本信息" name="basic">
					<el-form :model="formData" label-position="top" :inline="true" :disabled="true">
						<el-row :gutter="20">
							<el-col :span="8">
								<el-form-item label="设备名称">
									<el-input v-model="formData.equipName" placeholder="设备名称" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="设备编码">
									<el-input v-model="formData.equipCode" placeholder="设备编码" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="故障发现时间">
									<el-input v-model="formData.faultFindTime" placeholder="故障发现时间" readonly />
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="20">
							<el-col :span="8">
								<el-form-item label="紧急程度">
									<el-input v-model="emergencyLevelText" placeholder="紧急程度" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="维修类型">
									<el-input v-model="formData.maintTypeName" placeholder="维修类型" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="是否停机">
									<el-input v-model="isStoppedText" placeholder="是否停机" readonly />
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="20">
							<el-col :span="24">
								<el-form-item label="故障描述">
									<el-input v-model="formData.faultDesc" type="textarea" :rows="3" placeholder="故障描述" readonly />
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</el-collapse-item>
				<!-- 派工信息 -->
				<el-collapse-item title="派工信息" name="dispatch">
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item class="dispatch-part-form-item">
								<div class="dispatch-part-wrapper">
									<div class="dispatch-part-header">
										<span class="dispatch-part-title">部位部件</span>
										<el-button type="primary" plain @click="openPartTreeDialog">添加</el-button>
									</div>
									<el-table :data="dispatchPartList" border size="small" max-height="240">
										<el-table-column prop="equipInstitutionName" label="设备机构名称" min-width="160" />
										<el-table-column prop="equipUnitName" label="设备部件名称" min-width="160" />
										<el-table-column label="操作" width="80" align="center">
											<template #default="{ row }">
												<el-button link type="danger" @click="removeDispatchPart(row)">删除</el-button>
											</template>
										</el-table-column>
									</el-table>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="派工类型" prop="dispatchTypeCode">
								<el-select v-model="formData.dispatchTypeCode" placeholder="请选择派工类型" style="width: 100%" @change="handleDispatchTypeChange">
									<el-option label="委内" :value="'1'" />
									<el-option label="大包" :value="'2'" />
									<el-option label="定额" :value="'3'" />
									<el-option label="非定额" :value="'4'" />
									<el-option label="其他" :value="'5'" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col v-if="isMaintProjApplyVisible" :span="8">
							<el-form-item label="维修项目申请单" prop="mantAppNumber">
								<el-select
									v-model="formData.mantAppNumber"
									style="width: 100%"
									filterable
									clearable
									:loading="maintProjApplyLoading"
									placeholder="请选择维修项目申请单"
									@change="handleMantAppNumberChange"
								>
									<el-option
										v-for="item in maintProjApplyOptions"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="承修单位" prop="maintOrgId">
								<Select
									:selectData="deptList"
									v-model:value="formData.maintOrgId"
									v-model:label="formData.maintOrgName"
									:disabled="!formData.dispatchTypeCode || isMaintProjApplyVisible"
									:placeholder="isMaintProjApplyVisible ? '将从申请单自动带出' : (formData.dispatchTypeCode ? '请选择承修单位' : '请先选择派工类型')"
									@change="handleDeptChange"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="维修负责人" prop="maintLeaderId">
								<Select
									:selectData="userList"
									v-model:value="formData.maintLeaderId"
									v-model:label="formData.maintLeaderName"
									:disabled="!formData.maintOrgId"
									placeholder="请先选择承修单位"
									@change="handleMaintLeaderChange"
									multiple
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="手机号码" prop="maintLeaderMobile">
								<el-input v-model="formData.maintLeaderMobile" placeholder="请输入手机号码" disabled />
							</el-form-item>
						</el-col>
						</el-row>
						<el-row :gutter="20">
						<el-col :span="5">
							<el-form-item label="是否涉及特殊作业" prop="isSpecialJob">
								<el-radio-group v-model="formData.isSpecialJob" @change="handleIsSpecialJobChange">
									<el-radio label="0">否</el-radio>
									<el-radio label="1">是</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col v-if="formData.isSpecialJob === '1'" :span="19">
							<el-form-item label="特殊作业情况" prop="specialJobCodeList">
								<el-checkbox-group v-model="formData.specialJobCodeList" @change="handleSpecialJobChange">
									<el-checkbox v-for="item in specialJobOptions" :key="item.value" :label="item.value">
										{{ item.label }}
									</el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
			</el-collapse>
		</el-form>

		<el-dialog v-model="partTreeDialogVisible" title="选择设备零部件" width="640px" append-to-body>
			<div class="part-tree-search-wrapper">
				<el-input
					v-model="partTreeFilterText"
					placeholder="请输入部位/部件名称进行搜索..."
					clearable
					prefix-icon="Search"
					class="part-tree-search-input"
				/>
			</div>
			<div v-loading="partTreeLoading" class="part-tree-container">
				<el-tree
					ref="partTreeRef"
					:data="partTreeData"
					node-key="id"
					show-checkbox
					default-expand-all
					:props="partTreeProps"
					:filter-node-method="filterPartTreeNode"
					empty-text="暂无设备零部件数据"
				/>
			</div>
			<template #footer>
				<div style="display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="partTreeDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="confirmPartTreeSelection">确定</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="dispatch">
import { ref, reactive, computed, getCurrentInstance, onMounted, watch, nextTick } from 'vue'
import Select from '@/components/Select'
import api from '@/api/equipment/maintInfo/index'
import equipmentInfoApi from '@/api/equipment/equipmentInfo/index'
import publicApi from '@/api/public/index'
import userApi from '@/api/system/user'

const props = defineProps({
	maintInfoId: {
		type: Number,
		default: null,
	},
})

const emit = defineEmits(['saved'])

const { proxy } = getCurrentInstance()
const formRef = ref(null)

// 折叠面板展开项
const activeNames = ref(['basic', 'dispatch'])

// 部门列表
const deptList = ref([])

// 用户列表（维修负责人）
const userList = ref([])
const specialJobOptions = ref([])
const maintProjApplyLoading = ref(false)
const maintProjApplyOptions = ref([])

// 派工部位部件
const dispatchPartList = ref([])
const partTreeDialogVisible = ref(false)
const partTreeLoading = ref(false)
const partTreeData = ref([])
const partTreeRef = ref(null)
const partTreeFilterText = ref('')
const partTreeProps = {
	children: 'children',
	label: 'typeName',
}
let partTreeLeafMap = new Map()

// 表单数据
const formData = reactive({
	id: null,
	equipId: null,
	equipName: '',
	equipCode: '',
	equipSmallCategoryId: null,
	equipSmallCategoryName: '',
	faultFindTime: '',
	emergencyLevel: '0',
	maintTypeCode: '',
	maintTypeName: '',
	isStopped: 0,
	faultDesc: '',
	reportTypeCode: '1',
	reportTypeName: '提报',
	dispatchTypeCode: '', // 派工类型：1-委内，2-大包
	dispatchTypeName: '',
	mantAppNumber: '',
	maintOrgId: null,
	maintOrgName: '',
	maintLeaderId: [],
	maintLeaderName: [],
	maintLeaderMobile: '',
	isSpecialJob: '0',
	specialJobCode: '',
	specialJobName: '',
	specialJobCodeList: [],
	itemList: [],
	status: 1, // 派工后状态为1-已派工
})

// 紧急程度文本
const emergencyLevelText = computed(() => {
	const levelMap = {
		'0': '常规',
		'1': '紧急',
		'2': '特急'
	}
	return levelMap[formData.emergencyLevel] || formData.emergencyLevel
})

// 是否停机文本
const isStoppedText = computed(() => {
	return formData.isStopped === 1 ? '是' : '否'
})

const isMaintProjApplyVisible = computed(() => {
	return formData.dispatchTypeCode === '3' || formData.dispatchTypeCode === '4'
})

// 表单验证规则
const rules = reactive({
	dispatchTypeCode: [{ required: true, message: '派工类型不能为空', trigger: 'change' }],
	mantAppNumber: [{
		validator: (_rule, value, callback) => {
			if (isMaintProjApplyVisible.value && !value) {
				callback(new Error('维修项目申请单不能为空'))
				return
			}
			callback()
		},
		trigger: 'change',
	}],
	maintOrgId: [{ required: true, message: '承修单位不能为空', trigger: 'change' }],
	maintLeaderId: [{ required: true, message: '维修负责人不能为空', trigger: 'change' }],
	specialJobCodeList: [{
		validator: (rule, value, callback) => {
			if (formData.isSpecialJob === '1' && (!Array.isArray(value) || value.length === 0)) {
				callback(new Error('请选择特殊作业情况'))
				return
			}
			callback()
		},
		trigger: 'change',
	}],
})

const getSelectValue = (item) => {
	return item?.value ?? item?.id ?? ''
}

const getSelectLabel = (item) => {
	return item?.label || item?.typeName || item?.name || ''
}

const normalizeDispatchPartList = (list) => {
	const map = new Map()
	;(list || []).forEach(item => {
		const equipUnitId = item?.equipUnitId || item?.id || item?.value
		if (!equipUnitId) return
		map.set(String(equipUnitId), {
			equipSmallCategoryId: item?.equipSmallCategoryId || formData.equipSmallCategoryId || null,
			equipSmallCategoryName: item?.equipSmallCategoryName || formData.equipSmallCategoryName || '',
			equipInstitutionId: item?.equipInstitutionId || item?.parentId || '',
			equipInstitutionName: item?.equipInstitutionName || item?.parentName || '',
			equipUnitId: equipUnitId,
			equipUnitName: item?.equipUnitName || item?.typeName || item?.label || '',
			sortOrder: item?.sortOrder || 0,
		})
	})
	return Array.from(map.values()).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
}

const syncDispatchPartToForm = () => {
	dispatchPartList.value = dispatchPartList.value.map((item, index) => ({
		...item,
		equipSmallCategoryId: item.equipSmallCategoryId || formData.equipSmallCategoryId || null,
		equipSmallCategoryName: item.equipSmallCategoryName || formData.equipSmallCategoryName || '',
		sortOrder: index + 1,
	}))
	formData.itemList = dispatchPartList.value.map(item => ({
		equipSmallCategoryId: item.equipSmallCategoryId,
		equipSmallCategoryName: item.equipSmallCategoryName,
		equipInstitutionId: item.equipInstitutionId,
		equipInstitutionName: item.equipInstitutionName,
		equipUnitId: item.equipUnitId,
		equipUnitName: item.equipUnitName,
		sortOrder: item.sortOrder,
	}))
}

const normalizeSpecialJobOptions = (list = []) => {
	return list.map(item => ({
		label: item?.label || item?.dictLabel || item?.name || '',
		value: String(item?.value ?? item?.dictValue ?? item?.code ?? ''),
	})).filter(item => item.value)
}

const syncSpecialJobFields = () => {
	if (formData.isSpecialJob !== '1') {
		formData.specialJobCode = ''
		formData.specialJobName = ''
		formData.specialJobCodeList = []
		return
	}

	const selectedCodes = (formData.specialJobCodeList || []).map(item => String(item)).filter(Boolean)
	const selectedNames = selectedCodes.map(code => {
		const match = specialJobOptions.value.find(option => String(option.value) === code)
		return match?.label || ''
	}).filter(Boolean)

	formData.specialJobCodeList = selectedCodes
	formData.specialJobCode = selectedCodes.join(',')
	formData.specialJobName = selectedNames.join(',')
}

const loadSpecialJobOptions = async () => {
	if (specialJobOptions.value.length > 0) {
		return
	}

	try {
		const res = await publicApi.getLocalSelect({
			type: 'DICT',
			dictType: 'SPECIAL_OPERATION',
		})
		if (res.code === '0000') {
			specialJobOptions.value = normalizeSpecialJobOptions(res.data || [])
			syncSpecialJobFields()
			return
		}
		proxy.$message.error(res.msg || '加载特殊作业字典失败')
	} catch (error) {
		console.error('加载特殊作业字典失败:', error)
		proxy.$message.error('加载特殊作业字典失败')
	}
}

const filterPartTreeNode = (value, data, node) => {
	if (!value) return true
	const keyword = String(value).trim()
	if (!keyword) return true

	const nodeName = data?.typeName || data?.label || ''
	if (nodeName.includes(keyword)) return true

	// 父节点命中时保留当前子节点，确保“机构”命中后能看到全部“部件”
	let parentNode = node?.parent
	while (parentNode && parentNode.data) {
		const parentName = parentNode.data?.typeName || parentNode.data?.label || ''
		if (parentName.includes(keyword)) return true
		parentNode = parentNode.parent
	}

	// 子节点命中时保留当前父节点，确保可展开到命中的部件
	const hasMatchedChild = (children = []) => {
		return children.some(child => {
			const childName = child?.typeName || child?.label || ''
			return childName.includes(keyword) || hasMatchedChild(child?.children || [])
		})
	}
	return hasMatchedChild(data?.children || [])
}

const loadEquipmentSmallCategory = async () => {
	if (formData.equipSmallCategoryId || !formData.equipId) {
		return formData.equipSmallCategoryId
	}
	try {
		const res = await equipmentInfoApi.getById(formData.equipId)
		if (res.code === '0000' && res.data) {
			formData.equipSmallCategoryId = res.data.equipSmallCategoryId || null
			formData.equipSmallCategoryName = res.data.equipSmallCategoryName || ''
		}
	} catch (error) {
		console.error('加载设备小类失败:', error)
	}
	return formData.equipSmallCategoryId
}

const loadPartTreeBySmallCategory = async (smallCategoryId) => {
	partTreeLoading.value = true
	partTreeLeafMap = new Map()
	try {
		const res = await api.getPartsTreeBySmallCategoryId(smallCategoryId)
		if (res.code !== '0000') {
			proxy.$message.error(res.msg || '加载设备零部件树失败')
			partTreeData.value = []
			return
		}

		const rawTree = res.data || []
		const smallCategoryNode = rawTree.find(item => Number(item?.categoryLevel) === 3)
		const institutionList = smallCategoryNode ? (smallCategoryNode.children || []) : rawTree

		partTreeData.value = (institutionList || []).map(institution => {
			const institutionId = getSelectValue(institution)
			const institutionName = getSelectLabel(institution)
			const children = (institution.children || []).map(unit => {
				const equipUnitId = getSelectValue(unit)
				if (equipUnitId === '' || equipUnitId == null) return null
				const equipUnitName = getSelectLabel(unit)
				partTreeLeafMap.set(String(equipUnitId), {
					equipInstitutionId: institutionId,
					equipInstitutionName: institutionName,
					equipUnitId: equipUnitId,
					equipUnitName: equipUnitName,
				})
				return {
					id: equipUnitId,
					typeName: equipUnitName,
				}
			}).filter(Boolean)
			return {
				id: institutionId,
				typeName: institutionName,
				children,
			}
		}).filter(item => item.id !== '' && item.id != null)
	} catch (error) {
		console.error('加载设备零部件树失败:', error)
		proxy.$message.error('加载设备零部件树失败')
		partTreeData.value = []
		partTreeLeafMap = new Map()
	} finally {
		partTreeLoading.value = false
	}
}

const openPartTreeDialog = async () => {
	const smallCategoryId = await loadEquipmentSmallCategory()
	if (!smallCategoryId) {
		proxy.$message.warning('未获取到设备小类，无法选择部位部件')
		return
	}
	partTreeDialogVisible.value = true
	partTreeFilterText.value = ''
	await loadPartTreeBySmallCategory(smallCategoryId)
	nextTick(() => {
		const checkedKeys = dispatchPartList.value.map(item => item.equipUnitId).filter(Boolean)
		partTreeRef.value?.setCheckedKeys(checkedKeys)
	})
}

const confirmPartTreeSelection = () => {
	const checkedKeys = partTreeRef.value?.getCheckedKeys(true) || []
	dispatchPartList.value = checkedKeys.map(key => partTreeLeafMap.get(String(key))).filter(Boolean)
	syncDispatchPartToForm()
	partTreeDialogVisible.value = false
}

const removeDispatchPart = (row) => {
	dispatchPartList.value = dispatchPartList.value.filter(item => String(item.equipUnitId) !== String(row.equipUnitId))
	syncDispatchPartToForm()
}

const handleIsSpecialJobChange = async (value) => {
	formData.isSpecialJob = String(value || '0')
	if (formData.isSpecialJob === '1') {
		await loadSpecialJobOptions()
		syncSpecialJobFields()
		nextTick(() => {
			formRef.value?.clearValidate(['specialJobCodeList'])
		})
		return
	}

	formData.specialJobCode = ''
	formData.specialJobName = ''
	formData.specialJobCodeList = []
	nextTick(() => {
		formRef.value?.clearValidate(['specialJobCodeList'])
	})
}

const handleSpecialJobChange = () => {
	syncSpecialJobFields()
}

const clearMaintOrgAndLeader = () => {
	formData.maintOrgId = null
	formData.maintOrgName = ''
	formData.maintLeaderId = null
	formData.maintLeaderName = ''
	formData.maintLeaderMobile = ''
	deptList.value = []
	userList.value = []
}

const clearMaintProjApply = () => {
	formData.mantAppNumber = ''
	maintProjApplyOptions.value = []
	maintProjApplyLoading.value = false
}

const getMaintProjAppType = () => {
	if (formData.dispatchTypeCode === '3') return '1'
	if (formData.dispatchTypeCode === '4') return '2'
	return ''
}

const ensureDeptDefaultOption = (deptId, deptName) => {
	if (!deptId) return
	const deptIdStr = String(deptId)
	const hasOption = deptList.value.some(item => String(item.value) === deptIdStr)
	if (!hasOption) {
		deptList.value.unshift({
			value: deptId,
			label: deptName || deptIdStr,
		})
	}
}

const queryMaintProjApplyOptions = async () => {
	if (!isMaintProjApplyVisible.value || !formData.equipId) {
		maintProjApplyOptions.value = []
		return
	}
	const appType = getMaintProjAppType()
	if (!appType) {
		maintProjApplyOptions.value = []
		return
	}
	maintProjApplyLoading.value = true
	try {
		const params = {
			type: 'MAINT_PROJ_APPLY',
			equipId: formData.equipId,
			appType,
		}
		// 修改时传当前维保ID，后端可放行当前记录已绑定的申请单
		if (formData.id || props.maintInfoId) {
			params.maintInfoId = formData.id || props.maintInfoId
		}
		const res = await publicApi.getLocalSelect({
			...params,
		})
		if (res.code === '0000') {
			maintProjApplyOptions.value = (res.data || []).map(item => ({
				value: item.value,
				label: item.label,
			}))
			return
		}
		proxy.$message.error(res.msg || '加载维修项目申请单失败')
		maintProjApplyOptions.value = []
	} catch (error) {
		console.error('加载维修项目申请单失败:', error)
		proxy.$message.error('加载维修项目申请单失败')
		maintProjApplyOptions.value = []
	} finally {
		maintProjApplyLoading.value = false
	}
}

const handleMantAppNumberChange = async (appNumber) => {
	if (!appNumber) {
		clearMaintOrgAndLeader()
		return
	}
	try {
		const res = await api.getMaintProjApplyByAppNumber(appNumber)
		if (res.code !== '0000' || !res.data) {
			proxy.$message.warning(res.msg || '未查询到申请单对应维修单位')
			return
		}
		const unitId = res.data.maintenanceUnitId ?? res.data.maintOrgId ?? res.data.MAINTENANCE_UNIT_ID
		const unitName = res.data.maintenanceUnitName ?? res.data.maintOrgName ?? res.data.MAINTENANCE_UNIT_NAME
		if (!unitId) {
			proxy.$message.warning('申请单未匹配到维修单位')
			return
		}
		ensureDeptDefaultOption(unitId, unitName)
		formData.maintOrgId = unitId
		formData.maintOrgName = unitName || (deptList.value.find(item => String(item.value) === String(unitId))?.label || '')
		handleDeptChange()
	} catch (error) {
		console.error('根据申请单查询维修单位失败:', error)
		proxy.$message.error('根据申请单查询维修单位失败')
	}
}

// 加载维修单位列表
const loadDeptList = () => {
	if (!formData.dispatchTypeCode) {
		deptList.value = []
		return
	}

	// 校验设备是否已选择
	if (!formData.equipId) {
		proxy.$message.warning('请先选择设备')
		deptList.value = []
		return
	}

	// 委内(1)查询内部单位(outType=1)，大包/定额/非定额/其他(2/3/4/5)查询外部单位(outType=2)
	const outType = formData.dispatchTypeCode === '1' ? '1' : '2'

	// 使用新的接口查询维修单位
	api.getRepairContractByEquipId(formData.equipId, outType).then(res => {
		if (res.code === '0000') {
			deptList.value = res.data.map(item => ({
				value: item.externalCompanyId,
				label: item.unitName,
			}))
			if (formData.maintOrgId) {
				ensureDeptDefaultOption(formData.maintOrgId, formData.maintOrgName)
			}
		} else {
			proxy.$message.error(res.msg || '加载维修单位列表失败')
		}
	}).catch(error => {
		console.error('加载维修单位列表失败:', error)
		proxy.$message.error('加载维修单位列表失败')
	})
}

// 加载用户列表
const loadUserList = (deptId) => {
	if (!deptId) {
		userList.value = []
		formData.maintLeaderId = null
		formData.maintLeaderName = ''
		return
	}

	publicApi.getLocalSelect({
		type: 'USER',
    companyId: deptId
	}).then(res => {
		if (res.code === '0000') {
			userList.value = res.data.map(item => ({
				value: item.value || item.id,
				label: item.label || item.userName,
			}))
		} else {
			proxy.$message.error(res.msg || '加载用户列表失败')
		}
	}).catch(error => {
		console.error('加载用户列表失败:', error)
		proxy.$message.error('加载用户列表失败')
	})
}

// 派工类型变化
const handleDispatchTypeChange = (newVal) => {
	const typeMap = {
		'1': '委内',
		'2': '大包',
		'3': '定额',
		'4': '非定额',
		'5': '其他'
	}
	formData.dispatchTypeName = typeMap[newVal] || ''
	// 清空承修单位和维修负责人
	clearMaintProjApply()
	clearMaintOrgAndLeader()
	// 重新加载维修单位列表
	loadDeptList()
	if (newVal === '3' || newVal === '4') {
		queryMaintProjApplyOptions()
	}
	nextTick(() => {
		formRef.value?.clearValidate(['mantAppNumber'])
	})
}

// 承修单位变化
const handleDeptChange = () => {
	// 清空维修负责人和手机号码
	formData.maintLeaderId = []
	formData.maintLeaderName = []
	formData.maintLeaderMobile = ''
	userList.value = []
	// 加载对应的用户列表
	if (formData.maintOrgId) {
		loadUserList(formData.maintOrgId)
	}
}

// 维修负责人变化时，查询手机号码
const handleMaintLeaderChange = (item) => {
	const itemArray = Array.isArray(item) ? item : (item ? [item] : [])
	if (itemArray.length === 0) {
		formData.maintLeaderMobile = ''
		return
	}

	let mobileList = []
	let promises = itemArray.map(i => {
		if (i && i.value) {
			return userApi.getById(i.value).then(res => {
				if (res.code === '0000' && res.data && res.data.mobile) {
					// 保证顺序，可直接 push 或按索引这里暂简单push
					mobileList.push(res.data.mobile)
				}
			}).catch(() => {})
		}
		return Promise.resolve()
	})
	Promise.all(promises).then(() => {
		formData.maintLeaderMobile = mobileList.join(',')
	})
}

watch(
	() => formData.equipId,
	(newVal, oldVal) => {
		if (newVal === oldVal) {
			return
		}
		// 设备变化或被清空时，清理所有依赖设备查询的派工数据
		clearMaintProjApply()
		clearMaintOrgAndLeader()
		if (newVal && formData.dispatchTypeCode) {
			loadDeptList()
			if (isMaintProjApplyVisible.value) {
				queryMaintProjApplyOptions()
			}
		}
	}
)

watch(() => partTreeFilterText.value, (newVal) => {
	partTreeRef.value?.filter(newVal)
})

// 重置表单
const resetForm = () => {
	if (formRef.value) {
		formRef.value.resetFields()
	}
	Object.keys(formData).forEach(key => {
		if (key === 'id') {
			formData[key] = null
		} else if (key === 'status') {
			formData[key] = 1
		} else if (Array.isArray(formData[key])) {
			formData[key] = []
		} else if (typeof formData[key] === 'number') {
			formData[key] = null
		} else {
			formData[key] = ''
		}
	})
	deptList.value = []
	userList.value = []
	dispatchPartList.value = []
	partTreeData.value = []
	partTreeFilterText.value = ''
	partTreeLeafMap = new Map()
	formData.isStopped = 0
	formData.reportTypeCode = '1'
	formData.reportTypeName = '提报'
	formData.isSpecialJob = '0'
	formData.specialJobCode = ''
	formData.specialJobName = ''
	formData.specialJobCodeList = []
	clearMaintProjApply()
	setTimeout(() => {
		if (formRef.value) {
			formRef.value.clearValidate()
		}
	}, 100)
}

const clearValidation = () => {
	setTimeout(() => {
		if (formRef.value) {
			formRef.value.clearValidate()
		}
	}, 100)
}

// 表单验证
const validate = () => {
	return new Promise((resolve, reject) => {
		formRef.value.validate(valid => {
			if (valid) {
				resolve(true)
			} else {
				reject(false)
			}
		})
	})
}

// 加载数据
const loadData = (data) => {
	resetForm()
	if (data) {
		// 基本信息
		formData.id = data.id
		formData.equipId = data.equipId
		formData.equipName = data.equipName || ''
		formData.equipCode = data.equipCode || ''
		formData.equipSmallCategoryId = data.equipSmallCategoryId || null
		formData.equipSmallCategoryName = data.equipSmallCategoryName || ''
		formData.faultFindTime = data.faultFindTime || ''
		formData.emergencyLevel = data.emergencyLevel || '0'
		formData.maintTypeCode = data.maintTypeCode || ''
		formData.maintTypeName = data.maintTypeName || ''
		formData.isStopped = data.isStopped !== undefined ? data.isStopped : 0
		formData.faultDesc = data.faultDesc || ''
		formData.reportTypeCode = data.reportTypeCode || '1'
	formData.reportTypeName = data.reportTypeName || '提报'

		// 派工信息
		formData.dispatchTypeCode = data.dispatchTypeCode || ''
		formData.dispatchTypeName = data.dispatchTypeName || ''
		formData.mantAppNumber = data.mantAppNumber || ''
		formData.maintOrgId = data.maintOrgId
		formData.maintOrgName = data.maintOrgName || ''
		formData.maintLeaderId = data.maintLeaderId ? (typeof data.maintLeaderId === 'string' ? data.maintLeaderId.split(',') : data.maintLeaderId) : []
		formData.maintLeaderName = data.maintLeaderName ? (typeof data.maintLeaderName === 'string' ? data.maintLeaderName.split(',') : data.maintLeaderName) : []
		formData.maintLeaderMobile = data.maintLeaderMobile || ''
		formData.isSpecialJob = String(data.isSpecialJob ?? '0')
		formData.specialJobCode = data.specialJobCode || ''
		formData.specialJobName = data.specialJobName || ''
		formData.specialJobCodeList = formData.specialJobCode ? formData.specialJobCode.split(',').map(item => item.trim()).filter(Boolean) : []
		formData.status = data.status || 0
		dispatchPartList.value = normalizeDispatchPartList(data.itemList || data.dispatchItemList || data.partList || [])
		syncDispatchPartToForm()
		syncSpecialJobFields()

		// 如果维修类型代码存在但名称为空，设置名称
		if (formData.maintTypeCode && !formData.maintTypeName) {
			const typeMap = {
				'1': '计划维修',
				'2': '应急维修'
			}
			formData.maintTypeName = typeMap[formData.maintTypeCode] || ''
		}

		// 如果有派工类型，加载对应的部门列表
		if (formData.dispatchTypeCode) {
			nextTick(() => {
				loadDeptList()
				if (isMaintProjApplyVisible.value) {
					queryMaintProjApplyOptions()
				}
				// 如果有承修单位，加载对应的用户列表
				if (formData.maintOrgId) {
					setTimeout(() => {
						loadUserList(formData.maintOrgId)
					}, 300)
				}
			})
		}
		if (formData.isSpecialJob === '1') {
			loadSpecialJobOptions()
		}
		loadEquipmentSmallCategory()
	}
}

onMounted(() => {
	// 初始化
})

// 暴露方法给父组件
defineExpose({
	resetForm,
	validate,
	formData,
	loadData,
	loadDeptList,
	loadUserList,
	clearValidation,
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/formData.scss';

.dispatch-part-wrapper {
	width: 100%;
}

.dispatch-part-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.dispatch-part-title {
	font-size: 14px;
	font-weight: 500;
	color: #606266;
}

.dispatch-part-form-item {
	width: 100%;
}

:deep(.dispatch-part-form-item .el-form-item__content) {
	display: block;
	width: 100%;
}

:deep(.dispatch-part-form-item .el-form-item__label) {
	padding-bottom: 0;
}

.part-tree-container {
	margin-top: 12px;
	max-height: 420px;
	overflow-y: auto;
	border: 1px solid #ebeef5;
	border-radius: 4px;
	padding: 8px;
}

.part-tree-search-wrapper {
	margin-bottom: 4px;
}

.part-tree-search-input {
	width: 100%;
}
</style>

