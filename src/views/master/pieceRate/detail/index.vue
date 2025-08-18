<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="作业公司" prop="companyId">
				<Select
					:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
					v-model:value="formData.companyId"
					v-model:label="formData.companyName"
					placeholder="作业公司"
				/>
			</el-form-item>
      <el-form-item label="所属部门" prop="deptId" style="width: 100%">
        <div style="width: 100%">
          <Select :dataConfig="{ params: { type: 'DEPT_INNER_ID' } }"
                  v-model:value="formData.deptId"
                  v-model:label="formData.deptName"
          />
        </div>
      </el-form-item>
			<el-form-item label="计件工资类型" prop="salaryTypeCode" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
						v-model:value="formData.salaryTypeCode"
						v-model:label="formData.salaryTypeName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="主作业过程" prop="workProcessId">
				<Select
					:selectData="MAIN_PROCESS"
					v-model:value="formData.workProcessId"
					v-model:label="formData.workProcessName"
					@change="childChange"
				/>
			</el-form-item>

			<el-form-item label="子作业过程" prop="workProcessChildId">
				<Select
					:selectData="CHILD_PROCESS"
					v-model:value="formData.workProcessChildId"
					v-model:label="formData.workProcessChildName"
				/>
			</el-form-item>
			<el-form-item label="单价" prop="price">
				<el-input
					v-model="formData.price"
					@input="formData.price = proxy.verify('threePoint', formData.price)"
					placeholder="请输入单价"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
import api from '@/api/master/pieceRate'
import publicApi from "@/api/public";
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const MAIN_PROCESS = ref([]) //主过程
const CHILD_PROCESS = ref([]) //子过程

const childChange = e => {
	formData.workProcessChildName = ''
	formData.workProcessChildId = ''
  let newProcessFlag = false;
  publicApi.getSystemParams({key:"NEW_PROCESS"}).then(res=> {
    let data = res.data;
    newProcessFlag = data.paramVal == "Y" ? true : false;
    api.getWorkProcessSelect({parentId: e.value}).then(res => {
      const resData = JSON.parse(JSON.stringify(res.data))
      let data = []
      if (newProcessFlag) {
        for (let index in res.data) {
          let item = res.data[index]
          if (item.newProcess == '1') {
            data.push(item)
          }
        }
      } else {
        for (let index in res.data) {
          let item = res.data[index]
          data.push(item)
        }
      }
      CHILD_PROCESS.value = data
      console.log(CHILD_PROCESS.value)
    })
  })
}
const ruleForm = ref()
const formData = reactive({
	id: '',
	companyId: '',
	price: '',
	workProcessChildName: '',
	workProcessChildId: '',
	workProcessName: '',
	workProcessId: '',
	companyName: '',
	deptId: '',
	deptName: '',
	salaryTypeCode: '',
	salaryTypeName: '',
})

const rules = reactive({
	companyId: [{ required: true, message: '请输入作业公司名称', trigger: 'blur' }],
	/*workProcessChildId: [{ required: true, message: '请输入子作业过程', trigger: 'blur' }],
	workProcessId: [{ required: true, message: '请输入主作业过程', trigger: 'blur' }],*/
	price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
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
	CHILD_PROCESS.value = []
}
const init = () => {
	api.getWorkProcessSelect({ parentId: -1 }).then(res => {
		const resData = JSON.parse(JSON.stringify(res.data))
		MAIN_PROCESS.value = resData
	})
}
init()

defineExpose({
	validate,
	resetForm,
	formData,
	CHILD_PROCESS,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
