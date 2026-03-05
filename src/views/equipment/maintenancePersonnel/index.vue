<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:total="total"
		/>
		<Dialog v-model:visible="open" :title="title" width="50%">
			<detail ref="detailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="maintenancePersonnel">
import { ref, reactive, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenancePersonnel/index'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref('')
const tableData = ref([])
const loading = ref(false)
const open = ref(false)
const title = ref('')
const detailRef = ref(null)

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		repairContarctName: undefined,
		repairName: undefined,
	},
})
const { queryParams } = toRefs(data)

const getCertificateTypeNames = list => {
	if (!list || list.length === 0) return ''
	const certificateTypeMap = {
		1: '职业资格证书',
		2: '技能等级证书',
		3: '特种作业证书',
		4: '其他',
	}
	return list
		.map(item => {
			const certName = item.certificateName || ''
			const typeName = certificateTypeMap[item.certificateType] || ''
			return certName ? `${certName}(${typeName})` : typeName
		})
		.join('、')
}

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '单位', prop: 'repairContarctName', align: 'left', minWidth: 180, showOverFlow: true },
	{ label: '姓名', prop: 'repairName', align: 'center', minWidth: 100 },
	{ label: '身份证号', prop: 'idCard', align: 'center', minWidth: 180 },
	{ label: '手机号', prop: 'phone', align: 'center', minWidth: 120 },
	{
		prop: 'list',
		label: '资格证书',
		align: 'left',
		minWidth: 300,
		showOverFlow: true,
		render: row => {
			return getCertificateTypeNames(row.list)
		},
	},
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 150,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:emequiprepairuser:update',
					},
					{
						default: () => '编辑',
					},
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'equipment:emequiprepairuser:delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

const selectData = reactive([
	{
		name: '单位',
		type: 'input',
		modelValue: 'repairContarctName',
		span: 12,
	},
	{
		name: '姓名',
		type: 'input',
		modelValue: 'repairName',
		span: 12,
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd,
		permission: 'system:user:add',
	},
])

const getList = e => {
	loading.value = true
	queryParams.value = e
	api.getList(e).then(res => {
		loading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

const cancel = () => {
	open.value = false
	reset()
}

const reset = () => {
	detailRef.value?.resetForm()
}

const handleAdd = () => {
	reset()
	title.value = '新增维修人员'
	open.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleUpdate = row => {
	reset()
	title.value = '编辑维修人员'
	open.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.repairContarctId = resData.repairContarctId
			detailRef.value.formData.repairContarctName = resData.repairContarctName
			detailRef.value.formData.repairName = resData.repairName
			detailRef.value.formData.idCard = resData.idCard
			detailRef.value.formData.phone = resData.phone
			detailRef.value.list = resData.list || []
		})
	})
}

const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = {
			...detailRef.value.formData,
			list: detailRef.value.list,
		}
		if (params.id) {
			api.update(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList()
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList()
			})
		}
	}
}

const handleDelete = row => {
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.delete(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

getList(queryParams.value)
</script>

<style lang="scss" scoped>
.app-container {
	padding: 20px;
}
</style>
