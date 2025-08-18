<template>
	<div class="app-container">
		<!-- 头部搜索模块 -->
		<SearchHeader
      ref="SearchHeaderRef"
      class="tab_header"
      :selectData="selectData"
      @searchClick="getList"
      :endSelect="endSelect"
      :buttonList="buttonList"
    />
		<el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick">
			<el-tab-pane label="国内" name="first">
        <BaseTable
          ref="baseTable"
          class="tab_table"
          :tableColumns="tableColumns"
          :sync-resize="tabActiveName"
          :tableData="tableData"
          :cellClickEvent="cellClickEvent"
          :total="total"
          :tableHeight="'tabTableHeight'"
          :showFooter="true"
          :searchClick="getList"
        />
			</el-tab-pane>
			<el-tab-pane label="国际" name="second">
				<BaseTable
					ref="baseTable"
					class="tab_table"
					:tableColumns="tableColumns1"
					:tableData="tableData1"
					:cellClickEvent="cellClickEvent"
					:total="total"
          :tableHeight="'tabTableHeight'"
          :showFooter="true"
          :searchClick="getList"
        />
			</el-tab-pane>
		</el-tabs>
		<el-drawer v-model="drawerVisible" :title="title" size="35%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="port">
import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/port/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const queryParams = ref({
	isDomestic: '1',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ prop: 'portName', label: '港口名称' },
	{ prop: 'shorthandCode', label: '助记码' },
	{ prop: 'portCode', label: '港口代码' },
	{ prop: 'provinceName', label: '所属省' },
	{ prop: 'cityName', label: '所属市' },
	{ prop: 'routeName', label: '航线' },
	{ prop: 'sortNum', label: '排序号', align: 'right' },
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
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'master:port:update', // 权限
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
						permission: 'master:port:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const tableData1 = ref([])
const tableColumns1 = ref([
	{ prop: 'portName', label: '港口名称' },
	{ prop: 'shorthandCode', label: '助记码' },
	{ prop: 'portCode', label: '港口代码' },
	{ prop: 'nationName', label: '国籍' },
	{ prop: 'routeName', label: '航线' },
	{ prop: 'sortNum', label: '排序号', align: 'right' },
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
		name: '港口名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'portName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '助记码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'shorthandCode', // 绑定字段
		span: 12, // 占位，共24
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:port:add', // 权限
	},
])
const resetSearch = () => {
	SearchHeaderRef.value.resetSearch()
}
const drawerVisible = ref(false)
const tabActiveName = ref('first')
const handleClick = tab => {
	if (tab.index == '0') {
		queryParams.value.isDomestic = '1'
	} else if (tab.index == '1') {
		queryParams.value.isDomestic = '0'
	}
	getList(queryParams.value)
}
const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.getList(queryParams.value).then(res => {
		if (tabActiveName.value == 'first') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			tableData1.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}
// 新增事件
const add = () => {
	title.value = '新增'
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		if (queryParams.value.isDomestic == '1') {
			detailRef.value.formData.isDomestic = '1'
		} else if (queryParams.value.isDomestic == '0') {
			detailRef.value.formData.isDomestic = '0'
		}
	})
}

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getPortById(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			proxy.setFormData(detailRef.value.formData, resData)
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(() => {
			api.deleteById(deleteRow.id).then(res => {
				getList(queryParams.value)
				proxy.$modal.msgSuccess('删除成功')
			})
		})
		.catch(() => {})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = {
			...detailRef.value.formData,
		}
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.updatePort(params).then(res => {
					proxy.$modal.msgSuccess('修改成功')
					drawerVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertPort(params).then(res => {
					proxy.$modal.msgSuccess('新增成功')
					drawerVisible.value = false
					getList(queryParams.value)
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
<style lang="scss" scoped></style>
