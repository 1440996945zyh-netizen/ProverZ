<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" label-width="120px" :rules="rules">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="指令票货信息" name="1">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="通知单编号" prop="tbtTrustNo">
								<el-input v-model="formData.tbtTrustNo" :disabled="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="作业过程" prop="tbtProcessName">
								<el-input v-model="formData.tbtProcessName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="作业公司" prop="tbtCompanyName">
								<el-input v-model="formData.tbtCompanyName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="船名_航次" prop="shipNameVoyage">
								<el-input v-model="formData.shipNameVoyage" :disabled="true" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="货主" prop="tbtcCargoOwnerName">
								<el-input v-model="formData.tbtcCargoOwnerName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="货代" prop="tbtcCargoAgentName">
								<el-input v-model="formData.tbtcCargoAgentName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="货名" prop="tbtcCargoName">
								<el-input v-model="formData.tbtcCargoName" :disabled="true" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="内外贸" prop="tbtTradeType">
								<el-input v-model="formData.tbtTradeType" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="包装" prop="tbtcPackingName">
								<el-input v-model="formData.tbtcPackingName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="量" prop="tbtcTon">
								<el-input v-model="formData.tbtcTon" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="件" prop="tbtcQuantity">
								<el-input v-model="formData.tbtcQuantity" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
				<el-collapse-item title="车队信息" name="2">
					<EditTable
						ref="baseTable"
						:showSearchHeader="false"
						:showPagination="false"
						:showToolBarEditTable="true"
						:tableColumns="tableColumns"
						:tableData="formData.assignFleets"
						:tableHeight="tableHeight"
						:editRules="editRules"
						:hasAdd="true"
						:disabledKey="'tbttrId'"
					/>
				</el-collapse-item>
			</el-collapse>
		</el-form>
	</div>
</template>

<script setup name="assignFleet">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/public/index'
import tableParamsStore from '@/store/modules/tableParams'
import { ElButton } from 'element-plus'
const baseTable = ref()
const ruleForm = ref()
const activeNames = reactive(['1', '2'])
const formData = reactive({
	assignFleets: [],
	tbciShipName: '',
	tbciCargoInfoNo: '',
	tbciCargoOwnerName: '',
})
const editRules = ref({
	customerId: [{ required: true, message: '物流车队必须填写' }],
	ton: [
		{ required: true, message: '计划重量必须填写' },
		{
			pattern: /^\d{0,7}(\.\d{0,3})?$/,
			message: '计划件数数字长度最长为7位整数,三位小数',
			trigger: 'blur',
		},
	],
	quantity: [{ pattern: /^\d{0,8}$/, message: '计划件数数字长度最长为8位', trigger: 'blur' }],
})
// 可编辑列表
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
// const tableEditConfig = reactive({ trigger: 'click', mode: 'cell' })
const tableData = reactive([])
const tableColumns = ref([
	{
		prop: 'customerId',
		label: '物流车队',
		editType: 'remoteSelect',
		type: 'CUSTOMER_FLEET',
		editRender: {},
		selectLabel: 'label', // options绑定的值，默认为label，和默认一致则不用传。
		selectValue: 'value', // options绑定的值，默认为value，和默认一致则不用传。
		modelLabel: 'customerName', // 选中label绑定的字段
		selectData: [],
	},
	{ label: '计划重量', prop: 'ton', editType: 'input', editRender: {} },
	{ label: '计划件数', prop: 'quantity', editType: 'input', editRender: {} },
	{
		prop: '',
		label: '添加',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: row.tbttrId,
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 删除事件
const handleDelete = row => {
	let rowIndex = ''
	formData.assignFleets.forEach((item, index) => {
		if (item._X_ROW_KEY == row._X_ROW_KEY) {
			rowIndex = index
		}
	})
	console.log('可编辑列表禁用', formData.assignFleets)
	formData.assignFleets.splice(rowIndex, 1)
}
const validate = async () => {
	const flag = await baseTable.value.validAllEvent()
	return flag
}
const resetForm = () => {
	ruleForm.value.resetFields()
}
defineExpose({
	validate,
	resetForm,
	formData,
	tableData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
