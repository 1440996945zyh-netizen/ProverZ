<template>
	<div>
		<div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:total="total"
				:id="tableId"
				:isShowAdvancedQuery="true"
			/>
		</div>
		<el-drawer v-model="dictVisible" :title="title" size="35%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="dictVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<el-drawer v-model="drawerVisible" title="列表" size="60%">
			<drawerList ref="drawerListRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">关闭</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="dict">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, provide } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/master/dict/index.js'
import detail from './detail/index.vue'
import drawerList from './drawerList/index.vue'

const { proxy } = getCurrentInstance()
const advancedQuery = ref([])
provide('onQuery', data => {
	console.log('父组件收到数据：', data)
	advancedQuery.value = JSON.parse(JSON.stringify(data))
	// 处理数据...
	getList()
})
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const drawerListRef = ref() //明细列表
const dictVisible = ref(false)
const drawerVisible = ref(false)
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const clickRow = ref({})
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const tableId = ref('dict_1760148546264')
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '字典类型名称', prop: 'dictName', align: 'left' },
	{ label: '字典类型编号', prop: 'dictType', align: 'left' },
	{ label: '备注', prop: 'remark', align: 'left' },
	{ label: '排序号', prop: 'sortNum', align: 'left' },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.statusLabel == '在用' ? '' : 'info',
					},
					{
						default: () => (row.statusLabel === '在用' ? '在用' : '停用'),
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
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDictList(row)
						},
						type: 'primary',
						link: true,
						icon: 'Operation',
					},
					{
						default: () => '列表',
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
		name: '字典类型名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'dictName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '字典类型编号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'dictType', // 绑定字段
		span: 12, // 占位，共24
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:user:add', // 权限
	},
])
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

/** 查询字典类型列表 */
const getList = e => {
	queryParams.value = e
	let params ={
		...queryParams.value,
		advancedQuery:JSON.stringify(advancedQuery.value),
	}
	api.getAllDictTypeList(params).then(response => {
		tableData.value = response.data.pages
		total.value = response.data.totalNum
	})
}

/** 新增字典 */
const add = () => {
	dictVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 清空id
		detailRef.value.formData.status = '1'
	})
}

/** 修改字典类型按钮操作 */
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	dictVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getDictTypeById(editRow.id).then(res => {
			console.log('修改数据', res)
			proxy.setFormData(detailRef.value.formData, res.data)
		})
	})
}

// 字典类型保存
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm(`确定保存？`).then(() => {
			console.log('点击保存', params)
			if (params.id) {
				api.updateDictType(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					dictVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertDictType(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					dictVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}

/** 字典列表操作 */
const handleDictList = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		drawerListRef.value.getData({ dictType: editRow.dictType, dictName: editRow.dictName })
	})
}

/** 删除字典类型按钮操作 */
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.deleteDictTypeById(deleteRow.id).then(res => {
				getList(queryParams.value)
				proxy.$modal.msgSuccess(res.msg)
			})
		})
		.catch(() => {})
}
getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import '../../../assets/styles/searchform.scss';
</style>
