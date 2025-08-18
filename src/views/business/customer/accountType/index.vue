<template>
  <el-form ref="ruleForm" :model="formData" :rules="rules" class="demo-ruleForm" :size="formSize" status-icon>
    <el-form-item label="结算类型" prop="accountType">
      <el-select v-model="formData.accountType" clearable>
        <el-option label="月结" value="1" />
        <el-option label="票结" value="0" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup name="accountTypeDialog">
import { reactive, ref } from 'vue'
const ruleForm = ref()
const { proxy } = getCurrentInstance()

const formData = ref({
  id:'',
  accountType: '',
})
const rules = reactive({
  accountType: proxy.getRules({
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
