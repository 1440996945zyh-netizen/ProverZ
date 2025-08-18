<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" label-width="120px" :rules="rules">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="集疏港申请" name="1">
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
						<el-col :span="3">
							<el-form-item label="日期" prop="workDate">
								<el-date-picker
									v-model="formData.workDate"
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									type="date"
									placeholder="日期"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="3">
							<el-form-item label="班次" prop="classCode">
								<Select
									:dataConfig="{ params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } }"
									v-model:value="formData.classCode"
									v-model:label="formData.className"
								/>
							</el-form-item>
						</el-col>
            <el-col :span="6">
              <el-form-item label="作业过程" prop="processName">
                <Select
                  :selectData="processNameList"
                  v-model:value="formData.processCode"
                  v-model:label="formData.processName"
                  placeholder="请选择作业过程"
                />
              </el-form-item>
            </el-col>
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
					</el-row>
					<el-row :gutter="20">
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
							<el-form-item label="计划件数" prop="quantityPlan">
								<el-input
									v-model="formData.quantityPlan"
									:disabled="true"
									placeholder=""
									@input="formData.quantityPlan = proxy.verify('number', formData.quantityPlan)"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="计划重量" prop="tonPlan">
								<el-input v-model="formData.tonPlan" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20"></el-row>
				</el-collapse-item>
				<el-collapse-item name="2">
					<template #title>
						<div>
							<span>机械类型信息</span>
						</div>
					</template>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="申请机械" prop="equipmentNamesBack">
								<MechanicalType
									ref="MechanicalTypeRef"
									v-model:value="formData.equipmentNamesBack"
									:workPlanId="workPlanId"
									@change="changeMechanical"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="申请装卸队量(人)" prop="laborNum">
								<el-input
									v-model="formData.laborNum"
									placeholder="请输入两位数字"
									@input="formData.laborNum = proxy.verify('number', formData.laborNum)"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="作业要求" prop="remark">
								<el-input v-model="formData.remark" placeholder="请输入作业要求" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row></el-row>
				</el-collapse-item>
				<el-collapse-item name="3">
					<template #title>
						<div>
							<span>场地信息</span>
						</div>
					</template>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="垛位信息" prop="massIdsSource">
								<RemoteSelect
									type="ALL_STORAGE_MASS"
									v-model:value="formData.massIdsSource"
									@change="changeMass"
									multiple
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
			:trustType="2"
			:permission="'storage:openPortApply:add'"
			@change="instructionsChange"
		/>
	</div>
</template>

<script setup name="openPortApplyDetail">
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import MechanicalType from '@/businessComponents/MechanicalType/index.vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue'
import publicApi from '@/api/public/index'
import api from '@/api/storage/openPortApply/index'

const ruleForm = ref()
const instructionsImportRef = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({
	companyId: proxy.getRules({ required: true }),
	classCode: proxy.getRules({ required: true }),
	workDate: proxy.getRules({ required: true }),
  processName: proxy.getRules({ required: true }),
	trustNo: proxy.getRules({ required: true }),
	laborNum: proxy.getRules({
		numberCheck: {
			int: 2,
		},
	}),
	remark: proxy.getRules({
		length: '1-200',
	}),
	times: proxy.getRules({ required: true }),
})
const activeNames = reactive(['1', '2', '3'])
const formData = reactive({
	id: '',
	companyId: '',
	companyName: '',
	workDate: '',
	classCode: '',
	laborNum: '',
	className: '',
	trustId: '',
	trustNo: '',
	processName: '',
	processCode: '',
	quantityPlan: '',
	startTimePlan: '',
	endTimePlan: '',
	equipmentNamesBack: '',
	remark: '',
	shipvoyageId: '',
	shipvoyageItemId: '',
	massIdsSource: '',
	equmentListBack: [], //机械参数集合
	massIdsSource: [], // 垛位id集合
	locationListSource: [], // 垛位参数集合
})
//作业指令
const clickTrustNo = () => {
	nextTick(() => {
		instructionsImportRef.value.instructDrawerVisible = true
	})
}
const workPlanId = ref('')
const validate = async () => {
	let flags = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flags = true
		} else {
			flags = false
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flags
}
const resetForm = () => {
	proxy.resetObj(formData)
}
//作业指令
const instructionsChange = e => {
	if (e.trustNo) {
		instructDrawerVisible.value = false
		formData.trustId = e.id
    formData.companyId = e.companyId
    formData.companyName = e.companyName
/*		formData.processCode = e.processCode
		formData.processName = e.processName*/
		formData.quantityPlan = e.quantity
		formData.tonPlan = e.ton
		formData.shipvoyageId = e.shipvoyageId
		formData.shipvoyageItemId = e.shipvoyageItemId
	} else {
		proxy.resetForm()
	}
}
// 修改机械处理数据
const changeMechanical = data => {
	formData.equmentListBack = JSON.parse(JSON.stringify(data)) // 赋值
}
// 修改垛位处理数据
const changeMass = row => {
	formData.locationListSource = row
}

const instructDrawerVisible = ref(false) //作业指令组件抽屉
const processNameList = ref([])
const initData = () => {
  api.getNormalProcess().then(res => {
    processNameList.value.splice(0, processNameList.value.length)
    for (var i = 0; i < res.data.length; i++) {
      processNameList.value.push({ label: res.data[i].label, value: res.data[i].value })
    }
  })
}
initData()
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
