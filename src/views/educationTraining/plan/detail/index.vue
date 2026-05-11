<template>
	<div class="formData">
		<el-form ref="ruleForm" :model="formData" :rules="rules" label-position="top" label-width="120px">
			<el-row :gutter="24">
				<el-col :span="8">
					<el-form-item label="计划编号">
						<el-input v-model="formData.planCode" disabled placeholder="系统自动生成" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="培训计划名称" prop="planName">
						<el-input v-model="formData.planName" placeholder="请输入培训计划名称" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="负责人" prop="chargeUserId">
						<el-select v-model="formData.chargeUserId" filterable placeholder="请选择负责人">
							<el-option v-for="item in chargeUserOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="培训开始时间" prop="trainStartTime">
						<el-date-picker
							v-model="formData.trainStartTime"
							type="datetime"
							format="YYYY-MM-DD HH:mm"
							value-format="YYYY-MM-DD HH:mm"
							placeholder="请选择培训开始时间"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="培训结束时间" prop="trainEndTime">
						<el-date-picker
							v-model="formData.trainEndTime"
							type="datetime"
							format="YYYY-MM-DD HH:mm"
							value-format="YYYY-MM-DD HH:mm"
							placeholder="请选择培训结束时间"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="考核时间" prop="examTime">
						<el-date-picker
							v-model="formData.examTime"
							type="datetime"
							format="YYYY-MM-DD HH:mm"
							value-format="YYYY-MM-DD HH:mm"
							placeholder="请选择考核时间"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="培训部门" prop="trainDeptId">
						<el-tree-select
							v-model="formData.trainDeptId"
							:data="deptTree"
							:props="deptProps"
							check-strictly
							filterable
							node-key="id"
							placeholder="请选择培训部门"
							@change="handleTrainDeptChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="参与人员" prop="participantIds">
						<el-select
							v-model="formData.participantIds"
							multiple
							filterable
							collapse-tags
							collapse-tags-tooltip
							:disabled="!formData.trainDeptId"
							placeholder="请先选择培训部门"
						>
							<el-option v-for="item in participantOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="考核人员" prop="examinerIds">
						<el-select v-model="formData.examinerIds" multiple filterable collapse-tags collapse-tags-tooltip placeholder="请选择考核人员">
							<el-option v-for="item in examinerOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="状态" prop="status">
						<el-select v-model="formData.status" placeholder="请选择状态">
							<el-option label="启用" value="1" />
							<el-option label="停用" value="0" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="备注">
						<el-input v-model="formData.remark" placeholder="请输入备注" />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="培训内容" prop="trainContent">
						<el-input v-model="formData.trainContent" type="textarea" :rows="3" placeholder="请输入培训内容" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="educationTrainingPlanDetail">
import { ref, reactive } from 'vue'
import api from '@/api/educationTraining/plan/index'

const ruleForm = ref(null)
const deptTree = ref([])
const chargeUserOptions = ref([])
const participantOptions = ref([])
const examinerOptions = ref([])

const deptProps = {
	children: 'childrenList',
	label: 'deptName',
	value: 'id',
}

const emptyForm = () => ({
	id: '',
	planCode: '',
	planName: '',
	trainContent: '',
	trainDeptId: '',
	trainDeptName: '',
	trainStartTime: '',
	trainEndTime: '',
	examTime: '',
	chargeUserId: '',
	chargeUserName: '',
	status: '1',
	remark: '',
	participantIds: [],
	examinerIds: [],
})

const formData = ref(emptyForm())

const requiredArray = message => ({
	required: true,
	validator: (rule, value, callback) => {
		if (!value || value.length === 0) callback(new Error(message))
		else callback()
	},
	trigger: 'change',
})

const rules = reactive({
	planName: [{ required: true, message: '请输入培训计划名称', trigger: 'blur' }],
	trainDeptId: [{ required: true, message: '请选择培训部门', trigger: 'change' }],
	trainStartTime: [{ required: true, message: '请选择培训开始时间', trigger: 'change' }],
	trainEndTime: [{ required: true, message: '请选择培训结束时间', trigger: 'change' }],
	examTime: [{ required: true, message: '请选择考核时间', trigger: 'change' }],
	chargeUserId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
	status: [{ required: true, message: '请选择状态', trigger: 'change' }],
	participantIds: [requiredArray('请选择参与人员')],
	examinerIds: [requiredArray('请选择考核人员')],
})

const normalizeMinute = value => {
	return value ? String(value).slice(0, 16) : ''
}

const applyFormData = data => {
	formData.value = {
		...emptyForm(),
		...data,
		trainStartTime: normalizeMinute(data.trainStartTime),
		trainEndTime: normalizeMinute(data.trainEndTime),
		examTime: normalizeMinute(data.examTime),
		participantIds: (data.participantIds || []).map(String),
		examinerIds: (data.examinerIds || []).map(String),
	}
	deptTree.value = data.deptTree || []
	chargeUserOptions.value = data.chargeUserOptions || []
	participantOptions.value = data.participantOptions || []
	examinerOptions.value = data.examinerOptions || []
}

const resetForm = async () => {
	const res = await api.getFormInit()
	applyFormData(res.data || {})
	if (ruleForm.value) ruleForm.value.clearValidate()
}

const setData = async data => {
	applyFormData(data || {})
}

const handleTrainDeptChange = async value => {
	formData.value.participantIds = []
	participantOptions.value = []
	if (!value) return
	const res = await api.getParticipantOptions({ trainDeptId: value })
	participantOptions.value = res.data || []
	if (ruleForm.value) ruleForm.value.validateField('participantIds')
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate(valid => {
		flag = valid
	})
	return flag
}

defineExpose({
	formData,
	resetForm,
	setData,
	validate,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
