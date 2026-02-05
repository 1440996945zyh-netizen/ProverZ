<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" label-position="top" :inline="true" :disabled="readonly">
			<el-collapse v-model="activeNames">
				<!-- 设备基本信息 -->
				<el-collapse-item title="设备基本信息" name="basic">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="设备类型" prop="equipSmallCategoryId">
								<el-tree-select
									style="width: 100%"
									v-model="formData.equipSmallCategoryId"
									:data="equipmentTypeTreeData"
									:props="{ value: 'id', label: 'typeName', children: 'children' }"
									value-key="id"
									placeholder="请选择设备小类（只能选择小类）"
									check-strictly
									:render-after-expand="false"
									@change="handleEquipmentTypeChange"
									filterable
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备大类">
								<el-input v-model="formData.equipBigCategoryName" placeholder="设备大类" :readonly="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备中类">
								<el-input v-model="formData.equipMiddleCategoryName" placeholder="设备中类" :readonly="true" />
							</el-form-item>
						</el-col>
            <el-col :span="6">
              <el-form-item label="设备编码" prop="equipCode">
                <el-input v-model="formData.equipCode" placeholder="设备编码" />
              </el-form-item>
            </el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="设备名称" prop="equipName">
								<el-input v-model="formData.equipName" placeholder="设备名称" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备规格" prop="specificCode">
								<el-input v-model="formData.specificCode" placeholder="设备规格" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备型号" prop="modelNumber">
								<el-input v-model="formData.modelNumber" placeholder="设备型号" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="能源类型" prop="sourceType">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_ENERGY' } }"
									v-model:value="formData.sourceType"
									v-model:label="formData.sourceTypeName"
								/>
							</el-form-item>
						</el-col>

					</el-row>
					<el-row :gutter="20">
