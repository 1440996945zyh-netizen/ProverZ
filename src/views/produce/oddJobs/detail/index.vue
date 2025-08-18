<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" :rules="rules">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="零工申请" name="oddJobs">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="作业公司" prop="companyId">
								<Select
									:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
									v-model:value="formData.companyId"
									v-model:label="formData.companyName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="日期" prop="workDate">
								<el-date-picker
									v-model="formData.workDate"
									type="date"
									placeholder="日期"
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									:size="size"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="班次" prop="classCode">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } }"
									v-model:value="formData.classCode"
									v-model:label="formData.className"
								/>
							</el-form-item>
						</el-col>
						<el-form-item label="零工类型" prop="reshipmentTypeCode">
							<el-radio-group v-model="formData.reshipmentTypeCode" class="ml-4" @change="dataClear">
								<el-radio label="1" size="large">客户要求</el-radio>
								<el-radio label="2" size="large">内部零工</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6" v-if="formData.reshipmentTypeCode == 1">
							<el-form-item label="作业指令" prop="trustNo">
								<el-input
									v-model="formData.trustNo"
									@click="clickTrustNo()"
									:disabled="false"
									placeholder="请选择作业指令"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="作业过程" prop="processName">
								<Select
									:dataConfig="{ params: { type: 'MAIN_WORK_PROCESS', planTypeCode: '4' } }"
									v-model:value="formData.processCode"
									v-model:label="formData.processName"
								/>
							</el-form-item>
						</el-col>

						<el-col :span="6">
							<el-form-item label="计划件数" prop="quantityPlan">
								<el-input
									v-model="formData.quantityPlan"
									placeholder="计划件数"
									@input="formData.quantityPlan = proxy.verify('number', formData.quantityPlan)"
								/>
							</el-form-item>
						</el-col>

						<el-col :span="6">
							<el-form-item label="计划重量" prop="tonPlan">
								<el-input v-model="formData.tonPlan" placeholder="计划重量" />
							</el-form-item>
						</el-col>
					</el-row>

					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="计划开工时间" prop="startTimePlan">
								<el-date-picker
									format="YYYY-MM-DD HH:mm"
									v-model="formData.startTimePlan"
									type="datetime"
									placeholder="计划开工时间"
									value-format="YYYY-MM-DD HH:mm"
								/>
							</el-form-item>
						</el-col>

						<el-col :span="6">
							<el-form-item label="计划完工时间" prop="endTimePlan">
								<el-date-picker
									format="YYYY-MM-DD HH:mm"
									v-model="formData.endTimePlan"
									type="datetime"
									placeholder="计划完工时间"
									value-format="YYYY-MM-DD HH:mm"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="船名航次" prop="shipvoyageItemId">
								<RemoteSelect type="VOYAGE" v-model:value="formData.shipvoyageItemId" @change="remoteChange" />
							</el-form-item>
						</el-col>

						<el-col :span="6">
							<el-form-item label="货种" prop="cargoCategoryCode">
								<RemoteSelect
									type="CARGO_CATEGORY"
									v-model:value="formData.cargoCategoryCode"
									v-model:label="formData.cargoCategoryName"
								/>
							</el-form-item>
						</el-col>

						<el-col :span="6">
							<el-form-item label="作业要求" prop="remark">
								<el-input v-model="formData.remark" placeholder="请输入作业要求" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
				<el-collapse-item title="机械类型信息" name="mechanicalType">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="申请机械" prop="equipmentNamesBack">
								<MechanicalType
									ref="MechanicalTypeRef"
									v-model:value="formData.equipmentNamesBack"
									:workPlanId="formData.id"
									@change="changeMechanical"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="申请装卸队量(人)" prop="laborNum">
								<el-input
									v-model="formData.laborNum"
									placeholder="申请装卸队量(人)"
									@input="formData.laborNum = proxy.verify('number', formData.laborNum)"
								/>
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
			</el-collapse>
		</el-form>
		<instructionsImport
			ref="instructionsImportRef"
			v-model:value="formData.trustNo"
			:trustType="4"
			:permission="'storage:transportApply:add'"
			@change="instructionsChange"
		/>
	</div>
