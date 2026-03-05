<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="单位" prop="repairContarctId">
				<Select
					:selectData="unitOptions"
					v-model:value="formData.repairContarctId"
					v-model:label="formData.repairContarctName"
					placeholder="请选择单位"
				/>
			</el-form-item>

			<el-form-item label="姓名" prop="repairName">
				<el-input v-model="formData.repairName" placeholder="请输入姓名" maxlength="50" />
			</el-form-item>

			<el-form-item label="身份证号" prop="idCard">
				<el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
			</el-form-item>

			<el-form-item label="手机号" prop="phone">
				<el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
			</el-form-item>

			<el-form-item label="资格证书">
				<div style="display: flex; flex-direction: column; width: 100%">
					<EditTable
						ref="certificateTableRef"
						:name="'资格证书'"
						:tableData="list"
						:tableColumns="certificateColumns"
						:tableHeight="300"
						:editRules="certificateEditRules"
						:rowConfig="rowConfig"
						:disabledKey="'rowDisabled'"
						:hasAdd="true"
						:row-style="{ height: '80px' }"
					/>
					<!-- <el-button type="primary" link style="margin-top: 10px" @click="addCertificate">
						<el-icon style="vertical-align: middle; margin-right: 4px">
							<Plus />
						</el-icon>
						新增证书
					</el-button> -->
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="maintenancePersonnelDetail">
import { ref, reactive, getCurrentInstance, toRefs, h, onMounted } from 'vue'
import { ElButton, ElInput, ElInputNumber, ElSelect, ElOption, ElDatePicker } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import Upload from '@/components/upload'
import api from '@/api/equipment/maintenancePersonnel/index'
import publicApi from '@/api/public/index.js'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const certificateTableRef = ref()
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }

const data = reactive({
	formData: {
		id: null,
		repairContarctId: null,
		repairContarctName: '',
		repairName: '',
		idCard: '',
		phone: '',
	},
	list: [],
})
const { formData, list } = toRefs(data)

const unitOptions = ref([])

const getUnitList = () => {
	api.queryUnitName({}).then(res => {
		if (res.code === '0000') {
			unitOptions.value = res.data.map(item => ({
				label: item.unitName || item.repairContarctName || item.name,
				value: item.id || item.unitId || item.repairContarctId,
			}))
		}
	})
}
const certificateTypeOptions = ref([])
const getCertificateType = () => {
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'CERTIFICATE_TYPE' }).then(res => {
		if (res.code === '0000') {
			certificateTypeOptions.value = res.data
		}
	})
}

onMounted(() => {
	getUnitList()
	getCertificateType()
})

const rules = reactive({
	repairContarctId: proxy.getRules({ required: true }),
	repairName: proxy.getRules({ required: true }),
	idCard: proxy.getRules({ required: true }),
	phone: proxy.getRules({ required: true, handset: {} }),
})

const certificateColumns = reactive([
	{
		label: '证照名称',
		prop: 'certificateName',
		editType: 'input',
		editRender: {
			component: ElInput,
			props: {
				placeholder: '请输入证照名称',
			},
		},
		minWidth: 150,
	},
	{
		label: '证书类型',
		prop: 'certificateType',
		editType: 'select',
		editRender: {
			component: ElSelect,
			props: {
				placeholder: '请选择证书类型',
			},
		},
		selectData: certificateTypeOptions,
		selectLabel: 'label',
		selectValue: 'value',
		minWidth: 150,
	},
	{
		label: '到期时间',
		prop: 'certificateTime',
		editType: 'date',
		editRender: {},
		minWidth: 150,
		align: 'center',
	},
	{
		label: '附件',
		prop: 'list',
		editType: 'upload',
		editRender: {
			component: Upload,
			props: {
				businessType: 'MAINTENANCE_PERSONNEL_CERTIFICATE',
				fileTypeName: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
			},
		},
		minWidth: 350,
	},
	{
		prop: '',
		label: '添加',
		width: 80,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteCertificate(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

const certificateEditRules = reactive({
	certificateName: proxy.getRules({ required: true }),
	certificateType: proxy.getRules({ required: true }),
	certificateTime: proxy.getRules({ required: true }),
})

const addCertificate = () => {
	const nextIndex = list.value.length + 1
	const newRow = {
		row_id: Date.now(),
		certificateName: `证照${nextIndex}`,
		certificateType: '',
		certificateTime: '',
		list: [],
		rowDisabled: false,
	}
	list.value.push(newRow)
}

const deleteCertificate = row => {
	proxy.$modal
		.confirm('确定删除该证书?')
		.then(() => {
			const index = list.value.findIndex(item => item.row_id === row.row_id)
			if (index > -1) {
				list.value.splice(index, 1)
			}
		})
		.catch(err => {})
}

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
	formData.value.id = null
	formData.value.repairContarctId = null
	formData.value.repairContarctName = ''
	formData.value.repairName = ''
	formData.value.idCard = ''
	formData.value.phone = ''
	list.value = []
	ruleForm.value?.clearValidate()
}

defineExpose({
	validate,
	resetForm,
	formData,
	list,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
