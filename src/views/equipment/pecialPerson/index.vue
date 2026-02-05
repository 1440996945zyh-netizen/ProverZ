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
			:cellClickEvent="cellClickEvent"
			:total="total"
			:rowStyle="getRowStyle"
		/>
	</div>
	<el-drawer v-model="open" :title="title" size="55%">
		<detail ref="detailRef" :readonly="isReadonly" :mode="detailMode" @saved="handleDetailSaved" />
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="cancel">取消</el-button>
				<el-button v-if="!isReadonly && detailMode === 'add'" type="primary" @click="save" v-hasPermi="['equipment:pecialPerson:add']">
					确定
				</el-button>
				<el-button v-if="!isReadonly && detailMode === 'edit'" type="primary" @click="save" v-hasPermi="['equipment:pecialPerson:update']">
					保存
				</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="pecialPerson">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/pecialPerson/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const detailRef = ref(null)
const total = ref('')
const title = ref('')
const open = ref(false)
const isReadonly = ref(false)
const detailMode = ref('add') // 'add' 或 'edit'
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const loading = ref(false)
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '所属部门', prop: 'useOrgName', align: 'left',  },
	{ label: '证书所属人', prop: 'certifiUserName', align: 'left',},
	{ label: '作业项目', prop: 'certificateName', align: 'left', },
	{ label: '证书编号', prop: 'certifiNumber', align: 'left',  },
	{ label: '档案编号', prop: 'certifiCode', align: 'left',  },
	{ label: '批准时间', prop: 'firstDate', align: 'center', width: 120 },
	{ label: '到期时间', prop: 'expireDate', align: 'center', width: 120 },
	{ label: '有效期(月)', prop: 'validDate', align: 'right', width: 120 },
	{ label: '认证单位', prop: 'certificationAuthority', align: 'left', width: 150 },
	{ label: '考试机构', prop: 'examOrg', align: 'left', width: 150 },
	{
		prop: '',
		label: '操作',
		width: 210,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:pecialPerson:update',
					},
					{
						default: () => '修改',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							view(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
						permission: 'equipment:pecialPerson:update',
					},
					{
						default: () => '查看',
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
						permission: 'equipment:pecialPerson:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

const selectData = reactive([
	{
		name: '证书所属人',
		type: 'input',
		modelValue: 'certifiUser',
		span: 8,
	},
	{
		name: '证书编号',
		type: 'input',
		modelValue: 'certifiNumber',
		span: 8,
	},
	{
		name: '档案编号',
		type: 'input',
		modelValue: 'certifiCode',
		span: 8,
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add(),
		permission: 'equipment:pecialPerson:add',
	},
])

const clickRow = ref({})

// 点击查询的事件
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

// 新增事件
const add = () => {
	open.value = true
	title.value = '新增特种作业人员证书'
	detailMode.value = 'add'
	isReadonly.value = false
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value
	open.value = true
	title.value = '修改特种作业人员证书'
	detailMode.value = 'edit'
	isReadonly.value = false
	nextTick(() => {
		// 先重置表单
		detailRef.value.resetForm()
		// 然后加载数据
		api.getById(editRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 逐个赋值，确保响应式更新
				Object.keys(msg).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = msg[key]
					}
				})
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 查看事件
const view = row => {
	const viewRow = row || clickRow.value
	open.value = true
	title.value = '查看特种作业人员证书'
	detailMode.value = 'edit'
	isReadonly.value = true
	nextTick(() => {
		// 先重置表单
		detailRef.value.resetForm()
		// 然后加载数据
		api.getById(viewRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 逐个赋值，确保响应式更新
				Object.keys(msg).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = msg[key]
					}
				})
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value
	proxy.$modal
		.confirm('确定删除？')
		.then(() => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(() => {})
}

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(() => {
			// 深拷贝表单数据
			const submitData = JSON.parse(JSON.stringify(detailRef.value.formData))

			if (title.value == '修改特种作业人员证书') {
				api.update(submitData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						open.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			} else {
				delete submitData.id
				api.add(submitData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						open.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			}
		})
	}
}

// 取消事件
const cancel = () => {
	open.value = false
}

// 处理详情页保存成功事件
const handleDetailSaved = () => {
	// 刷新列表
	getList(queryParams.value)
	// 关闭抽屉
	open.value = false
}

// 获取行样式，如果到期时间已过期则显示红色背景
const getRowStyle = ({ row }) => {
	if (row.expireDate) {
		const expireDate = new Date(row.expireDate)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		expireDate.setHours(0, 0, 0, 0)

		// 如果到期时间小于今天，则显示红色背景
		if (expireDate < today) {
			return {
				backgroundColor: '#ffebee'
			}
		}
	}
	return {}
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

getList(queryParams.value)
</script>

