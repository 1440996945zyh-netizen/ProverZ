<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" label-width="120px" :rules="rules">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="转运申请" name="1">
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
            <el-col :span="6" >
              <el-form-item label="作业过程" prop="processName">
                <Select
                  :selectData="processNameList"
                  v-model:value="formData.processCode"
                  v-model:label="formData.processName"
                  placeholder="请选择作业过程"
                  @change="changeItem"
                />
              </el-form-item>
            </el-col>
						<el-col :span="6">
							<el-form-item label="转运类型" prop="reshipmentTypeCode">
								<el-radio-group v-model="formData.reshipmentTypeCode" class="ml-4" @change="dataClear">
									<el-radio label="1" size="large">客户要求</el-radio>
									<el-radio label="2" size="large">内部转运</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
<!--            <el-col :span="6" v-if="formData.reshipmentTypeCode == 2">
							<el-form-item label="票货信息" prop="busCargoInfoId">
                <el-input
                  v-model="formData.cargoInfoNo"
                  @click="clickBusCargoInfoId()"
                  :disabled="false"
                  placeholder="请选择票货信息"
                />
							</el-form-item>
						</el-col>
						<el-col :span="6" v-if="formData.reshipmentTypeCode == 2">
							<el-form-item label="计划件数" prop="quantityPlan">
								<el-input v-model="formData.quantityPlan" placeholder="请输入计划件数" />
							</el-form-item>
						</el-col>
						<el-col :span="6" v-if="formData.reshipmentTypeCode == 2">
							<el-form-item label="计划重量" prop="tonPlan">
								<el-input v-model="formData.tonPlan" placeholder="请输入计划重量" />
							</el-form-item>
						</el-col>-->
						<el-col :span="6" >
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
							<el-form-item label="计划件数" prop="quantityPlan" >
								<el-input v-model="formData.quantityPlan" :disabled="true" placeholder="请输入计划件数" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="计划重量" prop="tonPlan">
								<el-input v-model="formData.tonPlan" :disabled="true" placeholder="请输入计划重量" />
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
									placeholder="选择计划开工时间"
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
									placeholder="选择计划完工时间"
									value-format="YYYY-MM-DD HH:mm"
								/>
							</el-form-item>
						</el-col>
					</el-row>
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
									placeholder="请输入申请装卸队量"
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
							<el-form-item label="源垛位" prop="regionIdsSource">
								<RemoteSelect
									type="ALL_STORAGE_MASS"
									v-model:value="formData.regionIdsSource"
									@change="changeMass"
									multiple
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="目标垛位" prop="regionIdsTarget">
								<RemoteSelect
									type="ALL_STORAGE_MASS"
									v-model:value="formData.regionIdsTarget"
									@change="changeMassTarget"
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
			:trustType="3"
			:permission="'storage:transportApply:add'"
			@change="instructionsChange"
		/>
	</div>

  <el-drawer v-model="cargoInfoDetailVisable" title="票货详情" size="80%" @close="handleClose">
    <cargoInfoDetail ref="cargoInfoDetailRef" />
    <template #footer>
      <div>
        <el-button @click="cargoInfoDetailVisable = false">取消</el-button>
        <el-button type="primary" @click="saveCargoInfo">保存</el-button>
      </div>
    </template>
  </el-drawer>

</template>

<script setup name="transportApplyDetail">
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import MechanicalType from '@/businessComponents/MechanicalType/index.vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue'
import api from '@/api/storage/transportApply/index'
import {ElButton} from "element-plus";
import cargoInfoDetail from '@/views/storage/transportApply/cargoInfoDetail/index'

const cargoInfoDetailRef = ref(null) // 明细组件ref
const cargoInfoDetailVisable = ref(false)