</template>

<script setup name="oddJobs">
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import MechanicalType from '@/businessComponents/MechanicalType/index.vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue'

const ruleForm = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const workPlanId = ref(null)
// 校验规则
const rules = ref({
	companyId: proxy.getRules({ required: true }),
	classCode: proxy.getRules({ required: true }),
	workDate: proxy.getRules({ required: true }),
	quantityPlan: proxy.getRules({
		numberCheck: {
			int: 8,
		},
	}),
	laborNum: proxy.getRules({
		numberCheck: {
			int: 2,
		},
	}),
	remark: proxy.getRules({
		length: '1-200',
	}),
	tonPlan: proxy.getRules({
		numberCheck: {
			int: 7,
			dec: 4,
		},
	}),
	times: proxy.getRules({ required: true }),
	processName: proxy.getRules({ required: true }),
})
const activeNames = reactive(['oddJobs', 'mechanicalType']) //控制默认展开
const formData = reactive({
	id: '',
	companyId: '',
	companyName: '',
	workDate: '',
	classCode: '',
	className: '',
	startTimePlan: '',
	endTimePlan: '',
	startWorkTime: '',
	endWorkTime: '',
	processCode: '',
	processName: '',
	quantityPlan: '',
	tonPlan: '',
	shipvoyageId: '',
	shipvoyageItemId: '',
	cargoCategoryCode: '',
	busCargoInfoId: '', //票货信息
	cargoCategoryName: '',
	remark: '',
	equipmentNamesBack: '',
	laborNum: null,
	equmentListBack: [], //机械参数集合
	reshipmentTypeCode: '', //零工类型
	trustNo: '', //作业指令
})
const validate = async () => {
	let flags = false
	await ruleForm.value.validate(valid => {
		if (valid) {
			flags = true
		} else {
			flags = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flags
}
const instructDrawerVisible = ref(false) //作业指令组件抽屉
//作业指令
const instructionsChange = e => {
	console.log('111111', e)
	if (e.trustNo) {
		instructDrawerVisible.value = false
		formData.trustId = e.id
		formData.processCode = e.processCode
		formData.processName = e.processName
		formData.quantityPlan = e.planQuantity
    formData.tonPlan = e.planTon
		formData.shipvoyageId = e.shipvoyageId
		formData.shipvoyageItemId = e.shipvoyageItemId
    formData.remark = e.remark
    formData.startTimePlan = e.startTime
    formData.endTimePlan = e.endTime
	} else {
		formData.trustId = ''
		formData.processCode = ''
		formData.processName = ''
		formData.quantityPlan = ''
		formData.tonPlan = ''
		formData.shipvoyageId = ''
		formData.shipvoyageItemId = ''
	}
}
const instructionsImportRef = ref({})
const clickTrustNo = () => {
	nextTick(() => {
		instructionsImportRef.value.instructDrawerVisible = true
	})
}

const resetForm = () => {
	proxy.resetObj(formData)
}
// 修改机械处理数据
const changeMechanical = data => {
	formData.equmentListBack = JSON.parse(JSON.stringify(data)) // 赋值
}
const dataClear = () => {
	formData.trustId = ''
	formData.trustNo = ''
	formData.busCargoInfoId = '' //票货信息
	formData.tonPlan = ''
	formData.quantityPlan = ''
  formData.shipvoyageId = ''
  formData.shipvoyageItemId = ''
}
//change事件
const remoteChange = e => {
	formData.shipvoyageId = e.shipvoyageId
}

defineExpose({
	validate,
	resetForm,
	formData,
	MechanicalTypeRef,
	workPlanId,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
