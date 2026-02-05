<template>
	<div class="special-info">
		<el-form :model="localFormData" ref="ruleForm" :rules="rules" label-position="top" :inline="true" :disabled="readonly">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="特种设备信息" name="special">
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="特种设备注册码" prop="particularRegistrationCode" :required="localFormData.isParticular == '1'" class="form-table-item">
								<el-input v-model="localFormData.particularRegistrationCode" placeholder="特种设备注册码" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="证书类别" prop="certifiType" :required="localFormData.isParticular == '1'" class="form-table-item">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'E_ZS_TYPE' } }"
									v-model:value="localFormData.certifiType"
									v-model:label="localFormData.certifiTypeName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="证书编号" prop="certifiCode" :required="localFormData.isParticular == '1'" class="form-table-item">
								<el-input v-model="localFormData.certifiCode" placeholder="证书编号" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="发布时间" prop="releaseDate" :required="localFormData.isParticular == '1'" class="form-table-item">
								<el-date-picker
									v-model="localFormData.releaseDate"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
									@change="calculateValidDate"
								/>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="到期时间" prop="expireDate" :required="localFormData.isParticular == '1'" class="form-table-item">
								<el-date-picker
									v-model="localFormData.expireDate"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
									@change="calculateValidDate"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="有效期（月）" prop="validDate" :required="localFormData.isParticular == '1'" class="form-table-item">
								<el-input-number v-model="localFormData.validDate" placeholder="有效期（月）" style="width: 100%" :min="0" :readonly="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="检查周期(月)" prop="specialDiscoverCycle" :required="localFormData.isParticular == '1'" class="form-table-item">
								<el-input-number v-model="localFormData.specialDiscoverCycle" placeholder="检查周期(月)" style="width: 100%" :min="0" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="备注" prop="specialRemark" class="form-table-item">
								<el-input v-model="localFormData.specialRemark" placeholder="备注" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
			</el-collapse>
		</el-form>

		<!-- 变更记录 -->
		<el-collapse v-model="activeNames" v-if="formData.isParticular == '1' || formData.isParticular == 1" style='margin-top: 20px'>
			<el-collapse-item title="特种设备信息历史记录" name="specialChangeLog">
				<ChangeLog v-if="formData.id" ref="specialChangeLogRef" :equipId="formData.id" changeType="SPECIAL_INFO" :readonly="readonly" :height="tableHeight" />
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup name="SpecialInfo">
import { ref, reactive, watch, onMounted, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import ChangeLog from './ChangeLog.vue'
const tableHeight = reactive(window.innerHeight - 540)
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
const activeNames = ref(['special', 'specialChangeLog'])

// 本地表单数据 - 直接使用 props.formData 的引用
const localFormData = props.formData

// 监听本地数据变化，同步到父组件
watch(() => props.formData, (newVal) => {
	emit('update:formData', newVal)
}, { deep: true })

// 验证规则
const rules = reactive({
	particularRegistrationCode: [
		{
			validator: (rule, value, callback) => {
				if (localFormData.isParticular == '1' && (!value || value.trim() === '')) {
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
				if (localFormData.isParticular == '1' && (value === null || value === undefined || value === '')) {
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
				if (localFormData.isParticular == '1' && (value === null || value === undefined || value === '')) {
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
				if (localFormData.isParticular == '1' && (!value || value.trim() === '')) {
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
				if (localFormData.isParticular == '1' && (!value || value.trim() === '')) {
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
				if (localFormData.isParticular == '1' && (!value || value.trim() === '')) {
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
				if (localFormData.isParticular == '1' && (value === null || value === undefined || value === '')) {
					callback(new Error('有效期（月）不能为空'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
})

// 计算有效期（根据发布时间和到期时间计算月份差）
const calculateValidDate = () => {
	if (!localFormData.releaseDate || !localFormData.expireDate) {
		localFormData.validDate = null
		return
	}

	const releaseDate = new Date(localFormData.releaseDate)
	const expireDate = new Date(localFormData.expireDate)

	if (expireDate < releaseDate) {
		localFormData.validDate = null
		return
	}

	const yearDiff = expireDate.getFullYear() - releaseDate.getFullYear()
	const monthDiff = expireDate.getMonth() - releaseDate.getMonth()

	const totalMonths = yearDiff * 12 + monthDiff

	let months = totalMonths
	if (expireDate.getDate() < releaseDate.getDate()) {
		months--
	}

	localFormData.validDate = Math.max(1, months)
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

// 初始化
onMounted(() => {
	if (localFormData.releaseDate && localFormData.expireDate) {
		calculateValidDate()
	}
})

const specialChangeLogRef = ref(null)

// 加载变更记录
const loadChangeLog = () => {
	nextTick(() => {
		if (specialChangeLogRef.value) {
			specialChangeLogRef.value.loadData()
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
.special-info {
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

