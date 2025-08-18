<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="费率信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="货物信息" prop="cargoCode">
							<div style="width: 100%">
								<RemoteSelect
									type="CARGO_INFO_SIGN"
									v-model:value="formData.cargoCode"
									v-model:label="formData.cargoName"
									@change="changeSelect1"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="rateItemCode" label="费目名称">
							<el-select v-model="formData.rateItemCode" placeholder="请选择费目名称" clearable @change="changeRateItem">
								<el-option v-for="item in rateItemData" :key="item.id" :label="item.label" :value="item.value"></el-option>
							</el-select>
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
				</el-row>
				<el-row :gutter="24"></el-row>
				<el-row :gutter="24">
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
				</el-row>
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item prop="remark" label="备注">
							<el-input v-model="formData.remark" placeholder="请输入备注" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="费率详情" name="2">
				<EditTable
					ref="baseTable"
					:showSearchHeader="false"
					:showPagination="false"
					:showToolBarEditTable="true"
					:tableColumns="tableColumns"
					:tableData="tableList"
					:tableHeight="tableHeight"
					:editRules="editRules"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { reactive, ref, toRefs } from 'vue'
import api from '@/api/business/lumpSum/index'
import publicApi from '@/api/public/index' //字典
import RemoteSelect from '@/components/RemoteSelect'
import EditTable from '@/components/EditTable/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
const { proxy } = getCurrentInstance()
// 可编辑列表
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
const ruleForm = ref()
const formData = reactive({
	id: '',
	rateItemCode: '02',
	rateItemName: '港口作业包干费', //费目
	cargoCode: '', //货物信息
	cargoName: '',
	taxRate: '6', //税率
	measurementUnitCode1: 'ton', //计量单位1
	// dateArr: [], //时间段
	startDate: '', //有效期起
	endDate: '', //有效期止
	remark: '',
})
const data = reactive({
	unitData: [], //计量单位
	rateItemData: [], //费目名称数据
	serviceContentData: [], //服务内容数据
	processData: [], //作业过程数据
})
const { unitData, rateItemData, serviceContentData, processData } = toRefs(data)
const rules = reactive({
  cargoCode: proxy.getRules({
    required: true,
  }),
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
const collapseOpen = ['1', '2'] // 打开的面板
// 多选框触发事件
const changeRateItem = val => {
	formData.rateItemName = ''
	rateItemData.value.forEach(item => {
		console.log(item)
		if (item.value == val) {
			formData.rateItemName = item.label
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
	formData.id = ''
	ruleForm.value.resetFields()
}
const editRules = ref()
// 可编辑列表
const tableList = ref([])
const tableColumns = ref([
	{
		prop: 'inteFore',
		label: '内外贸',
	},
	{
		label: '进出口',
		prop: 'inOut',
		render: row => {
			// let text =
			// return [h('div', {}, text)]
			return [h('div', {}, row.inOut == 'IN' ? '进口' : row.inOut == 'OUT' ? '出口' : '进出口')]
		},
	},
	{ label: '作业方式', prop: 'serviceContentName' },
	{ label: '含税费率', prop: 'rate', editType: 'input', editRender: {} },
])
// 根据字典查下拉框数据
const getDictListData = () => {
	const date = new Date()
	formData.startDate = date.getFullYear() + '-' + '01' + '-' + '01'
	formData.endDate = date.getFullYear() + '-' + '12' + '-' + '31'
	rateItemData.value = []
	serviceContentData.value = []
	processData.value = []
	publicApi.getLocalSelects({ types: 'SERVICE,MAIN_WORK_PROCESS,FEE_ITEM,' }).then(response => {
		rateItemData.value = response.data.FEE_ITEM.filter(item => item.label == '港口作业包干费')
		serviceContentData.value = response.data.SERVICE
		processData.value = response.data.MAIN_WORK_PROCESS
	})
	publicApi.getDictList({ types: 'UNIT' }).then(response => {
		unitData.value = response.data.UNIT //计量单位
	})
}
getDictListData()

defineExpose({
	validate,
	resetForm,
	formData,
	tableList,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
