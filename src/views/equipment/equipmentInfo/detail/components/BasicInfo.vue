<template>
	<div class="basic-info">
		<el-form :model="localFormData" ref="ruleForm" :rules="rules" label-position="top" :inline="true" :disabled="readonly">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="设备基本信息" name="basic">
					<!-- 第一行：设备类型、设备大类、设备中类、设备编码 -->
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备类型" prop="equipSmallCategoryId" class="form-table-item">
								<el-tree-select
									style="width: 100%"
									v-model="localFormData.equipSmallCategoryId"
									:data="equipmentTypeTreeData"
									:props="{ value: 'id', label: 'typeName', children: 'children' }"
									value-key="id"
									placeholder="请选择设备小类（只能选择小类）"
									check-strictly
									:render-after-expand="false"
									filterable
									@change="handleEquipmentTypeChange"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备大类" class="form-table-item">
								<el-input v-model="localFormData.equipBigCategoryName" placeholder="设备大类" :readonly="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备中类" class="form-table-item">
								<el-input v-model="localFormData.equipMiddleCategoryName" placeholder="设备中类" :readonly="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备编码" prop="equipCode" class="form-table-item">
								<el-input v-model="localFormData.equipCode" placeholder="设备编码" />
							</el-form-item>
						</el-col>
					</el-row>
					<!-- 第二行：设备名称、规格、型号、能源类型 -->
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备名称" prop="equipName" class="form-table-item">
								<el-input v-model="localFormData.equipName" placeholder="设备名称" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备规格" prop="specificCode" class="form-table-item">
								<el-input v-model="localFormData.specificCode" placeholder="设备规格" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备型号" prop="modelNumber" class="form-table-item">
								<el-input v-model="localFormData.modelNumber" placeholder="设备型号" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="能源类型" prop="sourceType" class="form-table-item">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_ENERGY' } }"
									v-model:value="localFormData.sourceType"
									v-model:label="localFormData.sourceTypeName"
								/>
							</el-form-item>
						</el-col>
					</el-row>
					<!-- 第三行：设备技术状况、计量单位、保险期限、所属部门 -->
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备技术状况" prop="equipTechState" class="form-table-item">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_TECH' } }"
									v-model:value="localFormData.equipTechState"
									v-model:label="localFormData.equipTechStateName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="计量单位" prop="unit" class="form-table-item">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_UNIT' } }"
									v-model:value="localFormData.unit"
									v-model:label="localFormData.unitName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="保险期限" prop="insuranceDate" class="form-table-item">
								<el-date-picker
									v-model="localFormData.insuranceDate"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="所属部门" prop="useOrgId" class="form-table-item">
								<Select
									:selectData="deptList"
									v-model:value="localFormData.useOrgId"
									placeholder="请选择使用部门"
									@change="handleDeptChange"
								/>
							</el-form-item>
						</el-col>
					</el-row>
					<!-- 第四行：负责人、是否特种设备、设备状态、备注 -->
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="负责人" prop="responsiCode" class="form-table-item">
								<Select
									:selectData="userList"
									v-model:value="localFormData.responsiCode"
									:disabled="!localFormData.useOrgId"
									placeholder="请先选择使用部门"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="是否特种设备" prop="isParticular" class="form-table-item">
								<el-radio-group v-model="localFormData.isParticular">
									<el-radio label="0">否</el-radio>
									<el-radio label="1">是</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备使用状态" prop="equipState" class="form-table-item">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_STATUS' } }"
									v-model:value="localFormData.equipState"
									v-model:label="localFormData.equipStateName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="备注" prop="remark" class="form-table-item">
								<el-input v-model="localFormData.remark" placeholder="备注" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
			</el-collapse>
		</el-form>

		<!-- 变更记录 -->
		<el-collapse v-model="activeNames" style='margin-top: 20px'>
			<el-collapse-item title="设备基本信息历史记录" name="changeLog">
				<ChangeLog
					v-if="formData.id"
					ref="changeLogRef"
					:equipId="formData.id"
					changeType="BASIC_INFO"
					:readonly="readonly"
					:height="tableHeight"
				/>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup name="BasicInfo">
import { ref, reactive, watch, onMounted, getCurrentInstance, nextTick } from 'vue'
import Select from '@/components/Select'
import equipmentTypeApi from '@/api/equipment/equipmentType/index'
import { getListByLevel } from '@/api/system/dept'
import publicApi from '@/api/public/index'
import ChangeLog from './ChangeLog.vue'
const tableHeight = reactive(window.innerHeight - 700)
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

const emit = defineEmits(['update:formData'])

const { proxy } = getCurrentInstance()
const ruleForm = ref(null)
const activeNames = ref(['basic', 'changeLog'])

// 本地表单数据 - 直接使用 props.formData 的引用，避免数据不同步
const localFormData = props.formData

// 监听本地数据变化，同步到父组件
watch(() => props.formData, (newVal) => {
	emit('update:formData', newVal)
}, { deep: true })

// 设备类型树
const equipmentTypeTreeData = ref([])

// 部门列表
const deptList = ref([])

// 负责人列表
const userList = ref([])

