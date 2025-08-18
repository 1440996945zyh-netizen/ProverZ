<template>
	<div>
		<div class="clean">
      <el-form :model="formData" ref="ruleForm" :inline="true" >
        <el-form-item label="是否为海清物流" prop="isHq" >
            <Select
              v-model:value="formData.isHq"
              :disabled="disabled"
              :selectData="[
                      { label: '是', value: '1' },
                      { label: '否', value: '0' },
                    ]"/>
          </el-form-item>
      </el-form>
			</div>
  	</div>
</template>

<script setup>
import Select from '@/components/Select'
import {ref} from "vue";
const formData = ref({
	cargoInfoId: '', //票货id
  isHq: '', //作业日期
})
const ruleForm = ref()
const disabled = ref()
// 获取班次和当前班次接口
const resetForm = () => {
  ruleForm.value.resetFields()
  formData.value.isHq = ''
  formData.value.cargoInfoId = ''
}
defineExpose({
  formData,
  resetForm,
  disabled
})
</script>

<style lang="scss" scoped>
.clean {
	display: flex;
	height: 40px;
	line-height: 40px;
	.clean_date {
		width: 115px;
	}
	.clean_class {
		width: 50px;
		margin-left: 10px;
	}
	.selectClass {
		width: 200px;
	}
}
.cargoInfo {
	height: 40px;
	line-height: 40px;
	font-size: 16px;
}
</style>
