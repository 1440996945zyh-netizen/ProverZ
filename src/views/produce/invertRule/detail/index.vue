<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="空车重量不高于" prop="emptyWeight">
        <el-input v-model="formData.emptyWeight" placeholder="请输入数字"
                  @input="formData.emptyWeight = proxy.verify('positiveNumber', formData.emptyWeight)" />
      </el-form-item>
      <el-form-item label="重车重量不低于" prop="heavyWeight">
        <el-input v-model="formData.heavyWeight" placeholder="请输入数字"
                  @input="formData.heavyWeight = proxy.verify('positiveNumber', formData.heavyWeight)"/>
      </el-form-item>
      <el-form-item label='货物名称' prop='cargoCode'>
        <div style="width: 100%">
          <RemoteSelect
            ref="cargoSelect"
            v-model:value="formData.cargoCode"
            v-model:label="formData.cargoName"
            placeholder="请选择货物名称"
            type="CARGO_INFO_SIGN"
          />
        </div>
      </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
import api from '@/api/produce/invertRule'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this


const ruleForm = ref()
const formData = reactive({
	id: '',
  emptyWeight: '',
  heavyWeight: '',
  ruleName: '',
  cargoCode: '',
  cargoName: '',
})

const rules = reactive({
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  emptyWeight: [{ required: true, message: '请输入数字', trigger: 'blur' }],
  heavyWeight: [{ required: true, message: '请输入数字', trigger: 'blur' }],
  cargoCode: [{ required: true, message: '请输入货物名称', trigger: 'blur' }],
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		}
	})

	return flag
}
const resetForm = () => {
	formData.id = ''
	ruleForm.value.resetFields()
}
const init = () => {

}
init()

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
