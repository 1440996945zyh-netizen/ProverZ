<template>
	<div class="maint-info-detail-wrapper">
		<el-form ref="formRef" :model="formData" :rules="rules" label-position="top" :inline="true" :disabled="readonly">
			<el-collapse v-model="activeNames">
				<!-- 基本信息（只在非onlyDispatch模式下显示） -->
				<el-collapse-item v-if="!onlyDispatch" title="基本信息" name="basic">
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="设备名称" prop="equipId">
								<Select
									:dataConfig="{ params: { type: 'EQUIPMENT' } }"
									v-model:value="formData.equipId"
									v-model:label="formData.equipName"
									placeholder="请选择设备（可搜索）"
									@change="handleEquipmentChange"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="报修类型" prop="reportTypeCode">
								<el-input v-model="formData.reportTypeName" readonly style="width: 100%" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="故障发现时间" prop="faultFindTime">
								<el-date-picker
									v-model="formData.faultFindTime"
									type="datetime"
									placeholder="请选择故障发现时间"
									format="YYYY-MM-DD HH:mm:ss"
									value-format="YYYY-MM-DD HH:mm:ss"
									style="width: 100%"
								/>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
             			<el-col :span="8">
							<el-form-item label="紧急程度" prop="emergencyLevel">
								<el-radio-group v-model="formData.emergencyLevel">
								<el-radio label="0">常规</el-radio>
								<el-radio label="1">紧急</el-radio>
								<el-radio label="2">特急</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="维修类型" prop="maintTypeCode">
								<el-radio-group v-model="formData.maintTypeCode" @change="handleMaintTypeChange">
									<el-radio label="1">计划维修</el-radio>
									<el-radio label="2">应急维修</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="是否停机" prop="isStopped">
								<el-radio-group v-model="formData.isStopped">
									<el-radio :label="0">否</el-radio>
									<el-radio :label="1">是</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item label="故障描述" prop="faultDesc">
								<el-input v-model="formData.faultDesc" type="textarea" :rows="3" placeholder="请输入故障描述" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="24">
							<div class="image-upload-section">
								<div class="image-upload-label">故障图片</div>
								<el-upload
									class="image-uploader"
									:http-request="handleImageUpload"
									:file-list="imageFileList"
									list-type="picture-card"
									:on-preview="handlePicturePreview"
									:on-remove="handleImageRemove"
									accept="image/*"
									:disabled="readonly"
								>
									<el-icon v-if="!readonly"><Plus /></el-icon>
								</el-upload>
							</div>
						</el-col>
					</el-row>
				</el-collapse-item>
				<!-- 派工信息（在派工模式或onlyDispatch模式下显示） -->
				<el-collapse-item v-if="internalMode === 'dispatch' || onlyDispatch" title="派工信息" name="dispatch">
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item class="dispatch-part-form-item">
								<div class="dispatch-part-wrapper">
									<div class="dispatch-part-header">
										<span class="dispatch-part-title">部位部件</span>
										<el-button type="primary" plain :disabled="readonly" @click="openPartTreeDialog">添加</el-button>
									</div>
									<el-table :data="dispatchPartList" border size="small" max-height="240">
										<el-table-column prop="equipInstitutionName" label="设备机构名称" min-width="160" />
										<el-table-column prop="equipUnitName" label="设备部件名称" min-width="160" />
										<el-table-column v-if="!readonly" label="操作" width="80" align="center">
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
									<el-option label="委外" :value="'2'" />
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
									:disabled="!formData.dispatchTypeCode"
									:placeholder="formData.dispatchTypeCode ? '请选择承修单位' : '请先选择派工类型'"
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
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="手机号码" prop="maintLeaderMobile">
								<el-input v-model="formData.maintLeaderMobile" placeholder="请输入手机号码" maxlength="11" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="是否涉及特殊作业" prop="isSpecialJob">
								<el-select v-model="formData.isSpecialJob" placeholder="请选择是否涉及特殊作业" style="width: 100%" @change="handleIsSpecialJobChange">
									<el-option label="否" value="0" />
									<el-option label="是" value="1" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col v-if="formData.isSpecialJob === '1'" :span="24">
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

		<!-- 图片预览对话框 -->
		<el-dialog v-model="previewVisible" title="图片预览" width="80%">
			<img :src="previewImageUrl" style="width: 100%; height: auto" />
		</el-dialog>

		<el-dialog v-model="partTreeDialogVisible" title="选择设备零部件" width="640px" append-to-body>
			<el-input v-model="partTreeFilterText" placeholder="请输入部位/部件名称" clearable />
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

