<template>
	<div>
		<div class="app-container">
			<div class="header">
				<div></div>
				<div>
					<el-button v-hasPermi="['master:storageStack:query']" type="primary" icon="Search" @click="getList">刷新</el-button>
					<el-button type="primary" icon="Plus" v-hasPermi="['master:storageStack:insert']" @click="add">新建</el-button>
				</div>
			</div>
			<BaseTable :tableColumns="tableColumns" :tableData="tableData" :cellClickEvent="cellClickEvent" :treeConfig="treeConfig" />
		</div>
		<el-drawer v-model="detailVisible" :title="title" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<el-drawer v-model="stackVisible" :title="title" size="30%">
			<stack ref="stackRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="stackVisible = false">取消</el-button>
					<el-button type="primary" @click="saveStack">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="storageStack">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import stack from './stack/index.vue'
import api from '@/api/master/storageStack/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const detailRef = ref(null) // 明细组件ref
const stackRef = ref(null) // 明细组件ref
const title = ref('')

const treeConfig = reactive({
	transform: true,
	rowField: 'id',
	parentField: 'parentId',
	lazy: true,
	hasChild: 'hasChildren',
	loadMethod({ row }) {
		// 异步加载子节点
		return fetchChildListApi(row)
	},
})
const fetchChildListApi = async row => {
	const res = await api.getbyparentid(row.id)
	return res.data
}
// 查询主列表
const getList = () => {
	api.getbyparentid(-1).then(res => {
		tableData.value = res.data
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '场/区/垛', prop: 'storageYardNm', treeNode: true },
	{ label: '类型', prop: 'storageYardTypeNm' },
  { label: '是否前沿',width: 130, prop: 'isFrontierLabel' },
	{ label: '面积(m²)', prop: 'area', align: 'right' },
	{ label: '单位面积承载吨', prop: 'unitAreaTon', align: 'right' },
	{
		prop: 'isInnerStorageYardLabel',
		label: '是否港内货场',
		width: 130,
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isInnerStorageYardLabel == '是' ? '' : 'info',
					},
					{
						default: () => row.isInnerStorageYardLabel,
					}
				),
			]
		},
	},

	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							addChildren(row)
						},
						type: 'primary',
						link: true,
						icon: 'Plus',
						disabled: row.storageYardLevel === '3',
						permission: 'master:storageStack:insert', // 权限
					},
					{
						default: () => '新增',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'master:storageStack:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),

				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'master:storageStack:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

const detailVisible = ref(false)
const stackVisible = ref(false)
// 新增根节点
const add = () => {
	detailVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 初始化
		detailRef.value.formData.parentId = '-1'
		detailRef.value.formData.storageYardLevel = '1'
	})
}
// 新增子节点
const addChildren = row => {
	if (row.parentId === '-1') {
		// 新增2级区
		detailVisible.value = true
		title.value = '新增'
		nextTick(() => {
			detailRef.value.resetForm() // 清空事件
			detailRef.value.formData.id = ''
			detailRef.value.formData.parentId = row.id
			detailRef.value.formData.storageYardLevel = String(Number(row.storageYardLevel) + 1)
		})
	} else {
		// 新增3级垛
		stackVisible.value = true
		title.value = '新增'
		nextTick(() => {
			stackRef.value.resetForm() // 清空事件
			stackRef.value.formData.id = ''
			stackRef.value.formData.parentId = row.id
			stackRef.value.formData.storageYardLevel = String(Number(row.storageYardLevel) + 1)
		})
	}
}
// 编辑事件
const edit = row => {
	console.log(row)
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	editRow.storageYardLevel === '3' ? (stackVisible.value = true) : (detailVisible.value = true)
	title.value = '编辑'
	nextTick(() => {
		if (editRow.storageYardLevel !== '3') {
			detailRef.value.resetForm() // 清空事件
			proxy.setFormData(detailRef.value.formData, editRow)
		} else {
			stackRef.value.resetForm() // 清空事件
			proxy.setFormData(stackRef.value.formData, editRow)
		}
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	if (row.hasChildren) {
		proxy.$modal.msgWarning('有子区域，不能删除！')
		return
	}
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.deletebyid(deleteRow.id).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getList()
			})
		})
		.catch(err => {})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
			if (params.id) {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList()
				})
			} else {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList()
				})
			}
		})
	}
}
const saveStack = async () => {
	if (await stackRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			const params = JSON.parse(JSON.stringify(stackRef.value.formData)) // 取到子组件的formData
			if (params.id) {
				api.update(params).then(res => {
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						stackVisible.value = false
						getList()
					}
				})
			} else {
				api.insert(params).then(res => {
					if (res.code == '0000') {
						proxy.$modal.msgSuccess(res.msg)
						stackVisible.value = false
						getList()
					}
				})
			}
		})
	}
}
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	console.log(row, 'rowowowowo')
	clickRow.value = row
}
getList()
</script>
<style scoped lang="scss">
.header {
	display: flex;
	justify-content: space-between;
	height: 40px;
	margin: 8px 0;
	padding-right: 5px;
}
</style>
