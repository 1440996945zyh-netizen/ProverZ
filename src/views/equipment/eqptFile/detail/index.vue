<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="设备名称" prop="equipId">
				<Select
					:dataConfig="{ params: { type: 'EQUIPMENT' } }"
					v-model:value="formData.equipId"
					v-model:label="formData.equipName"
					placeholder="请选择设备（可搜索）"
					@change="handleEquipmentChange"
				/>
			</el-form-item>

			<el-form-item label="资料类型" prop="dataTypeCode">
				<Select
					:dataConfig="{ url: '/api/internal/public/getDictListByType/FILE_TYPE' }"
					v-model:value="formData.dataTypeCode"
					v-model:label="formData.dataTypeName"
					placeholder="请选择资料类型"
				/>
			</el-form-item>

			<el-form-item label="文件上传" prop="fileIds">
				<Upload 
					:key="`upload-${formData.id || 'new'}`"
					businessType="E_M_EQPT_FILE" 
					:businessId="formData.id ? String(formData.id) : ''" 
					:maxCount="1"
					@changeFile="changeFile" 
				/>
			</el-form-item>

			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="eqptFileDetail">
import { ref, reactive, getCurrentInstance, toRefs, watch, computed } from 'vue'
import Upload from '@/components/upload'
import Select from '@/components/Select'
import equipmentInfoApi from '@/api/equipment/equipmentInfo/index'

const props = defineProps({
	formData: {
		type: Object,
		default: null,
	},
})

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		equipId: null,
		equipName: '',
		dataTypeCode: '',
		dataTypeName: '',
		fileTableId: null,
		remark: '',
		fileIds: [], // 文件ID列表
	},
})
const { formData } = toRefs(data)

// 计算businessId，确保响应式更新
const businessId = computed(() => {
	return formData.value.id ? String(formData.value.id) : ''
})

const rules = reactive({
	equipId: proxy.getRules({ required: true }),
	dataTypeCode: proxy.getRules({ required: true }),
	// 资料类型NAME通过字典选择自动填充，不需要单独验证
	fileIds: [
		{
			validator: (rule, value, callback) => {
				if (!value || value.length === 0) {
					callback(new Error('请上传文件'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
})

// 设置表单数据
const setFormData = data => {
	if (data) {
		formData.value.id = data.id || null
		formData.value.equipId = data.equipId || null
		formData.value.equipName = data.equipName || ''
		formData.value.dataTypeCode = data.dataTypeCode || ''
		formData.value.dataTypeName = data.dataTypeName || ''
		formData.value.fileTableId = data.fileTableId || null
		formData.value.remark = data.remark || ''
		// 如果有文件ID，需要触发文件列表加载（Upload组件会自动加载）
		// fileIds会在Upload组件加载文件后自动更新，这里不需要手动设置
	}
}

// 监听外部传入的formData
if (props.formData) {
	watch(
		() => props.formData,
		newVal => {
			if (newVal) {
				setFormData(newVal)
			}
		},
		{ immediate: true, deep: true }
	)
}

// 处理设备选择变化
const handleEquipmentChange = item => {
	if (item && item.value) {
		// 根据设备ID查询设备编码（如果需要）
		equipmentInfoApi.getById(item.value).then(res => {
			if (res.code == '0000' && res.data) {
				// 可以在这里保存设备编码等信息，如果需要的话
				// formData.value.equipCode = res.data.equipCode || ''
			}
		}).catch(() => {
			// 查询失败不影响
		})
	}
}

// 文件上传变化事件
const changeFile = files => {
	// files是文件ID数组，限制只能有一个文件
	const fileArray = files || []
	// 如果超过1个文件，只保留第一个
	if (fileArray.length > 1) {
		formData.value.fileIds = [fileArray[0]]
		formData.value.fileTableId = fileArray[0]
	} else {
		formData.value.fileIds = fileArray
		// 取第一个作为fileTableId（兼容旧逻辑）
		if (fileArray.length > 0) {
			formData.value.fileTableId = fileArray[0]
		} else {
			formData.value.fileTableId = null
		}
	}
	// 触发表单验证
	ruleForm.value?.validateField('fileIds')
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
	// 逐个属性重置，保持响应式
	formData.value.id = null
	formData.value.equipId = null
	formData.value.equipName = ''
	formData.value.dataTypeCode = ''
	formData.value.dataTypeName = ''
	formData.value.fileTableId = null
	formData.value.remark = ''
	formData.value.fileIds = []
	ruleForm.value?.clearValidate()
}

defineExpose({
	validate,
	resetForm,
	setFormData,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>