<script setup name="maintInfoDetail">
import { ref, reactive, computed, getCurrentInstance, onMounted, watch, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Select from '@/components/Select'
import api from '@/api/equipment/maintInfo/index'
import equipmentInfoApi from '@/api/equipment/equipmentInfo/index'
import { getListByLevel, listDept } from '@/api/system/dept'
import publicApi from '@/api/public/index'
import userApi from '@/api/system/user'

const props = defineProps({
	readonly: {
		type: Boolean,
		default: false,
	},
	mode: {
		type: String,
		default: 'add',
	},
	onlyDispatch: {
		type: Boolean,
		default: false, // 是否只显示派工信息
	},
})

const emit = defineEmits(['saved'])

const { proxy } = getCurrentInstance()
const formRef = ref(null)

// 内部模式：'add' 只录入基本信息（状态0-提报），'dispatch' 录入全部信息（状态1-已派工）
const internalMode = ref('add')

// 折叠面板展开项（根据模式控制）
const activeNames = computed(() => {
	if (props.onlyDispatch) {
		// 只显示派工信息模式
		return ['dispatch']
	} else if (internalMode.value === 'dispatch') {
		return ['basic', 'dispatch'] // 派工模式：显示全部
	} else {
		return ['basic'] // 新增模式：只显示基本信息
	}
})

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

// 图片上传列表
const imageFileList = ref([]) // 故障图片
const previewImageUrl = ref('') // 预览图片URL
const previewVisible = ref(false) // 预览对话框显示状态

// 表单数据
const formData = reactive({
	id: null,
	equipId: null,
	equipName: '',
	equipCode: '',
	equipSmallCategoryId: null,
	equipSmallCategoryName: '',
	faultFindTime: '',
	emergencyLevel: '0', // 默认值为常规
	maintTypeCode: '', // 维修类型不设默认值
	maintTypeName: '',
	isStopped: 0,
	faultDesc: '',
	reportTypeCode: '', // 报修类型由外部设置
	reportTypeName: '', // 报修类型由外部设置
	dispatchTypeCode: '', // 派工类型：1-委内，2-委外
	dispatchTypeName: '',
	mantAppNumber: '',
	maintOrgId: null,
	maintOrgName: '',
	maintLeaderId: null,
	maintLeaderName: '',
	maintLeaderMobile: '',
	isSpecialJob: '0',
	specialJobCode: '',
	specialJobName: '',
	specialJobCodeList: [],
	dispatcherId: null,
	dispatcherName: '',
	dispatchTime: '',
	// 状态（0-提报，1-已派工，2-维修中，4-维修完成，5-验收通过，6-验收不通过，7-作废）
	status: 0,
	itemList: [],
	// 故障图片文件ID列表
	faultImageIds: [],
})

// 表单验证规则（根据模式动态设置）
const rules = reactive({
	equipId: [{ required: true, message: '设备不能为空', trigger: 'change' }],
	faultFindTime: [{ required: true, message: '故障发现时间不能为空', trigger: 'change' }],
	maintTypeCode: [{ required: true, message: '维修类型不能为空', trigger: 'change' }],
	isStopped: [{ required: true, message: '是否停机不能为空', trigger: 'change' }],
	dispatchTypeCode: [],
	mantAppNumber: [],
	maintOrgId: [],
	maintLeaderId: [],
	specialJobCodeList: [],
})

const isMaintProjApplyVisible = computed(() => {
	return formData.dispatchTypeCode === '3' || formData.dispatchTypeCode === '4'
})

// 根据模式更新验证规则
const updateRules = () => {
	if (internalMode.value === 'dispatch') {
		// 派工模式：派工信息字段必填
		rules.dispatchTypeCode = [{ required: true, message: '派工类型不能为空', trigger: 'change' }]
		rules.mantAppNumber = [{
			validator: (_rule, value, callback) => {
				if (isMaintProjApplyVisible.value && !value) {
					callback(new Error('维修项目申请单不能为空'))
					return
				}
				callback()
			},
			trigger: 'change',
		}]
		rules.maintOrgId = [{ required: true, message: '承修单位不能为空', trigger: 'change' }]
		rules.maintLeaderId = [{ required: true, message: '维修负责人不能为空', trigger: 'change' }]
		rules.specialJobCodeList = [{
			validator: (rule, value, callback) => {
				if (formData.isSpecialJob === '1' && (!Array.isArray(value) || value.length === 0)) {
					callback(new Error('请选择特殊作业情况'))
					return
				}
				callback()
			},
			trigger: 'change',
		}]
	} else {
		// 新增模式：派工信息字段非必填
		rules.dispatchTypeCode = []
		rules.mantAppNumber = []
		rules.maintOrgId = []
		rules.maintLeaderId = []
		rules.specialJobCodeList = []
	}
}

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
	if (props.readonly) return
	const smallCategoryId = await loadEquipmentSmallCategory()
	if (!smallCategoryId) {
		proxy.$message.warning('请先选择设备')
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

// 处理设备选择变化
const handleEquipmentChange = (item) => {
	clearMaintProjApply()
	clearMaintOrgAndLeader()
	if (item && item.value) {
		// 根据设备ID查询设备编码
		equipmentInfoApi.getById(item.value).then(res => {
			if (res.code == '0000' && res.data) {
				formData.equipCode = res.data.equipCode || ''
				formData.equipSmallCategoryId = res.data.equipSmallCategoryId || null
				formData.equipSmallCategoryName = res.data.equipSmallCategoryName || ''
				dispatchPartList.value = []
				syncDispatchPartToForm()
				if (formData.dispatchTypeCode) {
					loadDeptList()
					if (isMaintProjApplyVisible.value) {
						queryMaintProjApplyOptions()
					}
				}
			}
		}).catch(() => {
			// 如果查询失败，尝试从 label 中提取（如果包含编码信息）
		})
	} else {
		formData.equipCode = ''
		formData.equipSmallCategoryId = null
		formData.equipSmallCategoryName = ''
		dispatchPartList.value = []
		syncDispatchPartToForm()
	}
}

// 处理维修类型变化
const handleMaintTypeChange = (value) => {
	const typeMap = {
		'1': '计划维修',
		'2': '应急维修'
	}
	formData.maintTypeName = typeMap[value] || ''
}

// 处理报修类型变化
const handleReportTypeChange = (value) => {
	const typeMap = {
		'1': '提报',
		'2': '派工',
		'3': '点检',
		'4': '润滑'
	}
	formData.reportTypeName = typeMap[value] || ''
}

// 获取当前时间（格式：YYYY-MM-DD HH:mm:ss）
const getCurrentDateTime = () => {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 加载维修单位列表（根据派工类型）
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

	// 委内(1)查询内部单位(outType=1)，委外/定额/非定额/其他(2/3/4/5)查询外部单位(outType=2)
	const outType = formData.dispatchTypeCode === '1' ? '1' : '2'

	// 使用新的接口查询维修单位
	api.getRepairContractByEquipId(formData.equipId, outType).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.unitName,
				value: item.externalCompanyId,
			}))
			if (formData.maintOrgId) {
				ensureDeptDefaultOption(formData.maintOrgId, formData.maintOrgName)
			}
		}
	}).catch(() => {
		deptList.value = []
	})
}

