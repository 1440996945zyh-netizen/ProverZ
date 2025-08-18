<template>
  <div class="formData">
    <el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
      <el-form-item label="库场名称" prop="storageYardNm">
        <el-input v-model="formData.storageYardNm" placeholder="请输入库场名称" @input="getShortCd" />
      </el-form-item>
      <el-form-item label="助记码" prop="shortCd">
        <el-input v-model="formData.shortCd" placeholder="请输入助记码" />
      </el-form-item>
      <el-form-item label="库场面积(m²)" prop="area">
        <el-input
          v-model="formData.area"
          placeholder="请输入数字"
          @input="formData.area = proxy.verify('positiveNumber', formData.area)"
        />
      </el-form-item>
      <el-form-item label="工作区域" prop="workAreaCd" style="width: 100%">
        <div style="width: 100%">
          <Select :dataConfig="{ url: '/api/internal/public/getDictListByType/WORK_AREA' }"
                  v-model:value="formData.workAreaCd"/>
        </div>
      </el-form-item>
      <el-form-item label="排序" prop="sortNum">
        <el-input
          v-model="formData.sortNum"
          placeholder="请输入数字"
          @input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="Detail">
import {ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance} from 'vue'

const {proxy} = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import {creatShortCd} from '@/utils/index.js'

const ruleForm = ref()
const formData = reactive({
  storageYardNm: '',
  shortCd: '',
  area: '',
  workAreaCd: '',
  sortNum: '',
  id: '',
})
const rules = reactive({
  storageYardNm: proxy.getRules({
    required: true,
    length: '1-50',
  }),
  shortCd: proxy.getRules({
    length: '1-50',
  }),
  sortNum: proxy.getRules({
    numberCheck: {
      int: 8,
      dec: 0,
    },
  }),
})
// 获取助记码
const getShortCd = value => {
  formData.shortCd = creatShortCd(value)
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
  formData.id = ''
  console.log(ruleForm, 'ruleForm')
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
