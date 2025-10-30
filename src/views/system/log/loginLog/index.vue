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
			@Status_Change="Status_Change"
			defaultWidth="60"
			showNum="6"
			:id="tableId"
			:isShowAdvancedQuery="true"
		/>
		<!-- 查看 抽屉组件 -->
		<el-drawer v-model="loginVisible" :title="title" size="70%">
			<Drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="loginVisible = false">关闭</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="loginLog">
import Drawer from './drawer/index'
import { listOperLog } from '@/api/system/LoginLog'
import BaseTable from '@/components/BaseTable/index.vue'
import { ElButton, ElTag } from 'element-plus'
import { ref, reactive } from 'vue'
import tableParamsStore from '@/store/modules/tableParams'
const tableId = ref('loginLog_1760153814593')
const loginVisible = ref(false)
const { proxy } = getCurrentInstance()
const drawer = ref(false)
const total = ref(0)
const drawerRef = ref(null)
const title = ref('日志详情')
const dateRange = ref('')
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const menuRef = ref(null)
let storeHight = computed(() => tableParamsStore().pageTableHeight)
const tableHeight = computed(() => storeHight.value)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	beginTimes: '',
	endTimes: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '登录人账号', prop: 'accNo', align: 'left',width: 120 },
	{ label: '登录人', prop: 'userName', align: 'left',width: 120 },
	{ label: '岗位', prop: 'post', align: 'left',width: 120 },
	{ label: '部门', prop: 'dept', align: 'left',width: 120 },
	{ label: '所属公司', prop: 'companyName', align: 'left',width: 120 },
	{ label: '登录时间',prop: 'loginTime', align: 'center' ,width: 160},
	{ label: '登录ip', prop: 'loginIp', align: 'center' ,width: 120},
	{ label: '登录渠道', prop: 'channelType', align: 'left' ,width: 120},
	{ label: '登录用户唯一标记', prop: 'uqMark', align: 'center',width: 170 },
	{ label: '操作系统', prop: 'os', align: 'center',width: 210 },
	{ label: '浏览器', prop: 'browser', align: 'left' ,width: 120},
	{ label: '登录地点', prop: 'location', align: 'left' ,width: 120},
	{
		label: '状态',
		prop: 'status',
		align: 'center',
    width: 120,
		render: row => {
			// console.log(row, 'rowww')
			return [
				h(
					ElTag,
					{
						type: row.status == '成功' ? '' : 'info',
					},
					{
						default: () => (row.status === '成功' ? '成功' : '失败'),
					}
				),
			]
		},
	},
	{ label: '错误信息', prop: 'errorMsg', align: 'left',width: 120 },
	{
		prop: '',
		label: '操作',
		width: 150,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleLoginLog(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'system:loginLog:query', // 权限
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
		span: 3, // 占位，共24
		name:'开始时间',
	},
	{
		type: 'date', // 搜索框类型
		modelValue: 'endTimes', // 绑定字段
		span: 3, // 占位，共24
		name:'结束时间',
	},
	{
		name: '登录人账号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'accNo', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '登录人', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'userName', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '登录状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		selectData: [
			{ label: '成功', value: '成功' },
			{ label: '失败', value: '失败' },
		],
	},
])
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	// queryParams.value.beginTimes = proxy.addDateRange(e).dateRange ? proxy.addDateRange(e).dateRange[0] : ''
	// queryParams.value.endTimes = proxy.addDateRange(e).dateRange ? proxy.addDateRange(e).dateRange[1] : ''

	listOperLog(queryParams.value)
		.then(response => {
			console.log(6666, response)
			tableData.value = response.data.pages
			total.value = response.data.totalNum
			console.log('列表数据', tableData.value)
		})
		.catch(res => {
		})
}
/** 查看按钮操作 */
const handleLoginLog = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '日志详情'
	loginVisible.value = true
	nextTick(() => {
		drawerRef.value.getLoginLog(editRow.id) // 子组件查询选中日志
	})
}

/** 关闭抽屉 */
function closeDrawer() {
	drawer.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
	queryParams.value.startPage = 1

	getList(queryParams.value)
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

getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
.my-label {
	background: var(--el-color-success-light-9);
}
.my-content {
	background: var(--el-color-danger-light-9);
}
</style>