// 加载用户列表（根据部门ID）
const loadUserList = (deptId) => {
	if (!deptId) {
		userList.value = []
		return
	}
	publicApi.getLocalSelect({
		type: 'USER',
		deptId: deptId
	}).then(res => {
		if (res.code == '0000') {
			userList.value = res.data.map(item => ({
				label: item.label || item.userName,
				value: item.value || item.id,
			}))
		}
	})
}

// 派工类型变化时，清空承修单位和维修负责人，重新加载维修单位列表
const handleDispatchTypeChange = (value) => {
	const typeMap = {
		'1': '委内',
		'2': '委外',
		'3': '定额',
		'4': '非定额',
		'5': '其他'
	}
	formData.dispatchTypeName = typeMap[value] || ''

	clearMaintProjApply()
	clearMaintOrgAndLeader()

	// 重新加载维修单位列表
	if (value) {
		loadDeptList()
		if (value === '3' || value === '4') {
			queryMaintProjApplyOptions()
		}
	} else {
		deptList.value = []
	}
	nextTick(() => {
		formRef.value?.clearValidate(['mantAppNumber'])
	})
}

// 部门变化时，清空维修负责人和手机号码，加载用户列表
const handleDeptChange = () => {
	formData.maintLeaderId = null
	formData.maintLeaderName = ''
	formData.maintLeaderMobile = ''
	userList.value = []
	// 加载用户列表
	if (formData.maintOrgId) {
		loadUserList(formData.maintOrgId)
	}
}

