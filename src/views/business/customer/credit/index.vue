<template>
  <el-form ref="ruleForm" :model="formData" :rules="rules" class="demo-ruleForm" :size="formSize" status-icon>
    <el-form-item prop="isCredit" label="是否授信">
      <el-radio-group v-model="formData.isCredit">
        <el-radio label="1">是</el-radio>
        <el-radio label="0">否</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup name="customerDialog">
import { reactive, ref } from 'vue'
const ruleForm = ref()
const { proxy } = getCurrentInstance()

const formData = ref({
  id:'',
  isCredit: '',
})
const rules = reactive({
  isCredit: proxy.getRules({
    required: true,
  }),
})
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
  // proxy.resetObj(formData)
  formData.id = ''
  ruleForm.value.resetFields()
}
defineExpose({
  validate,
  resetForm,
  formData,
})
</script>

<style lang="scss" scoped></style>
