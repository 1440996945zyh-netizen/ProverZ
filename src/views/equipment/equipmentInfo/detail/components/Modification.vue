<template>
	<div class="modification">
		<!-- 操作按钮 -->
		<div class="toolbar">
			<el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
			<el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
		</div>

		<!-- 表格 -->
		<BaseTable
			ref="baseTableRef"
			name="equipmentModification"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:total="total"
			:queryParams="queryParams"
      :tableHeight="tableHeight"
			@pageChange="handlePageChange"
			:showSearchHeader="false"
			:showToolBar="false"
			:showPagination="true"
		/>

		<!-- 抽屉：编辑改造记录 -->
		<el-drawer v-model="drawerVisible" :title="drawerTitle" size="500px">
			<el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" style='margin: 10px'>
				<el-form-item label="改造类型" prop="modifyTypeCode" required>
					<Select
						:dataConfig="{ params: { type: 'DICT', dictType: 'E_VATION' } }"
						v-model:value="formData.modifyTypeCode"
						v-model:label="formData.modifyTypeName"
						placeholder="请选择"
					/>
				</el-form-item>

				<el-form-item label="改造厂家" prop="modifyManufacturer" required>
					<el-input v-model="formData.modifyManufacturer" placeholder="请输入改造厂家" />
				</el-form-item>

				<el-form-item label="改造时间" prop="modifyTime" required>
					<el-date-picker
						v-model="formData.modifyTime"
						type="date"
						placeholder="选择日期"
						style="width: 100%"
						value-format="YYYY-MM-DD"
					/>
				</el-form-item>

				<el-form-item label="改造内容" prop="modifyContent" required>
					<el-input
						v-model="formData.modifyContent"
						type="textarea"
						:rows="4"
						placeholder="请输入改造内容"
						maxlength="500"
						show-word-limit
					/>
				</el-form-item>

				<el-form-item label="改造备注" prop="modifyRemark">
					<el-input
						v-model="formData.modifyRemark"
						type="textarea"
						:rows="4"
						placeholder="请输入改造备注"
						maxlength="500"
						show-word-limit
					/>
				</el-form-item>
			</el-form>

			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="handleCancel">取消</el-button>
					<el-button type="primary" @click="handleSubmit">提交</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="Modification">
import { ref, reactive, onMounted, watch, getCurrentInstance, h, nextTick } from 'vue'
import { Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select'
import api from '@/api/equipment/equipmentInfo/index'
const tableHeight = reactive(window.innerHeight - 310)
const { proxy } = getCurrentInstance()

const props = defineProps({
	equipId: {
		type: [Number, String],
		default: null,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
})

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const baseTableRef = ref(null)
const formRef = ref(null)
const drawerVisible = ref(false)
const drawerTitle = ref('编辑改造记录')

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

const formData = reactive({
	id: null,
	equipId: null,
	modifyTypeCode: null,
	modifyTypeName: '',
	modifyManufacturer: '',
	modifyTime: '',
	modifyContent: '',
	modifyRemark: '',
})

const rules = reactive({
	modifyTypeCode: [
		{ required: true, message: '请选择改造类型', trigger: 'change' },
	],
	modifyManufacturer: [
		{ required: true, message: '请输入改造厂家', trigger: 'blur' },
	],
	modifyTime: [
		{ required: true, message: '请选择改造时间', trigger: 'change' },
	],
	modifyContent: [
		{ required: true, message: '请输入改造内容', trigger: 'blur' },
	],
})

// 表格列定义
const readonlyFlag = ref(props.readonly)
watch(() => props.readonly, (newVal) => {
	readonlyFlag.value = newVal
})

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center' },
	{ label: '改造类型', prop: 'modifyTypeName', align: 'center', width: 120 },
	{ label: '改造内容', prop: 'modifyContent', align: 'left', minWidth: 200, showOverFlow: 'ellipsis' },
	{ label: '改造厂家', prop: 'modifyManufacturer', align: 'left', width: 150 },
	{
		label: '改造时间',
		prop: 'modifyTime',
		align: 'center',
		width: 120,
		formatter: ({ cellValue }) => {
			if (!cellValue) return ''
			const date = new Date(cellValue)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},
	},
	{
		label: '操作',
		width: 150,
		align: 'center',
		fixed: 'right',
		render: (params) => {
			const row = params.row || params
			return [
				h(
					ElButton,
					{
						link: true,
						type: 'primary',
						icon: 'Edit',
						disabled: readonlyFlag.value,
						onClick: () => handleEdit(row),
					},
					{ default: () => '编辑' }
				),
				h(
					ElButton,
					{
						link: true,
						type: 'danger',
						icon: 'Delete',
						disabled: readonlyFlag.value,
						onClick: () => handleDelete(row),
						style: { marginLeft: '10px' },
					},
					{ default: () => '删除' }
				),
			]
		},
	},
])

