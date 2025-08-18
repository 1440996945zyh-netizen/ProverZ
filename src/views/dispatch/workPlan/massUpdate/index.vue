<template>
  <div class='formData'>
    <el-form :model='formData' ref='massForm' label-position='left' label-width='120px'>

      <el-form-item label='源货垛' prop='massIdsSource'>
        <RemoteSelect
          type='ALL_STORAGE_MASS'
          v-model:value='formData.regionIdsSource'
          @change='changeMass'
          multiple
        />
      </el-form-item>

      <el-form-item label='目标货垛' prop='massIdsTarget'>
        <RemoteSelect
          type='ALL_STORAGE_MASS'
          v-model:value='formData.regionIdsTarget'
          @change='changeMassTarget'
          multiple
        />
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup name='massDetail'>
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import publicApi from '@/api/public/index' //字典
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue'

const ruleForm = ref()
const instructionsImportRef = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({})
const formData = reactive({
  updateType: '0',
  id: '',
  regionIdsSource: '',
  regionIdsTarget: '',
  locationListSource: [],
  locationListTarget: []
})


const resetForm = () => {
  proxy.resetObj(formData)
    formData.id= '',
    formData.regionIdsSource='',
    formData.regionIdsTarget='',
    formData.locationListSource=[],
    formData.locationListTarget=[]
  // ruleForm.value.resetFields()
}

// 修改垛位处理数据
const changeMass = row => {
  formData.locationListSource = row
}

const changeMassTarget = row => {
  formData.locationListTarget = row
}

defineExpose({
  resetForm,
  formData
})
</script>
<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
