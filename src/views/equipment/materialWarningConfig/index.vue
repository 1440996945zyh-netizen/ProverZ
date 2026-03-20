<template>
	<div class="app-container">
		<div class="table-wrapper">
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
				:tableHeight="tableHeight"
			/>
		</div>
		<Drawer v-model="dialogVisible" :title="title" size="40%">
			<detail ref="detailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="materialWarningConfig">
import { ref, reactive, computed, getCurrentInstance, toRefs, h, nextTick } from 'vue'
import { ElButton, ElTag, ElSwitch } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/materialWarningConfig/index'
import tableParamsStore from '@/store/modules/tableParams'

const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHeight.value - 90)

const { proxy } = getCurrentInstance()
const baseTable = ref()
const total = ref('')
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		materialName: undefined,
		status: undefined,
	},
})
const { queryParams } = toRefs(data)

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 180, showOverFlow: true },
	{ label: '物资编码', prop: 'materialCode', align: 'left', minWidth: 150, showOverFlow: true },
	{ label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 150, showOverFlow: true },
	{ label: '计量单位', prop: 'unitName', align: 'center', width: 100 },
	{ label: '预警阈值', prop: 'warningThreshold', align: 'center', width: 100 },
	{ label: '预警接收人', prop: 'receiverNames', align: 'left', minWidth: 200, showOverFlow: true },
	{
		prop: 'status',
		label: '状态',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status === '1' ? 'success' : 'danger',
						size: 'default',
					},
					{
						default: () => {
							return row.status === '1' ? '启用' : '禁用'
						},
					},
				),
			]
		},
	},
	{ label: '创建时间', prop: 'createTime', align: 'center', width: 180 },
	{ label: '修改时间', prop: 'updateTime', align: 'center', width: 180 },
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
						permission: 'equipment:materialWarningConfig:update',
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
						permission: 'equipment:materialWarningConfig:delete',
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
		name: '物资名称',
		type: 'input',
		modelValue: 'materialName',
		span: 8,
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ label: '启用', value: '1' },
			{ label: '禁用', value: '0' },
		],
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd,
		permission: 'equipment:materialWarningConfig:add',
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
	dialogVisible.value = false
	reset()
}

const reset = () => {
	detailRef.value?.resetForm()
}

const handleAdd = () => {
	reset()
	title.value = '新增物资预警配置'
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleUpdate = row => {
	title.value = '编辑物资预警配置'
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.materialId = resData.materialId
			detailRef.value.formData.materialName = resData.materialName
			detailRef.value.formData.materialCode = resData.materialCode
			detailRef.value.formData.specificationModel = resData.specificationModel
			detailRef.value.formData.unitName = resData.unitName
			detailRef.value.formData.warningThreshold = resData.warningThreshold
			detailRef.value.formData.receivers = resData.receivers || ''
			detailRef.value.formData.receiverNames = resData.receiverNames || ''
			detailRef.value.formData.status = resData.status || '1'
			if (resData.receivers) {
				detailRef.value.selectedUsers = resData.receivers.split(',').map((id, index) => {
					const names = resData.receiverNames ? resData.receiverNames.split(',') : []
					return {
						id: id,
						name: names[index] || '',
					}
				})
			} else {
				detailRef.value.selectedUsers = []
			}
		})
	})
}

const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = detailRef.value.formData
		if (params.id) {
			api.update(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				dialogVisible.value = false
				getList()
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				dialogVisible.value = false
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

<style lang="scss" scoped></style>
