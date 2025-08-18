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
			:cellClickEvent="cellClickEvent"
			:total="total"
		/>
	</div>
	<el-drawer v-model="customerVisible" :title="title" size="30%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="customerVisible = false">取消</el-button>
				<el-button type="primary" @click="save" v-hasPermi="['master:machine:add', 'master:machine:update']">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="machine">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/machine/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '机械代码', prop: 'macCode' },
	{ label: '机械名称', prop: 'macName' },
	{ label: '机械类型', prop: 'macTypeName' },
  { label: '部门类型', prop: 'deptName' },
  { label: '机械型号', prop: 'macModelName' },
	{ label: '绑定设备', prop: 'imei' },
	{
		label: '状态',
		prop: 'status',
		width: 'status',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '1' ? '' : 'info',
					},
					{
						default: () => (row.status === '1' ? '在用' : '停用'),
					}
				),
			]
		},
	},
  {
    label: '是否电子围栏',
    prop: 'isElectronFence',
    width: 140,
    align: 'center',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isElectronFence == '1' ? '' : 'info',
          },
          {
            default: () => (row.isElectronFence == '1' ? '是' : '否'),
          }
        ),
      ]
    },
  },
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						hasPermi: 'master:machine:delete',
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
		name: '机械代码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'macCode', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '机械名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'macName', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '机械类型',
		type: 'select',
		modelValue: 'macTypeCode',
		span: 8,
		dataConfig: { params: { type: 'MAC_TYPE' } },
	},
	{
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 2, // 占位，共24
		selectData: [
			{
				value: '1',
				label: '在用',
			},
			{
				value: '0',
				label: '停用',
			},
		],
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:machine:add', // 权限
	},
])
const customerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 新增事件
const add = () => {
	customerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	customerVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.typeList = []
		api.getDataById(editRow.id).then(res => {
			if (res.code == '0000') {
				let msg = res.data
				detailRef.value.formData.id = msg.id
				detailRef.value.formData.macCode = msg.macCode
				detailRef.value.formData.macName = msg.macName
				detailRef.value.formData.macTypeCode = msg.macTypeCode
				detailRef.value.formData.macModelCode = msg.macModelCode
				detailRef.value.formData.macModelName = msg.macModelName
				detailRef.value.formData.deptId = msg.deptId
				detailRef.value.formData.imei = msg.imei
				detailRef.value.formData.status = msg.status
        detailRef.value.formData.isElectronFence = msg.isElectronFence
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(err => {})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(res => {
			if (title.value == '编辑') {
				api.update(detailRef.value.formData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						customerVisible.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			} else {
				delete detailRef.value.formData.id
				api.insert(detailRef.value.formData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						customerVisible.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
