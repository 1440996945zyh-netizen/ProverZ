<template>
  <div class="formData">
    <el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
      <el-form-item label="年份" prop="year">
        <el-date-picker
          v-model="formData.year"
          type="year"
          value-format="YYYY"
          format="YYYY"
          placeholder="请选择年份"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="费用类型" prop="costType">
        <el-select
          v-model="formData.costType"
          placeholder="请选择费用类型"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in costTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="预算金额" prop="amount">
        <el-input-number
          v-model="formData.amount"
          :precision="2"
          :min="0"
          :max="999999999.99"
          placeholder="请输入预算金额"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="costBudgetManagementDetail">
import { ref, reactive, getCurrentInstance, toRefs, onMounted } from 'vue'
import publicApi from '@/api/public/index'

const { proxy } = getCurrentInstance()

const ruleForm = ref()

const data = reactive({
  formData: {
    id: null,
    year: '',
    costType: '',
    amount: null,
  },
  costTypeOptions: [],
})

const { formData, costTypeOptions } = toRefs(data)

/**
 * 表单校验
 */
const rules = reactive({
  year: proxy.getRules({ required: true }),
  costType: proxy.getRules({ required: true }),
  amount: proxy.getRules({ required: true }),
})

/**
 * 加载费用类型字典
 * 字典类型与后端 Mapper 保持一致：EXPENSE_TYPE
 */
const loadCostTypeOptions = async () => {
  try {
    const res = await publicApi.getLocalSelect({ type: 'DICT', dictType: 'EXPENSE_TYPE' })
    if (res.code === '0000' && Array.isArray(res.data)) {
      costTypeOptions.value = res.data.map(item => ({
        label: item.label ?? item.dictLabel ?? item.name ?? '',
        value: item.value ?? item.dictValue ?? item.id ?? '',
      }))
      return
    }
    costTypeOptions.value = []
    proxy.$message.error(res.msg || '加载费用类型失败')
  } catch (error) {
    costTypeOptions.value = []
    console.error('加载费用类型字典失败:', error)
    proxy.$message.error('加载费用类型失败')
  }
}

/**
 * 表单校验方法
 */
const validate = async () => {
  let flag = false
  await ruleForm.value.validate(valid => {
    if (valid) {
      flag = true
    } else {
      flag = false
      proxy.$message.warning('请完善表单信息！')
    }
  })
  return flag
}

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value.id = null
  formData.value.year = ''
  formData.value.costType = ''
  formData.value.amount = null
  ruleForm.value?.clearValidate()
}

onMounted(() => {
  loadCostTypeOptions()
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