<!--						<el-col :span="6">-->
<!--							<el-form-item label="设备技术状况" prop="equipTechState">-->
<!--								<Select-->
<!--									:dataConfig="{ params: { type: 'DICT', dictType: 'E_TECH' } }"-->
<!--									v-model:value="formData.equipTechState"-->
<!--									v-model:label="formData.equipTechStateName"-->
<!--								/>-->
<!--							</el-form-item>-->
<!--						</el-col>-->
						<el-col :span="6">
							<el-form-item label="计量单位" prop="unit">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_UNIT' } }"
									v-model:value="formData.unit"
									v-model:label="formData.unitName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="保险期限" prop="insuranceDate">
								<el-date-picker
									v-model="formData.insuranceDate"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="使用部门" prop="useOrgId">
								<Select
									:selectData="deptList"
									v-model:value="formData.useOrgId"
									placeholder="请选择使用部门"
									@change="handleDeptChange"
								/>
							</el-form-item>
						</el-col>
            <el-col :span="6">
              <el-form-item label="负责人" prop="responsiCode">
                <Select
                  :selectData="userList"
                  v-model:value="formData.responsiCode"
                  :disabled="!formData.useOrgId"
                  placeholder="请先选择使用部门"
                />
              </el-form-item>
            </el-col>
					</el-row>
					<el-row :gutter="20">

						<el-col :span="6">
							<el-form-item label="是否特种设备" prop="isParticular">
								<el-radio-group v-model="formData.isParticular">
									<el-radio label="0">否</el-radio>
									<el-radio label="1">是</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备使用状态" prop="equipState">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_STATUS' } }"
									v-model:value="formData.equipState"
									v-model:label="formData.equipStateName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="备注" prop="remark">
								<el-input type='textarea' v-model="formData.remark" placeholder="备注" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>

				<!-- 设备供货信息 -->
				<el-collapse-item title="设备供货信息" name="supply">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="出厂编号" prop="factoryNumber">
								<el-input v-model="formData.factoryNumber" placeholder="出厂编号" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备自重(T)" prop="equipWeight">
								<el-input-number v-model="formData.equipWeight" placeholder="设备自重" style="width: 100%" :precision="2" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备购置时间" prop="purchaseTime">
								<el-date-picker
									v-model="formData.purchaseTime"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
									@change="calculateDepreciatedPeriod"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备使用时间" prop="usageTime">
								<el-date-picker
									v-model="formData.usageTime"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
								/>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="供货单位" prop="supplierUnit">
								<el-input v-model="formData.supplierUnit" placeholder="供货单位" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="制造厂家" prop="manufacturer">
								<el-input v-model="formData.manufacturer" placeholder="制造厂家" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="排放标准" prop="emissionStandard">
								<Select :dataConfig="{ params: { type: 'DICT', dictType: 'EMISSION' } }" v-model:value="formData.emissionStandard" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="发动机功率/装机容量(Kw)" prop="enginePower">
								<el-input-number v-model="formData.enginePower" placeholder="发动机功率/装机容量" style="width: 100%" :precision="2" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>

				<!-- 财务信息 -->
				<el-collapse-item title="财务信息" name="finance">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="设备资产编号" prop="assetsNo">
								<el-input v-model="formData.assetsNo" placeholder="设备资产编号" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="设备原值(元)" prop="originalValue">
								<el-input-number v-model="formData.originalValue" placeholder="设备原值" style="width: 100%" :precision="2" :min="0" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="折旧期限(月)" prop="depreciationPeriod">
								<el-input-number v-model="formData.depreciationPeriod" placeholder="折旧期限" style="width: 100%" :min="0" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="已折旧期限(月)" prop="depreciatedPeriod">
								<el-input-number v-model="formData.depreciatedPeriod" placeholder="已折旧期限" style="width: 100%" :min="0" :readonly="true" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>

				<!-- 特种设备信息 -->
				<el-collapse-item v-if="formData.isParticular == '1'" title="特种设备信息" name="special">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="特种设备注册码" prop="particularRegistrationCode" :required="formData.isParticular == '1'">
								<el-input v-model="formData.particularRegistrationCode" placeholder="特种设备注册码" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="证书类别" prop="certifiType" :required="formData.isParticular == '1'">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_ZS_TYPE' } }"
									v-model:value="formData.certifiType"
									v-model:label="formData.certifiTypeName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="证书编号" prop="certifiCode" :required="formData.isParticular == '1'">
								<el-input v-model="formData.certifiCode" placeholder="证书编号" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="发布时间" prop="releaseDate" :required="formData.isParticular == '1'">
								<el-date-picker
									v-model="formData.releaseDate"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
									@change="calculateValidDate"
								/>
							</el-form-item>
						</el-col>

					</el-row>
					<el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="到期时间" prop="expireDate" :required="formData.isParticular == '1'">
                <el-date-picker
                  v-model="formData.expireDate"
                  type="date"
                  placeholder="添加日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  @change="calculateValidDate"
                />
              </el-form-item>
            </el-col>
						<el-col :span="6">
							<el-form-item label="有效期（月）" prop="validDate" :required="formData.isParticular == '1'">
								<el-input-number v-model="formData.validDate" placeholder="有效期（月）" style="width: 100%" :min="0" :readonly="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="检查周期(月)" prop="specialDiscoverCycle" :required="formData.isParticular == '1'">
								<el-input-number v-model="formData.specialDiscoverCycle" placeholder="检查周期(月)" style="width: 100%" :min="0" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="备注" prop="specialRemark">
								<el-input v-model="formData.specialRemark" placeholder="备注" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>

				<!-- 附件与照片 -->
				<el-collapse-item title="设备照片" name="attachment">
					<el-row :gutter="20">
						<el-col :span="8">
							<div class="image-upload-section">
								<div class="image-upload-label">设备全景图</div>
								<el-upload
									class="image-uploader"
									:http-request="handlePanoramaUpload"
									:file-list="panoramaFileList"
									list-type="picture-card"
									:on-preview="handlePicturePreview"
									:on-remove="handlePanoramaRemove"
									accept="image/*"
								>
									<el-icon><Plus /></el-icon>
								</el-upload>
							</div>
						</el-col>
						<el-col :span="8">
							<div class="image-upload-section">
								<div class="image-upload-label">设备方位图</div>
								<el-upload
									class="image-uploader"
									:http-request="handleOrientationUpload"
									:file-list="orientationFileList"
									list-type="picture-card"
									:on-preview="handlePicturePreview"
									:on-remove="handleOrientationRemove"
									accept="image/*"
								>
									<el-icon><Plus /></el-icon>
								</el-upload>
							</div>
						</el-col>
						<el-col :span="8">
							<div class="image-upload-section">
								<div class="image-upload-label">设备主要附属物</div>
								<el-upload
									class="image-uploader"
									:http-request="handleAccessoryUpload"
									:file-list="accessoryFileList"
									list-type="picture-card"
									:on-preview="handlePicturePreview"
									:on-remove="handleAccessoryRemove"
									accept="image/*"
								>
									<el-icon><Plus /></el-icon>
								</el-upload>
							</div>
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

