<template>
	<div class="app-container">
		<!-- 主列表设备资料文件显示 -->
		<div class="container-content">
			<BaseTable
				ref="eqptFileTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableData="eqptFileList"
				:tableColumns="tableColumns"
				name="eqptFileTable"
				:loading="tableLoading"
				:total="total"
        :sortNum='2'
			/>
		</div>
		<!-- 新增弹窗/编辑弹窗 -->
		<Dialog v-model:visible="open" :title="title" width="40%">
			<detail ref="detailRef" :form-data="formData" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm" v-hasPermi="['equipment:eqptFile:add', 'equipment:eqptFile:update']">
						确定
					</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="eqptFile">
import { ref, reactive, computed, nextTick, getCurrentInstance, onMounted, toRefs, h } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/eqptFile/index'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance()

const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value) //表格高度
const eqptFileTableRef = ref(null) // BaseTable实例ref
const eqptFileList = ref([]) // 设备资料文件列表数据
const total = ref(0) // 数据总数
const open = ref(false) // 弹窗显示状态
const title = ref('') // 弹窗标题
const formData = ref(null) // 表单数据
const detailRef = ref(null) // 详情组件ref
const tableLoading = ref(false) // 表格加载状态

const data = reactive({
	queryParams: {
		dataTypeCode: undefined,
		dataTypeName: undefined,
		fileTableId: undefined,
		startPage: 1,
		pageSize: 20,
	},
})
const { queryParams } = toRefs(data)

/* 表格数据列 */
const tableColumns = ref([
	// 列1：序号
	{
		label: '序号',
		type: 'seq',
		width: 60,
		align: 'center',
		fixed: 'left',
	},
	// 列2：设备名称
	{
		prop: 'equipName',
		label: '设备名称',
		align: 'left',
		minWidth: 150,
	},
	// 列3：设备小类名称
	{
		prop: 'equipSmallCategoryName',
		label: '设备小类名称',
		align: 'left',
		minWidth: 150,
	},
	// 列4：规格
	{
		prop: 'specificCode',
		label: '规格',
		align: 'left',
		minWidth: 120,
	},
	// 列5：型号
	{
		prop: 'modelNumber',
		label: '型号',
		align: 'left',
		minWidth: 120,
	},
	// 列6：制造厂家
	{
		prop: 'manufacturer',
		label: '制造厂家',
		align: 'left',
		minWidth: 150,
	},
	// 列7：资料类型NAME
	{
		prop: 'dataTypeName',
		label: '资料类型',
		align: 'left',
		minWidth: 200,
	},
	// 列8：资料名称
	{
		prop: 'fileTableName',
		label: '资料名称',
		align: 'left',
		minWidth: 200,
	},
	// 列10：创建人
	{
		prop: 'createByName',
		label: '创建人',
		align: 'center',
		width: 120,
	},
	// 列11：创建时间
	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
		width: 180,
	},
	// 列12：操作列（编辑/删除）
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 180,
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
						permission: 'equipment:eqptFile:update',
					},
					{
						default: () => '编辑',
					}
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
						permission: 'equipment:eqptFile:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

/* 查询条件 */
const selectData = reactive([
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 12,
	},
	{
		name: '资料类型',
		type: 'select',
		modelValue: 'dataTypeCode',
		span: 12,
		dataConfig: {
			url: '/api/internal/public/getDictListByType/FILE_TYPE',
		},
	},
])

/* 按钮列表 */
const buttonList = reactive([
	{
		name: '新增',
		type: 'primary',
		icon: 'Plus',
		permission: 'equipment:eqptFile:add',
		click: () => {
			handleAdd()
		},
	},
])

/* 查询列表 */
const getList = e => {
	tableLoading.value = true
	if (e) {
		queryParams.value = { ...queryParams.value, ...e }
	}
	api.getList(queryParams.value)
		.then(res => {
			tableLoading.value = false
			if (res.code == '0000') {
				eqptFileList.value = res.data.pages || []
				total.value = res.data.totalNum || 0
			} else {
				proxy.$message.error(res.msg || '查询失败')
			}
		})
		.catch(() => {
			tableLoading.value = false
			proxy.$message.error('查询失败')
		})
}

/* 新增 */
const handleAdd = () => {
	formData.value = null
	title.value = '新增设备资料文件'
	open.value = true
	nextTick(() => {
		detailRef.value?.resetForm()
	})
}

/* 编辑 */
const handleUpdate = row => {
	api.getById(row.id)
		.then(res => {
			if (res.code == '0000') {
				formData.value = res.data
				title.value = '编辑设备资料文件'
				open.value = true
				nextTick(() => {
					detailRef.value?.setFormData(res.data)
				})
			} else {
				proxy.$message.error(res.msg || '获取数据失败')
			}
		})
		.catch(() => {
			proxy.$message.error('获取数据失败')
		})
}

/* 删除 */
const handleDelete = row => {
	proxy
		.$confirm('确定要删除该设备资料文件吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		})
		.then(() => {
			api.delete(row.id)
				.then(res => {
					if (res.code == '0000') {
						proxy.$message.success('删除成功')
						getList()
					} else {
						proxy.$message.error(res.msg || '删除失败')
					}
				})
				.catch(() => {
					proxy.$message.error('删除失败')
				})
		})
		.catch(() => {})
}

/* 提交表单 */
const submitForm = () => {
	detailRef.value
		?.validate()
		.then(valid => {
			if (valid) {
				const formDataValue = detailRef.value?.formData
				if (formDataValue.id) {
					// 修改
					api.update(formDataValue)
						.then(res => {
							if (res.code == '0000') {
								proxy.$message.success('修改成功')
								open.value = false
								getList()
							} else {
								proxy.$message.error(res.msg || '修改失败')
							}
						})
						.catch(() => {
							proxy.$message.error('修改失败')
						})
				} else {
					// 新增
					api.add(formDataValue)
						.then(res => {
							if (res.code == '0000') {
								// 保存成功后，更新formData.id，这样Upload组件就能正确关联文件
								if (res.data && res.data.id) {
									const newId = res.data.id
									detailRef.value.formData.id = newId
									// 如果上传了文件但还没有关联businessId，需要更新文件关联
									// Upload组件会在businessId变化时自动处理，但需要确保businessId更新
									// 使用nextTick确保DOM更新后再处理
									nextTick(() => {
										// Upload组件会通过watch监听businessId变化，自动加载文件
										// 如果文件是在新增时上传的（businessId为空），需要重新关联
										// 这里通过更新businessId触发Upload组件的watch来重新关联文件
									})
								}
								proxy.$message.success('新增成功')
								open.value = false
								getList()
							} else {
								proxy.$message.error(res.msg || '新增失败')
							}
						})
						.catch(() => {
							proxy.$message.error('新增失败')
						})
				}
			}
		})
		.catch(() => {
			proxy.$message.warning('请完善表单信息！')
		})
}

/* 取消 */
const cancel = () => {
	open.value = false
	nextTick(() => {
		detailRef.value?.resetForm()
	})
}

/* 初始化 */
onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
.app-container {
}
</style>

