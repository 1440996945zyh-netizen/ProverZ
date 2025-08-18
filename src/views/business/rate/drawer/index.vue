<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="费率信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item prop="rateItemCode" label="费目名称">
							<el-select v-model="formData.rateItemCode" placeholder="请选择费目名称" clearable @change="changeRateItem">
								<el-option v-for="item in rateItemData" :key="item.id" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="serviceContentId" label="服务内容名称">
							<el-select
								v-model="formData.serviceContentId"
								placeholder="请选择服务内容名称"
								clearable
								@change="changeServiceContent"
							>
								<el-option
									v-for="item in serviceContentData"
									:key="item.id"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="processCode" label="作业过程">
							<el-select v-model="formData.processCode" placeholder="请选择作业过程" clearable @change="changeProcess">
								<el-option v-for="item in processData" :key="item.id" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="货物信息" prop="cargoCode">
							<div style="width: 100%">
								<RemoteSelect
									type="CARGO_INFO"
									v-model:value="formData.cargoCode"
									v-model:label="formData.cargoName"
									@change="changeSelect1"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="内外贸" prop="inteFore">
							<el-radio-group v-model="formData.inteFore">
								<el-radio label="内贸" value="内贸">内贸</el-radio>
								<el-radio label="外贸" value="外贸">外贸</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>

					<el-col :span="8">
						<el-form-item label="作业模式" prop="workType">
							<Select
								v-model:value="formData.workType"
								:selectData="[
									{ label: '件杂', value: '1' },
									{ label: '散杂', value: '2' },
								]"
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item prop="rate" label="费率">
							<el-input
								v-model="formData.rate"
								placeholder="请输入费率"
								@input="formData.rate = proxy.verify('positiveDecimal', formData.rate)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="taxRate" label="税率(%)">
							<el-input
								v-model="formData.taxRate"
								placeholder="请输入数字"
								@input="formData.taxRate = proxy.verify('number', formData.taxRate)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="计量单位" prop="measurementUnitCode1">
							<el-select v-model="formData.measurementUnitCode1" placeholder="请选择计量单位" clearable>
								<el-option
									v-for="item in unitData"
									:key="item.id"
									:label="item.dictLabel"
									:value="item.dictValue"
								></el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item prop="startDate" label="有效期起">
							<el-date-picker
								format="YYYY-MM-DD"
								v-model="formData.startDate"
								type="datetime"
								placeholder="开始时间"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="endDate" label="有效期止">
							<el-date-picker
								format="YYYY-MM-DD"
								v-model="formData.endDate"
								type="datetime"
								placeholder="开始时间"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="免堆存期" prop="freeStorageDays">
							<el-input
								v-model="formData.freeStorageDays"
								placeholder="请输入免堆存期"
								@input="formData.freeStorageDays = proxy.verify('number', formData.freeStorageDays)"
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24">
          <el-col :span="8">
            <el-form-item prop="easType" label="辅助帐类型">
              <el-input v-model="formData.easType" placeholder="请输入辅助帐类型" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
						<el-form-item prop="remark" label="备注">
							<el-input v-model="formData.remark" placeholder="请输入备注" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { reactive, ref, toRefs } from 'vue'
import api from '@/api/business/rate/index'
import publicApi from '@/api/public/index' //字典
import RemoteSelect from '@/components/RemoteSelect'
import Select from '@/components/Select'
const { proxy } = getCurrentInstance()
const ruleForm = ref()
const formData = reactive({
	id: undefined,
	rateItemCode: '',
	rateItemName: '', //费目
	serviceContentId: '', //服务内容
	serviceContentName: '',
	processCode: '',
	processName: '', //作业过程
	cargoCode: '', //货物信息
	cargoName: '',
	inteFore: '', //内外贸
	workType: '', //作业模式
	rate: '', //费率
	freeStorageDays: '',
	taxRate: '', //税率
	measurementUnitCode1: '', //计量单位1
	measurementUnitCode2: '', //计量单位2
	// dateArr: [], //时间段
	startDate: '', //有效期起
	endDate: '', //有效期止
	remark: '',
	status: '',
  rateCodeEas:'',
  rateNameEas:'',
  easType:'',
  easItemRateCode:'',
  easItemRateName:''
})
const easItemRateList = ref()
const data = reactive({
	unitData: [], //计量单位
	rateItemData: [], //费目名称数据
	serviceContentData: [], //服务内容数据
	processData: [], //作业过程数据
})
const { unitData, rateItemData, serviceContentData, processData } = toRefs(data)
const rules = reactive({
	rateItemCode: proxy.getRules({
		required: true,
	}),
	rate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	taxRate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 3,
			dec: 0,
		},
	}),
	measurementUnitCode1: proxy.getRules({
		required: true,
	}),
	// dateArr: proxy.getRules({
	// 	required: true,
	// }),
	startDate: proxy.getRules({
		required: true,
	}),
	endDate: proxy.getRules({
		required: true,
	}),
})
const collapseOpen = ['1'] // 打开的面板
// 多选框触发事件
const changeRateItem = val => {
	formData.rateItemName = ''
	rateItemData.value.forEach(item => {
		if (item.value == val) {
			formData.rateItemName = item.label
		}
	})
}
const changeServiceContent = val => {
	formData.serviceContentName = ''
	serviceContentData.value.forEach(item => {
		if (item.value == val) {
			formData.serviceContentName = item.label
		}
	})
}
const changeEasItemRateCode = val => {
	formData.easItemRateName = ''
  easItemRateList.value.forEach(item => {
		if (item.value == val) {
			formData.easItemRateName = item.label
		}
	})
}
const changeProcess = val => {
	formData.processName = ''
	processData.value.forEach(item => {
		console.log(item)
		if (item.value == val) {
			formData.processName = item.label
		}
	})
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
	console.log('重置', 'ruleForm')
	ruleForm.value.resetFields()
}
// 根据字典查下拉框数据
const getDictListData = () => {
	rateItemData.value = []
	serviceContentData.value = []
	processData.value = []
	publicApi.getLocalSelects({ types: 'SERVICE,MAIN_WORK_PROCESS,FEE_ITEM,' }).then(response => {
		rateItemData.value = response.data.FEE_ITEM
		serviceContentData.value = response.data.SERVICE
		processData.value = response.data.MAIN_WORK_PROCESS
	})
	publicApi.getDictList({ types: 'UNIT' }).then(response => {
		unitData.value = response.data.UNIT //计量单位
	})
  publicApi.getDictList({ types: 'EAS_ITEM_RATE' }).then(response => {
    easItemRateList.value = response.data.EAS_ITEM_RATE //计量单位
	})
}
getDictListData()

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