<script setup name="equipmentInfoAdd">
import { ref, reactive, getCurrentInstance, watch, onMounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Select from '@/components/Select'
import equipmentTypeApi from '@/api/equipment/equipmentType/index'
import { getListByLevel } from '@/api/system/dept'
import publicApi from '@/api/public/index'

const props = defineProps({
	readonly: {
		type: Boolean,
		default: false,
	},
})

const { proxy } = getCurrentInstance()
const ruleForm = ref()
const activeNames = ref(['basic', 'supply', 'finance', 'attachment'])

// 设备类型树形数据
const equipmentTypeTreeData = ref([])

// 部门列表
const deptList = ref([])

// 负责人列表
const userList = ref([])

// 图片上传列表
const panoramaFileList = ref([]) // 设备全景图
const orientationFileList = ref([]) // 设备方位图
const accessoryFileList = ref([]) // 设备主要附属物
const previewImageUrl = ref('') // 预览图片URL
const previewVisible = ref(false) // 预览对话框显示状态

const formData = reactive({
	id: null,
	equipCode: '',
	equipName: '',
	equipBigCategoryId: null,
	equipBigCategoryName: '',
	equipMiddleCategoryId: null,
	equipMiddleCategoryName: '',
	equipSmallCategoryId: null,
	equipSmallCategoryName: '',
	specificCode: '',
	modelNumber: '',
	equipSystemCode: '',
	equipTechState: null,
	equipTechStateName: '',
	equipState: null,
	equipStateName: '',
	unit: null,
	unitName: '',
	insuranceDate: '',
	useOrgId: null,
	responsiCode: null,
	isParticular: '0',
	remark: '',
	sourceType: null,
	sourceTypeName: '',
	factoryNumber: '',
	equipWeight: null,
	purchaseTime: '',
	usageTime: '',
	supplierUnit: '',
	manufacturer: '',
	emissionStandard: '',
	enginePower: null,
	assetsNo: '',
	originalValue: null,
	depreciationPeriod: null,
	depreciatedPeriod: null,
	// 特种设备信息
	particularRegistrationCode: '',
	specialDiscoverCycle: null,
	certifiType: null,
	certifiTypeName: '',
	certifiCode: '',
	releaseDate: '',
	certifiUser: '',
	expireDate: '',
	validDate: null,
	certifiState: null,
	specialRemark: '',
	// 附件与照片
	panoramaImageIds: [], // 设备全景图文件ID列表
	orientationImageIds: [], // 设备方位图文件ID列表
	accessoryImageIds: [], // 设备主要附属物文件ID列表
})

const rules = reactive({
	equipCode: proxy.getRules({ required: true }),
	equipName: proxy.getRules({ required: true }),
	equipBigCategoryId: proxy.getRules({ required: true }),
	equipMiddleCategoryId: proxy.getRules({ required: true }),
	equipSmallCategoryId: proxy.getRules({ required: true }),
	specificCode: proxy.getRules({ required: true }),
	modelNumber: proxy.getRules({ required: true }),
	sourceType: proxy.getRules({ required: true }),
	equipTechState: proxy.getRules({ required: true }),
	equipState: proxy.getRules({ required: true }),
	unit: proxy.getRules({ required: true }),
	useOrgId: proxy.getRules({ required: true }),
	responsiCode: proxy.getRules({ required: true }),
	purchaseTime: proxy.getRules({ required: true }),
	usageTime: proxy.getRules({ required: true }),
	originalValue: proxy.getRules({ required: true }),
	// 特种设备信息字段验证
	particularRegistrationCode: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (!value || value.trim() === '')) {
					callback(new Error('特种设备注册码不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	specialDiscoverCycle: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (value === null || value === undefined || value === '')) {
					callback(new Error('检查周期(月)不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	certifiType: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (value === null || value === undefined || value === '')) {
					callback(new Error('证书类别不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	certifiCode: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (!value || value.trim() === '')) {
					callback(new Error('证书编号不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	releaseDate: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (!value || value.trim() === '')) {
					callback(new Error('发布时间不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
	expireDate: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (!value || value.trim() === '')) {
					callback(new Error('到期时间不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
	validDate: [
		{
			validator: (rule, value, callback) => {
				if (formData.isParticular == '1' && (value === null || value === undefined || value === '')) {
					callback(new Error('有效期（月）不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
})

// 加载设备类型树形数据
const loadEquipmentTypeTree = () => {
	equipmentTypeApi.getTree().then(res => {
		if (res.code == '0000') {
			equipmentTypeTreeData.value = res.data || []
		}
	})
}

// 递归查找树节点
const findTreeNode = (tree, id) => {
	for (const node of tree) {
		if (node.id === id) {
			return node
		}
		if (node.children && node.children.length > 0) {
			const found = findTreeNode(node.children, id)
			if (found) {
				return found
			}
		}
	}
	return null
}

// 处理设备类型选择变化
const handleEquipmentTypeChange = (value) => {
	if (!value) {
		// 清空所有设备类型字段
		formData.equipBigCategoryId = null
		formData.equipBigCategoryName = ''
		formData.equipMiddleCategoryId = null
		formData.equipMiddleCategoryName = ''
		formData.equipSmallCategoryId = null
		formData.equipSmallCategoryName = ''
		return
	}

	// 先验证选择的是否为小类（categoryLevel为3）
	const selectedNode = findTreeNode(equipmentTypeTreeData.value, value)
	if (!selectedNode) {
		proxy.$message.warning('请选择设备小类')
		formData.equipSmallCategoryId = null
		return
	}

	if (selectedNode.categoryLevel !== 3) {
		proxy.$message.warning('只能选择设备小类，请重新选择')
		formData.equipSmallCategoryId = null
		return
	}

	// 调用接口获取完整路径
	equipmentTypeApi.getPathBySmallCategoryId(value).then(res => {
		if (res.code == '0000') {
			const pathData = res.data
			formData.equipBigCategoryId = pathData.equipBigCategoryId
			formData.equipBigCategoryName = pathData.equipBigCategoryName || ''
			formData.equipMiddleCategoryId = pathData.equipMiddleCategoryId
			formData.equipMiddleCategoryName = pathData.equipMiddleCategoryName || ''
			formData.equipSmallCategoryId = pathData.equipSmallCategoryId
			formData.equipSmallCategoryName = pathData.equipSmallCategoryName || ''
		} else {
			proxy.$message.error(res.msg || '获取设备类型信息失败')
			// 选择失败，清空选择
			formData.equipSmallCategoryId = null
		}
	}).catch(error => {
		proxy.$message.error('获取设备类型信息失败')
		// 选择失败，清空选择
		formData.equipSmallCategoryId = null
	})
}

// 加载部门列表（DEPT_LEVEL=2）
const loadDeptList = () => {
	getListByLevel(2).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
		}
	})
}

// 加载负责人列表（根据部门ID）
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

// 部门变化时，清空负责人并重新加载负责人列表
const handleDeptChange = () => {
	formData.responsiCode = null
	if (formData.useOrgId) {
		loadUserList(formData.useOrgId)
	} else {
		userList.value = []
	}
}

// 计算已折旧期限
const calculateDepreciatedPeriod = () => {
	if (!formData.purchaseTime) {
		formData.depreciatedPeriod = null
		return
	}
	const purchaseDate = new Date(formData.purchaseTime)
	const currentDate = new Date()
	const yearDiff = currentDate.getFullYear() - purchaseDate.getFullYear()
	const monthDiff = currentDate.getMonth() - purchaseDate.getMonth()
	const totalMonths = yearDiff * 12 + monthDiff
	let months = totalMonths
	if (currentDate.getDate() < purchaseDate.getDate()) {
		months = totalMonths - 1
	}
	formData.depreciatedPeriod = Math.max(1, months + 1)
}

// 计算有效期
const calculateValidDate = () => {
	if (!formData.releaseDate || !formData.expireDate) {
		formData.validDate = null
		return
	}
	const releaseDate = new Date(formData.releaseDate)
	const expireDate = new Date(formData.expireDate)
	if (expireDate < releaseDate) {
		formData.validDate = null
		return
	}
	const yearDiff = expireDate.getFullYear() - releaseDate.getFullYear()
	const monthDiff = expireDate.getMonth() - releaseDate.getMonth()
	const totalMonths = yearDiff * 12 + monthDiff
	let months = totalMonths
	if (expireDate.getDate() < releaseDate.getDate()) {
		months--
	}
	formData.validDate = Math.max(1, months)
}

// 监听isParticular变化
watch(
	() => formData.isParticular,
	newVal => {
		if (newVal != '1') {
			formData.particularRegistrationCode = ''
			formData.specialDiscoverCycle = null
			formData.certifiType = null
			formData.certifiTypeName = ''
			formData.certifiCode = ''
			formData.releaseDate = ''
			formData.certifiUser = ''
			formData.expireDate = ''
			formData.validDate = null
			formData.certifiState = null
			formData.specialRemark = ''
			// 如果不是特种设备，从展开列表中移除
			const index = activeNames.value.indexOf('special')
			if (index > -1) {
				activeNames.value.splice(index, 1)
			}
		} else {
			// 如果是特种设备，确保展开
			if (activeNames.value.indexOf('special') === -1) {
				activeNames.value.push('special')
			}
		}
		nextTick(() => {
			if (ruleForm.value) {
				ruleForm.value.validateField([
					'particularRegistrationCode',
					'specialDiscoverCycle',
					'certifiType',
					'certifiCode',
					'releaseDate',
					'expireDate',
					'validDate',
				], () => {})
			}
		})
	}
)


// 监听formData.useOrgId变化
watch(
	() => formData.useOrgId,
	newVal => {
		if (newVal && !userList.value.length) {
			loadUserList(newVal)
		}
	}
)

// 监听formData.purchaseTime变化
watch(
	() => formData.purchaseTime,
	() => {
		calculateDepreciatedPeriod()
	}
)

// 设备全景图上传
const handlePanoramaUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'EQUIPMENT_PANORAMA')

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 添加到ID列表
				if (!formData.panoramaImageIds) {
					formData.panoramaImageIds = []
				}
				formData.panoramaImageIds.push(uploadedFile.id)
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				panoramaFileList.value.push({
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

// 设备方位图上传
const handleOrientationUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'EQUIPMENT_ORIENTATION')

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 添加到ID列表
				if (!formData.orientationImageIds) {
					formData.orientationImageIds = []
				}
				formData.orientationImageIds.push(uploadedFile.id)
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				orientationFileList.value.push({
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

// 设备主要附属物上传
const handleAccessoryUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'EQUIPMENT_ACCESSORY')

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 添加到ID列表
				if (!formData.accessoryImageIds) {
					formData.accessoryImageIds = []
				}
				formData.accessoryImageIds.push(uploadedFile.id)
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				accessoryFileList.value.push({
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

// 删除设备全景图
const handlePanoramaRemove = (file) => {
	if (file && file.id) {
		// 从ID列表中移除
		if (formData.panoramaImageIds) {
			const index = formData.panoramaImageIds.indexOf(file.id)
			if (index > -1) {
				formData.panoramaImageIds.splice(index, 1)
			}
		}
		// 从文件列表中移除
		const fileIndex = panoramaFileList.value.findIndex(item => item.id === file.id)
		if (fileIndex > -1) {
			panoramaFileList.value.splice(fileIndex, 1)
		}
	}
}

// 删除设备方位图
const handleOrientationRemove = (file) => {
	if (file && file.id) {
		// 从ID列表中移除
		if (formData.orientationImageIds) {
			const index = formData.orientationImageIds.indexOf(file.id)
			if (index > -1) {
				formData.orientationImageIds.splice(index, 1)
			}
		}
		// 从文件列表中移除
		const fileIndex = orientationFileList.value.findIndex(item => item.id === file.id)
		if (fileIndex > -1) {
			orientationFileList.value.splice(fileIndex, 1)
		}
	}
}

// 删除设备主要附属物
const handleAccessoryRemove = (file) => {
	if (file && file.id) {
		// 从ID列表中移除
		if (formData.accessoryImageIds) {
			const index = formData.accessoryImageIds.indexOf(file.id)
			if (index > -1) {
				formData.accessoryImageIds.splice(index, 1)
			}
		}
		// 从文件列表中移除
		const fileIndex = accessoryFileList.value.findIndex(item => item.id === file.id)
		if (fileIndex > -1) {
			accessoryFileList.value.splice(fileIndex, 1)
		}
	}
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
		}
	})
	return flag
}

const resetForm = () => {
	ruleForm.value?.resetFields()
	Object.keys(formData).forEach(key => {
		if (key === 'id') {
			formData[key] = null
		} else if (key === 'isParticular') {
			formData[key] = '0'
		} else if (key === 'panoramaImageIds' || key === 'orientationImageIds' || key === 'accessoryImageIds') {
			// 图片ID列表保持为空数组
			formData[key] = []
		} else if (typeof formData[key] === 'number') {
			formData[key] = null
		} else if (Array.isArray(formData[key])) {
			// 其他数组字段也保持为空数组
			formData[key] = []
		} else {
			formData[key] = ''
		}
	})
	// 清空图片列表
	panoramaFileList.value = []
	orientationFileList.value = []
	accessoryFileList.value = []
}

const loadEditCategoryData = () => {
	// 如果已有小类ID，调用接口获取完整路径
	if (formData.equipSmallCategoryId) {
		equipmentTypeApi.getPathBySmallCategoryId(formData.equipSmallCategoryId).then(res => {
			if (res.code == '0000') {
				const pathData = res.data
				formData.equipBigCategoryId = pathData.equipBigCategoryId
				formData.equipBigCategoryName = pathData.equipBigCategoryName || ''
				formData.equipMiddleCategoryId = pathData.equipMiddleCategoryId
				formData.equipMiddleCategoryName = pathData.equipMiddleCategoryName || ''
				formData.equipSmallCategoryId = pathData.equipSmallCategoryId
				formData.equipSmallCategoryName = pathData.equipSmallCategoryName || ''
			}
		})
	}
	if (formData.useOrgId) {
		loadUserList(formData.useOrgId)
	}
}

onMounted(() => {
	loadEquipmentTypeTree()
	loadDeptList()
	loadEditCategoryData()
	if (formData.purchaseTime) {
		calculateDepreciatedPeriod()
	}
	if (formData.releaseDate && formData.expireDate) {
		calculateValidDate()
	}
})

defineExpose({
	formData,
	validate,
	resetForm,
	loadEditCategoryData,
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/formData.scss';

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

