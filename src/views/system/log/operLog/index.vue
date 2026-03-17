<template>
	<div class="app-container">
		<BaseTable
			ref="operLogTableRef"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:total="total"
			@Status_Change="Status_Change"
			
			:showNum="4"
		/>

		<Drawer v-model="operVisible" :title="title" size="70%">
			<DrawerDetail ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="operVisible = false">关闭</el-button>
				</div>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="operLog">
import DrawerDetail from './drawer/index'
import { listOperLog, getById } from '@/api/system/operLog'
import BaseTable from '@/components/BaseTable/index.vue'
import { ElButton, ElMessage } from 'element-plus'
import { ref, reactive, toRefs } from 'vue'
import Drawer from '@/components/Drawer/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
const router = useRouter()
// 组件实例与路由
const { proxy } = getCurrentInstance()
const operLogTableRef = ref(null)
const operVisible = ref(false)
const drawerRef = ref(null)
const drawer = ref(false)
const total = ref(0)
const title = ref('')
const dateRange = ref('')
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const menuRef = ref(null)
const columnWidth = '100px'
const drawerShow = ref(false)
const operId = ref(null)
let storeHight = computed(() => tableParamsStore().pageTableHeight)
const tableHeight = computed(() => storeHight.value)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	beginTimes: '',
	endTimes: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: 'PC/APP', prop: 'operType', align: 'left' },
	{ label: '业务模块', prop: 'title', align: 'left' },
	{ label: '方法名', prop: 'method', align: 'left' },
	{ label: '操作类型', prop: 'businessType', align: 'left' },
	{ label: '主机地址', prop: 'operIp', align: 'center' },
	{ label: '请求url', prop: 'operUrl', align: 'left' },
	{ label: '请求方式', prop: 'requestMethod', align: 'left' },
	{ label: '操作状态', prop: 'status', align: 'center' },
	{ label: '操作人', prop: 'operUserName', align: 'left' },
	{ label: '创建时间', prop: 'operTime', align: 'center' },
	{
		prop: '',
		label: '操作',
		width: 160,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleOperLog(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'system:operlog:query', // 权限
					},
					{
						default: () => '查看',
					}
				),
			]
		},
	},
])
// 搜索框数据
const selectData = reactive([
	{
		type: 'date', // 搜索框类型
		modelValue: 'beginTimes', // 绑定字段
		span: 6, // 占位，共24
		name: '开始时间',
	},
	{
		type: 'date', // 搜索框类型
		modelValue: 'endTimes', // 绑定字段
		span: 6, // 占位，共24
		name: '结束时间',
	},

	{
		name: '操作类型', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'businessType', // 绑定字段
		span: 6, // 占位，共24
		selectData: [
			{ label: '查询', value: '查询' },
			{ label: '新增', value: '新增' },
			{ label: '修改', value: '修改' },
			{ label: '删除', value: '删除' },
			{ label: '其他操作', value: '其他操作' },
		],
	},
	{
		name: '操作状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		selectData: [
			{ label: '正常', value: '正常' },
			{ label: '异常', value: '异常' },
		],
	},
	{
		name: '模块标题', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'title', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '方法名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'method', // 绑定字段
		span: 6, // 占位，共24
	},
])
// 点击查询的事件
const getList = e => {
	let pagination = operLogTableRef.value?.buildQueryParams()
	let params = {
		...e,
		...pagination,
	}

	listOperLog(params)
		.then(response => {
			console.log(6666)
			tableData.value = response.data.pages
			total.value = response.data.totalNum
			console.log('列表数据', tableData.value)
		})
		.catch(res => {})
}
// 触发自定义事件
const drawerShowEmit = e => {
	drawerShow.value = e
}

/** 查看按钮操作 */
const handleOperLog = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '日志详情'
	operVisible.value = true

	nextTick(() => {
		drawerRef.value.getoperLog(editRow.operId) // 子组件查询选中日志
	})
}
/** 关闭抽屉 */
function closeDrawer() {
	drawer.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
	queryParams.value.startPage = 1

	getList()
}
/** 重置按钮操作 */
function resetQuery() {
	dateRange.value = []
	proxy.resetForm('queryRef')
	handleQuery()
}
/** 重置新增的表单以及其他数据  */
function reset() {
	if (menuRef.value != undefined) {
		menuRef.value.setCheckedKeys([])
	}
	menuExpand.value = false
	menuNodeAll.value = false
	deptExpand.value = true
	deptNodeAll.value = false
	form.value = {
		id: undefined,
		roleName: undefined,
		roleCode: undefined,
		roleSort: 0,
		status: '1',
		menuIds: [],
		deptIds: [],
		menuCheckStrictly: true,
		deptCheckStrictly: true,
		remark: undefined,
	}
	proxy.resetForm('roleRef')
}

onMounted(() => {
	getList()
})
</script>
<style lang="less" scoped>
.my-label {
	background: var(--el-color-success-light-9);
}
.my-content {
	background: var(--el-color-danger-light-9);
}
</style>
