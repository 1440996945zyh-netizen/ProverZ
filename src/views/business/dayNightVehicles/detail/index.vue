<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" style="margin: 20px 20px" >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="计划号" prop="planNo">
            <el-input v-model="formData.planNo" placeholder="请输入计划号"  disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="子计划号" prop="subPlanNo">
            <el-input v-model="formData.subPlanNo" placeholder="请输入子计划号" disabled  />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label='中文船名' prop='vesselNameCn'>
            <el-input v-model="formData.vesselNameCn" placeholder="请输入中文船名" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="进口航次" prop="voyageImport">
            <el-input v-model="formData.voyageImport" placeholder="请输入进口航次" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '1'">
          <el-form-item label="计划件数" prop="planQuantity" >
            <el-input v-model="formData.planQuantity" placeholder="请输入计划件数" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '1'">
          <el-form-item label="已完成件数" prop="finishQuantity" >
            <el-input v-model="formData.finishQuantity" placeholder="请输入已完成件数" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '1'">
          <el-form-item label="剩余件数" prop="surplusQuantity" >
            <el-input v-model="formData.surplusQuantity"  placeholder="请输入剩余件数" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '0'">
          <el-form-item label="计划重量(吨)" prop="planWeight" >
            <el-input v-model="formData.planWeight" placeholder="请输入计划重量(吨)" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '0'">
          <el-form-item label="已完成量(吨)" prop="finishWeight" >
            <el-input v-model="formData.finishWeight" placeholder="请输入已完成量(吨)" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '0'">
          <el-form-item label="剩余量(吨)" prop="surplusWeight" >
            <el-input v-model="formData.surplusWeight"  placeholder="请输入剩余量(吨)" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '0'">
          <el-form-item label="委托重量" prop="entrustWeight">
            <el-input v-model="formData.entrustWeight"  placeholder="请输入委托重量" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="formData.packing === '1'" >
          <el-form-item label="委托件数" prop="entrustQuantity"  >
            <el-input v-model="formData.entrustQuantity"  placeholder="请输入委托件数" />
          </el-form-item>
        </el-col>
        <el-col :span="8" >
          <el-form-item label="客户名称" prop="companyCode">
            <div style="width: 100%">
              <RemoteSelect type="CUSTOMER_BHT" v-model:value="formData.companyCode" v-model:label="formData.companyName" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8" >
          <el-form-item label="物流公司" prop="consigneeCode">
            <div style="width: 100%">
              <RemoteSelect type="CUSTOMER_BHT" v-model:value="formData.consigneeCode" v-model:label="formData.consigneeName" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="货物名称" prop="cargoName">
            <div style="width: 100%">
              <RemoteSelect
                ref="cargoSelect"
                v-model:value="formData.cargoCode"
                v-model:label="formData.cargoName"
                placeholder="请选择货物名称"
                type="BHT_CARGO_INFO"
              />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开始时间" prop="planStartTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="formData.planStartTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结束时间" prop="planEndTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="formData.planEndTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
		</el-form>
	</div>
</template>

<script setup name="sundryType">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, toRefs } from 'vue'
import Select from '@/components/Select/index.vue'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import upload from '@/components/upload/index'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const data = reactive({
	formData: {
		id: '',
    planNo: '',
    subPlanNo: '',
    vesselNameCn: '',
    voyageImport: '',
    cargoName: '',
    cargoCode:'',
    planYard: '',
    planQuantity: '',
    finishQuantity: '',
    surplusQuantity: '',
    planWeight: '',
    finishWeight:'',
    surplusWeight:'',
    planStartTime:'',
    planEndTime:'',
    packing:'',
    consigneeCode:'',
    consigneeName:'',
    companyCode:'',
    companyName:'',
    energyType:'',
    entrustQuantity:'',
    entrustWeight:'',
  },
})

const { formData } = toRefs(data)
const rules = reactive({
  entrustQuantity: proxy.getRules({
		required: true,
	}),
  entrustWeight: proxy.getRules({
		required: true,
	}),
  consigneeCode: proxy.getRules({
		required: true,
	}),
  companyCode: proxy.getRules({
		required: true,
	}),
  startTime: proxy.getRules({
		required: true,
	}),
  endTime: proxy.getRules({
		required: true,
	}),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			// console.log('succ')
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
			// console.log('err')
		}
	})

	return flag
}
// 文件上传
const changeFile = files => {
  // console.log('删除附件', files)
  formData.value.fileIds = files
}
const resetForm = () => {
	console.log(ruleForm, 'ruleForm')
	// ruleForm.value.resetFields()
	formData.value = {}
  proxy.$bus.emit('resetFileList')
  // console.log('chongzhi',formData.value);
}
defineExpose({
	validate,
	resetForm,
	formData,
  data
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