// 维修负责人变化时，查询手机号码
const handleMaintLeaderChange = (item) => {
	if (item && item.value) {
		// 查询用户详情获取手机号码
		userApi.getById(item.value).then(res => {
			if (res.code == '0000' && res.data) {
				formData.maintLeaderMobile = res.data.mobile || ''
			}
		}).catch(() => {
			// 查询失败不处理，允许手动输入
		})
	}
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
		if (formData.id) {
			params.maintInfoId = formData.id
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

// 监听dispatchTypeCode变化，自动设置dispatchTypeName
watch(() => formData.dispatchTypeCode, (newVal) => {
	if (newVal) {
		const typeMap = {
			'1': '委内',
			'2': '委外',
			'3': '定额',
			'4': '非定额',
			'5': '其他'
		}
		formData.dispatchTypeName = typeMap[newVal] || ''
		if (isMaintProjApplyVisible.value && maintProjApplyOptions.value.length === 0 && formData.equipId) {
			queryMaintProjApplyOptions()
		}
	} else {
		clearMaintProjApply()
	}
})

watch(() => partTreeFilterText.value, (newVal) => {
	partTreeRef.value?.filter(newVal)
})

watch(
	() => formData.equipId,
	(newVal, oldVal) => {
		if (newVal === oldVal) {
			return
		}
		if (!newVal) {
			clearMaintProjApply()
			clearMaintOrgAndLeader()
			return
		}
		if (formData.dispatchTypeCode) {
			loadDeptList()
			if (isMaintProjApplyVisible.value) {
				queryMaintProjApplyOptions()
			}
		}
	}
)

watch(() => [formData.isSpecialJob, formData.specialJobCode], async ([isSpecialJob, specialJobCode]) => {
	if (String(isSpecialJob) !== '1') {
		formData.isSpecialJob = '0'
		formData.specialJobCode = ''
		formData.specialJobName = ''
		formData.specialJobCodeList = []
		return
	}

	if (specialJobCode && (!Array.isArray(formData.specialJobCodeList) || formData.specialJobCodeList.length === 0)) {
		formData.specialJobCodeList = String(specialJobCode).split(',').map(item => item.trim()).filter(Boolean)
	}

	await loadSpecialJobOptions()
	syncSpecialJobFields()
}, {
	immediate: true,
})

watch(() => formData.itemList, (newVal) => {
	dispatchPartList.value = normalizeDispatchPartList(newVal)
}, {
	deep: true,
	immediate: true,
})

// 监听id变化，编辑模式下自动加载图片
watch(() => formData.id, (newVal) => {
	if (newVal && props.mode !== 'add') {
		// 编辑或查看模式下，加载已有图片
		loadImages()
	}
})

// 故障图片上传
const handleImageUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'MAINT_INFO_IMAGE')

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 添加到ID列表
				if (!formData.faultImageIds) {
					formData.faultImageIds = []
				}
				formData.faultImageIds.push(uploadedFile.id)
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				imageFileList.value.push({
					id: uploadedFile.id,
					name: uploadedFile.fileName,
					url: previewUrl,
					raw: file.file,
				})
			}
		} else {
			ElMessage({
				message: response.msg || '上传失败',
				type: 'error',
			})
		}
	}).catch(error => {
		ElMessage({
			message: '上传失败',
			type: 'error',
		})
	})
}

// 图片预览
const handlePicturePreview = (file) => {
	if (file.url) {
		previewImageUrl.value = file.url
		previewVisible.value = true
	} else if (file.id) {
		// 如果只有文件ID，需要下载后预览
		publicApi.down(file.id, 'arraybuffer').then(res => {
			const blob = new Blob([res.data], {
				type: 'image/jpeg',
			})
			const url = window.URL.createObjectURL(blob)
			previewImageUrl.value = url
			previewVisible.value = true
		})
	}
}

// 删除故障图片
const handleImageRemove = (file) => {
	if (file && file.id) {
		// 从ID列表中移除
		if (formData.faultImageIds) {
			const index = formData.faultImageIds.indexOf(file.id)
			if (index > -1) {
				formData.faultImageIds.splice(index, 1)
			}
		}
		// 从文件列表中移除
		const fileIndex = imageFileList.value.findIndex(item => item.id === file.id)
		if (fileIndex > -1) {
			imageFileList.value.splice(fileIndex, 1)
		}
	}
}

