<template>
  <div class="formData">
    <el-form :model="formData" ref="ruleForm" label-width="150px" :rules="rules">
      <el-form-item label="定额编号" prop="quotaCode">
        <el-input v-model="formData.quotaCode" placeholder="系统自动生成" disabled />
      </el-form-item>

      <el-form-item label="维修项目名称" prop="projectName">
        <el-input v-model="formData.projectName" placeholder="请输入维修项目名称" maxlength="200" />
      </el-form-item>

      <el-form-item label="维修项目内容" prop="projectContent">
        <el-input
          v-model="formData.projectContent"
          type="textarea"
          :rows="4"
          placeholder="请输入维修项目内容"
          maxlength="1000"
        />
      </el-form-item>

      <el-form-item label="计量单位" prop="unit">
        <el-select
          v-model="formData.unit"
          placeholder="请选择计量单位"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in unitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="不含税金额" prop="amountExcludingTax">
        <el-input-number
          v-model="formData.amountExcludingTax"
          :precision="2"
          :min="0"
          :max="999999999.99"
          placeholder="请输入不含税金额"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="maintenanceProjectQuotaDetail">
import { ref, reactive, getCurrentInstance, toRefs, onMounted } from 'vue'
import publicApi from '@/api/public/index'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
  formData: {
    id: null,
    quotaCode: '',
    projectName: '',
    projectContent: '',
    unit: '',
    amountExcludingTax: null,
  },
  unitOptions: [],
})
const { formData, unitOptions } = toRefs(data)

const rules = reactive({
  projectName: proxy.getRules({ required: true }),
  projectContent: proxy.getRules({ required: true }),
  unit: proxy.getRules({ required: true }),
  amountExcludingTax: proxy.getRules({ required: true }),
})

const loadUnitOptions = async () => {
  try {
    const res = await publicApi.getLocalSelect({
      type: 'DICT',
      dictType: 'E_UNIT',
    })

    if (res.code === '0000' && Array.isArray(res.data)) {
      unitOptions.value = res.data.map(item => {
        const label = item.label ?? item.dictLabel ?? item.name ?? ''
        return {
          label,
          value: label,
        }
      })
      return
    }

    unitOptions.value = []
    proxy.$message.error(res.msg || '加载计量单位失败')
  } catch (error) {
    unitOptions.value = []
    console.error('加载设备计量单位字典失败:', error)
    proxy.$message.error('加载计量单位失败')
  }
}

const validate = async () => {
  let flag = false
  await ruleForm.value.validate((valid) => {
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
  formData.value.id = null
  formData.value.quotaCode = ''
  formData.value.projectName = ''
  formData.value.projectContent = ''
  formData.value.unit = ''
  formData.value.amountExcludingTax = null
  ruleForm.value?.clearValidate()
}

onMounted(() => {
  loadUnitOptions()
})

defineExpose({
  validate,
  resetForm,
  formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
