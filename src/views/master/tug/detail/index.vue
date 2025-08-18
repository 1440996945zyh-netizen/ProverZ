<template>
  <div>
    <el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="拖轮编号" prop="tugCode">
        <el-input v-model="formData.tugCode" placeholder="拖轮编号" />
      </el-form-item>
      <el-form-item label="拖轮名称" prop="tugName">
        <el-input v-model="formData.tugName" placeholder="拖轮名称" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="berth">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = reactive({
  tugCode: '',
  tugName: ''
})
const rules = reactive({
  tugCode: proxy.getRules({
    required: true ,
    length: '0-30'
  }),
  tugName: proxy.getRules({
    required: true ,
    length: '0-50'
  }),
})

const validate = async () => {
  let flag = false
  await ruleForm.value.validate((valid, fields) => {
    if (valid) {
      flag = true
      console.log('succ')
    } else {
      flag = false
      proxy.$modal.msgWarning('请完善表单信息！')
      console.log('err')
    }
  })
  return flag
}
const resetForm = () => {
  ruleForm.value.resetFields()
}
defineExpose({
  validate,
  resetForm,
  formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