// 查询列表
const loadData = async () => {
	if (!props.equipId) {
		tableData.value = []
		total.value = 0
		return
	}

	loading.value = true
	try {
		const res = await api.getModificationList({
			equipId: props.equipId,
			pageNum: queryParams.value.startPage,
			pageSize: queryParams.value.pageSize,
		})
		if (res.code === '0000') {
			tableData.value =  res.data.pages || []
			total.value = res.data.total || res.data.totalNum || 0
			// 数据加载后，延迟刷新表格以确保表头正确渲染
			await nextTick()
			setTimeout(() => {
				if (baseTableRef.value) {
					// 如果 BaseTable 暴露了 xTable，直接调用 refreshColumn
					if (baseTableRef.value.xTable && baseTableRef.value.xTable.value) {
						baseTableRef.value.xTable.value.refreshColumn()
					} else if (baseTableRef.value.resetColEvent) {
						// 备用方案：使用 resetColEvent
						baseTableRef.value.resetColEvent()
					}
				}
			}, 150)
		} else {
			proxy.$message.error(res.msg || '查询失败')
		}
	} catch (error) {
		console.error('查询改造记录失败:', error)
		proxy.$message.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 分页改变
const handlePageChange = (params) => {
	queryParams.value.startPage = params.startPage
	queryParams.value.pageSize = params.pageSize
	loadData()
}

// 刷新
const handleRefresh = () => {
	queryParams.value.startPage = 1
	loadData()
}

// 新增
const handleAdd = () => {
	drawerTitle.value = '新增改造记录'
	resetForm()
	formData.equipId = props.equipId
	drawerVisible.value = true
	nextTick(() => {
		if (formRef.value) {
			formRef.value.clearValidate()
		}
	})
}

// 编辑
const handleEdit = (row) => {
	drawerTitle.value = '编辑改造记录'
	formData.id = row.id
	formData.equipId = row.equipId
	formData.modifyTypeCode = row.modifyTypeCode
	formData.modifyTypeName = row.modifyTypeName
	formData.modifyManufacturer = row.modifyManufacturer
	formData.modifyTime = row.modifyTime ? row.modifyTime.split(' ')[0] : ''
	formData.modifyContent = row.modifyContent || ''
	formData.modifyRemark = row.modifyRemark || ''
	drawerVisible.value = true
	nextTick(() => {
		if (formRef.value) {
			formRef.value.clearValidate()
		}
	})
}

// 提交
const handleSubmit = async () => {
	if (!formRef.value) return

	try {
		await formRef.value.validate((valid) => {
			if (valid) {
				if (!formData.equipId && !props.equipId) {
					ElMessage.warning('设备ID不能为空')
					return
				}

				const submitData = {
					...formData,
					equipId: props.equipId,
				}

				if (formData.id) {
					// 修改
					ElMessageBox.confirm('确定修改改造记录?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning',
					}).then(() => {
						api.updateModification(submitData).then(res => {
							if (res.code === '0000') {
								ElMessage.success(res.msg || '修改成功')
								drawerVisible.value = false
								resetForm()
								loadData()
							} else {
								ElMessage.error(res.msg || '修改失败')
							}
						}).catch(err => {
							console.error('修改失败:', err)
							ElMessage.error('修改失败')
						})
					}).catch(() => {})
				} else {
					// 新增
					ElMessageBox.confirm('确定新增改造记录?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning',
					}).then(() => {
						api.addModification(submitData).then(res => {
							if (res.code === '0000') {
								ElMessage.success(res.msg || '新增成功')
								drawerVisible.value = false
								resetForm()
								loadData()
							} else {
								ElMessage.error(res.msg || '新增失败')
							}
						}).catch(err => {
							console.error('新增失败:', err)
							ElMessage.error('新增失败')
						})
					}).catch(() => {})
				}
			}
		})
	} catch (error) {
		console.error('表单验证失败:', error)
	}
}

// 取消
const handleCancel = () => {
	drawerVisible.value = false
	resetForm()
}

// 删除单条记录
const handleDelete = (row) => {
	console.log('handleDelete row:', row)
	if (!row) {
		ElMessage.warning('请选择要删除的记录')
		return
	}

	const recordId = row.id
	console.log('recordId:', recordId)
	if (!recordId) {
		console.error('记录ID不存在，row对象:', row)
		ElMessage.warning('记录ID不存在，无法删除')
		return
	}

	ElMessageBox.confirm('确定删除这条改造记录?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		api.deleteModification(recordId).then(res => {
			if (res.code === '0000') {
				ElMessage.success(res.msg || '删除成功')
				loadData()
			} else {
				ElMessage.error(res.msg || '删除失败')
			}
		}).catch(err => {
			console.error('删除失败:', err)
			ElMessage.error('删除失败')
		})
	}).catch(() => {})
}

// 重置表单
const resetForm = () => {
	if (formRef.value) {
		formRef.value.resetFields()
	}
	formData.id = null
	formData.equipId = props.equipId
	formData.modifyTypeCode = null
	formData.modifyTypeName = ''
	formData.modifyManufacturer = ''
	formData.modifyTime = ''
	formData.modifyContent = ''
	formData.modifyRemark = ''
}

// 监听equipId变化
watch(
	() => props.equipId,
	() => {
		if (props.equipId) {
			queryParams.value.startPage = 1
			loadData()
		}
	},
	{ immediate: true }
)

onMounted(() => {
	if (props.equipId) {
		loadData()
	}
	// 组件挂载后，延迟刷新表格以确保表头正确渲染
	nextTick(() => {
		setTimeout(() => {
			if (baseTableRef.value && baseTableRef.value.xTable && baseTableRef.value.xTable.value) {
				baseTableRef.value.xTable.value.refreshColumn()
			}
		}, 200)
	})
})

defineExpose({
	loadData,
})
</script>

<style scoped lang="scss">
.modification {
	padding: 20px;

	.toolbar {
		margin-bottom: 10px;
		display: flex;
		gap: 10px;
	}
}
</style>
