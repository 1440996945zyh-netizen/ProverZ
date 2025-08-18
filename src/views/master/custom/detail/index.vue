<template>
	<div class="demo-collapse">
		<el-collapse v-model="activeName" accordion>
			<el-collapse-item title="客户资料" name="1">
				<div>
					<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules">
						<el-row :gutter="20">
							<el-col :span="8">
								<el-form-item label="客户代码" prop="customerCode">
									<el-input v-model="formData.customerCode" placeholder="客户代码" />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="客户名称" prop="customerName">
									<el-input v-model="formData.customerName" placeholder="客户名称" />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="英文名称" prop="enCustomerName">
									<el-input v-model="formData.enCustomerName" placeholder="英文名称" />
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="20">
							<el-col :span="8">
								<el-form-item label="简称" prop="customerShort">
									<el-input v-model="formData.customerShort" placeholder="简称" />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="状态" prop="stauts" style="width: 100%">
									<el-select v-model="formData.stauts" class="m-2" placeholder="状态">
										<el-option label="在用" value="1" />
										<el-option label="停用" value="0" />
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item
									label="客户类型"
									prop="typeList"
									style="width: 100%"
									:rules="[{ type: 'array', required: true, message: '请输入客户名称', trigger: 'blur' }]"
								>
									<el-select v-model="typeList" @change="changeTypeList" value-key="id" placeholder="客户类型" multiple>
										<el-option
											v-for="item in dictData.value"
											:key="item.dictValue"
											:label="item.dictLabel"
											:value="item.dictValue"
										/>
									</el-select>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="20">
							<el-col :span="16">
								<el-form-item label="备注" prop="remark">
									<el-input v-model="formData.remark" type="textarea" placeholder="备注" />
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</div>
			</el-collapse-item>
			<el-collapse-item title="Feedback" name="2">
				<template #title>
					<div>
						<span>开票信息</span>
						<span style="position: absolute; left: 87%">
							<el-button size="mini" type="primary" @click.stop="addInvoce">添加</el-button>
						</span>
					</div>
				</template>
				<div>
					<EditTable
						ref="editTable"
						:tableHeight="300"
						:tableColumns="tableColumns"
						:tableData="formData.invoceList"
						:editRules="editRules"
						:border="true"
						:showPagination="false"
					/>
				</div>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import request from '@/utils/request'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from '@/components/EditTable/index.vue'
import { ElButton } from 'element-plus'
import Select from '@/components/Select'

const ruleForm = ref()
const editTable = ref()
const activeName = ref(['1', '2'])
const typeList = ref([])
const tableColumns = ref([
	{ label: '开票名称', prop: 'invoiceName', editType: 'input', editRender: {} },
	{ label: '开票地址', prop: 'invAddress', editType: 'input', editRender: {} },
	{ label: '电话', prop: 'invTel', editType: 'input', editRender: {} },
	{ label: '开户行', prop: 'invBank', editType: 'input', editRender: {} },
	{ label: '开户行号', prop: 'invBankNo', editType: 'input', editRender: {} },
	{ label: '纳税人识别号', prop: 'invTaxNo', editType: 'input', editRender: {} },
	{
		label: '发票类型',
		prop: 'invKindFlag',
		editType: 'select',
		editRender: {},
		selectData: [
			{ label: '专票', value: '0' },
			{ label: '普票', value: '1' },
		],
	},
	{ label: '备注', prop: 'remark', editType: 'input', editRender: {} },
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							deleteData(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const formData = reactive({
	customerCode: '',
	customerName: '',
	enCustomerName: '',
	customerShort: '',
	stauts: '',
	remark: '',
	invoceList: [],
	typeList: [],
})
const rules = reactive({
	customerCode: [{ required: true, message: '请输入客户代码', trigger: 'blur' }],
	customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
	stauts: [{ required: true, message: '请选择状态', trigger: 'blur' }],
})
const editRules = ref({
	invoiceName: [{ required: true, message: '请输入开票名称' }],
	invAddress: [{ required: true, message: '请输入开票地址' }],
	invTel: [{ required: true, message: '请输入电话' }],
	invBank: [{ required: true, message: '请输入开户行' }],
	invBankNo: [{ required: true, message: '请输入开户行号' }],
	invTaxNo: [{ required: true, message: '请输入纳税人识别号' }],
	invKindFlag: [{ required: true, message: '请输入发票类型' }],
})

const validate = async () => {
	let flag = false
	let flag1 = await editTable.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1) {
			flag = true
		} else {
			flag = false
			// proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	console.log(flag)
	return flag
}
const resetForm = () => {
	ruleForm.value.resetFields()
}
const addInvoce = () => {
	let data = {
		customerCode: '',
		invoiceName: '',
		invAddress: '',
		invTel: '',
		invBank: '',
		invBankNo: '',
		invTaxNo: '',
		invKindFlag: '',
		remark: '',
	}
	formData.invoceList.push(data)
}
const dictData = reactive([])
const getDict = () => {
	request({
		url: `/api/internal/public/getDictListByType/CUSTOMER_TYPE`,
		method: 'get',
	}).then(res => {
		dictData.value = res.data
	})
}
const changeTypeList = row => {
	if (row.length > 0) {
		formData.typeList = []
		row.forEach(item => {
			let data = {
				customerCode: formData.customerCode,
				customerTypeCode: item,
				customerTypeName: dictData.value.filter(d => d.dictValue == item)[0].dictLabel,
			}
			formData.typeList.push(data)
		})
	}
}
const deleteData = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			formData.invoceList.splice(row, 1)
		})
		.catch(err => {})
}
onMounted(() => {
	getDict()
})
defineExpose({
	validate,
	resetForm,
	formData,
	typeList,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
