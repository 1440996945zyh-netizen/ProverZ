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
						<!-- 报修类型字段已隐藏，但保留默认值 '1'（日常维修） -->
						<el-col :span="8" style="display: none;">
							<el-form-item label="报修类型" prop="reportTypeCode">
								<el-select v-model="formData.reportTypeCode" placeholder="请选择报修类型" style="width: 100%" @change="handleReportTypeChange">
									<el-option label="日常维修" :value="'1'" />
								</el-select>
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
             <el-col :span="8">
               <el-form-item label="紧急程度" prop="emergencyLevel">
                 <el-radio-group v-model="formData.emergencyLevel">
                   <el-radio label="0">常规</el-radio>
                   <el-radio label="1">紧急</el-radio>
                   <el-radio label="2">特急</el-radio>
                 </el-radio-group>
               </el-form-item>
             </el-col>
					</el-row>
					<el-row :gutter="20">

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
						<el-col :span="8">
							<el-form-item label="派工类型" prop="dispatchTypeCode">
								<el-select v-model="formData.dispatchTypeCode" placeholder="请选择派工类型" style="width: 100%" @change="handleDispatchTypeChange">
									<el-option label="委内" :value="'1'" />
									<el-option label="委外" :value="'2'" />
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
								/>
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
	</div>
</template>

<script setup name="maintInfoDetail">
import { ref, reactive, computed, getCurrentInstance, onMounted, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Select from '@/components/Select'
import api from '@/api/equipment/maintInfo/index'
import equipmentInfoApi from '@/api/equipment/equipmentInfo/index'
import { getListByLevel, listDept } from '@/api/system/dept'
import publicApi from '@/api/public/index'

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
	faultFindTime: '',
	emergencyLevel: '0', // 默认值为常规
	maintTypeCode: '', // 维修类型不设默认值
	maintTypeName: '',
	isStopped: 0,
	faultDesc: '',
	reportTypeCode: '1', // 默认值为日常维修
	reportTypeName: '日常维修', // 默认值为日常维修
	dispatchTypeCode: '', // 派工类型：1-委内，2-委外
	dispatchTypeName: '',
	maintOrgId: null,
	maintOrgName: '',
	maintLeaderId: null,
	maintLeaderName: '',
	dispatcherId: null,
	dispatcherName: '',
	dispatchTime: '',
	// 状态（0-提报，1-已派工，2-维修中，4-维修完成，5-验收通过，6-验收不通过，7-作废）
	status: 0,
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
	maintOrgId: [],
	maintLeaderId: [],
})

// 根据模式更新验证规则
const updateRules = () => {
	if (internalMode.value === 'dispatch') {
		// 派工模式：派工信息字段必填
		rules.dispatchTypeCode = [{ required: true, message: '派工类型不能为空', trigger: 'change' }]
		rules.maintOrgId = [{ required: true, message: '承修单位不能为空', trigger: 'change' }]
		rules.maintLeaderId = [{ required: true, message: '维修负责人不能为空', trigger: 'change' }]
	} else {
		// 新增模式：派工信息字段非必填
		rules.dispatchTypeCode = []
		rules.maintOrgId = []
		rules.maintLeaderId = []
	}
}

// 处理设备选择变化
const handleEquipmentChange = (item) => {
	if (item && item.value) {
		// 根据设备ID查询设备编码
		equipmentInfoApi.getById(item.value).then(res => {
			if (res.code == '0000' && res.data) {
				formData.equipCode = res.data.equipCode || ''
			}
		}).catch(() => {
			// 如果查询失败，尝试从 label 中提取（如果包含编码信息）
		})
	} else {
		formData.equipCode = ''
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
		'1': '日常维修'
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

// 加载部门列表（根据派工类型：委内=内部部门，委外=外部部门）
const loadDeptList = () => {
	if (!formData.dispatchTypeCode) {
		deptList.value = []
		return
	}

	// 委内(1)查询内部部门(IN_OUT_TYPE='I')，委外(2)查询外部部门(IN_OUT_TYPE='O')
	const inOutType = formData.dispatchTypeCode === '1' ? 'I' : 'O'

	// 查询部门列表：DEPT_LEVEL=2（部门级别），IN_OUT_TYPE=I/O（内外部），STATUS=1（在用）
	listDept({
		deptLevel: 2,
		inOutType: inOutType,
		status: '1'
	}).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
		}
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

// 派工类型变化时，清空承修单位和维修负责人，重新加载部门列表
const handleDispatchTypeChange = (value) => {
	const typeMap = {
		'1': '委内',
		'2': '委外'
	}
	formData.dispatchTypeName = typeMap[value] || ''

	// 清空承修单位和维修负责人
	formData.maintOrgId = null
	formData.maintOrgName = ''
	formData.maintLeaderId = null
	formData.maintLeaderName = ''
	userList.value = []

	// 重新加载部门列表
	if (value) {
		loadDeptList()
	} else {
		deptList.value = []
	}
}

// 部门变化时，清空维修负责人并重新加载用户列表
const handleDeptChange = () => {
	formData.maintLeaderId = null
	formData.maintLeaderName = ''
	if (formData.maintOrgId) {
		loadUserList(formData.maintOrgId)
	} else {
		userList.value = []
	}
}

// 监听maintOrgId变化，编辑时自动加载用户列表
watch(() => formData.maintOrgId, (newVal) => {
	if (newVal && !userList.value.length) {
		loadUserList(newVal)
	}
})

// 监听dispatchTypeCode变化，自动设置dispatchTypeName并加载部门列表
watch(() => formData.dispatchTypeCode, (newVal) => {
	if (newVal) {
		const typeMap = {
			'1': '委内',
			'2': '委外'
		}
		formData.dispatchTypeName = typeMap[newVal] || ''
		// 加载对应的部门列表
		loadDeptList()
	}
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
			formData[key] = '1' // 默认值为日常维修
			formData.reportTypeName = '日常维修'
		} else if (key === 'reportTypeName') {
			// 报修类型名称在reportTypeCode中已设置，跳过
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
	// 重置状态
	formData.status = 0
	// 重置模式
	internalMode.value = 'add'
	// 确保报修类型名称有值（如果报修类型代码为'1'）
	if (formData.reportTypeCode === '1') {
		formData.reportTypeName = '日常维修'
	}
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

// 初始化时设置报修类型名称（维修类型不设默认值）
if (formData.reportTypeCode === '1') {
	formData.reportTypeName = '日常维修'
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
	// 如果报修类型代码为'1'，确保报修类型名称为'日常维修'
	if (formData.reportTypeCode === '1' && !formData.reportTypeName) {
		formData.reportTypeName = '日常维修'
	}
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
</style>

