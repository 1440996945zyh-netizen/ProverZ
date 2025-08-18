<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules">
			<el-form-item label="库场名称" prop="storageYardNm">
				<el-input v-model="formData.storageYardNm" placeholder="库场名称" @input="getShortCd" />
			</el-form-item>
			<el-form-item label="助记码" prop="shortCd">
				<el-input v-model="formData.shortCd" placeholder="助记码" />
			</el-form-item>
      <el-form-item label="是否保税区" prop="isBondedArea">
        <el-radio-group v-model="formData.isBondedArea">
          <el-radio label="1">是</el-radio>
          <el-radio label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
			<el-form-item label="排序" prop="sortNum">
				<el-input
					v-model="formData.sortNum"
					placeholder="排序"
					@input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
				/>
			</el-form-item>
			<el-form-item label="场地" prop="sortNum">
        <el-select @change="changePosition" clearable = "true" v-model="formData.positionCode" placeholder="场地">
          <el-option
            v-for="item in positionList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            >
          </el-option>
        </el-select>

      </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="Stack">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { creatShortCd } from '@/utils/index.js'
import api from "@/api/master/waifuProcess";
const ruleForm = ref()
const positionList = ref([])
const formData = reactive({
	storageYardNm: '',
	shortCd: '',
	sortNum: '',
	id: '',
	parentId: '',
	storageYardLevel: '',
  isBondedArea:'',
  positionCode:'',
  positionName:'',
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
	storageYardTypeCd: proxy.getRules({
		required: true,
	}),
	area: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	unitAreaTon: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
})
const changePosition= (e)=>{
  console.log(e,'1')
  formData.positionName = ''
  positionList.value.forEach(o=>{
    if(o.value==e){
      formData.positionName=o.label
    }
  })
  console.log(formData,'formData');
}
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
  formData.positionCode=''
	console.log(ruleForm, 'ruleForm')
	ruleForm.value.resetFields()
}
const initStack=()=>{
  positionList.value = [
    {value:'01',label:'岸边'},
    {value:'02',label:'后场'}
  ]
}
initStack()
defineExpose({
	validate,
	resetForm,
	formData,
  positionList,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