// 验证规则
const rules = reactive({
	equipCode: proxy.getRules({ required: true }),
	equipName: proxy.getRules({ required: true }),
	equipSmallCategoryId: proxy.getRules({ required: true }),
	specificCode: proxy.getRules({ required: true }),
	modelNumber: proxy.getRules({ required: true }),
	sourceType: proxy.getRules({ required: true }),
	equipTechState: proxy.getRules({ required: true }),
	equipState: proxy.getRules({ required: true }),
	unit: proxy.getRules({ required: true }),
	useOrgId: proxy.getRules({ required: true }),
	responsiCode: proxy.getRules({ required: true }),
})

// 加载设备类型树
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

const resetEquipmentTypeFields = () => {
	localFormData.equipBigCategoryId = null
	localFormData.equipBigCategoryName = ''
	localFormData.equipMiddleCategoryId = null
	localFormData.equipMiddleCategoryName = ''
	localFormData.equipSmallCategoryName = ''
}

const applyEquipmentTypePath = pathData => {
	localFormData.equipBigCategoryId = pathData.equipBigCategoryId || null
	localFormData.equipBigCategoryName = pathData.equipBigCategoryName || ''
	localFormData.equipMiddleCategoryId = pathData.equipMiddleCategoryId || null
	localFormData.equipMiddleCategoryName = pathData.equipMiddleCategoryName || ''
	localFormData.equipSmallCategoryId = pathData.equipSmallCategoryId || null
	localFormData.equipSmallCategoryName = pathData.equipSmallCategoryName || localFormData.equipSmallCategoryName || ''
}

const loadEquipmentTypePath = smallCategoryId => {
	if (!smallCategoryId) {
		resetEquipmentTypeFields()
		return
	}
	equipmentTypeApi.getPathBySmallCategoryId(smallCategoryId).then(res => {
		if (res.code == '0000' && res.data) {
			applyEquipmentTypePath(res.data)
		} else {
			proxy.$message.error(res.msg || '获取设备类型信息失败')
			localFormData.equipSmallCategoryId = null
			resetEquipmentTypeFields()
		}
	}).catch(() => {
		proxy.$message.error('获取设备类型信息失败')
		localFormData.equipSmallCategoryId = null
		resetEquipmentTypeFields()
	})
}

// 选择设备类型（仅允许选择小类）
const handleEquipmentTypeChange = value => {
	if (!value) {
		localFormData.equipSmallCategoryId = null
		resetEquipmentTypeFields()
		return
	}
	const selectedNode = findTreeNode(equipmentTypeTreeData.value, value)
	if (!selectedNode || selectedNode.categoryLevel !== 3) {
		proxy.$message.warning('只能选择设备小类，请重新选择')
		localFormData.equipSmallCategoryId = null
		return
	}
	localFormData.equipSmallCategoryName = selectedNode.typeName || ''
	loadEquipmentTypePath(value)
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
	localFormData.responsiCode = null
	if (localFormData.useOrgId) {
		loadUserList(localFormData.useOrgId)
	} else {
		userList.value = []
	}
}

// 验证表单
const validate = async () => {
	if (!ruleForm.value) return true
	return new Promise((resolve) => {
		ruleForm.value.validate((valid) => {
			resolve(valid)
		})
	})
}

// 重置表单
const resetForm = () => {
	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}

// 加载编辑时的下拉列表数据
const loadEditCategoryData = () => {
	if (localFormData.equipSmallCategoryId) {
		loadEquipmentTypePath(localFormData.equipSmallCategoryId)
	}
	if (localFormData.useOrgId) {
		loadUserList(localFormData.useOrgId)
	}
}

// 监听formData.useOrgId变化，用于编辑时加载负责人列表
watch(
	() => localFormData.useOrgId,
	newVal => {
		if (newVal && !userList.value.length) {
			loadUserList(newVal)
		}
	}
)

// 初始化
onMounted(() => {
	loadEquipmentTypeTree()
	loadDeptList()
	loadEditCategoryData()
})

const changeLogRef = ref(null)

// 加载变更记录
const loadChangeLog = () => {
	nextTick(() => {
		if (changeLogRef.value) {
			changeLogRef.value.loadData()
		}
	})
}

defineExpose({
	validate,
	resetForm,
	loadChangeLog
})
</script>

<style scoped lang="scss">
.basic-info {
	padding: 0;

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

	:deep(.el-collapse-item__content) {
		padding: 10px;
	}

	:deep(.el-collapse-item__header.is-active),
	:deep(.el-collapse-item__header) {
		border-bottom: 1px solid #ebeef5;
		background-color: #fafafa;
		padding: 10px;
		font-size: 13px;
	}

	.form-table-row {
		border: 1px solid #dcdfe6;
		border-bottom: none;

		&:last-child {
			border-bottom: 1px solid #dcdfe6;
		}
	}

	.form-table-col {
		border-right: 1px solid #dcdfe6;

		&:last-child {
			border-right: none;
		}
	}

	.form-table-item {
		margin-bottom: 0;
		padding: 12px;
		border-bottom: 1px solid #dcdfe6;

		&:last-child {
			border-bottom: none;
		}

		:deep(.el-form-item__label) {
			font-weight: 500;
			color: #606266;
			margin-bottom: 8px;
		}

		:deep(.el-form-item__content) {
			line-height: 32px;
		}
	}
}
</style>
