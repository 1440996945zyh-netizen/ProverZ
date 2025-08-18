<!-- 子过程编辑表单 -->
<template>
	<div class="formData">
		<el-form ref="processForm" :model="formData" :rules="rules" label-width="auto">
			<el-form-item prop="processNm" label="子过程名称">
				<el-input
					v-model="formData.processNm"
					placeholder="请输入子过程名称"
					:maxlength="50"
					clearable
					@input="getShortCd"
				></el-input>
			</el-form-item>
			<el-form-item label="助记码" prop="shortCd">
				<el-input v-model="formData.shortCd" placeholder="不填写自动生成" :maxlength="50" clearable></el-input>
			</el-form-item>
			<el-form-item prop="sourceCd" label="源">
				<div style="width: 100%">
					<Select :selectData="orignList" v-model:value="formData.sourceCd" v-model:label="formData.sourceNm" />
				</div>
			</el-form-item>
			<el-form-item prop="targetCd" label="目的">
				<div style="width: 100%">
					<Select :selectData="orignList" v-model:value="formData.targetCd" v-model:label="formData.targetNm" />
				</div>
			</el-form-item>
			<el-form-item prop="inOutPortTypeCd" label="进出港配置">
				<div style="width: 100%">
					<Select :selectData="inOutPortTypeOptions" v-model:value="formData.inOutPortTypeCd" />
				</div>
			</el-form-item>
			<el-form-item label="是否理货过程" prop="isCargoPackageChange">
				<el-radio-group v-model="formData.isTallyCourse">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="是否改变货物包装" prop="isCargoPackageChange">
				<el-radio-group v-model="formData.isCargoPackageChange">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="作业理货量" prop="isTallyTon">
				<el-radio-group v-model="formData.isTallyTon">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<!-- <el-form-item label="是否为操作量" prop="isOperationTon">
				<el-radio-group v-model="formData.isOperationTon">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item> -->
			<el-form-item label="是否吞吐量" prop="isThroughput">
				<el-radio-group v-model="formData.isThroughput">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<!-- <el-form-item label="是否自然吨" prop="isNaturalTon">
				<el-radio-group v-model="formData.isNaturalTon">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item> -->
			<el-form-item label="是否指定核销" prop="isSettle">
				<el-radio-group v-model="formData.isSettle">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="是否有前置环节" prop="isPreProcess">
				<el-radio-group v-model="formData.isPreProcess">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
      <el-form-item label="签票部门" prop="isDispatchTally">
        <el-radio-group v-model="formData.isDispatchTally">
          <el-radio v-for="item in trueFalseOptions1" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否前沿(源)" prop="isFrontier">
        <el-radio-group v-model="formData.isFrontier">
          <el-radio v-for="item in isFrontierList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="调度/库场是否同时分配作业量" prop="isMeanwhile">
        <el-radio-group v-model="formData.isMeanwhile">
          <el-radio v-for="item in isMeanwhileList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="直取散货签票部门" prop="isDispatchTallySh">
        <el-radio-group v-model="formData.isDispatchTallySh">
          <el-radio v-for="item in trueFalseOptions1" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
			<el-form-item label="是否更新港存" prop="updatePoint">
				<div style="width: 100%">
					<Select
						:selectData="[
							{ label: '是', value: '1' },
							{ label: '否', value: '0' },
						]"
						v-model:value="formData.updatePoint"
					/>
				</div>
			</el-form-item>
      <el-form-item label="理货数据统计" prop="tallyDataStat">
				<div style="width: 100%">
					<Select
						:selectData="[
							{ label: '集疏港', value: '10' },
							{ label: '直取', value: '20' },
							{ label: '倒运', value: '30' },
							{ label: '落地装船', value: '40' },
							{ label: '前沿落地(集港)', value: '50' },
						]"
						v-model:value="formData.tallyDataStat"
					/>
				</div>
			</el-form-item>
			<el-form-item prop="inOutStorageTypeCd" label="入库标识">
				<div style="width: 100%">
					<Select :selectData="inOutStorageTypeOptions" v-model:value="formData.inOutStorageTypeCd" />
				</div>
			</el-form-item>
			<el-form-item label="排序" prop="sortNum">
				<el-input
					v-model="formData.sortNum"
					placeholder="不填写自动生成"
					:maxlength="4"
					@input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
				></el-input>
			</el-form-item>
      <el-form-item label="是否二次确认" prop="isConfirm">
        <div style="width: 100%">
          <Select
            :selectData="[
							{ value: '1', label: '否' },
							{ value: '2', label: '是' },
						]"
            v-model:value="formData.isConfirm"
          />
        </div>
      </el-form-item>
			<el-form-item prop="remark" label="备注">
				<el-input v-model="formData.remark" placeholder="请输入备注" :maxlength="200" clearable autocomplete="off"></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import publicApi from '@/api/public/index.js'
import { creatShortCd } from '@/utils/index.js'
import Select from '@/components/Select'
const props = defineProps({
	orignList: {
		type: Array,
		default: null,
	},
})
const trueFalseOptions = ref([
	{ label: '是', value: '1' },
	{ label: '否', value: '0' },
])
const trueFalseOptions1 = ref([
  { label: '调度室', value: '1' },
  { label: '库场队', value: '2' },
])
const isFrontierList = ref([
  { label: '是', value: '1' },
  { label: '否', value: '0' },
])
const isMeanwhileList = ref([
  { label: '是', value: '1' },
  { label: '否', value: '0' },
])
const processForm = ref()
const formData = reactive({
	processNm: '',
	processCd: '',
	shortCd: '',
	sourceCd: '',
	sourceNm: '',
	targetCd: '',
	targetNm: '',
	inOutPortTypeCd: '',
	isTallyCourse: '0', //是否理货过程
	isOperationTon: '0',
	isCargoPackageChange: '0',
	isTallyTon: '0',
	isThroughput: '0',
	isNaturalTon: '0',
	isSettle: '0',
	isPreProcess: '0',
  isDispatchTally:'0',
  isFrontier:'0',
  isMeanwhileList:'0',
  isDispatchTallySh:'0',
	updatePoint: '',
  tallyDataStat:'',
	inOutStorageTypeCd: '',
	sortNum: '',
	remark: '',
	id: '',
  isConfirm:'',
})

const rules = reactive({
	processNm: proxy.getRules({ required: true, length: '1-50' }),
	shortCd: proxy.getRules({ length: '0-50' }),
	remark: proxy.getRules({ length: '0-200' }),
})
const getShortCd = value => {
	console.log('123', creatShortCd)
	formData.shortCd = creatShortCd(value)
}
const validate = async () => {
	let flag = false
	await processForm.value.validate((valid, fields) => {
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
	processForm.value.resetFields()
	formData.sourceNm = ''
	formData.targetNm = ''
}
const inOutPortTypeOptions = ref([])
const inOutStorageTypeOptions = ref([])
const init = () => {
	publicApi.getDictList({ types: 'IN_OUT_PORT_TYPE,IN_OUT_STORAGE_TYPE' }).then(res => {
		inOutPortTypeOptions.value = res.data.IN_OUT_PORT_TYPE // 进出港
		inOutStorageTypeOptions.value = res.data.IN_OUT_STORAGE_TYPE // 入库
	})
}
defineExpose({
	validate,
	resetForm,
	formData,
})
init()
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