const instructionsImportRef = ref({})
// const radio1 = ref('1')
const ruleForm = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({
	companyId: proxy.getRules({ required: true }),
	classCode: proxy.getRules({ required: true }),
	workDate: proxy.getRules({ required: true }),
	laborNum: proxy.getRules({
		numberCheck: {
			int: 2,
		},
	}),
	trustNo: proxy.getRules({ required: true }),
	busCargoInfoId: proxy.getRules({ required: true }),
	remark: proxy.getRules({
		length: '1-200',
	}),
	times: proxy.getRules({ required: true }),
})
const activeNames = reactive(['1', '2', '3'])
const changeItem = e => {

	console.log(formData, 'formData')
	console.log(formData.value, 'e')
}
const formData = reactive({
	id: '',
	companyId: '',
	tonPlan: '',
	companyName: '',
	workDate: '',
	classCode: '',
	className: '',
	trustId: '',
	trustNo: '',
	shipvoyageId: '',
	shipvoyageItemId: '',
	processName: '',
	laborNum: null,
	processCode: '',
	reshipmentTypeCode: '1',
	quantityPlan: '',
	startTimePlan: '',
	endTimePlan: '',
	equipmentNamesBack: '',
	busCargoInfoId: '',
	remark: '',
	equmentListBack: [], //机械参数集合
	locationListSource: [], // 源垛位参数集合
	locationListTarget: [], // 目标垛位参数集合
  regionIdsSource:'',
  regionIdsTarget:''
})
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
	ruleForm.value.resetFields()
	formData.id = '' // 清空id
	workPlanId.value = ''
	formData.processCode = ''
	formData.processName = ''
}
const busCargoInfoChanged = val => {
	formData.tonPlan = val.ton
	formData.quantityPlan = val.quantity
}
const processNameList = ref([])
const initData = () => {
	api.getNormalProcess().then(res => {
    processNameList.value.splice(0, processNameList.value.length)
    for (var i = 0; i < res.data.length; i++) {
      processNameList.value.push({ label: res.data[i].label, value: res.data[i].value })
    }
  })
}
//每次切换单选框时清除数据
const dataClear = () => {
	formData.trustId = ''
	formData.trustNo = ''
  formData.cargoInfoNo = ''
	formData.busCargoInfoId = ''
	formData.processName = ''
  formData.processCode = ''
	formData.tonPlan = ''
	formData.quantityPlan = ''
	;(formData.shipvoyageId = ''), (formData.shipvoyageItemId = '')
}
//作业指令
const instructionsChange = e => {
	if (e.trustNo) {
    console.log(e)
		instructDrawerVisible.value = false
		formData.trustId = e.id
    if(e.processCode != null ){
      formData.processCode = e.processCode
      formData.processName = e.processName
    }
		formData.quantityPlan = e.planQuantity
		formData.tonPlan = e.planTon
		formData.shipvoyageId = e.shipvoyageId
		formData.shipvoyageItemId = e.shipvoyageItemId
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
const instructDrawerVisible = ref(false) //作业指令组件抽屉
// 修改机械处理数据
const changeMechanical = data => {
	formData.equmentListBack = JSON.parse(JSON.stringify(data)) // 赋值
}

//作业指令
const clickTrustNo = () => {
	nextTick(() => {
		instructionsImportRef.value.instructDrawerVisible = true
	})
}
const clickBusCargoInfoId = () => {
  if (formData.companyId) {
    cargoInfoDetailVisable.value = true
    nextTick(() => {
      cargoInfoDetailRef.value.queryParams.companyId = formData.companyId
      cargoInfoDetailRef.value.queryParams.tradeType = formData.tradeType
      cargoInfoDetailRef.value.getList(cargoInfoDetailRef.value.queryParams)
    })
  } else {
    proxy.$message.warning('请选择作业公司！')
    return
  }
}
const saveCargoInfo = () => {
  // 判断是否选择票货
  if (cargoInfoDetailRef.value.checkData.length < 1) {
    proxy.$message.warning('请选择票货！')
    return
  }
  if (cargoInfoDetailRef.value.checkData.length >1) {
    proxy.$message.warning('只能选择一票货！')
    return
  }
  console.log(cargoInfoDetailRef.value.checkData)
  formData.quantityPlan = cargoInfoDetailRef.value.checkData.map(item => item.quantity).join(',')
  formData.tonPlan = cargoInfoDetailRef.value.checkData.map(item => item.ton).join(',')
  formData.busCargoInfoId = cargoInfoDetailRef.value.checkData.map(item => item.cargoInfoId).join(',')

  formData.cargoInfoNo = cargoInfoDetailRef.value.checkData.map(item => item.cargoInfoNo).join(',')
  cargoInfoDetailVisable.value = false
}
// 修改垛位处理数据
const changeMass = row => {
	formData.locationListSource = row
}

// 修改垛位处理数据
const changeMassTarget = row => {
	formData.locationListTarget = row
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
