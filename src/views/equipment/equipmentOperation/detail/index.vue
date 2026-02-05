<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" label-position="top" :rules="rules">
			<el-row :gutter="24">
				<el-col :span="12">
					<el-form-item label="日期" prop="workDate">
						<el-date-picker
              v-model="formData.workDate"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              type="date"
            />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="设备名称" prop="equipId">
						<Select
							:selectData="equipmentList"
							v-model:value="formData.equipId"
							v-model:label="formData.equipName"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="运行台时" prop="runTime">
						<el-input v-model="formData.runTime" placeholder="运行台时"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="作业台时" prop="workTime">
						<el-input v-model="formData.workTime" placeholder="作业台时"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="故障台时" prop="faultTime">
						<el-input v-model="formData.faultTime" placeholder="故障台时"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="运行里程" prop="runMileage">
						<el-input v-model="formData.runMileage" placeholder="运行里程"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="'作业吨数'" prop="workTon">
						<el-input v-model="formData.workTon" placeholder="作业吨数" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="作业箱量" prop="workBox">
						<el-input v-model="formData.workBox" placeholder="作业箱量" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="耗油量" prop="oilConsume">
						<el-input v-model="formData.oilConsume" placeholder="耗油量" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="耗电量" prop="powerConsume">
						<el-input v-model="formData.powerConsume" placeholder="耗油量" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance, onMounted, toRefs, nextTick } from 'vue'
import api from '@/api/equipment/equipmentOperation/index'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'
import BaseTable from '@/components/BaseTable/index.vue'
const { proxy } = getCurrentInstance()

const equipmentList = ref([])
// 公共接口
const getSelectList = () => {
  publicApi.getLocalSelect({type: 'EQUIP_INFO'}).then(res => {
    equipmentList.value = res.data
  })
}
const ruleForm = ref(null)
const formData = ref({
  id: '',
	workDate: '',
	equipId: '',
	equipName: '',
	runTime: '',
	workTime: '',
	faultTime: '', 
  runMileage: '',
  workTon: '',
  workBox: '',
  oilConsume: '',
	powerConsume: '',
})
const rules = reactive({
	workDate: proxy.getRules({ required: true }),
	equipId: proxy.getRules({ required: true }),
	runTime: proxy.getRules({ required: true }),
	workTime: proxy.getRules({ required: true }),
})
const resetForm = () => {
	// 逐个属性重置，保持响应式
	formData.value.id = ''
	formData.value.workDate = ''
	formData.value.equipId = ''
	formData.value.equipName = ''
	formData.value.workTime = ''
	formData.value.runTime = ''
	formData.value.faultTime = ''
  formData.value.runMileage =''
	formData.value.workTon = ''
	formData.value.workBox = ''
	formData.value.oilConsume = ''
	formData.value.powerConsume = ''
	if (ruleForm.value){
		ruleForm.value.resetFields()
	}
}
const validate = async () => {
  let flag = false
  await ruleForm.value.validate((valid) => {
    if (valid) {
      flag = true
    }
  })
  return flag
}

getSelectList()
defineExpose({
	validate,
  formData,
  resetForm,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>