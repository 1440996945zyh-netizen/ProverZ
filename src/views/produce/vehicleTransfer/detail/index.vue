<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="140px" :rules="rules">

      <el-form-item label="内倒过磅顺序" prop="transportType">
        <Select
          v-model:value="formData.transportType"
          :selectData="[
						{ label: '先轻后重', value: '1' },
						{ label: '先重后轻', value: '2' },
					]"
        />
      </el-form-item>
			<el-form-item label="内倒类型" prop="innertransportType" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/INNERTRANSPORT_TYPE' }"
						v-model:value="formData.innertransportType"
						v-model:label="formData.innertransportLabel"
					/>
				</div>
			</el-form-item>
      <el-form-item label="工作区域" prop="workAreaCd" style="width: 100%">
        <div style="width: 100%">
          <Select :dataConfig="{ url: '/api/internal/public/getDictListByType/WORK_AREA' }" v-model:value="formData.workAreaCd"
                  v-model:label="formData.workAreaNm"/>
        </div>
      </el-form-item>
      <el-form-item label="是否启用内倒规则" prop="isRule">
        <el-radio-group v-model="formData.isRule"  @change="changeIsRule">
          <el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="emptyWeight" label="空车重量不高于" v-if='appear'>
        <el-input v-model="formData.emptyWeight" placeholder="请输入数字" @input="formData.emptyWeight = proxy.verify('positiveNumber', formData.emptyWeight)"  />
      </el-form-item>
      <el-form-item prop="heavyWeight" label="重车重量不低于" v-if='appear'>
        <el-input v-model="formData.heavyWeight" placeholder="请输入数字" @input="formData.heavyWeight = proxy.verify('positiveNumber', formData.heavyWeight)" />
      </el-form-item>
<!--      <el-form-item prop="emptyWeight" label="空车重量不高于" v-if='appear'>
        <el-input v-model="formData.emptyWeight" placeholder="请输入数字"  disabled />
      </el-form-item>
      <el-form-item prop="heavyWeight" label="重车重量不低于" v-if='appear'>
        <el-input v-model="formData.heavyWeight" placeholder="请输入数字" disabled />
      </el-form-item>-->
      <el-form-item label="是否打印磅单" prop="printPoundId">
        <el-radio-group v-model="formData.printPoundId"  @change="changePrintPound">
          <el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="printPoundNum" label="打印次数" v-if='printPoundAppear'>
        <el-input v-model="formData.printPoundNum" placeholder="请输入数字"
                  @input="formData.printPoundNum = proxy.verify('number', formData.printPoundNum)"/>
      </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import api from '@/api/produce/vehicleTransfer/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'

const appear =ref(false)
const printPoundAppear =ref(false)
const ruleForm = ref()
const formData = ref({
  trustCargoId: '',
  trustId:'',
  cargoCode:'',
  cargoName:'',
  innertransportType: '',
  innertransportLabel:'',
  workAreaCd:'',
  workAreaNm:'',
  isRule:'1',//是否启用内倒规则
  heavyWeight:'',//重车重量不低于
  emptyWeight:'',//空车重量不高于
  transportType:'1',//内倒过磅顺序，1先轻后重
  printPoundId:'',
  printPoundNum:''
})
const rules = reactive({
  innertransportType: proxy.getRules({ required: true }),
  isRule: proxy.getRules({ required: true }),
  transportType: proxy.getRules({ required: true }),
  emptyWeight: proxy.getRules({ required: true }),
  heavyWeight: proxy.getRules({ required: true }),
})
const trueFalseOptions = ref([
  { label: '是', value: '1' },
  { label: '否', value: '0' },
])

const changeIsRule = () => {
  if (formData.value.isRule == '0') {
    appear.value=false
    formData.value.emptyWeight=''
    formData.value.heavyWeight=''
  } else if (formData.value.isRule == '1') {
    appear.value=true
    formData.value.emptyWeight=''
    formData.value.heavyWeight=''
    /*api.getEmptyHeavy({
      cargoCode: formData.value.cargoCode
    }).then(res => {
      formData.value.emptyWeight=res.data.emptyWeight
      formData.value.heavyWeight=res.data.heavyWeight
    })*/
  }
}
const changePrintPound = () => {
  if (formData.value.printPoundId == '0') {
    printPoundAppear.value=false
    formData.value.printPoundNum=''
  }else if(formData.value.printPoundId == '1'){
    printPoundAppear.value=true
    formData.value.printPoundNum=1
  }
}
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
const resetForm = () => {
	formData.trustCargoId = ''
  ruleForm.value.resetFields()
  formData.cargoCode= ''
  formData.cargoName= ''
  formData.trustId= ''
  formData.innertransportType= ''
  formData.innertransportLabel= ''
  formData.workAreaCd= ''
  formData.workAreaNm= ''
  formData.isRule= ''
  formData.heavyWeight= ''
  formData.emptyWeight= ''
  formData.transportType= ''
  formData.printPoundId= ''
  formData.printPoundNum= ''
}
defineExpose({
	validate,
	resetForm,
	formData,
  appear,
  printPoundAppear
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
