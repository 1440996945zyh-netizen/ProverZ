<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules" style="margin: 20px 20px" :disabled='editChange'>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="计划号" prop="planNo">
            <el-input v-model="formData.planNo" placeholder="请输入计划号" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label='服务类型' prop='workTypeCode'>
            <Select
              :dataConfig="{ params: { type: 'BUSINESS_WORK_TYPE' } }"
              v-model:value='formData.workTypeCode'
              v-model:label='formData.workTypeName'
              placeholder='请选择服务类型' />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="formData.customerName" placeholder="客户名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="船舶名称" prop="shipName">
            <el-input v-model="formData.shipName" placeholder="船舶名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="作业区" prop="portCode">
            <Select
              v-model:value="formData.portCode"
              v-model:label="formData.portName"
              :selectData="[
                { label: '东作业区', value: '01' },
                { label: '中作业区', value: '02' },
                { label: '西作业区', value: '03' },
					    ]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="泊位" prop="berth">
              <el-input v-model="formData.berth"  placeholder="请输入泊位" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="装卸" prop="loadUnload">
              <Select
                :selectData="[
							    { value: '1', label: '装' },
							    { value: '2', label: '卸' },
						    ]"
                  v-model:value="formData.loadUnload"
              />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="货物名称" prop="cargoName">
              <el-input v-model="formData.cargoName" placeholder="请输入货物名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="formData.startTime"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="formData.endTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" placeholder="备注" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span=8>
          <el-form-item prop="" label="附件">
            <upload
              businessType="SUNDRY_ACCESSORY"
              :businessId="formData.id"
              @changeFile="changeFile"
            />
          </el-form-item>
        </el-col>
        <el-col :span=8>
          <el-form-item label="作业位置" prop="remark">
            <el-input v-model="formData.workAreaName" placeholder="作业位置" />
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
    workTypeCode: '',
    workTypeName: '',
    customerName: '',
    shipName: '',
    berth: '',
    portCode: '',
    remark: '',
    startTime: '',
    endTime: '',
    portName:'',
    cargoName:'',
    planNo:'',
    loadUnload:'',
    status:'',
    fileIds:'',
    examineFlag:'',
    examineStatus:'',
    workAreaName:'',
	},
})
const editChange = ref(true) // 是否禁止编辑
const { formData } = toRefs(data)
const rules = reactive({
  cargoName: proxy.getRules({
		required: true,
	}),
  workTypeCode: proxy.getRules({
		required: true,
	}),
  loadUnload: proxy.getRules({
		required: true,
	}),
  portCode: proxy.getRules({
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
  editChange
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
