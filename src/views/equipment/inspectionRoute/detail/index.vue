<template>
	<div class="formData">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="1">
				<el-form :model="formData" ref="ruleForm" label-width="120px" label-position="top" :rules="rules">
					<el-row :gutter="24">
						<el-col :span="8">
							<el-form-item label="路线编码" prop="routeCode">
								<el-input v-model="formData.routeCode" placeholder="请输入路线名称" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="路线名称" prop="routeName">
								<el-input v-model="formData.routeName" placeholder="请输入路线名称" maxlength="255" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="路线级别" prop="routeLevel">
								<Select
									v-model:value="formData.routeLevel"
									v-model:label="formData.routeLevel"
									placeholder="请选择路线级别"
									:dataConfig="{ params: { type: 'DICT', dictType: 'ROUTE_LEVEL' } }"
								/>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</el-collapse-item>
			<el-collapse-item title="巡检点列表" name="2">
				<template v-slot:title>
					<div style="display: flex; justify-content: space-between; width: 95%">
						<div>巡检点列表</div>
						<div>
							<el-button type="primary" @click.stop="addPoint">添加巡检点</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="editTableRef"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:editRules="editRules"
					:border="true"
					:stripe="true"
					:rowConfig="rowConfig"
					:tableHeight="400"
				/>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup name="inspectionRouteDetail">
import { ref, reactive, getCurrentInstance, h, nextTick } from 'vue'
import { ElButton, ElInputNumber } from 'element-plus'
import EditTable from '@/components/EditTable/index.vue'
import Select from '@/components/Select/index.vue'
import publicApi from '@/api/public/index'

const { proxy } = getCurrentInstance()

const activeNames = ref(['1', '2'])
const ruleForm = ref(null)
const editTableRef = ref(null)

const formData = ref({
	id: '',
	routeCode: '',
	routeName: '',
	routeLevel: '1',
})

const rules = reactive({
	routeName: proxy.getRules({ required: true }),
	routeLevel: proxy.getRules({ required: true }),
	routeCode: proxy.getRules({ required: true }),
})

const tableData = ref([])

const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }

const editRules = ref({
	equipId: [{ required: true, message: '设备必须选择' }],
	sortNum: [{ required: true, message: '巡检顺序必须填写' }],
})
const equipList = ref([])

const tableColumns = reactive([
	{
		prop: 'sortNum',
		label: '巡检顺序',
		width: 200,
		align: 'center',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 1,
				precision: 0,
			},
		},
	},
	{
		prop: 'equipId',
		label: '设备名称',
		minWidth: 200,
		editType: 'select',
		editRender: {},
		selectData: equipList,
		// dataConfig: { params: { type: 'EQUIPMENT' } },
		modelLabel: 'equipName',
	},
	{
		prop: 'delete',
		label: '操作',
		align: 'center',
		fixed: 'right',
		width: 120,
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
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

const handleDelete = row => {
	tableData.value.forEach((item, index) => {
		if (item.row_id == row.row_id) {
			tableData.value.splice(index, 1)
		}
	})
}

const addPoint = () => {
	tableData.value.push({
		id: null,
		parentId: null,
		equipId: '',
		equipName: '',
		sortNum: tableData.value.length + 1,
	})
}

const resetForm = () => {
	formData.value.id = ''
	formData.value.routeCode = ''
	formData.value.routeName = ''
	formData.value.routeLevel = '1'
	tableData.value = []
	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate(valid => {
		if (valid) {
			flag = true
		}
	})
	if (flag && tableData.value.length > 0) {
		const tableValid = await editTableRef.value.validAllEvent()
		flag = tableValid
	}
	return flag
}

const getEquipList = () => {
	publicApi.getLocalSelect({ type: 'EQUIPMENT' }).then(res => {
		equipList.value = res.data || []
	})
}
onMounted(() => {
	getEquipList()
})

defineExpose({
	validate,
	formData,
	resetForm,
	tableData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
