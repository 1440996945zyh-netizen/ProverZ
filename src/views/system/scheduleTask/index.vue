<template>
	<!-- 角色管理 -->
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
			:defaultWidth="40"
		/>
		<!-- 新增，修改抽屉组件 -->
		<Dialog v-model:visible="detailVisible" :title="title" :width="600">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="role">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive } from 'vue'
import detail from './detail/index.vue'
import DropDown from '@/components/DropDown/newIndex'
import Dialog from '@/components/Dialog/index.vue'
import { ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const clickRow = ref({}) //点击当前行
const total = ref(0)
const title = ref('新增')
const detailRef = ref(null)
const detailVisible = ref(false)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([
	{
		name: '用户数据每日备份',
		group: '数据同步组',
		remark: '每日凌晨 2 点自动备份 MySQL 数据库中 user 表的全量数据，备份文件存储至 /backup/user 目录',
		type: 'POST',
		url: 'http://api.example.com/backup/user-data',
		params: '{"dbName":"user_db","table":"user","backupType":"full"}',
		createTime: '2025-09-11 09:30:22',
		cron: '0 0 2 * * ?',
		nextRunTime: '2025-09-15 02:00:00',
	},
	{
		name: '首页流量每 10 分钟统计',
		group: '数据统计组',
		remark: '每 10 分钟采集一次首页访问量、独立访客数，数据存入 Redis 缓存供仪表盘展示',
		type: 'GET',
		url: 'http://api.example.com/stat/home-traffic',
		params: '{"timeRange":"10min","cacheKey":"home:traffic:latest"}',
		createTime: '2025-09-10 11:20:33',
		cron: '0 */10 * * * ?',
		nextRunTime: '2025-09-12 19:40:00',
	},
	{
		name: '月度财务报表生成',
		group: '财务自动化组',
		remark: '每月最后一天 23 点生成当月财务收支报表，自动发送至财务负责人邮箱',
		type: 'POST',
		url: 'http://api.example.com/finance/monthly-report',
		params: '{"month":"current","recipient":"finance@example.com","format":"excel"}',
		createTime: '2025-09-10 16:40:18',
		cron: '0 0 23 L * ?',
		nextRunTime: '2025-09-12 23:00:00',
	},
	{
		name: '设备在线状态检测',
		group: '物联网监控组',
		remark: '每天 8:00-22:00 期间，每 30 分钟检测一次物联网设备在线状态，离线设备触发告警',
		type: 'GET',
		url: 'http://api.example.com/iot/check-device-online',
		params: '{"alertThreshold":1,"checkRange":"all-devices"}',
		createTime: '2025-09-10 08:10:05',
		cron: '0 */30 8-22 * * ?',
		nextRunTime: '2025-09-12 19:30:00',
	},
])
const tableColumns = ref([
	{ label: '任务名称', prop: 'name', width: 150 },
	{ label: '任务所在组', prop: 'group', width: 150 },
	{ label: '任务描述', prop: 'remark', minWidth: 200 },
	{ label: '请求类型', prop: 'type', width: 100 },
	{ label: '请求url', prop: 'url', width: 120 },
	{ label: '请求参数', prop: 'params', width: 150 },
	{ label: '创建时间', prop: 'createTime', width: 150, align: 'center' },
	{ label: 'Cron表达式', prop: 'cron', width: 150 },
	{ label: '下次运行时间', prop: 'nextRunTime', width: 150, align: 'center' },
	{
		label: '任务状态',
		prop: 'statusLabel',
		align: 'center',
		width: 100,
		fixed: 'right',
		config: 'status',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: 'primary',
					},

					{
						default: () => '开启',
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			let dropDownList = []
			dropDownList = [
				{
					name: '编辑',
					command: '编辑',
					type: 'primary',
					link: true,
					click: () => edit(row),
					permission: 'system:role:update',
				},
				{
					name: '暂停',
					command: '暂停',
					type: 'warning',
					link: true,
					click: () => stop(row),
					permission: 'system:role:update',
				},
				{
					name: '恢复',
					command: '恢复',
					type: 'success',
					link: true,
					click: () => restart(row),
					permission: 'system:role:update',
				},
				{
					name: '删除',
					command: '删除',
					link: true,
					click: () => handleDelete(row),
					permission: 'system:role:update',
					type: 'danger',
				},
				{
					name: '执行记录',
					command: '执行记录',
					type: 'primary',
					link: true,
					click: () => report(row),
					permission: 'system:role:update',
				},
			]
			return [
				h(
					DropDown,
					{
						dropDownList,
					},
					{
						default: () => '',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '任务名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'roleCode', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '任务组名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'roleName', // 绑定字段
		span: 8, // 占位，共24
	},

	{
		name: '任务状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ label: '暂停', value: '0' },
			{ label: '开启', value: '1' },
		],
	},
])
const buttonList = reactive([
	{
		label: '添加任务', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:role:insert', // 权限
	},
	{
		label: '历史任务', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => historyTask, // 回调函数
		permission: 'system:role:dispatchUser', // 权限
	},
])

// 点击查询的事件
const getList = e => {
	queryParams.value = e
}
/** 历史任务 */
const historyTask = () => {}
/** 提交按钮 */
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.form)) // 取到子组件的form
		proxy.$modal.confirm('确定保存？').then(() => {})
	}
}
function stop(row) {
	proxy.$modal
		.confirm('确定暂停？')
		.then()
		.catch(() => {})
}
function restart(row) {
	proxy.$modal
		.confirm('确定恢复？')
		.then()
		.catch(() => {})
}
/** 删除按钮操作 */
function handleDelete(row) {
	proxy.$modal
		.confirm('确定删除？')
		.then()
		.catch(() => {})
}

const add = () => {
	detailVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	nextTick(() => {})
}
</script>
<style lang="less" scoped></style>