// 重置表单
const resetForm = () => {
	if (formRef.value) {
		formRef.value.resetFields()
	}
	Object.keys(formData).forEach(key => {
		if (key === 'id') {
			formData[key] = null
		} else if (key === 'isStopped') {
			formData[key] = 0
		} else if (key === 'emergencyLevel') {
			formData[key] = '0' // 默认值为常规
		} else if (key === 'maintTypeCode') {
			// 维修类型不设默认值
			formData[key] = ''
			formData.maintTypeName = ''
		} else if (key === 'reportTypeCode') {
			// 报修类型由外部设置，不重置
			return
		} else if (key === 'reportTypeName') {
			// 报修类型由外部设置，不重置
			return
		} else if (key === 'faultFindTime') {
			// 如果是新增模式，默认当前时间；否则清空
			if (props.mode === 'add') {
				formData[key] = getCurrentDateTime()
			} else {
				formData[key] = ''
			}
		} else if (typeof formData[key] === 'string') {
			formData[key] = ''
		} else if (Array.isArray(formData[key])) {
			formData[key] = []
		} else if (typeof formData[key] === 'number') {
			formData[key] = null
		} else {
			formData[key] = null
		}
	})
	// 清空图片列表
	imageFileList.value = []
	if (formData.faultImageIds) {
		formData.faultImageIds = []
	}
	dispatchPartList.value = []
	deptList.value = []
	userList.value = []
	partTreeData.value = []
	partTreeFilterText.value = ''
	partTreeLeafMap = new Map()
	formData.isSpecialJob = '0'
	formData.specialJobCode = ''
	formData.specialJobName = ''
	formData.specialJobCodeList = []
	clearMaintProjApply()
	// 重置状态
	formData.status = 0
	// 重置模式
	internalMode.value = 'add'
	// 更新验证规则
	updateRules()
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

// 如果是新增模式，设置故障发现时间为当前时间
if (props.mode === 'add' && !formData.faultFindTime) {
	formData.faultFindTime = getCurrentDateTime()
}

// 加载已有图片（通过业务ID和业务类型查询）
const loadImages = async () => {
	if (!formData.id) {
		imageFileList.value = []
		return
	}

	try {
		const res = await publicApi.getBusFiles({
			businessId: formData.id,
			businessType: 'MAINT_INFO_IMAGE',
		})
		if (res.code === '0000' && res.data && res.data.length > 0) {
			// 异步加载所有图片
			imageFileList.value = await Promise.all(
				res.data.map(async item => {
					try {
						const downRes = await publicApi.down(item.id, 'arraybuffer')
						const blob = new Blob([downRes.data], {
							type: 'image/jpeg',
						})
						const url = window.URL.createObjectURL(blob)
						return {
							id: item.id,
							name: item.fileName || `图片_${item.id}`,
							url: url,
						}
					} catch (error) {
						console.error('加载图片失败:', error)
						return {
							id: item.id,
							name: item.fileName || `图片_${item.id}`,
							url: '', // 预览时通过ID下载
						}
					}
				})
			)
			// 更新faultImageIds
			formData.faultImageIds = res.data.map(item => item.id)
		} else {
			imageFileList.value = []
			formData.faultImageIds = []
		}
	} catch (error) {
		console.error('查询故障图片失败:', error)
		imageFileList.value = []
	}
}

onMounted(() => {
	// 初始化验证规则
	updateRules()
	// 如果已经有派工类型，加载对应的部门列表
	if (formData.dispatchTypeCode) {
		loadDeptList()
	}
	// 编辑模式下，如果有ID，加载图片（onlyDispatch模式下不加载图片）
	if (formData.id && props.mode !== 'add' && !props.onlyDispatch) {
		loadImages()
	}
	// onlyDispatch模式下，强制设置为派工模式
	if (props.onlyDispatch) {
		internalMode.value = 'dispatch'
		formData.status = 1
		updateRules()
	}
})

// 设置模式
const setMode = (mode) => {
	internalMode.value = mode
	// 根据模式设置状态
	if (mode === 'dispatch') {
		formData.status = 1 // 派工模式：状态为1（已派工）
	} else {
		formData.status = 0 // 新增模式：状态为0（提报）
	}
	// 更新验证规则
	updateRules()
}

// 暴露方法给父组件
defineExpose({
	resetForm,
	validate,
	formData,
	loadUserList,
	setMode,
	loadImages,
	loadDeptList,
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/formData.scss';

.maint-info-detail-wrapper {
	padding: 10px;
}

:deep(.el-collapse) {
	width: 100%;
	border: none;
}

:deep(.el-collapse-item) {
	border: none !important;
	border-bottom: none !important;
}

:deep(.el-collapse-item:last-child) {
	border-bottom: none !important;
}

.image-upload-section {
	margin-bottom: 20px;

	.image-upload-label {
		font-size: 14px;
		color: #606266;
		margin-bottom: 10px;
		font-weight: 500;
	}

	:deep(.el-upload--picture-card) {
		width: 148px;
		height: 148px;
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all 0.3s;

		&:hover {
			border-color: #409eff;
		}
	}

	:deep(.el-upload-list--picture-card) {
		.el-upload-list__item {
			width: 148px;
			height: 148px;
		}
	}
}

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
</style>

